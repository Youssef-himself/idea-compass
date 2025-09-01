import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, CSVData, CSVMapping, RedditPost } from '@/types';
import CSVProcessor from '@/lib/csv-processor';
import { dataStorage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;

    if (!file) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'No file provided',
      }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Session ID is required',
      }, { status: 400 });
    }

    console.log('📎 Processing uploaded file:', file.name, 'for session:', sessionId);

    // Parse CSV file with progress tracking
    const csvData = await CSVProcessor.parseFile(file, (progress) => {
      console.log(`📈 Processing progress: ${progress.progress}% - ${progress.message}`);
    });

    // Generate automatic column mapping
    const suggestedMapping = CSVProcessor.suggestMapping(csvData.columns);
    console.log('🤖 Auto-generated mapping:', suggestedMapping);

    // Convert to Reddit posts automatically
    let posts: RedditPost[] = [];
    try {
      posts = CSVProcessor.convertToRedditPosts(csvData, suggestedMapping);
      console.log(`✅ Successfully converted ${posts.length} rows to posts`);
    } catch (error) {
      console.error('❌ Conversion failed:', error);
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Failed to process CSV data. Please ensure your file has a title/name column.',
      }, { status: 400 });
    }

    // Store the processed data temporarily for the session
    dataStorage.set(sessionId, posts);
    console.log(`💾 Stored ${posts.length} posts for session ${sessionId}`);

    // Return success with processed data info
    return NextResponse.json<APIResponse<{ 
      csvData: CSVData, 
      posts: RedditPost[], 
      mapping: CSVMapping,
      count: number 
    }>>({
      success: true,
      data: { 
        csvData, 
        posts, 
        mapping: suggestedMapping,
        count: posts.length
      },
      message: `Successfully processed ${posts.length} items from ${file.name}`,
    });

  } catch (error) {
    console.error('❌ Error processing CSV upload:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process CSV file',
    }, { status: 500 });
  }
}

export async function GET() {
  // Return sample CSV for download
  try {
    const sampleCSV = CSVProcessor.generateSampleCSV();
    
    return new NextResponse(sampleCSV, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="sample-data.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Failed to generate sample CSV',
    }, { status: 500 });
  }
}