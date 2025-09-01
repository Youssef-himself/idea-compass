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

interface BusinessPlan {
  id: string;
  title: string;
  coreProblem: string;
  proposedSolution: string;
  targetAudience: string;
  keyFeatures: string[];
  marketPotential: number;
  feasibility: number;
  monetization: string;
  actionPlan: string;
}

export async function POST(request: NextRequest) {
  try {
    const { posts, selectedIdeas, sessionId } = await request.json();

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Posts array is required',
      }, { status: 400 });
    }

    if (!selectedIdeas || !Array.isArray(selectedIdeas) || selectedIdeas.length === 0) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Selected ideas array is required',
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
      // Fallback to mock business plans for demo
      const mockPlans = await generateMockBusinessPlans(posts, selectedIdeas);
      try {
        await kvDb.saveBusinessPlans(sessionId, mockPlans);
      } catch (kvError) {
        console.warn('KV storage unavailable, continuing without cache:', kvError);
      }
      
      return NextResponse.json<APIResponse<BusinessPlan[]>>({
        success: true,
        data: mockPlans,
        message: 'Business plans generated using demo mode (OpenAI API key not configured)',
      });
    }

    // Use AI to generate detailed business plans
    const businessPlans = await AIAnalyzer.generateBusinessPlans(posts, selectedIdeas);
    
    // Save business plans to cache (with fallback handling)
    try {
      await kvDb.saveBusinessPlans(sessionId, businessPlans);
    } catch (kvError) {
      console.warn('KV storage unavailable, continuing without cache:', kvError);
    }

    return NextResponse.json<APIResponse<BusinessPlan[]>>({
      success: true,
      data: businessPlans,
      message: `Successfully generated ${businessPlans.length} detailed business plans`,
    });

  } catch (error) {
    console.error('Error in phase2 analysis API:', error);
    
    // Fallback to mock business plans on error
    try {
      const { posts, selectedIdeas, sessionId } = await request.json();
      const mockPlans = await generateMockBusinessPlans(posts, selectedIdeas);
      try {
        await kvDb.saveBusinessPlans(sessionId, mockPlans);
      } catch (kvError) {
        console.warn('KV storage unavailable, continuing without cache:', kvError);
      }
      
      return NextResponse.json<APIResponse<BusinessPlan[]>>({
        success: true,
        data: mockPlans,
        message: 'Business plans generated using fallback mode due to AI service error',
      });
    } catch (fallbackError) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate business plans',
      }, { status: 500 });
    }
  }
}

