'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Download, RotateCcw, FileText, File, Loader2, CheckCircle, Eye, Share2, Clock, AlertCircle, TrendingUp, Target, Star } from 'lucide-react';
import { Step5Props, GeneratedReport, BusinessPlan } from '@/types';
import { generateSmartFilename, generateFallbackFilename, sanitizeFilename } from '@/utils/exportNaming';
import StepNavigation from '@/components/ui/StepNavigation';

export default function Step5ReportGeneration({ 
  posts,
  businessPlans,
  keywords,
  sessionId,
  onBack, 
  onExportReport, 
  onStartNew 
}: Step5Props) {
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [expandedPlans, setExpandedPlans] = useState<string[]>([]);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 800);
    
    try {
      const response = await fetch('/api/generate-business-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          posts,
          businessPlans,
          sessionId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate report');
      }

      setReport(result.data);
      setGenerationProgress(100);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  const togglePlan = (planId: string) => {
    setExpandedPlans(prev => 
      prev.includes(planId)
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!report) return;

    try {
      console.log(`Starting ${format.toUpperCase()} export via server API...`);
      
      // Show loading state
      const originalText = document.querySelector(`button[data-format="${format}"]`)?.textContent;
      const button = document.querySelector(`button[data-format="${format}"]`) as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = `Generating ${format.toUpperCase()}...`;
      }

      // Call server-side export API
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ report }),
      });

      if (!response.ok) {
        throw new Error(`${format.toUpperCase()} generation failed: ${response.statusText}`);
      }

      // Get the file blob
      const blob = await response.blob();
      
      // Create download link with smart naming
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Generate smart filename based on keywords
      try {
        const smartFilename = generateSmartFilename(keywords, format);
        a.download = sanitizeFilename(smartFilename);
        console.log(`📄 Using smart filename: ${a.download}`);
      } catch (error) {
        console.warn('⚠️ Smart naming failed, using fallback:', error);
        a.download = generateFallbackFilename(format);
      }
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`${format.toUpperCase()} export completed successfully`);
      onExportReport(format);
      
      // Reset button state
      if (button && originalText) {
        button.disabled = false;
        button.textContent = originalText;
      }
      
    } catch (error) {
      console.error(`${format.toUpperCase()} export failed:`, error);
      
      // Reset button state on error
      const button = document.querySelector(`button[data-format="${format}"]`) as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.textContent = button.textContent?.replace(/Generating.*/, '') || `Export ${format.toUpperCase()}`;
      }
      
      // Fallback to text export if server-side generation fails
      console.log('Falling back to text export...');
      const textContent = generateTextReport(report);
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Use smart naming for fallback text export too
      try {
        const smartFilename = generateSmartFilename(keywords, 'txt');
        a.download = sanitizeFilename(smartFilename);
      } catch (error) {
        a.download = generateFallbackFilename('txt');
      }
      
      a.click();
      URL.revokeObjectURL(url);
      
      alert(`${format.toUpperCase()} export failed. Report downloaded as text file instead. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Fallback text generation function
  const generateTextReport = (report: GeneratedReport): string => {
    let text = `${report.title}\n${'='.repeat(report.title.length)}\n\n`;
    text += `EXECUTIVE SUMMARY\n${'-'.repeat(16)}\n${report.executiveSummary}\n\n`;
    text += `KEY FINDINGS\n${'-'.repeat(12)}\n`;
    report.keyFindings.forEach((finding, i) => {
      text += `${i + 1}. ${finding}\n`;
    });
    text += '\n';
    
    if (report.businessPlans && report.businessPlans.length > 0) {
      text += `BUSINESS OPPORTUNITIES\n${'-'.repeat(20)}\n`;
      report.businessPlans.forEach((plan) => {
        text += `\n${plan.title}\n${'-'.repeat(plan.title.length)}\n`;
        text += `Core Problem: ${plan.coreProblem}\n\n`;
        text += `Proposed Solution: ${plan.proposedSolution}\n\n`;
        text += `Target Audience: ${plan.targetAudience}\n\n`;
        text += `Key Features:\n`;
        plan.keyFeatures.forEach((feature) => {
          text += `• ${feature}\n`;
        });
        text += `\nMarket Potential: ${plan.marketPotential}/10\n`;
        text += `Feasibility: ${plan.feasibility}/10\n`;
        text += `Monetization: ${plan.monetization}\n`;
        text += `Action Plan: ${plan.actionPlan}\n\n`;
      });
    }
    
    text += `STRATEGIC RECOMMENDATIONS\n${'-'.repeat(24)}\n`;
    report.recommendations.forEach((rec, i) => {
      text += `${i + 1}. ${rec}\n`;
    });
    text += '\n';
    text += `Generated: ${new Date().toLocaleDateString()}\n`;
    text += `Total Posts Analyzed: ${report.metadata.totalPosts.toLocaleString()}\n`;
    text += 'Analysis Type: AI Business Opportunity Analysis\n';
    
    return text;
  };

  const exportFormats = [
    { id: 'docx', label: 'Word Document', icon: FileText, description: 'Professional .docx format' },
    { id: 'pdf', label: 'PDF Report', icon: File, description: 'Portable document format' },
  ];

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Generating Your Business Report
            </h2>
            <p className="text-gray-600 mb-6">
              AI is compiling your business plans and creating comprehensive insights...
            </p>
            
            <div className="max-w-md mx-auto mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(generationProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-500 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                Analyzing {posts.length} posts and {businessPlans.length} business plans
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Estimated completion: {Math.max(1, Math.ceil((100 - generationProgress) / 20))} minute(s)
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Generation Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={generateReport}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center">
            <p className="text-gray-600">Loading report...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        {/* Top Navigation */}
        <StepNavigation
          position="top"
          onBack={onBack}
          onNext={onStartNew}
          backText="Back to Analysis"
          nextText="Start New Research"
          nextIcon={RotateCcw}
          nextVariant="secondary"
        />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900">
              Your Business Opportunity Report
            </h2>
          </div>
          <p className="text-lg text-gray-600">
            Comprehensive business analysis complete with actionable insights
          </p>
        </div>

        {/* Report Metadata */}
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-700">{report.metadata.totalPosts.toLocaleString()}</div>
              <div className="text-sm text-green-600">Posts Analyzed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">{report.metadata.totalSubreddits}</div>
              <div className="text-sm text-green-600">Subreddits</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">{businessPlans.length}</div>
              <div className="text-sm text-green-600">Business Plans</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">{Math.round(report.metadata.processingTime / 1000)}s</div>
              <div className="text-sm text-green-600">Processing Time</div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="mb-8">
          <div className="bg-gray-50 border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">{report.title}</h3>
            
            {/* Executive Summary */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Executive Summary
              </h4>
              <div className="p-4 bg-white border rounded text-gray-700 leading-relaxed">
                {report.executiveSummary}
              </div>
            </div>

            {/* Key Findings */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Key Findings</h4>
              <ul className="space-y-2">
                {report.keyFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2 p-3 bg-white border rounded">
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Business Plans */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Business Opportunities
              </h4>
              <div className="space-y-3">
                {businessPlans.map((plan) => (
                  <div key={plan.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => togglePlan(plan.id)}
                      className="w-full p-4 text-left bg-white hover:bg-gray-50 rounded-lg flex items-center justify-between transition-colors"
                    >
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{plan.title}</h5>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Market:</span>
                            <div className="flex items-center gap-1">
                              <div className="text-sm font-bold text-blue-700">{plan.marketPotential}/10</div>
                              <div className="w-12 bg-blue-200 h-1.5 rounded">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded" 
                                  style={{ width: `${plan.marketPotential * 10}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Feasibility:</span>
                            <div className="flex items-center gap-1">
                              <div className="text-sm font-bold text-green-700">{plan.feasibility}/10</div>
                              <div className="w-12 bg-green-200 h-1.5 rounded">
                                <div 
                                  className="bg-green-600 h-1.5 rounded" 
                                  style={{ width: `${plan.feasibility * 10}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-gray-500 ml-4">
                        {expandedPlans.includes(plan.id) ? '−' : '+'}
                      </span>
                    </button>
                    
                    {expandedPlans.includes(plan.id) && (
                      <div className="p-4 border-t bg-gray-50">
                        <div className="space-y-4">
                          <div>
                            <h6 className="font-medium text-gray-800 mb-2">Core Problem:</h6>
                            <p className="text-sm text-gray-700">{plan.coreProblem}</p>
                          </div>
                          
                          <div>
                            <h6 className="font-medium text-gray-800 mb-2">Proposed Solution:</h6>
                            <p className="text-sm text-gray-700">{plan.proposedSolution}</p>
                          </div>

                          <div>
                            <h6 className="font-medium text-gray-800 mb-2">Target Audience:</h6>
                            <p className="text-sm text-gray-700">{plan.targetAudience}</p>
                          </div>

                          <div>
                            <h6 className="font-medium text-gray-800 mb-2">Key Features:</h6>
                            <ul className="text-sm text-gray-700 space-y-1 ml-4">
                              {plan.keyFeatures.map((feature, idx) => (
                                <li key={idx} className="list-disc">{feature}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h6 className="font-medium text-gray-800 mb-2">Monetization Strategy:</h6>
                            <p className="text-sm text-gray-700">{plan.monetization}</p>
                          </div>

                          <div>
                            <h6 className="font-medium text-gray-800 mb-2">Action Plan:</h6>
                            <p className="text-sm text-gray-700">{plan.actionPlan}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Strategic Recommendations</h4>
              <div className="space-y-2">
                {report.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-white border rounded">
                    <div className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                      ✓
                    </div>
                    <span className="text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Citation */}
            <div className="text-xs text-gray-500 border-t pt-4">
              <h5 className="font-medium mb-2">Sources & Methodology:</h5>
              <ul className="space-y-1">
                {report.sourceCitation.map((citation, index) => (
                  <li key={index}>• {citation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Review Submission Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl">
          <div className="text-center">
            <h4 className="font-bold text-lg text-yellow-800 mb-2">We'd Love Your Feedback!</h4>
            <p className="text-yellow-700 mb-4">
              Help us improve by sharing your experience with IdeaCompass
            </p>
            <button
              onClick={() => window.location.href = '/add-review'}
              className="inline-flex items-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <Star className="w-5 h-5 mr-2 fill-current" />
              Add Your Review
            </button>
            <p className="text-xs text-yellow-600 mt-3">
              Your feedback helps us create better insights for everyone
            </p>
          </div>
        </div>

        {/* Export Options */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Export Your Report
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exportFormats.map((format) => (
              <button
                key={format.id}
                data-format={format.id}
                onClick={() => handleExport(format.id as any)}
                className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <format.icon className="w-8 h-8 text-blue-600 mb-2 group-hover:text-blue-700" />
                <span className="font-medium text-gray-900">{format.label}</span>
                <span className="text-xs text-gray-500 text-center">{format.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Analysis
          </button>
          
          <button
            onClick={onStartNew}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Start New Research
          </button>
        </div>

        {/* Success Message */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">🎉 Business Analysis Complete!</h4>
          <p className="text-blue-800 text-sm">
            Your comprehensive business opportunity analysis has been generated successfully. 
            The report includes {businessPlans.length} detailed business plans with market analysis 
            and actionable next steps. You can export it in multiple formats or start a new research project.
          </p>
        </div>

      </div>
    </div>
  );
}