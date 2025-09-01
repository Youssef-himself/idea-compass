export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import AIAnalyzer from '@/lib/openai';
import { APIResponse, RedditPost, Category } from '@/types';
import { kvDb } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { posts, sessionId } = await request.json();

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Posts array is required',
      }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Session ID is required',
      }, { status: 400 });
    }

    // Check if we have OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to mock categorization for demo
      const mockCategories = await generateMockCategories(posts);
      try {
        await kvDb.saveCategories(sessionId, mockCategories);
      } catch (kvError) {
        console.warn('KV storage unavailable, continuing without cache:', kvError);
      }
      
      return NextResponse.json<APIResponse<Category[]>>({
        success: true,
        data: mockCategories,
        message: 'Categories generated using demo mode (OpenAI API key not configured)',
      });
    }

    // Use AI categorization
    const categories = await AIAnalyzer.categorizePost(posts);
    
    // Save categories to cache (with fallback handling)
    try {
      await kvDb.saveCategories(sessionId, categories);
    } catch (kvError) {
      console.warn('KV storage unavailable, continuing without cache:', kvError);
    }

    return NextResponse.json<APIResponse<Category[]>>({
      success: true,
      data: categories,
      message: `Successfully categorized ${posts.length} posts into ${categories.length} categories`,
    });

  } catch (error) {
    console.error('Error in categorize API:', error);
    
    // Fallback to mock categorization on error
    try {
      const { posts, sessionId } = await request.json();
      const mockCategories = await generateMockCategories(posts);
      try {
        await kvDb.saveCategories(sessionId, mockCategories);
      } catch (kvError) {
        console.warn('KV storage unavailable, continuing without cache:', kvError);
      }
      
      return NextResponse.json<APIResponse<Category[]>>({
        success: true,
        data: mockCategories,
        message: 'Categories generated using fallback mode due to AI service error',
      });
    } catch (fallbackError) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to categorize posts',
      }, { status: 500 });
    }
  }
}

