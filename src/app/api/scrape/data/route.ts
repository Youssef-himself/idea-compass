export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, RedditPost } from '@/types';
import { dataStorage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Session ID is required',
      }, { status: 400 });
    }

    const scrapedData = dataStorage.get(sessionId);

    return NextResponse.json<APIResponse<RedditPost[]>>({
      success: true,
      data: scrapedData || [],
      message: scrapedData ? `Retrieved ${scrapedData.length} posts` : 'No data available yet',
    });

  } catch (error) {
    console.error('Error getting scraped data:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Failed to get scraped data',
    }, { status: 500 });
  }
}