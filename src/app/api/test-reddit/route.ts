export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import RedditAPI from '@/lib/reddit';

export async function GET(request: NextRequest) {
  try {
    console.log('[Test-Reddit] =================================================');
    console.log('[Test-Reddit] COMPREHENSIVE REDDIT API DEBUG TEST STARTING');
    console.log('[Test-Reddit] =================================================');
    console.log('[Test-Reddit] Environment Check:');
    console.log(`[Test-Reddit] REDDIT_CLIENT_ID: ${process.env.REDDIT_CLIENT_ID || 'NOT SET'}`);
    console.log(`[Test-Reddit] REDDIT_CLIENT_SECRET: ${process.env.REDDIT_CLIENT_SECRET?.substring(0, 4) || 'NOT SET'}...`);
    console.log(`[Test-Reddit] NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`[Test-Reddit] Vercel Region: ${process.env.VERCEL_REGION || 'local'}`);
    console.log('[Test-Reddit] -------------------------------------------------');
    
    // Test 1: Direct Reddit API call
    console.log('[Test-Reddit] TEST 1: Direct Reddit API Call');
    const testUrl = 'https://www.reddit.com/r/test/top.json?limit=5&t=week';
    console.log(`[Test-Reddit] Making direct request to: ${testUrl}`);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'IdeaCompass/1.0 (Market Research Tool) by /u/IdeaCompass',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    console.log(`[Test-Reddit] Direct API Response: ${response.status} ${response.statusText}`);
    console.log(`[Test-Reddit] Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error response');
      console.error(`[Test-Reddit] Direct API Error Response: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const posts = data.data?.children?.length || 0;
    console.log(`[Test-Reddit] TEST 1 SUCCESS: ${posts} posts from r/test`);
    
    // Test 2: RedditAPI.discoverSubreddits
    console.log('[Test-Reddit] TEST 2: RedditAPI.discoverSubreddits');
    try {
      const subreddits = await RedditAPI.discoverSubreddits(['technology']);
      console.log(`[Test-Reddit] TEST 2 SUCCESS: Found ${subreddits.length} subreddits`);
      if (subreddits.length > 0) {
        console.log(`[Test-Reddit] First result: ${subreddits[0].name} (${subreddits[0].subscribers} subscribers)`);
      }
    } catch (discoverError) {
      console.error('[Test-Reddit] TEST 2 FAILED:', discoverError);
      throw new Error(`Discovery test failed: ${discoverError instanceof Error ? discoverError.message : 'Unknown error'}`);
    }
    
    // Test 3: RedditAPI.scrapeSubreddit
    console.log('[Test-Reddit] TEST 3: RedditAPI.scrapeSubreddit');
    try {
      const scrapedPosts = await RedditAPI.scrapeSubreddit('test', ['*']);
      console.log(`[Test-Reddit] TEST 3 SUCCESS: Scraped ${scrapedPosts.length} posts`);
      if (scrapedPosts.length > 0) {
        console.log(`[Test-Reddit] First post: "${scrapedPosts[0].title}" by ${scrapedPosts[0].author}`);
      }
    } catch (scrapeError) {
      console.error('[Test-Reddit] TEST 3 FAILED:', scrapeError);
      throw new Error(`Scraping test failed: ${scrapeError instanceof Error ? scrapeError.message : 'Unknown error'}`);
    }
    
    console.log('[Test-Reddit] =================================================');
    console.log('[Test-Reddit] ALL TESTS PASSED SUCCESSFULLY');
    console.log('[Test-Reddit] =================================================');
    
    return NextResponse.json({
      success: true,
      message: `All Reddit API tests passed successfully`,
      details: {
        directApiTest: `${posts} posts from r/test`,
        discoveryTest: 'Found subreddits for technology',
        scrapingTest: 'Successfully scraped r/test posts'
      },
      environment: {
        hasClientId: !!process.env.REDDIT_CLIENT_ID,
        hasClientSecret: !!process.env.REDDIT_CLIENT_SECRET,
        nodeEnv: process.env.NODE_ENV,
        vercelRegion: process.env.VERCEL_REGION
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[Test-Reddit] =================================================');
    console.error('[Test-Reddit] CRITICAL TEST FAILURE');
    console.error('[Test-Reddit] =================================================');
    console.error('[Test-Reddit] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Test-Reddit] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[Test-Reddit] Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    console.error('[Test-Reddit] Full error object:', error);
    console.error('[Test-Reddit] =================================================');
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Reddit API comprehensive test failed',
      environment: {
        hasClientId: !!process.env.REDDIT_CLIENT_ID,
        hasClientSecret: !!process.env.REDDIT_CLIENT_SECRET,
        nodeEnv: process.env.NODE_ENV,
        vercelRegion: process.env.VERCEL_REGION
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}