// Generate mock categories for demo/fallback purposes
async function generateMockCategories(posts: RedditPost[]): Promise<Category[]> {
  // Analyze posts to create realistic categories
  const subreddits = [...new Set(posts.map(p => p.subreddit))];
  const topicKeywords = extractTopicKeywords(posts);
  
  const categories: Category[] = [];
  let assignedPosts = 0;
  
  // Create categories based on common patterns and distribute ALL posts
  if (topicKeywords.problems > 0) {
    const problemPosts = posts.filter(p => 
      p.title.toLowerCase().includes('problem') || 
      p.title.toLowerCase().includes('issue') ||
      p.content.toLowerCase().includes('not working') ||
      p.title.toLowerCase().includes('bug') ||
      p.title.toLowerCase().includes('error')
    );
    
    if (problemPosts.length > 0) {
      categories.push({
        id: 'cat_problems',
        name: 'Issues & Problems',
        description: 'Posts discussing problems, complaints, and issues',
        keywords: ['problem', 'issue', 'bug', 'error', 'broken', 'not working'],
        postCount: problemPosts.length,
        percentage: Math.round((problemPosts.length / posts.length) * 100),
        confidence: 0.85,
        samplePosts: problemPosts.slice(0, 3),
        tags: ['negative', 'feedback', 'support'],
      });
      assignedPosts += problemPosts.length;
    }
  }

  if (topicKeywords.requests > 0) {
    const requestPosts = posts.filter(p => 
      p.title.toLowerCase().includes('feature') || 
      p.title.toLowerCase().includes('request') ||
      p.title.toLowerCase().includes('suggestion') ||
      p.title.toLowerCase().includes('improve') ||
      p.title.toLowerCase().includes('should')
    ).filter(p => !categories.some(cat => cat.samplePosts.some(sp => sp.id === p.id)));
    
    if (requestPosts.length > 0) {
      categories.push({
        id: 'cat_requests',
        name: 'Feature Requests',
        description: 'User suggestions and feature requests',
        keywords: ['feature', 'request', 'suggestion', 'improve', 'add', 'should'],
        postCount: requestPosts.length,
        percentage: Math.round((requestPosts.length / posts.length) * 100),
        confidence: 0.78,
        samplePosts: requestPosts.slice(0, 3),
        tags: ['positive', 'improvement', 'enhancement'],
      });
      assignedPosts += requestPosts.length;
    }
  }

  if (topicKeywords.questions > 0) {
    const questionPosts = posts.filter(p => 
      p.title.toLowerCase().includes('how') || 
      p.title.toLowerCase().includes('help') ||
      p.title.toLowerCase().startsWith('what') ||
      p.title.toLowerCase().includes('why') ||
      p.title.toLowerCase().includes('question')
    ).filter(p => !categories.some(cat => cat.samplePosts.some(sp => sp.id === p.id)));
    
    if (questionPosts.length > 0) {
      categories.push({
        id: 'cat_questions',
        name: 'Questions & Help',
        description: 'Users seeking help and asking questions',
        keywords: ['how', 'what', 'why', 'help', 'question', 'anyone know'],
        postCount: questionPosts.length,
        percentage: Math.round((questionPosts.length / posts.length) * 100),
        confidence: 0.82,
        samplePosts: questionPosts.slice(0, 3),
        tags: ['neutral', 'support', 'community'],
      });
      assignedPosts += questionPosts.length;
    }
  }

  // Get remaining unassigned posts
  const assignedPostIds = new Set(
    categories.flatMap(cat => cat.samplePosts.map(sp => sp.id))
  );
  const remainingPosts = posts.filter(p => !assignedPostIds.has(p.id));
  
  if (remainingPosts.length > 0) {
    categories.push({
      id: 'cat_discussions',
      name: 'General Discussion',
      description: 'General conversations and community discussions',
      keywords: ['discussion', 'thoughts', 'opinion', 'think', 'experience'],
      postCount: remainingPosts.length,
      percentage: Math.round((remainingPosts.length / posts.length) * 100),
      confidence: 0.72,
      samplePosts: remainingPosts.slice(0, 3),
      tags: ['neutral', 'conversation', 'community'],
    });
  }

  // If no specific patterns found, create simple subreddit-based categories
  if (categories.length === 0) {
    const postsBySubreddit = subreddits.map(subreddit => {
      const subredditPosts = posts.filter(p => p.subreddit === subreddit);
      return {
        id: `cat_${subreddit.toLowerCase()}`,
        name: `r/${subreddit} Discussions`,
        description: `Posts from the ${subreddit} community`,
        keywords: [subreddit.toLowerCase()],
        postCount: subredditPosts.length,
        percentage: Math.round((subredditPosts.length / posts.length) * 100),
        confidence: 0.9,
        samplePosts: subredditPosts.slice(0, 3),
        tags: ['community', subreddit.toLowerCase()],
      };
    });

    categories.push(...postsBySubreddit);
  }

  // Verify all posts are accounted for
  const totalCategorizedPosts = categories.reduce((sum, cat) => sum + cat.postCount, 0);
  console.log(`Mock categorization: ${totalCategorizedPosts}/${posts.length} posts categorized into ${categories.length} categories`);

  return categories;
}

function extractTopicKeywords(posts: RedditPost[]) {
  const allText = posts.map(p => `${p.title} ${p.content}`).join(' ').toLowerCase();
  
  return {
    problems: (allText.match(/\b(problem|issue|bug|error|broken|not working|fail)\b/g) || []).length,
    requests: (allText.match(/\b(feature|request|suggestion|improve|add|should|could)\b/g) || []).length,
    questions: (allText.match(/\b(how|what|why|help|question|anyone know)\b/g) || []).length,
    discussions: (allText.match(/\b(discussion|thoughts|opinion|think|experience)\b/g) || []).length,
  };
}

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

    let categories: Category[] | null = null;
    try {
      categories = await kvDb.getCategories(sessionId);
    } catch (kvError) {
      console.warn('KV storage unavailable for retrieval:', kvError);
      categories = null;
    }

    return NextResponse.json<APIResponse<Category[]>>({
      success: true,
      data: categories || [],
    });

  } catch (error) {
    console.error('Error getting categories:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Failed to get categories',
    }, { status: 500 });
  }
}