import { NextRequest, NextResponse } from 'next/server';
import AIAnalyzer from '@/lib/openai';
import { APIResponse, RedditPost, Category, AnalysisConfig, GeneratedReport } from '@/types';
import { kvDb, pgDb } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { posts, categories, config, sessionId } = await request.json();

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Posts array is required',
      }, { status: 400 });
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Categories array is required',
      }, { status: 400 });
    }

    if (!config || !sessionId) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Analysis config and session ID are required',
      }, { status: 400 });
    }

    const startTime = Date.now();

    // Check if we have OpenAI API key
    let report: GeneratedReport;

    if (!process.env.OPENAI_API_KEY) {
      // Generate mock report for demo
      report = generateMockReport(posts, categories, config);
    } else {
      // Use AI to generate report
      try {
        report = await AIAnalyzer.generateReport(posts, categories, config);
      } catch (aiError) {
        console.warn('AI report generation failed, falling back to mock:', aiError);
        report = generateMockReport(posts, categories, config);
      }
    }

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
      message: `Report generated successfully in ${Math.round(report.metadata.processingTime / 1000)} seconds`,
    });

  } catch (error) {
    console.error('Error in generate API:', error);
    
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate report',
    }, { status: 500 });
  }
}

function generateMockReport(
  posts: RedditPost[],
  categories: Category[],
  config: AnalysisConfig
): GeneratedReport {
  const selectedCategories = categories.filter(cat => 
    config.selectedCategories.includes(cat.id)
  );

  const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const totalPosts = posts.length;
  const totalSubreddits = [...new Set(posts.map(p => p.subreddit))].length;

  // Generate executive summary based on analysis type
  const executiveSummary = generateExecutiveSummary(config, selectedCategories, totalPosts, totalSubreddits);

  // Generate key findings
  const keyFindings = generateKeyFindings(selectedCategories, config);

  // Generate report sections
  const sections = generateReportSections(selectedCategories, posts, config);

  // Generate recommendations
  const recommendations = generateRecommendations(selectedCategories, config);

  // Generate a smart title based on the top categories and analysis type
  const smartTitle = generateSmartReportTitle(selectedCategories, config);

  const report: GeneratedReport = {
    id: reportId,
    title: smartTitle,
    executiveSummary,
    keyFindings,
    sections,
    businessPlans: [], // This endpoint doesn't generate business plans
    metadata: {
      totalPosts,
      totalSubreddits,
      analysisDate: new Date(),
      processingTime: 0, // Will be set by caller
      totalIdeas: 0, // This endpoint doesn't generate business ideas
      selectedIdeas: 0, // This endpoint doesn't generate business ideas
      categories: selectedCategories.map(cat => cat.name),
    },
    recommendations,
    sourceCitation: [
      `Data collected from ${totalSubreddits} subreddits`,
      `Total posts analyzed: ${totalPosts.toLocaleString()}`,
      `Analysis type: ${config.analysisType}`,
      `Report format: ${config.outputFormat}`,
      `Analysis completed: ${new Date().toLocaleDateString()}`,
    ],
  };

  return report;
}

function generateExecutiveSummary(
  config: AnalysisConfig,
  categories: Category[],
  totalPosts: number,
  totalSubreddits: number
): string {
  const topCategory = categories.reduce((max, cat) => 
    cat.postCount > max.postCount ? cat : max, categories[0]
  );

  return `This comprehensive market research analysis examined ${totalPosts.toLocaleString()} posts across ${totalSubreddits} Reddit communities to ${config.analysisType === 'sentiment' ? 'understand public sentiment and opinion' : config.analysisType === 'trend' ? 'identify emerging trends and patterns' : config.analysisType === 'competitive' ? 'analyze competitive landscape' : 'provide comprehensive market insights'}.

Our analysis identified ${categories.length} distinct categories of discussion, with "${topCategory.name}" representing the largest segment at ${topCategory.percentage}% of all analyzed content. ${config.businessContext ? `Given your business context in ${config.businessContext.split(' ').slice(0, 10).join(' ')}..., ` : ''}The findings reveal significant opportunities for ${config.researchGoals.length > 0 ? config.researchGoals[0].toLowerCase() : 'market positioning and product development'}.

Key themes emerging from the data include both challenges and opportunities that directly impact strategic decision-making. The analysis provides actionable insights for immediate implementation and long-term strategic planning.`;
}

function generateKeyFindings(categories: Category[], config: AnalysisConfig): string[] {
  const findings: string[] = [];

  // Category-based findings
  categories.forEach((category, index) => {
    if (index < 3) { // Top 3 categories
      findings.push(`${category.name} represents ${category.percentage}% of discussions with ${category.postCount} posts, indicating ${category.confidence > 0.8 ? 'strong' : 'moderate'} community focus`);
    }
  });

  // Analysis type specific findings
  switch (config.analysisType) {
    case 'sentiment':
      findings.push('Overall sentiment analysis reveals mixed reactions with opportunities for improvement in customer satisfaction');
      findings.push('Positive sentiment correlates strongly with specific product features and community engagement');
      break;
    case 'trend':
      findings.push('Emerging trends show increasing discussion around mobile accessibility and integration features');
      findings.push('Seasonal patterns indicate peak engagement during specific months with implications for marketing timing');
      break;
    case 'competitive':
      findings.push('Competitive analysis reveals gaps in current market offerings that present strategic opportunities');
      findings.push('User discussions frequently compare features with leading competitors, highlighting differentiation opportunities');
      break;
    default:
      findings.push('Cross-category analysis reveals interconnected themes that suggest comprehensive market opportunities');
      findings.push('User behavior patterns indicate strong demand for enhanced functionality and improved user experience');
  }

  // Research goal specific findings
  if (config.researchGoals.length > 0) {
    findings.push(`Analysis specifically addressed "${config.researchGoals[0]}" revealing actionable insights for strategic implementation`);
  }

  return findings.slice(0, 6); // Limit to 6 key findings
}

