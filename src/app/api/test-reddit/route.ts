export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Reddit API connectivity...');
    
    // Test with a simple, reliable subreddit
    const testUrl = 'https://www.reddit.com/r/test/top.json?limit=5&t=week';
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'IdeaCompass/1.0',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const posts = data.data?.children?.length || 0;
    
    console.log(`Reddit test successful: ${posts} posts from r/test`);
    
    return NextResponse.json({
      success: true,
      message: `Reddit API working - got ${posts} posts from r/test`,
      status: response.status,
      url: testUrl
    });
    
  } catch (error) {
    console.error('Reddit test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Reddit API test failed'
    }, { status: 500 });
  }
}