import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, ScrapingProgress } from '@/types';
import { progressStorage, debugStorage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    console.log(`🔍 GET Progress request for sessionId: ${sessionId}`);

    if (!sessionId) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Session ID is required',
      }, { status: 400 });
    }

    // CRITICAL DEBUG: Show all storage state
    debugStorage();
    
    const progressKey = `scraping_progress:${sessionId}`;
    const progress = progressStorage.get(progressKey);
    
    console.log(`📊 Looking for progress key: ${progressKey}`);
    console.log(`📊 Progress data found:`, progress);
    
    if (!progress) {
      console.log(`⚠️ No progress data found for session ${sessionId}`);
      console.log(`🔍 Available keys:`, Array.from(progressStorage.keys()));
    }

    return NextResponse.json<APIResponse<ScrapingProgress[]>>({
      success: true,
      data: progress || [],
      message: progress ? `Retrieved progress for ${progress.length} subreddits` : 'No progress data available yet',
    });

  } catch (error) {
    console.error('❌ Error getting scraping progress:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Failed to get scraping progress',
    }, { status: 500 });
  }
}