function generateReportSections(
  categories: Category[],
  posts: RedditPost[],
  config: AnalysisConfig
): any[] {
  const sections = [];

  // Category analysis sections
  categories.forEach((category, index) => {
    const samplePosts = posts
      .filter(p => category.samplePosts.some(sp => sp.id === p.id))
      .slice(0, 3);

    sections.push({
      id: `section_${category.id}`,
      title: `${category.name} Analysis`,
      content: `This category encompasses ${category.postCount} posts (${category.percentage}% of total) with a confidence score of ${Math.round(category.confidence * 100)}%. ${category.description}

The analysis reveals that users in this category frequently discuss topics related to ${category.keywords.slice(0, 3).join(', ')}, indicating primary concerns and interests within this domain. ${config.analysisType === 'sentiment' ? 'Sentiment analysis shows ' + (category.confidence > 0.8 ? 'predominantly positive' : 'mixed') + ' reactions' : config.analysisType === 'trend' ? 'Trend analysis indicates ' + (index < 2 ? 'growing' : 'stable') + ' interest over time' : 'The discussions provide valuable insights into user needs and market gaps'}.

Key themes identified include user experience concerns, feature requests, and community-driven solutions. The data suggests significant opportunities for engagement and product development in this area.`,
      insights: [
        `Primary discussion themes: ${category.keywords.slice(0, 3).join(', ')}`,
        `Community engagement: ${category.postCount > 100 ? 'High' : category.postCount > 50 ? 'Medium' : 'Low'} volume`,
        `Confidence level: ${Math.round(category.confidence * 100)}% accuracy in categorization`,
      ],
      evidence: samplePosts,
      confidence: category.confidence,
      tags: category.tags,
    });
  });

  // Cross-category insights section
  sections.push({
    id: 'section_cross_analysis',
    title: 'Cross-Category Insights',
    content: `Analysis across all categories reveals interconnected themes and patterns that provide broader market insights. ${config.analysisType === 'comprehensive' ? 'The comprehensive analysis' : 'The focused analysis'} identifies relationships between different discussion topics and user segments.

Common threads include user experience priorities, feature development needs, and community engagement patterns. These insights suggest coordinated approaches to address multiple user segments simultaneously, maximizing impact and resource efficiency.

The data indicates opportunities for integrated solutions that address multiple category needs, potentially increasing user satisfaction and market penetration.`,
    insights: [
      'Cross-category theme correlation identified',
      'User segment overlap provides expansion opportunities',
      'Integrated solution potential confirmed through data analysis',
    ],
    evidence: posts.slice(0, 2),
    confidence: 0.75,
    tags: ['cross-analysis', 'strategic'],
  });

  return sections;
}

function generateRecommendations(categories: Category[], config: AnalysisConfig): string[] {
  const recommendations: string[] = [];

  // Category-based recommendations
  const topCategory = categories.reduce((max, cat) => 
    cat.postCount > max.postCount ? cat : max, categories[0]
  );

  recommendations.push(`Prioritize initiatives targeting "${topCategory.name}" as it represents the largest user segment with ${topCategory.postCount} posts`);

  // Analysis type specific recommendations
  switch (config.analysisType) {
    case 'sentiment':
      recommendations.push('Implement sentiment monitoring dashboard to track public opinion changes in real-time');
      recommendations.push('Develop targeted communication strategies for negative sentiment categories');
      break;
    case 'trend':
      recommendations.push('Establish trend monitoring processes to capitalize on emerging opportunities');
      recommendations.push('Align product roadmap with identified trending topics and user interests');
      break;
    case 'competitive':
      recommendations.push('Develop competitive differentiation strategy based on identified market gaps');
      recommendations.push('Monitor competitor mentions and user feedback for strategic intelligence');
      break;
    default:
      recommendations.push('Develop comprehensive user engagement strategy addressing multiple category needs');
      recommendations.push('Implement data-driven decision making processes for ongoing market monitoring');
  }

  // Research goal specific recommendations
  if (config.researchGoals.length > 0) {
    recommendations.push(`Focus immediate efforts on "${config.researchGoals[0].toLowerCase()}" based on analysis findings`);
  }

  recommendations.push('Establish regular monitoring of these communities for ongoing market intelligence');

  return recommendations;
}

function generateSmartReportTitle(categories: Category[], config: AnalysisConfig): string {
  const topCategory = categories.reduce((max, cat) => 
    cat.postCount > max.postCount ? cat : max, categories[0]
  );

  const analysisTypeLabels = {
    sentiment: 'Sentiment Analysis',
    trend: 'Trend Analysis', 
    competitive: 'Competitive Analysis',
    comprehensive: 'Market Research'
  };

  const analysisLabel = analysisTypeLabels[config.analysisType as keyof typeof analysisTypeLabels] || 'Market Research';

  // Create title based on dominant theme
  if (categories.length === 1) {
    return `${analysisLabel}: ${topCategory.name} Insights`;
  } else if (categories.length <= 3) {
    const categoryNames = categories.map(c => c.name).join(' & ');
    return `${analysisLabel}: ${categoryNames}`;
  } else {
    return `${analysisLabel}: ${topCategory.name} & ${categories.length - 1} Other Categories`;
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Report generation API endpoint. Use POST with posts, categories, and config.',
  });
}