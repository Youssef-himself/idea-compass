import { NextRequest, NextResponse } from 'next/server';
import RedditAPI from '@/lib/reddit';
import { APIResponse, SubredditMetadata } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { keywords } = await request.json();

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Keywords array is required',
      }, { status: 400 });
    }

    // Discover subreddits using Reddit API
    const subreddits = await RedditAPI.discoverSubreddits(keywords);

    return NextResponse.json<APIResponse<SubredditMetadata[]>>({
      success: true,
      data: subreddits,
      message: `Found ${subreddits.length} relevant subreddits`,
    });

  } catch (error) {
    console.error('Error in discover API:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to discover subreddits',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Subreddit discovery API endpoint. Use POST with keywords array.',
  });
}