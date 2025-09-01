import { NextRequest, NextResponse } from 'next/server';
import AIAnalyzer from '@/lib/openai';
import { APIResponse, RedditPost } from '@/types';
import { kvDb } from '@/lib/database';

interface BusinessIdea {
  id: string;
  title: string;
  description: string;
  selected?: boolean;
}

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
      message: `Successfully identified ${businessIdeas.length} business opportunities from ${posts.length} posts`,
    });

  } catch (error) {
    console.error('Error in phase1 analysis API:', error);
    
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
  // Analyze posts to create realistic business ideas based on problems and needs
  const problemPatterns = extractProblemPatterns(posts);
  const businessIdeas: BusinessIdea[] = [];

  // Generate ideas based on common pain points found in the data
  if (problemPatterns.workflowIssues > 0) {
    businessIdeas.push({
      id: 'idea_workflow_automation',
      title: 'Workflow Automation SaaS for Small Teams',
      description: 'A specialized tool to automate repetitive tasks and streamline workflows for small businesses and teams.'
    });
  }

  if (problemPatterns.dataManagement > 0) {
    businessIdeas.push({
      id: 'idea_data_organization',
      title: 'Smart Data Organization Platform',
      description: 'An AI-powered platform that automatically categorizes and organizes business data across multiple sources.'
    });
  }

  if (problemPatterns.communicationGaps > 0) {
    businessIdeas.push({
      id: 'idea_team_communication',
      title: 'Context-Aware Team Communication Hub',
      description: 'A communication platform that uses context and project history to improve team collaboration efficiency.'
    });
  }

  if (problemPatterns.customerSupport > 0) {
    businessIdeas.push({
      id: 'idea_customer_support_ai',
      title: 'AI-Powered Customer Support Assistant',
      description: 'An intelligent customer support system that learns from past interactions to provide better automated responses.'
    });
  }

  if (problemPatterns.projectManagement > 0) {
    businessIdeas.push({
      id: 'idea_project_tracking',
      title: 'Micro-Task Project Management Tool',
      description: 'A simplified project management solution focused on breaking down complex projects into manageable micro-tasks.'
    });
  }

  // Add some general ideas if we don't have enough specific ones
  if (businessIdeas.length < 3) {
    businessIdeas.push(
      {
        id: 'idea_productivity_analytics',
        title: 'Personal Productivity Analytics Dashboard',
        description: 'A tool that tracks and analyzes personal work patterns to suggest productivity improvements.'
      },
      {
        id: 'idea_content_scheduling',
        title: 'Smart Content Scheduling Platform',
        description: 'An AI-driven content calendar that optimizes posting times and content mix for maximum engagement.'
      },
      {
        id: 'idea_feedback_aggregator',
        title: 'Multi-Platform Feedback Aggregation Tool',
        description: 'A centralized dashboard that collects and analyzes customer feedback from various platforms and channels.'
      }
    );
  }

  // Generate additional ideas based on subreddit themes
  const subreddits = [...new Set(posts.map(p => p.subreddit))];
  subreddits.forEach(subreddit => {
    if (businessIdeas.length < 8) { // Limit total ideas
      businessIdeas.push({
        id: `idea_${subreddit.toLowerCase()}_solution`,
        title: `Specialized Tool for ${subreddit} Community`,
        description: `A niche SaaS solution addressing the specific needs and challenges commonly discussed in the ${subreddit} community.`
      });
    }
  });

  console.log(`Mock Phase 1: Generated ${businessIdeas.length} business ideas from ${posts.length} posts`);

  return businessIdeas.slice(0, 8); // Return max 8 ideas
}

function extractProblemPatterns(posts: RedditPost[]) {
  const allText = posts.map(p => `${p.title} ${p.content}`).join(' ').toLowerCase();
  
  return {
    workflowIssues: (allText.match(/\b(workflow|process|manual|repetitive|automate|efficiency)\b/g) || []).length,
    dataManagement: (allText.match(/\b(data|organize|manage|storage|backup|sync)\b/g) || []).length,
    communicationGaps: (allText.match(/\b(communication|collaborate|team|meeting|sync|share)\b/g) || []).length,
    customerSupport: (allText.match(/\b(support|customer|help|ticket|response|service)\b/g) || []).length,
    projectManagement: (allText.match(/\b(project|task|deadline|planning|tracking|milestone)\b/g) || []).length,
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