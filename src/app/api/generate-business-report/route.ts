import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, RedditPost, BusinessPlan, GeneratedReport } from '@/types';
import { kvDb, pgDb } from '@/lib/database';
import { requireAuthentication, requireResearchCredits, validateInput, sanitizeInput } from '@/lib/api-middleware';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuthentication(request);
    if (!authResult.success) {
      return authResult.response;
    }

    // Check and consume research credits for report generation
    const creditResult = await requireResearchCredits(authResult.user.id, 'generate_report');
    if (!creditResult.success) {
      return creditResult.response;
    }

    const rawData = await request.json();
    const { posts, businessPlans, sessionId } = sanitizeInput(rawData);

    // Validate input
    const validation = validateInput(rawData, [
      { field: 'posts', type: 'array', required: true, minLength: 1 },
      { field: 'businessPlans', type: 'array', required: true, minLength: 1 },
      { field: 'sessionId', type: 'string', required: true, minLength: 1, maxLength: 100 }
    ]);

    if (!validation.isValid) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: `Invalid input: ${validation.errors.join(', ')}`,
      }, { status: 400 });
    }

    const startTime = Date.now();

    // Generate comprehensive business report
    const report = generateBusinessReport(posts, businessPlans);

    // Calculate processing time
    report.metadata.processingTime = Date.now() - startTime;

    // Save report to database
    try {
      await pgDb.saveGeneratedReport(report, sessionId);
    } catch (dbError) {
      console.warn('Failed to save report to database:', dbError);
    }

    return NextResponse.json<APIResponse<GeneratedReport>>({
      success: true,
      data: report,
      message: `Business report generated successfully in ${Math.round(report.metadata.processingTime / 1000)} seconds`,
    });

  } catch (error) {
    console.error('Error in generate-business-report API:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate business report',
    }, { status: 500 });
  }
}

