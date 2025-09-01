import React, { useState, useCallback } from 'react';
import { CSVData, CSVMapping, DataImportProgress, RedditPost } from '@/types';
import CSVProcessor from '@/lib/csv-processor';

// Safe date formatter that handles various date formats
const formatDate = (date: any): string => {
  try {
    // If it's already a Date object, use it directly
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
    
    // If it's a string or number, try to parse it
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString();
    }
    
    // Fallback for invalid dates
    return 'Invalid Date';
  } catch (error) {
    // Ultimate fallback
    return 'N/A';
  }
};

interface CSVUploadProps {
  onDataReady: (posts: RedditPost[], source: string) => void;
  onError: (error: string) => void;
}

const CSV_UPLOAD_STEPS = {
  UPLOAD_FILE: 'upload-file',
  MAP_COLUMNS: 'map-columns',
  PREVIEW_DATA: 'preview-data',
  COMPLETED: 'completed',
} as const;

type UploadStep = typeof CSV_UPLOAD_STEPS[keyof typeof CSV_UPLOAD_STEPS];

const CSVUpload: React.FC<CSVUploadProps> = ({ onDataReady, onError }) => {
  const [currentStep, setCurrentStep] = useState<UploadStep>(CSV_UPLOAD_STEPS.UPLOAD_FILE);
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [mapping, setMapping] = useState<CSVMapping>({});
  const [progress, setProgress] = useState<DataImportProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewPosts, setPreviewPosts] = useState<RedditPost[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [sessionId] = useState(`upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(null);
    setIsUploadComplete(false);
    setUploadedFileName(file.name);

    // Instant feedback: Show file selected
    setProgress({
      stage: 'uploading',
      progress: 0,
      message: `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    });

    try {
      // Create FormData for backend upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);

      setProgress({
        stage: 'uploading',
        progress: 20,
        message: 'Uploading file to server...',
      });

      // Send to backend endpoint
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      setProgress({
        stage: 'parsing',
        progress: 60,
        message: 'Processing and analyzing CSV data...',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to process file');
      }

      setProgress({
        stage: 'completed',
        progress: 100,
        message: `Successfully processed ${result.data.count} items!`,
      });

      // Set processed data
      setCsvData(result.data.csvData);
      setMapping(result.data.mapping);
      setPreviewPosts(result.data.posts);
      setIsUploadComplete(true);
      
      // Move directly to preview data step
      setCurrentStep(CSV_UPLOAD_STEPS.PREVIEW_DATA);
      
      console.log('✅ Upload and processing complete:', result.data.count, 'items processed');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      console.error('❌ Upload failed:', errorMessage);
      
      setProgress({
        stage: 'error',
        progress: 0,
        message: errorMessage,
        errors: [errorMessage],
      });
      
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [onError, sessionId]);

  const handleMappingChange = useCallback((column: string, mappedTo: string) => {
    setMapping(prev => ({
      ...prev,
      [mappedTo]: mappedTo === 'ignore' ? undefined : column,
    }));
  }, []);

  const handlePreviewData = useCallback(async () => {
    if (!csvData || !mapping.title) {
      onError('Please map at least the Title column to continue');
      return;
    }

    try {
      setIsProcessing(true);
      const posts = CSVProcessor.convertToRedditPosts(csvData, mapping);
      setPreviewPosts(posts);
      setCurrentStep(CSV_UPLOAD_STEPS.PREVIEW_DATA);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to convert data');
    } finally {
      setIsProcessing(false);
    }
  }, [csvData, mapping, onError]);

  const handleConfirmData = useCallback(() => {
    if (previewPosts.length > 0) {
      onDataReady(previewPosts, `CSV: ${csvData?.filename || 'uploaded-data'}`);
      // Don't set to COMPLETED - let parent handle navigation
      // The parent will show the "Proceed with This Data" button
    }
  }, [previewPosts, csvData, onDataReady]);

  const renderFileUpload = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload Your CSV File
        </h3>
        <p className="text-gray-600">
          Upload a CSV file containing your data for analysis
        </p>
      </div>

      {progress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">
              {progress.message}
            </span>
            <span className="text-sm text-blue-600">{progress.progress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          {progress.errors && progress.errors.length > 0 && (
            <div className="mt-2 space-y-1">
              {progress.errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">• {error}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
        <div className="space-y-4">
          <div className="text-4xl text-gray-400">
            {isProcessing ? '🔄' : uploadedFileName ? '📄' : '📄'}
          </div>
          <div>
            {/* Show uploaded file name or upload button */}
            {uploadedFileName && !isUploadComplete ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-800">
                  📎 Uploaded: {uploadedFileName}
                </p>
                <p className="text-xs text-gray-600">
                  Processing your file...
                </p>
              </div>
            ) : (
              <label
                htmlFor="csv-upload"
                className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
              >
                {isProcessing ? 'Processing...' : 'Choose CSV File'}
              </label>
            )}
            <input
              id="csv-upload"
              type="file"
              accept=".csv,text/csv,application/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              disabled={isProcessing}
            />
          </div>
          <p className="text-gray-500 text-sm">
            Supported format: CSV files up to 5MB
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Need a sample file?</h4>
        <p className="text-gray-600 text-sm mb-3">
          Download our sample CSV to understand the expected format
        </p>
        <a
          href="/api/upload-csv"
          download="sample-data.csv"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Download Sample CSV →
        </a>
      </div>
    </div>
  );

  const renderColumnMapping = () => {
    if (!csvData) return null;

    const mappingOptions = [
      { value: 'title', label: 'Title (Required)', required: true },
      { value: 'content', label: 'Content/Description' },
      { value: 'author', label: 'Author/Source' },
      { value: 'score', label: 'Score/Rating' },
      { value: 'date', label: 'Date' },
      { value: 'url', label: 'URL/Link' },
      { value: 'category', label: 'Category/Tag' },
      { value: 'ignore', label: 'Ignore Column' },
    ];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Column Mapping (Optional)
          </h3>
          <p className="text-gray-600">
            Fine-tune how your CSV columns should be interpreted
          </p>
          {mapping.title && (
            <div className="mt-4">
              <button
                onClick={handlePreviewData}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                🚀 Use Auto-Mapping & Continue
              </button>
              <p className="text-xs text-gray-500 mt-2">Or customize the mapping below</p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            📊 Found {csvData.totalRows} rows with {csvData.columns.length} columns
          </p>
          {csvData.validationErrors && csvData.validationErrors.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-sm font-medium text-orange-800">Validation Warnings:</p>
              {csvData.validationErrors.map((error, index) => (
                <p key={index} className="text-sm text-orange-700">• {error}</p>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {csvData.columns.map((column) => (
            <div key={column.name} className="border border-gray-200 rounded-lg p-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">{column.name}</h4>
                  <p className="text-sm text-gray-500 capitalize">{column.type} column</p>
                  {column.sampleValues.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-600">Sample values:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {column.sampleValues.slice(0, 3).map((value, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs max-w-24 truncate"
                            title={value}
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Map to:
                  </label>
                  <select
                    value={Object.entries(mapping).find(([_, value]) => value === column.name)?.[0] || 'ignore'}
                    onChange={(e) => {
                      // Clear previous mapping of this column
                      const currentMapping = Object.entries(mapping).find(([_, value]) => value === column.name)?.[0];
                      if (currentMapping) {
                        setMapping(prev => ({ ...prev, [currentMapping]: undefined }));
                      }
                      // Set new mapping
                      handleMappingChange(column.name, e.target.value);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {mappingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(CSV_UPLOAD_STEPS.UPLOAD_FILE)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Upload
          </button>
          <button
            onClick={handlePreviewData}
            disabled={!mapping.title || isProcessing}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Preview Data →'}
          </button>
        </div>
      </div>
    );
  };

  const renderPreviewData = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl text-green-500 mb-4">✅</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload Successful!
        </h3>
        <p className="text-gray-600">
          Your CSV data has been processed and stored. Ready for AI analysis!
        </p>
      </div>

      {/* Success Summary */}
      {uploadedFileName && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2 flex items-center">
            <span className="text-lg mr-2">📊</span>
            Processing Summary
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-800 mb-2">File Details:</p>
              <ul className="space-y-1">
                <li className="flex items-center text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <strong>File:</strong> <span className="ml-1">{uploadedFileName}</span>
                </li>
                <li className="flex items-center text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <strong>Items:</strong> <span className="ml-1">{previewPosts.length} processed</span>
                </li>
                <li className="flex items-center text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <strong>Status:</strong> <span className="ml-1">Ready for AI Analysis</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-green-800 mb-2">Auto-mapped columns:</p>
              <ul className="space-y-1">
                {Object.entries(mapping).map(([key, value]) => {
                  if (value && key !== 'ignore') {
                    return (
                      <li key={key} className="flex items-center text-green-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <strong className="capitalize">{key}:</strong> <span className="ml-1">{value}</span>
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Data Preview (First 5 items)</h4>
        </div>
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {previewPosts.slice(0, 5).map((post) => (
            <div key={post.id} className="border border-gray-200 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 mb-2">{post.title}</h5>
              {post.content && (
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.content}</p>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span>Author: {post.author}</span>
                <span>•</span>
                <span>Score: {post.score}</span>
                <span>•</span>
                <span>Date: {formatDate(post.createdAt)}</span>
                {post.flair && (
                  <>
                    <span>•</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{post.flair}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => {
            setCurrentStep(CSV_UPLOAD_STEPS.UPLOAD_FILE);
            setUploadedFileName('');
            setIsUploadComplete(false);
            setCsvData(null);
            setPreviewPosts([]);
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Upload Different File
        </button>
        <button
          onClick={handleConfirmData}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center text-lg shadow-lg"
        >
          <span className="mr-2">🚀</span>
          Start AI Analysis
        </button>
      </div>
    </div>
  );

  const renderCompleted = () => (
    <div className="text-center space-y-4">
      <div className="text-6xl text-green-500">✅</div>
      <h3 className="text-lg font-semibold text-gray-900">Data Ready!</h3>
      <p className="text-gray-600">
        Your CSV data has been successfully processed and is ready for analysis
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {currentStep === CSV_UPLOAD_STEPS.UPLOAD_FILE && renderFileUpload()}
      {currentStep === CSV_UPLOAD_STEPS.PREVIEW_DATA && renderPreviewData()}
      {currentStep === CSV_UPLOAD_STEPS.COMPLETED && renderCompleted()}
    </div>
  );
};

export default CSVUpload;