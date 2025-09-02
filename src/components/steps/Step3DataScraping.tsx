'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Download, Loader2, CheckCircle, AlertCircle, Clock, Lock } from 'lucide-react';
import { Step3Props, ScrapingProgress, RedditPost } from '@/types';
import StepNavigation from '@/components/ui/StepNavigation';
import { useAuth } from '@/contexts/AuthContext';
import UpgradeModal from '@/components/ui/UpgradeModal';

export default function Step3DataScraping({ 
  selectedSubreddits,
  keywords, 
  onNext, 
  onBack, 
  onExportData 
}: Step3Props) {
  const { profile } = useAuth();
  const isFreeUser = profile?.plan === 'free';
  const [isScrapingU, setIsScrapingU] = useState(false);
  const [scrapedData, setScrapedData] = useState<RedditPost[]>([]);
  const [progress, setProgress] = useState<ScrapingProgress[]>([]);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [error, setError] = useState<string | null>(null);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [creditConsumed, setCreditConsumed] = useState(false);

  // Function to poll progress during scraping with enhanced safety
  const pollProgress = async () => {
    console.log('🚀 POLLING FUNCTION CALLED - isScrapingU:', isScrapingU, 'sessionId:', sessionId);
    
    try {
      console.log('🔍 Polling progress for session:', sessionId);
      const response = await fetch(`/api/scrape/progress?sessionId=${sessionId}`);
      console.log('📰 Progress API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📊 Progress API result:', result);
        
        if (result.success && result.data) {
          console.log(`📊 Received progress data:`, result.data);
          setProgress(result.data);
          
          // ENHANCED completion detection logic with safety checks
          if (selectedSubreddits.length > 0) {
            const subredditStatuses = selectedSubreddits.map(subreddit => {
              const subredditProgress = result.data.find((p: ScrapingProgress) => p.subreddit === subreddit);
              return {
                subreddit,
                status: subredditProgress?.status || 'pending',
                hasProgress: !!subredditProgress
              };
            });
            
            const completed = subredditStatuses.filter(s => s.status === 'completed').length;
            const errored = subredditStatuses.filter(s => s.status === 'error').length;
            const total = selectedSubreddits.length;
            
            console.log(`📊 Progress: ${completed}/${total} completed, ${errored} errors`);
            console.log(`🔍 Subreddit statuses:`, subredditStatuses);
            
            // Stop when all subreddits are either completed or errored
            const allFinished = (completed + errored) >= total;
            
            console.log(`🏁 Checking completion: allFinished=${allFinished}, total=${total}`);
            
            if (allFinished) {
              console.log('✅ All subreddits finished, stopping progress polling');
              console.log(`📊 Final status breakdown: ${completed} completed, ${errored} errored out of ${total} total`);
              
              // CRITICAL: Stop polling immediately with multiple safety checks
              if (progressInterval) {
                console.log('🗑️ Clearing progress interval:', progressInterval);
                clearInterval(progressInterval);
                setProgressInterval(null);
              }
              setIsScrapingU(false);
              
              // Fetch final scraped data IMMEDIATELY
              console.log('📎 Fetching final scraped data IMMEDIATELY...');
              try {
                const dataResponse = await fetch(`/api/scrape/data?sessionId=${sessionId}`);
                console.log('📰 Data fetch response status:', dataResponse.status);
                
                if (dataResponse.ok) {
                  const dataResult = await dataResponse.json();
                  console.log('📊 Data fetch result:', dataResult);
                  
                  if (dataResult.success) {
                    setScrapedData(dataResult.data || []);
                    console.log(`✅ SUCCESS: Final data loaded: ${dataResult.data?.length || 0} posts`);
                    
                    // Clear any error messages since we succeeded
                    setError(null);
                  } else {
                    console.error('❌ Data fetch result indicates failure:', dataResult.error);
                  }
                } else {
                  console.error('❌ Data fetch failed with status:', dataResponse.status);
                }
              } catch (dataError) {
                console.error('❌ Error fetching final data:', dataError);
              }
              
              // CRITICAL: Return early to prevent any further polling
              return;
            }
          }
        } else {
          console.warn('⚠️ Progress API returned no data:', result);
        }
      } else {
        console.warn(`⚠️ Progress API returned ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error polling progress:', error);
      // CRITICAL: Stop polling on any error to prevent infinite loop
      if (progressInterval) {
        clearInterval(progressInterval);
        setProgressInterval(null);
      }
      setIsScrapingU(false);
      setError('Polling failed. Please try again.');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [progressInterval]);

  // Safety cleanup with shorter timeout and better error handling
  useEffect(() => {
    if (isScrapingU) {
      // Warning at 60 seconds
      const warningTimeout = setTimeout(() => {
        console.log('⚠️ Warning: Scraping taking longer than expected (60s). Still waiting...');
      }, 60000);
      
      // Final timeout at 2 minutes
      const safetyTimeout = setTimeout(() => {
        console.log('⚠️ Safety timeout reached after 2 minutes, stopping scraping');
        if (progressInterval) {
          clearInterval(progressInterval);
          setProgressInterval(null);
        }
        setIsScrapingU(false);
        setError('Scraping timed out after 2 minutes. Any collected data is still available.');
        
        // Try to get partial data
        const fetchPartialData = async () => {
          try {
            const dataResponse = await fetch(`/api/scrape/data?sessionId=${sessionId}`);
            if (dataResponse.ok) {
              const dataResult = await dataResponse.json();
              if (dataResult.success && dataResult.data?.length > 0) {
                setScrapedData(dataResult.data);
                console.log(`🔄 Partial data recovered: ${dataResult.data.length} posts`);
              }
            }
          } catch (error) {
            console.error('❌ Error fetching partial data after timeout:', error);
          }
        };
        fetchPartialData();
      }, 120000); // 2 minutes timeout

      return () => {
        clearTimeout(warningTimeout);
        clearTimeout(safetyTimeout);
      };
    }
  }, [isScrapingU, progressInterval, sessionId]);

  const handleStartScraping = async () => {
    // Consume credit first for free users
    if (isFreeUser && !creditConsumed) {
      try {
        const creditResponse = await fetch('/api/consume-credit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'data_scraping' })
        });
        
        const creditResult = await creditResponse.json();
        
        if (!creditResult.success) {
          setError(creditResult.error || 'Unable to consume credit');
          return;
        }
        
        setCreditConsumed(true);
      } catch (err) {
        setError('Failed to process credit. Please try again.');
        return;
      }
    }

    setIsScrapingU(true);
    setError(null);
    setProgress([]);
    setScrapedData([]);
    
    // Clear any existing polling interval
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    
    try {
      // Start the scraping process (fire and forget)
      const response = await fetch('/api/scrape/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subreddits: selectedSubreddits,
          keywords: keywords, // Pass keywords for ultra-fast scraping
          filters: {
            postType: 'top',
            timeRange: 'week',
            minScore: 5,
            includeComments: true,
            excludeNSFW: true,
          },
          sessionId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to start scraping');
      }

      console.log('🚀 Scraping started successfully, beginning progress polling');
      console.log('🔍 Session ID:', sessionId);
      console.log('🔍 Selected subreddits:', selectedSubreddits);
      
      // Start polling for progress updates (aggressive frequency to catch fast completion)
      const interval = setInterval(pollProgress, 1000); // Poll every 1 second for fast detection
      setProgressInterval(interval);
      console.log('⏰ Polling interval started with ID:', interval);
      
      // Start immediate polling to catch fast completions
      console.log('⚡ Starting immediate first poll...');
      setTimeout(pollProgress, 200); // First poll after 200ms
      
      // SAFETY: Additional timeout to prevent infinite polling - use the actual interval reference
      const safetyTimeoutId = setTimeout(() => {
        console.log('🔒 Safety check: clearing polling interval after 5 minutes');
        clearInterval(interval); // Use the actual interval reference
        setProgressInterval(null);
        setIsScrapingU(false);
      }, 300000); // 5 minutes for faster debugging
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scraping');
      setIsScrapingU(false);
    }
  };

  const handleStopScraping = () => {
    console.log('Manually stopping scraping process');
    
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    
    setIsScrapingU(false);
    
    // Try to fetch any data that was collected so far
    const fetchPartialData = async () => {
      try {
        const dataResponse = await fetch(`/api/scrape/data?sessionId=${sessionId}`);
        if (dataResponse.ok) {
          const dataResult = await dataResponse.json();
          if (dataResult.success && dataResult.data?.length > 0) {
            setScrapedData(dataResult.data);
            console.log(`Partial data loaded: ${dataResult.data.length} posts`);
          }
        }
      } catch (error) {
        console.error('Error fetching partial data:', error);
      }
    };
    
    fetchPartialData();
  };

  const handleNext = () => {
    onNext(scrapedData);
  };

  // Helper function to safely format dates
  const formatDate = (dateValue: any): string => {
    try {
      if (dateValue instanceof Date) {
        return dateValue.toISOString();
      }
      if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        return new Date(dateValue).toISOString();
      }
      return new Date().toISOString(); // Fallback to current date
    } catch (error) {
      console.warn('Invalid date value:', dateValue);
      return new Date().toISOString(); // Fallback to current date
    }
  };

  const handleExport = () => {
    if (isFreeUser) {
      setShowUpgradeModal(true);
      return;
    }
    // Create comprehensive CSV export with posts and comments
    const csvRows: string[] = [];
    
    // Header row
    csvRows.push('Type,Post_ID,Post_Title,Post_Content,Post_Author,Post_Score,Post_Comments_Count,Post_Upvote_Ratio,Post_Subreddit,Post_Created,Post_URL,Comment_ID,Comment_Body,Comment_Author,Comment_Score,Comment_Depth,Comment_Created,Comment_Parent_ID');
    
    scrapedData.forEach(post => {
      // Add post row
      const postRow = [
        'POST',
        post.id,
        `"${post.title.replace(/"/g, '""')}"`,
        `"${post.content.replace(/"/g, '""').substring(0, 1000)}"`,
        post.author,
        post.score,
        post.numComments,
        post.upvoteRatio || 0,
        post.subreddit,
        formatDate(post.createdAt),
        post.url,
        '', // Comment fields empty for post rows
        '',
        '',
        '',
        '',
        '',
        ''
      ].join(',');
      
      csvRows.push(postRow);
      
      // Add comment rows if they exist
      if (post.comments && post.comments.length > 0) {
        const addComments = (comments: any[], parentId: string = '') => {
          comments.forEach(comment => {
            const commentRow = [
              'COMMENT',
              post.id, // Post ID
              `"${post.title.replace(/"/g, '""')}"`, // Post title for reference
              '', // Post content empty for comment rows
              post.author, // Post author for reference
              post.score, // Post score for reference
              post.numComments,
              post.upvoteRatio || 0,
              post.subreddit,
              formatDate(post.createdAt),
              post.url,
              comment.id,
              `"${comment.body.replace(/"/g, '""').substring(0, 1000)}"`,
              comment.author,
              comment.score,
              comment.depth,
              formatDate(comment.createdAt),
              comment.parentId || parentId
            ].join(',');
            
            csvRows.push(commentRow);
            
            // Recursively add replies
            if (comment.replies && comment.replies.length > 0) {
              addComments(comment.replies, comment.id);
            }
          });
        };
        
        addComments(post.comments);
      }
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reddit-comprehensive-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Show export summary
    const totalComments = scrapedData.reduce((sum, post) => {
      const countComments = (comments: any[]): number => {
        return comments.reduce((count, comment) => {
          return count + 1 + (comment.replies ? countComments(comment.replies) : 0);
        }, 0);
      };
      return sum + (post.comments ? countComments(post.comments) : 0);
    }, 0);
    
    alert(`Export complete!\n\nIncluded:\n- ${scrapedData.length} posts\n- ${totalComments} comments\n- All authors, scores, and timestamps`);
  };

  const getProgressIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'in-progress':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const totalPosts = progress.reduce((sum, p) => sum + p.totalPosts, 0);
  const completedSubreddits = progress.filter(p => p.status === 'completed').length;
  const errorSubreddits = progress.filter(p => p.status === 'error').length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        {/* Top Navigation */}
        <StepNavigation
          position="top"
          onBack={onBack}
          onNext={handleNext}
          backText="Back to Selection"
          nextText={`Continue to AI Analysis (${scrapedData.length} posts)`}
          nextDisabled={scrapedData.length === 0}
        />

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Step 3: Data Scraping & Export
          </h2>
          <p className="text-lg text-gray-600">
            Collect posts and comments from selected subreddits
          </p>
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              🚀 <strong>Ultra-Fast Mode:</strong> Using optimized desktop app approach with parallel processing for lightning-fast results!
            </p>
          </div>
        </div>

        {/* Selected Subreddits Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            Selected Subreddits ({selectedSubreddits.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedSubreddits.map((subreddit) => (
              <span
                key={subreddit}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                r/{subreddit}
              </span>
            ))}
          </div>
        </div>

        {/* Scraping Controls */}
        {!isScrapingU && scrapedData.length === 0 && (
          <div className="text-center mb-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Ready to Scrape Data</h3>
              <p className="text-gray-600">
                This will collect recent posts from your selected subreddits using advanced filters.
              </p>
              <p className="text-sm text-blue-600 mt-2">
                ⏱️ Expected time: {selectedSubreddits.length === 1 ? '1-3 seconds' : selectedSubreddits.length === 2 ? '2-6 seconds' : `${selectedSubreddits.length * 1}-${selectedSubreddits.length * 3} seconds`} for {selectedSubreddits.length} subreddit{selectedSubreddits.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={handleStartScraping}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              <Download className="w-5 h-5" />
              Start Data Collection
            </button>
          </div>
        )}

        {/* Stop Scraping Button */}
        {isScrapingU && (
          <div className="text-center mb-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Scraping in Progress</h3>
              <p className="text-gray-600">
                Data collection is running. You can stop it anytime if needed.
              </p>
            </div>
            <button
              onClick={handleStopScraping}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-lg font-medium"
            >
              <AlertCircle className="w-5 h-5" />
              Stop Scraping
            </button>
          </div>
        )}

        {/* Progress Monitoring */}
        {(isScrapingU || progress.length > 0) && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Scraping Progress</h3>
            
            {/* Overall Progress */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Overall Progress
                </span>
                <span className="text-sm text-gray-600">
                  {completedSubreddits} of {selectedSubreddits.length} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedSubreddits / selectedSubreddits.length) * 100}%` }}
                />
              </div>
              {totalPosts > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Collected {totalPosts.toLocaleString()} posts total
                </p>
              )}
            </div>

            {/* Individual Subreddit Progress */}
            <div className="space-y-3">
              {selectedSubreddits.map((subreddit) => {
                const subredditProgress = progress.find(p => p.subreddit === subreddit);
                const elapsedTime = subredditProgress?.startTime 
                  ? Math.round((Date.now() - new Date(subredditProgress.startTime).getTime()) / 1000)
                  : 0;
                
                return (
                  <div key={subreddit} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getProgressIcon(subredditProgress?.status || 'pending')}
                      <div>
                        <span className="font-medium">r/{subreddit}</span>
                        {subredditProgress?.status === 'in-progress' && (
                          <div className="text-xs text-blue-600 mt-1">
                            {subredditProgress.errors.length > 0 && subredditProgress.errors[0].includes('page') 
                              ? subredditProgress.errors[0] 
                              : `Scraping for ${elapsedTime}s...`}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {subredditProgress?.status === 'completed' && (
                        <div>
                          <span className="text-sm font-medium text-green-600">
                            {subredditProgress.totalPosts} posts
                          </span>
                          <div className="text-xs text-green-500">
                            Completed in {subredditProgress.endTime && subredditProgress.startTime 
                              ? Math.round((new Date(subredditProgress.endTime).getTime() - new Date(subredditProgress.startTime).getTime()) / 1000)
                              : 0}s
                          </div>
                        </div>
                      )}
                      {subredditProgress?.status === 'error' && (
                        <div>
                          <span className="text-sm text-red-600 font-medium">
                            Error
                          </span>
                          <div className="text-xs text-red-500">
                            {subredditProgress.errors[0] || 'Unknown error'}
                          </div>
                        </div>
                      )}
                      {subredditProgress?.status === 'in-progress' && (
                        <div>
                          <span className="text-sm text-blue-600 font-medium">
                            {subredditProgress.processedPosts || 0} posts
                          </span>
                          <div className="text-xs text-blue-500">
                            Scraping...
                          </div>
                        </div>
                      )}
                      {!subredditProgress && (
                        <span className="text-sm text-gray-500">
                          Waiting...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-800 font-medium">Error occurred during scraping</p>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Results Summary */}
        {scrapedData.length > 0 && (
          <div className="mb-8">
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-green-900">
                  Data Collection Complete!
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-800">Total Posts:</span>
                  <span className="ml-2 text-green-700">{scrapedData.length.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-green-800">Subreddits:</span>
                  <span className="ml-2 text-green-700">{selectedSubreddits.length}</span>
                </div>
                <div>
                  <span className="font-medium text-green-800">Success Rate:</span>
                  <span className="ml-2 text-green-700">
                    {Math.round(((selectedSubreddits.length - errorSubreddits) / selectedSubreddits.length) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Sample Data Preview */}
              <div className="mt-4">
                <h4 className="font-medium text-green-800 mb-2">Sample Posts:</h4>
                <div className="space-y-2">
                  {scrapedData.slice(0, 3).map((post) => (
                    <div key={post.id} className="p-2 bg-white border border-green-200 rounded text-xs">
                      <div className="font-medium text-gray-900 line-clamp-1">{post.title}</div>
                      <div className="text-gray-600">r/{post.subreddit} • {post.score} points • {post.numComments} comments</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Export Info */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-medium text-blue-800 mb-1">📊 Comprehensive Export Available</h4>
                <div className="text-sm text-blue-700">
                  • All {scrapedData.length} posts with full content
                  • All comments with authors, scores & timestamps
                  • Nested comment threads with reply relationships
                  • Post metadata: upvote ratios, flairs, URLs
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Selection
          </button>
          
          <div className="flex gap-3">
            {scrapedData.length > 0 && (
              <button
                onClick={handleExport}
                className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors relative ${
                  isFreeUser
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                disabled={isFreeUser}
              >
                <Download className="w-4 h-4" />
                Export Complete Dataset
                {isFreeUser && (
                  <Lock className="w-4 h-4 ml-1" />
                )}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={scrapedData.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue to AI Analysis
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📊 Data Collection Info</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Collects top posts from the past month with minimum 10 upvotes</li>
            <li>• Includes post metadata: title, content, score, comments, author</li>
            <li>• Rate-limited to comply with Reddit's API guidelines</li>
            <li>• Raw data can be exported at any point for external analysis</li>
          </ul>
        </div>
      </div>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Data Export"
        description="Export comprehensive datasets with all posts, comments, and metadata. Available in Pro and Premium plans."
      />
    </div>
  );
}