// Generate mock business plans for demo/fallback purposes
async function generateMockBusinessPlans(posts: RedditPost[], selectedIdeas: BusinessIdea[]): Promise<BusinessPlan[]> {
  const businessPlans: BusinessPlan[] = [];

  for (const idea of selectedIdeas) {
    let plan: BusinessPlan;

    // Generate specific plans based on idea type
    if (idea.id.includes('workflow')) {
      plan = {
        id: idea.id,
        title: idea.title,
        coreProblem: 'Small teams struggle with manual, repetitive tasks that consume valuable time and resources, as evidenced by frequent complaints about inefficient workflows and time-consuming processes in the analyzed posts.',
        proposedSolution: 'A no-code workflow automation platform that allows teams to create custom automations through a visual interface, connecting popular business tools and automating routine tasks without technical expertise.',
        targetAudience: 'Small to medium businesses (10-50 employees), startup teams, and freelancers who need workflow optimization but lack dedicated IT resources.',
        keyFeatures: [
          'Visual drag-and-drop workflow builder',
          'Pre-built templates for common business processes',
          'Integration with 100+ popular business apps',
          'Real-time monitoring and analytics dashboard',
          'Team collaboration features with shared workflows'
        ],
        marketPotential: 8,
        feasibility: 7,
        monetization: 'Tiered subscription model: Starter ($19/month for 3 users), Professional ($49/month for 10 users), Enterprise ($149/month for unlimited users with advanced features).',
        actionPlan: 'Create a landing page showcasing workflow automation benefits and collect emails from 50 potential users from relevant business subreddits to validate demand.'
      };
    } else if (idea.id.includes('data')) {
      plan = {
        id: idea.id,
        title: idea.title,
        coreProblem: 'Businesses are drowning in unorganized data across multiple platforms and tools, leading to inefficiency, duplicated efforts, and missed insights as highlighted in numerous data management frustrations in the posts.',
        proposedSolution: 'An AI-powered data organization platform that automatically categorizes, tags, and structures business data from various sources, making it easily searchable and actionable.',
        targetAudience: 'Growing companies (20-200 employees), marketing agencies, and consulting firms that handle large amounts of client data and documents.',
        keyFeatures: [
          'AI-powered automatic data categorization',
          'Universal search across all connected data sources',
          'Smart tagging and metadata extraction',
          'Customizable data organization rules',
          'Secure data access controls and permissions'
        ],
        marketPotential: 9,
        feasibility: 6,
        monetization: 'Usage-based pricing: $0.10 per GB processed monthly, with minimum plans starting at $29/month for 300GB, scaling up to enterprise contracts.',
        actionPlan: 'Build a prototype that organizes sample business documents and demonstrate it to 20 potential customers from business-focused subreddits to gather feedback and validation.'
      };
    } else if (idea.id.includes('communication')) {
      plan = {
        id: idea.id,
        title: idea.title,
        coreProblem: 'Remote and distributed teams lose context and efficiency due to fragmented communication across multiple tools, as evidenced by posts about miscommunication and project delays.',
        proposedSolution: 'A context-aware communication platform that automatically links conversations to relevant projects, documents, and team members, providing intelligent conversation threading and decision tracking.',
        targetAudience: 'Remote-first companies, distributed development teams, and project-based service businesses with 10-100 employees.',
        keyFeatures: [
          'Intelligent conversation threading by project context',
          'Automatic meeting summary and action item extraction',
          'Integration with project management and document tools',
          'Decision tracking and outcome monitoring',
          'Smart notification management based on urgency and relevance'
        ],
        marketPotential: 7,
        feasibility: 8,
        monetization: 'Per-user monthly subscription: $12/user/month for teams under 25, $8/user/month for larger teams, with annual discounts and enterprise custom pricing.',
        actionPlan: 'Create a mockup of the context-aware interface and conduct user interviews with 15 remote team leads from r/remotework to validate the core value proposition.'
      };
    } else {
      // Generic plan template
      plan = {
        id: idea.id,
        title: idea.title,
        coreProblem: `Based on analysis of the community discussions, users frequently express frustration with existing solutions and seek more effective tools to address their specific needs in this domain.`,
        proposedSolution: `A specialized SaaS platform designed to solve the unique challenges identified in the community data, offering targeted features that existing solutions fail to address adequately.`,
        targetAudience: `Members of the analyzed communities and similar professionals who face the same challenges, typically ranging from individual contributors to small-medium teams.`,
        keyFeatures: [
          'User-friendly interface optimized for the target workflow',
          'Integration with commonly used tools in the space',
          'Automated features to reduce manual work',
          'Analytics and reporting capabilities',
          'Collaborative features for team use'
        ],
        marketPotential: Math.floor(Math.random() * 3) + 6, // 6-8
        feasibility: Math.floor(Math.random() * 3) + 6, // 6-8
        monetization: 'Monthly subscription model with freemium tier: Free (basic features), Pro ($19/month), Team ($49/month for up to 10 users).',
        actionPlan: 'Build a landing page describing the solution and collect emails from interested users in the relevant communities to measure demand and gather feature feedback.'
      };
    }

    businessPlans.push(plan);
  }

  console.log(`Mock Phase 2: Generated ${businessPlans.length} detailed business plans`);

  return businessPlans;
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

    let businessPlans: BusinessPlan[] | null = null;
    try {
      businessPlans = await kvDb.getBusinessPlans(sessionId);
    } catch (kvError) {
      console.warn('KV storage unavailable for retrieval:', kvError);
      businessPlans = null;
    }

    return NextResponse.json<APIResponse<BusinessPlan[]>>({
      success: true,
      data: businessPlans || [],
    });

  } catch (error) {
    console.error('Error getting business plans:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Failed to get business plans',
    }, { status: 500 });
  }
}