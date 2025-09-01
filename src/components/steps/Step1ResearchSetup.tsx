'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, X, Filter, Loader2, ArrowRight, Upload, Database } from 'lucide-react';
import { SearchFilters, SubredditMetadata, RedditPost } from '@/types';
import CSVUpload from '@/components/upload/CSVUpload';

type DataSourceType = 'reddit' | 'csv';

interface Step1EnhancedProps {
  onNext: (
    source: 'reddit' | 'csv',
    keywords: string[],
    filters: SearchFilters,
    subreddits?: SubredditMetadata[],
    uploaded?: RedditPost[]
  ) => void;
  initialKeywords?: string[];
  initialDataSource?: 'reddit' | 'csv';
  initialFilters?: SearchFilters;
}

export default function Step1ResearchSetup({ 
  onNext, 
  initialKeywords = [], 
  initialDataSource = 'reddit',
  initialFilters 
}: Step1EnhancedProps) {
  const [dataSource, setDataSource] = useState<DataSourceType>(initialDataSource);
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {
    postType: 'top',
    timeRange: 'month',
    minScore: 10,
    includeComments: true,
    excludeNSFW: true,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<{ posts: RedditPost[]; source: string } | null>(null);

  const addKeyword = () => {
    const input = currentKeyword.trim();
    if (!input) return;
    
    // Handle comma-separated keywords
    const keywordList = input.split(',').map(k => k.trim()).filter(Boolean);
    const uniqueKeywords = keywordList.filter(k => !keywords.includes(k));
    
    if (uniqueKeywords.length > 0) {
      setKeywords([...keywords, ...uniqueKeywords]);
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleDiscoverSubreddits = async () => {
    if (keywords.length === 0) {
      setError('Please add at least one keyword');
      return;
    }

    console.log('🔍 Starting subreddit discovery with keywords:', keywords);
    setIsDiscovering(true);
    setError(null);

    try {
      console.log('📡 Making API request to /api/discover');
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords }),
      });

      console.log('📨 API response status:', response.status);
      const result = await response.json();
      console.log('📊 API response data:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to discover subreddits');
      }

      console.log('✅ Discovery successful, found', result.data?.length || 0, 'subreddits');
      onNext('reddit', keywords, filters, result.data || []);
    } catch (err) {
      console.error('❌ Discovery failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to discover subreddits');
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleCSVDataReady = (posts: RedditPost[], sourceName: string) => {
    setCsvData({ posts, source: sourceName });
    // Extract keywords from CSV data for better analysis
    const extractedKeywords = extractKeywordsFromPosts(posts);
    setKeywords(extractedKeywords);
  };

  const handleProceedWithCSV = () => {
    if (csvData) {
      onNext('csv', keywords, filters, undefined, csvData.posts);
    }
  };

  const extractKeywordsFromPosts = (posts: RedditPost[]): string[] => {
    // Simple keyword extraction from titles
    const wordFreq = new Map<string, number>();
    
    posts.forEach(post => {
      const words = post.title.toLowerCase()
        .replace(/[^a-zA-Z\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      words.forEach(word => {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      });
    });
    
    // Get top 5 most frequent words as keywords
    return Array.from(wordFreq.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  };

  const handleCSVError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const suggestedKeywords = [
    'artificial intelligence', 'machine learning', 'startup', 'productivity',
    'web development', 'marketing', 'design', 'entrepreneurship', 'technology',
    'business', 'finance', 'health', 'fitness', 'gaming'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Step 1: Research Setup
          </h2>
          <p className="text-lg text-gray-600">
            Choose your data source and configure your research parameters
          </p>
        </div>

        {/* Data Source Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Data Source
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setDataSource('reddit')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                dataSource === 'reddit'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Database className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Reddit Discovery</h3>
                  <p className="text-sm text-gray-600">
                    Discover and scrape relevant Reddit communities based on your keywords
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Real-time data</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Auto-discovery</span>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setDataSource('csv')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                dataSource === 'csv'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Upload className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Upload CSV Data</h3>
                  <p className="text-sm text-gray-600">
                    Analyze your own data by uploading a CSV file with your content
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Custom data</span>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Flexible format</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* CSV Upload Interface */}
        {dataSource === 'csv' && (
          <div className="mb-8">
            {!csvData ? (
              <CSVUpload
                onDataReady={handleCSVDataReady}
                onError={handleCSVError}
              />
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2">
                      ✅ Data Ready: {csvData.source}
                    </h3>
                    <p className="text-green-800 text-sm mb-4">
                      Successfully loaded {csvData.posts.length} items for analysis
                    </p>
                    
                    {/* Auto-extracted keywords */}
                    {keywords.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-green-800 mb-2">Auto-extracted keywords:</p>
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((keyword) => (
                            <span
                              key={keyword}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                            >
                              {keyword}
                              <button
                                onClick={() => removeKeyword(keyword)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setCsvData(null);
                      setKeywords([]);
                      setError(null);
                    }}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Change Data
                  </button>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleProceedWithCSV}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Proceed with This Data
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Keywords Section - Only for Reddit */}
        {dataSource === 'reddit' && (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Research Keywords {keywords.length > 0 && <span className="text-blue-600">({keywords.length} added)</span>}
          </label>
          

          
          {/* Keyword Input - Streamlined without Add button */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter keywords, use comma for more (example1, example2)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            {/* Helper text */}
            <p className="text-sm text-gray-500 mt-2">
              Use comma for more keywords (example1, example2)
            </p>
          </div>

          {/* Current Keywords */}
          {keywords.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Your keywords:</p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="text-blue-600 hover:text-blue-800 ml-1"
                      title="Remove keyword"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}


          
          {/* Error Display for Reddit */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          {/* Discovery Status - Show when processing */}
          {isDiscovering && (
            <div className="flex justify-center mb-6">
              <div className="text-center">
                <div className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Discovering Subreddits...
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Finding relevant communities for your keywords
                </p>
              </div>
            </div>
          )}
          
          {/* Action Button for Reddit */}
          <div className="flex justify-center mb-6">
            <button
              onClick={handleDiscoverSubreddits}
              disabled={keywords.length === 0 || isDiscovering}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <ArrowRight className="w-5 h-5" />
              Discover Subreddits Now
            </button>
          </div>
        </div>
        )}

        {/* Advanced Filters - Only for Reddit */}
        {dataSource === 'reddit' && (
        <div className="mb-8">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Advanced Filters
            <span className="text-xs text-gray-500">(Optional)</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              {/* Post Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Type
                </label>
                <select
                  value={filters.postType}
                  onChange={(e) => setFilters({ ...filters, postType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="top">Top Posts</option>
                  <option value="hot">Hot Posts</option>
                  <option value="new">New Posts</option>
                </select>
              </div>

              {/* Time Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Range
                </label>
                <select
                  value={filters.timeRange}
                  onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="day">Past 24 Hours</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* Min Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Score: {filters.minScore}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minScore}
                  onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.includeComments}
                    onChange={(e) => setFilters({ ...filters, includeComments: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include comments in analysis</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.excludeNSFW}
                    onChange={(e) => setFilters({ ...filters, excludeNSFW: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Exclude NSFW content</span>
                </label>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Research Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use specific keywords related to your business or industry</li>
            <li>• Include both broad terms and niche topics for comprehensive coverage</li>
            <li>• Consider synonyms and alternative terms your audience might use</li>
            <li>• 2-5 keywords typically provide the best balance of depth and breadth</li>
          </ul>
        </div>
      </div>
    </div>
  );
}