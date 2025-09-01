import { NextRequest, NextResponse } from 'next/server';
import RedditAPI from '@/lib/reddit';
import { APIResponse, RedditPost, SearchFilters, ScrapingProgress } from '@/types';
import { progressStorage, dataStorage, debugStorage } from '@/lib/storage';
import { requireAuthentication, requireResearchCredits, validateInput, sanitizeInput } from '@/lib/api-middleware';

const scrapingJobs = new Map<string, Promise<void>>();


export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuthentication(request);
    if (!authResult.success) {
      return authResult.response;
    }

    // Check and consume research credits
    const creditResult = await requireResearchCredits(authResult.user.id, 'scrape_data');
    if (!creditResult.success) {
      return creditResult.response;
    }

    const rawData = await request.json();
    const { subreddits, filters, sessionId, keywords } = sanitizeInput(rawData);
    
    console.log(`🚀 POST Start scraping request for sessionId: ${sessionId}`);
    console.log(`🎯 Subreddits:`, subreddits);
    console.log(`🔑 Keywords:`, keywords);

    // Validate input
    const validation = validateInput(rawData, [
      { field: 'subreddits', type: 'array', required: true, minLength: 1, maxLength: 20 },
      { field: 'sessionId', type: 'string', required: true, minLength: 1, maxLength: 100 },
      { field: 'keywords', type: 'array', required: false, maxLength: 10 }
    ]);

    if (!validation.isValid) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: `Invalid input: ${validation.errors.join(', ')}`,
      }, { status: 400 });
    }

    // Additional validation for subreddits
    if (!subreddits.every((sub: any) => typeof sub === 'string' && sub.length > 0 && sub.length <= 21)) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'All subreddits must be valid strings (1-21 characters)',
      }, { status: 400 });
    }

    const keywordsToUse = keywords || [];
    console.log(`🚀 Starting ultra-fast scraping: ${subreddits.length} subreddits, ${keywordsToUse.length} keywords`);

    // Check if already scraping for this session
    if (scrapingJobs.has(sessionId)) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Scraping already in progress for this session',
      }, { status: 409 });
    }

    // Initialize progress tracking
    const progressKey = `scraping_progress:${sessionId}`;
    const initialProgress: ScrapingProgress[] = subreddits.map((sub: string) => ({
      subreddit: sub,
      totalPosts: 0,
      processedPosts: 0,
      status: 'pending',
      errors: [],
      startTime: new Date(),
    }));

    progressStorage.set(progressKey, initialProgress);
    console.log(`📦 STORED initial progress for key: ${progressKey}`);
    debugStorage();

    // Start scraping process asynchronously
    const scrapingPromise = performScraping(subreddits, filters, sessionId, progressKey, keywordsToUse);
    scrapingJobs.set(sessionId, scrapingPromise);

    // Clean up completed job after some time
    scrapingPromise.finally(() => {
      setTimeout(() => {
        scrapingJobs.delete(sessionId);
      }, 300000); // Clean up after 5 minutes
    });

    return NextResponse.json<APIResponse<{ message: string }>>({
      success: true,
      data: { message: 'Scraping started successfully' },
      message: `Started ultra-fast scraping of ${subreddits.length} subreddits with ${keywordsToUse.length} keywords`,
    });

  } catch (error) {
    console.error('Error starting scrape job:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start scraping',
    }, { status: 500 });
  }
}

async function performScraping(
  subreddits: string[], 
  filters: SearchFilters, 
  sessionId: string, 
  progressKey: string,
  keywords: string[] = []
): Promise<void> {
  const allPosts: RedditPost[] = [];
  
  // Get existing progress (don't reinitialize)
  const existingProgress = progressStorage.get(progressKey) || [];
  console.log(`📊 Starting scraping with existing progress for ${subreddits.length} subreddits`);
  
  try {
    console.log(`🚀 Using ultra-conservative scraping with ${keywords.length} keywords:`, keywords);
    
    // Enhanced progress update function
    const updateProgress = (scrapingProgress: ScrapingProgress) => {
      const currentProgress = progressStorage.get(progressKey) || existingProgress;
      const index = currentProgress.findIndex(p => p.subreddit === scrapingProgress.subreddit);
      if (index >= 0) {
        currentProgress[index] = { ...scrapingProgress };
        progressStorage.set(progressKey, [...currentProgress]);
        console.log(`📈 Updated progress for r/${scrapingProgress.subreddit}: ${scrapingProgress.status}`);
      }
    };
    
    const onSubredditComplete = (subreddit: string, posts: RedditPost[]) => {
      // Don't add posts here - they will be returned by scrapeMultipleSubreddits
      console.log(`✅ Completed r/${subreddit}: ${posts.length} posts`);
    };
    
    // Use ultra-conservative sequential scraping
    const scrapedPosts = await RedditAPI.scrapeMultipleSubreddits(
      subreddits,
      keywords.length > 0 ? keywords : [''], // Use empty string as fallback to get all posts
      updateProgress,
      onSubredditComplete
    );
    
    allPosts.push(...scrapedPosts);
    
    // CRITICAL FIX: Ensure ALL subreddits are marked as completed
    const finalProgress = progressStorage.get(progressKey) || existingProgress;
    finalProgress.forEach(p => {
      if (p.status === 'in-progress' || p.status === 'pending') {
        p.status = 'completed';
        p.endTime = new Date();
      }
    });
    progressStorage.set(progressKey, finalProgress);
    
    // Save final scraped data
    dataStorage.set(sessionId, allPosts);
    console.log(`🏁 Ultra-conservative scraping complete for session ${sessionId}: ${allPosts.length} total posts`);
    console.log(`📊 Final progress status:`, finalProgress.map(p => `${p.subreddit}: ${p.status}`));
    console.log(`📦 FINAL STORAGE STATE:`);
    debugStorage();
    
  } catch (error) {
    console.error('Fatal error during scraping:', error);
    
    // Mark all remaining as error
    const currentProgress = progressStorage.get(progressKey) || existingProgress;
    for (let i = 0; i < currentProgress.length; i++) {
      if (currentProgress[i].status === 'pending' || currentProgress[i].status === 'in-progress') {
        currentProgress[i].status = 'error';
        currentProgress[i].errors = [error instanceof Error ? error.message : 'Scraping process failed'];
        currentProgress[i].endTime = new Date();
      }
    }
    progressStorage.set(progressKey, currentProgress);
    console.log(`❌ Error occurred - final progress:`, currentProgress.map(p => `${p.subreddit}: ${p.status}`));
  }
}