function generateBusinessReport(
  posts: RedditPost[],
  businessPlans: BusinessPlan[]
): GeneratedReport {
  const reportId = `business_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const totalPosts = posts.length;
  const totalSubreddits = [...new Set(posts.map(p => p.subreddit))].length;
  
  // Generate smart title based on business plans
  const title = generateSmartBusinessReportTitle(businessPlans);

  // Generate executive summary
  const executiveSummary = generateExecutiveSummary(businessPlans, totalPosts, totalSubreddits);

  // Generate key findings
  const keyFindings = generateKeyFindings(businessPlans);

  // Generate recommendations
  const recommendations = generateBusinessRecommendations(businessPlans);

  // Generate report sections (optional - could include market analysis)
  const sections = generateReportSections(businessPlans);

  const report: GeneratedReport = {
    id: reportId,
    title,
    executiveSummary,
    keyFindings,
    sections,
    businessPlans,
    metadata: {
      totalPosts,
      totalSubreddits,
      analysisDate: new Date(),
      processingTime: 0, // Will be set by caller
      totalIdeas: businessPlans.length,
      selectedIdeas: businessPlans.length,
    },
    recommendations,
    sourceCitation: [
      `Data collected from ${totalSubreddits} subreddits`,
      `Total posts analyzed: ${totalPosts.toLocaleString()}`,
      `Business opportunities identified: ${businessPlans.length}`,
      `Analysis type: AI-Powered Business Opportunity Analysis`,
      `Analysis completed: ${new Date().toLocaleDateString()}`,
    ],
  };

  return report;
}

function generateSmartBusinessReportTitle(businessPlans: BusinessPlan[]): string {
  const planCount = businessPlans.length;
  
  if (planCount === 1) {
    return `Business Opportunity Analysis: ${businessPlans[0].title}`;
  } else if (planCount <= 3) {
    const titles = businessPlans.map(p => p.title.split(':')[0].trim()).slice(0, 2);
    return `Business Opportunity Analysis: ${titles.join(' & ')} + ${planCount - 2} More`;
  } else {
    return `Business Opportunity Analysis: ${planCount} SaaS Opportunities`;
  }
}

function generateExecutiveSummary(
  businessPlans: BusinessPlan[],
  totalPosts: number,
  totalSubreddits: number
): string {
  const avgMarketPotential = businessPlans.reduce((sum, plan) => sum + plan.marketPotential, 0) / businessPlans.length;
  const avgFeasibility = businessPlans.reduce((sum, plan) => sum + plan.feasibility, 0) / businessPlans.length;
  const topPlan = businessPlans.reduce((max, plan) => 
    (plan.marketPotential + plan.feasibility) > (max.marketPotential + max.feasibility) ? plan : max, 
    businessPlans[0]
  );

  return `This comprehensive business opportunity analysis examined ${totalPosts.toLocaleString()} community discussions across ${totalSubreddits} Reddit communities to identify and develop ${businessPlans.length} high-potential SaaS business opportunities.

Through AI-powered analysis of user problems, pain points, and unmet needs expressed in these discussions, we identified distinct market gaps that represent significant business opportunities. The analysis reveals an average market potential score of ${avgMarketPotential.toFixed(1)}/10 and feasibility score of ${avgFeasibility.toFixed(1)}/10 across all identified opportunities.

The highest-potential opportunity identified is "${topPlan.title}" with a combined score of ${topPlan.marketPotential + topPlan.feasibility}/20, addressing critical problems in ${topPlan.targetAudience.toLowerCase()}. Each opportunity includes detailed market analysis, technical feasibility assessment, monetization strategies, and concrete action plans for validation and implementation.

The findings provide a clear roadmap for entrepreneurs and businesses looking to enter the SaaS market with data-driven, community-validated business ideas.`;
}

function generateKeyFindings(businessPlans: BusinessPlan[]): string[] {
  const findings: string[] = [];
  
  // Market potential analysis
  const highPotential = businessPlans.filter(p => p.marketPotential >= 8).length;
  const mediumPotential = businessPlans.filter(p => p.marketPotential >= 6 && p.marketPotential < 8).length;
  
  if (highPotential > 0) {
    findings.push(`${highPotential} high-potential opportunities (8-10/10 market score) identified with significant market demand and growth potential`);
  }
  
  if (mediumPotential > 0) {
    findings.push(`${mediumPotential} medium-potential opportunities (6-7/10 market score) offer solid market entry points with manageable competition`);
  }

  // Feasibility analysis
  const highFeasibility = businessPlans.filter(p => p.feasibility >= 8).length;
  if (highFeasibility > 0) {
    findings.push(`${highFeasibility} opportunities rated as highly feasible (8-10/10) for solo founders or small teams to implement`);
  }

  // Target audience patterns
  const audienceTypes = businessPlans.map(p => {
    const audience = p.targetAudience.toLowerCase();
    if (audience.includes('small') || audience.includes('startup')) return 'SMB';
    if (audience.includes('enterprise') || audience.includes('large')) return 'Enterprise';
    if (audience.includes('freelancer') || audience.includes('individual')) return 'Individual';
    return 'Mid-market';
  });
  
  const smbCount = audienceTypes.filter(t => t === 'SMB').length;
  if (smbCount > 0) {
    findings.push(`${smbCount} opportunities specifically target small-medium businesses, indicating strong demand in the underserved SMB market`);
  }

  // Common problem themes
  const problemThemes = businessPlans.map(p => {
    const problem = p.coreProblem.toLowerCase();
    if (problem.includes('workflow') || problem.includes('automation')) return 'workflow';
    if (problem.includes('data') || problem.includes('organization')) return 'data';
    if (problem.includes('communication') || problem.includes('collaboration')) return 'communication';
    return 'productivity';
  });
  
  const workflowCount = problemThemes.filter(t => t === 'workflow').length;
  if (workflowCount > 0) {
    findings.push(`Workflow automation and process optimization emerged as dominant themes in ${workflowCount} opportunities, reflecting widespread inefficiencies in business operations`);
  }

  // Monetization patterns
  const subscriptionCount = businessPlans.filter(p => 
    p.monetization.toLowerCase().includes('subscription') || p.monetization.toLowerCase().includes('monthly')
  ).length;
  
  if (subscriptionCount > 0) {
    findings.push(`${subscriptionCount} opportunities are well-suited for recurring subscription models, providing predictable revenue potential`);
  }

  // Add at least 5 findings
  while (findings.length < 5) {
    findings.push(`Community-driven analysis reveals authentic market demand with real users expressing genuine pain points requiring solutions`);
    findings.push(`Technical implementation paths are clearly defined with specific feature requirements and integration needs identified`);
    break;
  }

  return findings.slice(0, 6); // Limit to 6 key findings
}

function generateBusinessRecommendations(businessPlans: BusinessPlan[]): string[] {
  const recommendations: string[] = [];
  
  // Prioritization recommendation
  const topPlan = businessPlans.reduce((max, plan) => 
    (plan.marketPotential + plan.feasibility) > (max.marketPotential + max.feasibility) ? plan : max, 
    businessPlans[0]
  );
  
  recommendations.push(`Prioritize "${topPlan.title}" as your primary opportunity due to its optimal combination of market potential (${topPlan.marketPotential}/10) and implementation feasibility (${topPlan.feasibility}/10)`);

  // Market validation recommendation
  const highPotentialPlans = businessPlans.filter(p => p.marketPotential >= 8);
  if (highPotentialPlans.length > 1) {
    recommendations.push(`Conduct parallel validation for the ${highPotentialPlans.length} highest-potential opportunities to maximize your chances of finding product-market fit`);
  }

  // Development approach
  const highFeasibility = businessPlans.filter(p => p.feasibility >= 8);
  if (highFeasibility.length > 0) {
    recommendations.push(`Start with the ${highFeasibility.length} most technically feasible opportunities to achieve faster time-to-market and earlier revenue generation`);
  }

  // Community engagement recommendation
  recommendations.push(`Engage directly with the source communities where these problems were identified to validate assumptions and gather additional user feedback`);

  // MVP development recommendation
  recommendations.push(`Focus on building minimal viable products (MVPs) with the core features identified in each business plan before expanding functionality`);

  // Market monitoring recommendation
  recommendations.push(`Establish ongoing monitoring of the source communities and related discussions to track market evolution and emerging opportunities`);

  return recommendations;
}

function generateReportSections(businessPlans: BusinessPlan[]): any[] {
  const sections = [];

  // Market Analysis Section
  sections.push({
    id: 'market_analysis',
    title: 'Market Opportunity Analysis',
    content: `The analysis of community discussions reveals significant market opportunities across multiple domains. The average market potential score of ${(businessPlans.reduce((sum, plan) => sum + plan.marketPotential, 0) / businessPlans.length).toFixed(1)}/10 indicates strong commercial viability for the identified opportunities.

Key market characteristics include unmet user needs, expressed frustrations with existing solutions, and active discussions about desired features and improvements. This organic demand validation provides a strong foundation for product development and go-to-market strategies.

The diversity of opportunities spans multiple business domains, indicating broad market needs rather than niche-specific problems, suggesting multiple viable entry points for new SaaS businesses.`,
    insights: [
      'Community-validated demand reduces market risk',
      'Multiple viable opportunities provide strategic options',
      'Real user problems translate to genuine market need'
    ],
    evidence: [],
    confidence: 0.85,
    tags: ['market-analysis', 'demand-validation']
  });

  // Implementation Feasibility Section
  sections.push({
    id: 'implementation_analysis',
    title: 'Implementation Feasibility Assessment',
    content: `Technical feasibility analysis reveals practical implementation paths for all identified opportunities. The average feasibility score of ${(businessPlans.reduce((sum, plan) => sum + plan.feasibility, 0) / businessPlans.length).toFixed(1)}/10 demonstrates that these opportunities are achievable for individual entrepreneurs and small teams.

Most opportunities leverage existing technologies and APIs, reducing development complexity and time-to-market. The identified feature sets are well-scoped for MVP development, allowing for iterative product development based on user feedback.

Resource requirements vary but remain within reasonable bounds for bootstrap or seed-funded development, making these opportunities accessible to a wide range of potential founders.`,
    insights: [
      'Moderate technical complexity enables solo founder success',
      'Existing technology stacks reduce development risk',
      'Clear MVP scope accelerates time-to-market'
    ],
    evidence: [],
    confidence: 0.80,
    tags: ['feasibility', 'technical-assessment']
  });

  return sections;
}

export async function GET() {
  return NextResponse.json({
    message: 'Business report generation API endpoint. Use POST with posts and businessPlans.',
  });
}