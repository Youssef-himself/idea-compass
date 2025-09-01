import { NextRequest, NextResponse } from 'next/server';
import AIAnalyzer from '@/lib/openai';
import { APIResponse, RedditPost, BusinessIdea } from '@/types';
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
      // Fallback to mock business ideas for demo
      const mockIdeas = await generateMockBusinessIdeas(posts);
      try {
        await kvDb.saveBusinessIdeas(sessionId, mockIdeas);
      } catch (kvError) {
        console.warn('KV storage unavailable, continuing without cache:', kvError);
      }
      
      return NextResponse.json<APIResponse<BusinessIdea[]>>({
        success: true,
        data: mockIdeas,
        message: 'Business ideas generated using demo mode (OpenAI API key not configured)',
      });
    }

    // Use AI to generate business ideas
    const businessIdeas = await AIAnalyzer.generateBusinessIdeas(posts);
    
    // Save business ideas to cache (with fallback handling)
    try {
      await kvDb.saveBusinessIdeas(sessionId, businessIdeas);
    } catch (kvError) {
      console.warn('KV storage unavailable, continuing without cache:', kvError);
    }

    return NextResponse.json<APIResponse<BusinessIdea[]>>({
      success: true,
      data: businessIdeas,
      message: `Successfully generated ${businessIdeas.length} business ideas`,
    });

  } catch (error) {
    console.error('Error in phase-a analysis API:', error);
    
    // Fallback to mock business ideas on error
    try {
      const { posts, sessionId } = await request.json();
      const mockIdeas = await generateMockBusinessIdeas(posts);
      try {
        await kvDb.saveBusinessIdeas(sessionId, mockIdeas);
      } catch (kvError) {
        console.warn('KV storage unavailable, continuing without cache:', kvError);
      }
      
      return NextResponse.json<APIResponse<BusinessIdea[]>>({
        success: true,
        data: mockIdeas,
        message: 'Business ideas generated using fallback mode due to AI service error',
      });
    } catch (fallbackError) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate business ideas',
      }, { status: 500 });
    }
  }
}

// Generate mock business ideas for demo/fallback purposes
async function generateMockBusinessIdeas(posts: RedditPost[]): Promise<BusinessIdea[]> {
  const subreddits = [...new Set(posts.map(p => p.subreddit))];
  const commonKeywords = ['workflow', 'automation', 'data', 'communication', 'productivity', 'integration', 'analytics', 'management'];
  
  const ideaTemplates = [
    {
      id: 'idea_workflow_1',
      title: 'No-Code Workflow Automation Platform',
      description: 'A SaaS platform that allows small teams to create custom workflow automations through a visual drag-and-drop interface, connecting popular business tools without requiring technical expertise.'
    },
    {
      id: 'idea_data_2', 
      title: 'AI-Powered Data Organization System',
      description: 'An intelligent data management platform that automatically categorizes, tags, and structures business data from various sources, making it easily searchable and actionable for growing companies.'
    },
    {
      id: 'idea_communication_3',
      title: 'Context-Aware Team Communication Hub',
      description: 'A communication platform that automatically links conversations to relevant projects and team members, providing intelligent threading and decision tracking for remote teams.'
    },
    {
      id: 'idea_analytics_4',
      title: 'Real-Time Business Intelligence Dashboard',
      description: 'A unified analytics platform that aggregates data from multiple business tools and provides real-time insights with customizable dashboards and automated reporting.'
    },
    {
      id: 'idea_integration_5',
      title: 'Universal API Integration Manager',
      description: 'A middleware platform that simplifies API integrations between business applications, allowing non-technical users to connect and sync data across their tool stack.'
    },
    {
      id: 'idea_productivity_6',
      title: 'AI-Assisted Project Optimization Tool',
      description: 'A project management enhancement platform that uses AI to analyze team patterns, predict bottlenecks, and suggest optimizations to improve productivity and delivery times.'
    }
  ];

  // Select 4-6 ideas based on post content analysis
  const selectedIdeas = ideaTemplates.slice(0, Math.min(4 + Math.floor(posts.length / 100), 6));

  console.log(`Mock Phase A: Generated ${selectedIdeas.length} business ideas for ${posts.length} posts`);

  return selectedIdeas;
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

    let businessIdeas: BusinessIdea[] | null = null;
    try {
      businessIdeas = await kvDb.getBusinessIdeas(sessionId);
    } catch (kvError) {
      console.warn('KV storage unavailable for retrieval:', kvError);
      businessIdeas = null;
    }

    return NextResponse.json<APIResponse<BusinessIdea[]>>({
      success: true,
      data: businessIdeas || [],
    });

  } catch (error) {
    console.error('Error getting business ideas:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Failed to get business ideas',
    }, { status: 500 });
  }
}