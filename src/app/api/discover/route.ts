import { NextRequest, NextResponse } from 'next/server';
import RedditAPI from '@/lib/reddit';
import { APIResponse, SubredditMetadata } from '@/types';
import { AuthHelpers } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await AuthHelpers.getCurrentUser();
    if (!user) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Authentication required. Please sign in to continue.',
      }, { status: 401 });
    }

    // Check if user has research credits available
    const { hasCredits, remainingCredits } = await AuthHelpers.hasResearchCredits(user.id);
    if (!hasCredits) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'You have run out of research credits. Please upgrade your plan to continue.',
      }, { status: 403 });
    }

    const { keywords } = await request.json();

    // Validate input
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Keywords array is required',
      }, { status: 400 });
    }

    // Additional validation: limit keywords array size and sanitize
    if (keywords.length > 10) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Maximum of 10 keywords allowed',
      }, { status: 400 });
    }

    // Sanitize keywords
    const sanitizedKeywords = keywords
      .map(keyword => String(keyword).trim())
      .filter(keyword => keyword.length > 0 && keyword.length <= 100)
      .slice(0, 10);

    if (sanitizedKeywords.length === 0) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'At least one valid keyword is required (max 100 characters each)',
      }, { status: 400 });
    }

    // Consume a research credit
    const creditConsumed = await AuthHelpers.consumeResearchCredit(user.id, 'discover_subreddits');
    if (!creditConsumed) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Failed to process research credit. Please try again.',
      }, { status: 500 });
    }

    // Discover subreddits using Reddit API
    const subreddits = await RedditAPI.discoverSubreddits(sanitizedKeywords);

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