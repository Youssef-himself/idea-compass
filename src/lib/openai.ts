import OpenAI from 'openai';
import { RedditPost, Category, AnalysisConfig, GeneratedReport, ReportSection } from '@/types';

// Lazy initialization of OpenAI client
let openai: any | null = null;

async function getOpenAIClient(): Promise<any> {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    const OpenAI = (await import('openai')).default;
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export class AIAnalyzer {
  // Categorize posts using AI
  static async categorizePost(posts: RedditPost[]): Promise<Category[]> {
    try {
      if (posts.length === 0) return [];

      // Prepare post data for analysis
      const postSample = posts.slice(0, 100).map(post => ({
        title: post.title,
        content: post.content.substring(0, 500), // Limit content length
        subreddit: post.subreddit,
        score: post.score,
        comments: post.numComments,
      }));

      const prompt = this.buildCategorizationPrompt(postSample);

      const response = await (await getOpenAIClient()).chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert market research analyst. Analyze the provided Reddit posts and categorize them into meaningful themes that would be useful for business intelligence and market research.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const categoriesText = response.choices[0]?.message?.content;
      if (!categoriesText) throw new Error('No categorization response received');

      // Parse the AI response into categories
      const categories = this.parseCategorizationResponse(categoriesText, posts);
      
      // Assign posts to categories
      const categorizedPosts = await this.assignPostsToCategories(posts, categories);
      
      return categorizedPosts;

    } catch (error) {
      console.error('Error categorizing posts:', error);
      throw new Error('Failed to categorize posts');
    }
  }

  // Generate final report using AI
  static async generateReport(
    posts: RedditPost[],
    categories: Category[],
    config: AnalysisConfig
  ): Promise<GeneratedReport> {
    try {
      const reportPrompt = this.buildReportPrompt(posts, categories, config);

      const response = await (await getOpenAIClient()).chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.getSystemPromptForReport(config.outputFormat)
          },
          {
            role: 'user',
            content: reportPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
      });

      const reportContent = response.choices[0]?.message?.content;
      if (!reportContent) throw new Error('No report response received');

      // Parse the report content
      const report = this.parseReportResponse(reportContent, posts, categories, config);
      
      return report;

    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }

  // Generate insights for specific categories
  static async generateCategoryInsights(
    category: Category,
    posts: RedditPost[]
  ): Promise<string[]> {
    try {
      const categoryPosts = posts.filter(post => 
        category.samplePosts.some(sample => sample.id === post.id)
      );

      const prompt = `
Analyze these Reddit posts from the "${category.name}" category and provide 3-5 key business insights:

Posts:
${categoryPosts.slice(0, 10).map(post => `
Title: ${post.title}
Content: ${post.content.substring(0, 300)}
Score: ${post.score}
Comments: ${post.numComments}
---`).join('\n')}

Provide specific, actionable insights that would be valuable for business decision-making.
`;

      const response = await (await getOpenAIClient()).chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a business intelligence expert. Provide clear, actionable insights based on social media discussions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      const insights = response.choices[0]?.message?.content;
      if (!insights) return [];

      // Parse insights into array  
      return insights.split('\n').filter((line: string) => 
        line.trim().length > 10 && (line.includes('-') || line.includes('•') || line.match(/^\d+\./))
      ).map((insight: string) => insight.replace(/^[-•\d.\s]+/, '').trim());

    } catch (error) {
      console.error('Error generating category insights:', error);
      return [];
    }
  }

  // PHASE 1: Generate business ideas from problems and opportunities
  static async generateBusinessIdeas(posts: RedditPost[]): Promise<any[]> {
    try {
      if (posts.length === 0) return [];

      // Prepare post data for business idea analysis
      const postSample = posts.slice(0, 100).map(post => ({
        title: post.title,
        content: post.content.substring(0, 500),
        subreddit: post.subreddit,
        score: post.score,
        comments: post.numComments,
      }));

      const prompt = this.buildBusinessIdeaPrompt(postSample);

      const response = await (await getOpenAIClient()).chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert business strategist and entrepreneur. Your mission is to transform raw data into actionable, high-potential SaaS business ideas. You must identify problems and needs expressed in the data and convert them into viable business opportunities.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2000,
      });

      const businessIdeasText = response.choices[0]?.message?.content;
      if (!businessIdeasText) throw new Error('No business ideas response received');

      // Parse the AI response into business ideas
      const businessIdeas = this.parseBusinessIdeasResponse(businessIdeasText);
      
      return businessIdeas;

    } catch (error) {
      console.error('Error generating business ideas:', error);
      throw new Error('Failed to generate business ideas');
    }
  }

  // PHASE 2: Generate detailed business plans for selected ideas
  static async generateBusinessPlans(posts: RedditPost[], selectedIdeas: any[]): Promise<any[]> {
    try {
      if (posts.length === 0 || selectedIdeas.length === 0) return [];

      const businessPlans = [];

      for (const idea of selectedIdeas) {
        const prompt = this.buildBusinessPlanPrompt(posts, idea);

        const response = await (await getOpenAIClient()).chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a senior business consultant specializing in SaaS startups and market analysis. Generate detailed, realistic business plans with market scoring and actionable next steps.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500,
        });

        const businessPlanText = response.choices[0]?.message?.content;
        if (businessPlanText) {
          const businessPlan = this.parseBusinessPlanResponse(businessPlanText, idea);
          businessPlans.push(businessPlan);
        }
      }

      return businessPlans;

    } catch (error) {
      console.error('Error generating business plans:', error);
      throw new Error('Failed to generate business plans');
    }
  }

  // Extract sentiment from posts
  static async analyzeSentiment(posts: RedditPost[]): Promise<{ positive: number; negative: number; neutral: number }> {
    try {
      const samplePosts = posts.slice(0, 50);
      const textsToAnalyze = samplePosts.map(post => `${post.title} ${post.content.substring(0, 200)}`);

      const prompt = `
Analyze the sentiment of these Reddit posts and provide a breakdown:

${textsToAnalyze.map((text, i) => `${i + 1}. ${text}`).join('\n\n')}

Respond with only three numbers representing the percentage of posts that are positive, negative, and neutral (should sum to 100):
Format: "positive:X negative:Y neutral:Z"
`;

      const response = await (await getOpenAIClient()).chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a sentiment analysis expert. Analyze text sentiment accurately.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 100,
      });

      const sentimentText = response.choices[0]?.message?.content || '';
      const match = sentimentText.match(/positive:(\d+)\s+negative:(\d+)\s+neutral:(\d+)/);
      
      if (match) {
        return {
          positive: parseInt(match[1]),
          negative: parseInt(match[2]),
          neutral: parseInt(match[3]),
        };
      }

      // Default fallback
      return { positive: 40, negative: 20, neutral: 40 };

    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return { positive: 40, negative: 20, neutral: 40 };
    }
  }

  // Private helper methods
  private static buildCategorizationPrompt(posts: any[]): string {
    return `
Analyze these Reddit posts and create 5-8 meaningful categories that capture the main themes and topics discussed. Each category should be business-relevant and actionable.

Posts to analyze:
${posts.map((post, i) => `
${i + 1}. Title: ${post.title}
   Content: ${post.content}
   Subreddit: r/${post.subreddit}
   Engagement: ${post.score} points, ${post.comments} comments
`).join('\n')}

For each category, provide:
1. Category name (2-4 words)
2. Brief description (1 sentence)
3. Key keywords/phrases (3-5 words)
4. Estimated confidence level (0-100)

Format your response as:
CATEGORY 1: [Name]
Description: [Description]
Keywords: [keyword1, keyword2, keyword3]
Confidence: [0-100]

CATEGORY 2: [Name]
...
`;
  }

  private static buildReportPrompt(
    posts: RedditPost[],
    categories: Category[],
    config: AnalysisConfig
  ): string {
    const selectedCategories = categories.filter(cat => 
      config.selectedCategories.includes(cat.id)
    );

    return `
Generate a comprehensive market research report based on this Reddit data analysis:

RESEARCH CONTEXT:
- Total Posts Analyzed: ${posts.length}
- Categories: ${selectedCategories.map(c => c.name).join(', ')}
- Analysis Type: ${config.analysisType}
- Business Context: ${config.businessContext || 'General market research'}
- Research Goals: ${config.researchGoals.join(', ')}

CATEGORY BREAKDOWN:
${selectedCategories.map(cat => `
- ${cat.name}: ${cat.postCount} posts (${cat.percentage}%)
  Description: ${cat.description}
  Key themes: ${cat.keywords.join(', ')}
`).join('\n')}

${config.customPrompt ? `CUSTOM ANALYSIS REQUEST:\n${config.customPrompt}\n` : ''}

Please provide a structured report with:
1. Executive Summary (2-3 paragraphs)
2. Key Findings (5-7 bullet points)
3. Category Analysis (detailed insights for each category)
4. Market Opportunities (3-5 specific opportunities)
5. Recommendations (3-5 actionable recommendations)
6. Conclusion

Focus on business-actionable insights and concrete opportunities.
`;
  }

  private static getSystemPromptForReport(format: string): string {
    const basePrompt = 'You are a senior market research analyst creating professional business intelligence reports.';
    
    switch (format) {
      case 'executive':
        return `${basePrompt} Focus on high-level strategic insights suitable for C-suite executives. Keep technical details minimal.`;
      case 'detailed':
        return `${basePrompt} Provide comprehensive analysis with supporting data and detailed explanations.`;
      case 'technical':
        return `${basePrompt} Include detailed methodology, data analysis techniques, and statistical insights.`;
      default:
        return basePrompt;
    }
  }

  private static parseCategorizationResponse(response: string, posts: RedditPost[]): Category[] {
    const categories: Category[] = [];
    const categoryBlocks = response.split(/CATEGORY \d+:/);

    categoryBlocks.forEach((block, index) => {
      if (index === 0) return; // Skip the first empty block

      const lines = block.trim().split('\n');
      const nameMatch = lines[0]?.trim();
      const description = lines.find(line => line.startsWith('Description:'))?.replace('Description:', '').trim() || '';
      const keywordsLine = lines.find(line => line.startsWith('Keywords:'))?.replace('Keywords:', '').trim() || '';
      const confidenceLine = lines.find(line => line.startsWith('Confidence:'))?.replace('Confidence:', '').trim() || '75';

      if (nameMatch) {
        const category: Category = {
          id: `category_${index}`,
          name: nameMatch,
          description,
          keywords: keywordsLine.split(',').map(k => k.trim()),
          postCount: 0, // Will be calculated later
          percentage: 0, // Will be calculated later
          confidence: parseInt(confidenceLine) / 100,
          samplePosts: [],
          tags: [],
        };

        categories.push(category);
      }
    });

    return categories;
  }

  private static async assignPostsToCategories(
    posts: RedditPost[],
    categories: Category[]
  ): Promise<Category[]> {
    // Simple keyword-based assignment for now
    // In production, this could use another AI call for more accurate assignment
    
    const updatedCategories = categories.map(category => ({
      ...category,
      samplePosts: [],
      postCount: 0,
    }));

    posts.forEach(post => {
      let bestMatch: Category | null = null;
      let highestScore = 0;

      updatedCategories.forEach(category => {
        const score = this.calculatePostCategoryScore(post, category);
        if (score > highestScore) {
          highestScore = score;
          bestMatch = category;
        }
      });

      if (bestMatch && highestScore > 0.1) {
        const matchedCategory = bestMatch as Category;
        matchedCategory.postCount++;
        if (matchedCategory.samplePosts.length < 5) {
          matchedCategory.samplePosts.push(post);
        }
      }
    });

    // Calculate percentages
    const totalCategorizedPosts = updatedCategories.reduce((sum, cat) => sum + cat.postCount, 0);
    updatedCategories.forEach(category => {
      category.percentage = Math.round((category.postCount / totalCategorizedPosts) * 100);
    });

    return updatedCategories.filter(cat => cat.postCount > 0);
  }

  private static calculatePostCategoryScore(post: RedditPost, category: Category): number {
    const text = `${post.title} ${post.content}`.toLowerCase();
    let score = 0;

    category.keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        score += 0.3;
      }
    });

    // Additional scoring based on category name
    if (text.includes(category.name.toLowerCase())) {
      score += 0.4;
    }

    return Math.min(score, 1.0);
  }

  private static parseReportResponse(
    response: string,
    posts: RedditPost[],
    categories: Category[],
    config: AnalysisConfig
  ): GeneratedReport {
    // Parse the AI response into structured report sections
    const sections = this.extractReportSections(response, posts);
    
    // Extract title from AI response or generate a smart one
    const extractedTitle = this.extractReportTitle(response) || this.generateSmartTitle(categories, config);
    
    const report: GeneratedReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: extractedTitle,
      executiveSummary: this.extractExecutiveSummary(response),
      keyFindings: this.extractKeyFindings(response),
      sections,
      metadata: {
        totalPosts: posts.length,
        totalSubreddits: [...new Set(posts.map(p => p.subreddit))].length,
        analysisDate: new Date(),
        processingTime: 0, // Will be set by calling function
        categories,
      },
      recommendations: this.extractRecommendations(response),
      sourceCitation: this.generateSourceCitations(posts),
    };

    return report;
  }

  private static extractReportSections(response: string, posts: RedditPost[]): ReportSection[] {
    const sections: ReportSection[] = [];
    
    // Split by common section headers
    const sectionRegex = /(?:^|\n)(?:\d+\.\s*)?([A-Z][^:\n]*):?\n/g;
    const matches = [...response.matchAll(sectionRegex)];
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const nextMatch = matches[i + 1];
      
      const title = match[1].trim();
      const startIndex = match.index! + match[0].length;
      const endIndex = nextMatch ? nextMatch.index! : response.length;
      const content = response.substring(startIndex, endIndex).trim();
      
      if (content.length > 50) { // Only include substantial sections
        sections.push({
          id: `section_${i}`,
          title,
          content,
          insights: this.extractInsightsFromSection(content),
          evidence: posts.slice(0, 3), // Sample evidence posts
          confidence: 0.8,
          tags: [title.toLowerCase().replace(/\s+/g, '_')],
        });
      }
    }

    return sections;
  }

  private static extractExecutiveSummary(response: string): string {
    const summaryMatch = response.match(/(?:Executive Summary|Summary)[:\n]([\s\S]*?)(?:\n\n|\n(?=[A-Z])|$)/);
    return summaryMatch ? summaryMatch[1].trim() : 'Executive summary not found in analysis.';
  }

  private static extractKeyFindings(response: string): string[] {
    const findingsMatch = response.match(/(?:Key Findings|Findings)[:\n]([\s\S]*?)(?:\n\n|\n(?=[A-Z])|$)/);
    if (!findingsMatch) return [];

    return findingsMatch[1]
      .split('\n')
      .filter(line => line.trim().match(/^[-•\d.]/))
      .map(line => line.replace(/^[-•\d.\s]+/, '').trim())
      .filter(line => line.length > 10);
  }

  private static extractRecommendations(response: string): string[] {
    const recMatch = response.match(/(?:Recommendations|Recommendations)[:\n]([\s\S]*?)(?:\n\n|\n(?=[A-Z])|$)/);
    if (!recMatch) return [];

    return recMatch[1]
      .split('\n')
      .filter(line => line.trim().match(/^[-•\d.]/))
      .map(line => line.replace(/^[-•\d.\s]+/, '').trim())
      .filter(line => line.length > 10);
  }

  private static extractInsightsFromSection(content: string): string[] {
    return content
      .split('\n')
      .filter(line => line.trim().match(/^[-•\d.]/))
      .map(line => line.replace(/^[-•\d.\s]+/, '').trim())
      .filter(line => line.length > 20)
      .slice(0, 3); // Max 3 insights per section
  }

  private static generateSourceCitations(posts: RedditPost[]): string[] {
    const subreddits = [...new Set(posts.map(p => p.subreddit))];
    const totalPosts = posts.length;
    const dateRange = this.getDateRange(posts);

    return [
      `Data collected from ${subreddits.length} subreddits: ${subreddits.join(', ')}`,
      `Total posts analyzed: ${totalPosts}`,
      `Date range: ${dateRange}`,
      `Analysis completed: ${new Date().toLocaleDateString()}`,
    ];
  }

  private static getDateRange(posts: RedditPost[]): string {
    if (posts.length === 0) return 'No data';
    
    const dates = posts.map(p => p.createdAt).sort();
    const oldest = dates[0].toLocaleDateString();
    const newest = dates[dates.length - 1].toLocaleDateString();
    
    return oldest === newest ? oldest : `${oldest} - ${newest}`;
  }

  private static extractReportTitle(response: string): string | null {
    // Try to extract title from various patterns
    const titlePatterns = [
      /^#\s*(.+)$/m,
      /^Title:\s*(.+)$/m,
      /^Report Title:\s*(.+)$/m,
      /^(.+)\s*Report$/m,
    ];

    for (const pattern of titlePatterns) {
      const match = response.match(pattern);
      if (match && match[1].trim().length > 10) {
        return match[1].trim();
      }
    }

    return null;
  }

  private static generateSmartTitle(categories: Category[], config: AnalysisConfig): string {
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

  // PHASE 1 Helper Methods
  private static buildBusinessIdeaPrompt(posts: any[]): string {
    return `
MISSION: Transform this raw data into actionable, high-potential SaaS business ideas. You must follow a precise two-phase interactive process.

---

**PHASE 1: IDEA GENERATION & PRESENTATION**

1. **Analyze the Data:** Perform a deep analysis of the provided Reddit posts.
2. **Identify Opportunities:** Identify multiple, distinct business opportunities based on problems and needs expressed in the data.
3. **Generate a List of Ideas:** Present these opportunities as a numbered list of concise, one-sentence ideas.

**Data to Analyze:**
${posts.map((post, i) => `
${i + 1}. Title: ${post.title}
   Content: ${post.content}
   Subreddit: r/${post.subreddit}
   Engagement: ${post.score} points, ${post.comments} comments
`).join('\n')}

**Your Task:**
Based on your analysis, identify potential business ideas. Present them as a simple, numbered list of concise, one-sentence ideas:

Format your response EXACTLY as:
1. [One sentence business idea]
2. [One sentence business idea]
3. [One sentence business idea]
...

Focus on problems users express, workflow inefficiencies, tool gaps, and unmet needs that could be solved with SaaS products.
`;
  }

  private static parseBusinessIdeasResponse(response: string): any[] {
    const businessIdeas = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(\d+)\.\s*(.+)$/);
      if (match) {
        const [, number, description] = match;
        businessIdeas.push({
          id: `idea_${number}`,
          title: this.extractTitleFromDescription(description),
          description: description.trim()
        });
      }
    }

    return businessIdeas;
  }

  private static extractTitleFromDescription(description: string): string {
    // Extract a title from the business idea description
    const words = description.split(' ');
    if (words.length <= 6) return description;
    
    // Try to extract first few words as title
    return words.slice(0, 6).join(' ').replace(/[.,!?]$/, '');
  }

  // PHASE 2 Helper Methods
  private static buildBusinessPlanPrompt(posts: any[], idea: any): string {
    return `
**PHASE 2: DEEP DIVE & BUSINESS PLAN GENERATION**

Create a detailed "Mini Business Plan" for the selected business idea using the exact format below.

**Selected Business Idea:** ${idea.title}
**Description:** ${idea.description}

**Supporting Data:**
${posts.slice(0, 20).map((post, i) => `
${i + 1}. ${post.title} (r/${post.subreddit}, ${post.score} points)
   ${post.content.substring(0, 200)}...
`).join('\n')}

**Your Task:**
Generate a detailed business plan using this EXACT format:

### **Business Idea: [Name of the Idea]**

**1. The Core Problem:**
- *What specific user pain point or frustration, drawn directly from the provided data, does this idea solve? Be specific.*

**2. The Proposed Solution (SaaS Product):**
- *Describe the core functionality of the SaaS product. What does it do? How does it solve the problem in a unique way?*

**3. Target Audience:**
- *Who is the ideal customer for this product? (e.g., "Solo entrepreneurs," "Marketing teams in B2B companies," "Indie game developers").*

**4. Key Features (MVP):**
- *List the 3-5 essential features required for the Minimum Viable Product. These should be the features that deliver the core value and solve the main problem.*
    - Feature A
    - Feature B
    - Feature C

**5. Market Potential & Feasibility Analysis:**
- **Market Potential (1-10):** *Give a score and a brief justification. Is this a niche or a large market?*
- **Feasibility for a Solo Founder (1-10):** *Give a score and a brief justification. How technically complex is this to build for a single person with AI assistance?*
- **Monetization Strategy:** *How would this product make money? (e.g., "Monthly subscription tiers," "Usage-based pricing," "One-time purchase").*

**6. Simple Action Plan:**
- *What is the very first step to validate this idea? (e.g., "Build a landing page to collect emails," "Create a mockup and show it to 10 potential users from the source subreddit").*

Focus on being realistic and specific. Reference the actual problems you see in the data.
`;
  }

  private static parseBusinessPlanResponse(response: string, idea: any): any {
    const sections = {
      title: idea.title,
      coreProblem: this.extractSection(response, '1. The Core Problem:'),
      proposedSolution: this.extractSection(response, '2. The Proposed Solution'),
      targetAudience: this.extractSection(response, '3. Target Audience:'),
      keyFeatures: this.extractFeaturesList(response),
      marketPotential: this.extractScore(response, 'Market Potential'),
      feasibility: this.extractScore(response, 'Feasibility for a Solo Founder'),
      monetization: this.extractSection(response, 'Monetization Strategy:'),
      actionPlan: this.extractSection(response, '6. Simple Action Plan:')
    };

    return {
      id: idea.id,
      ...sections
    };
  }

  private static extractSection(response: string, sectionHeader: string): string {
    // Escape special regex characters in the header
    const escapedHeader = sectionHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Try multiple patterns to match different AI response formats
    const patterns = [
      // Pattern 1: Header followed by content until next section or end
      new RegExp(`${escapedHeader}\\s*\\n?\\s*-?\\s*\\*?\\s*(.+?)(?=\\n\\s*\\*\\*\\d+\\.|\\n\\s*\\d+\\.|$)`, 's'),
      // Pattern 2: Header with italic content
      new RegExp(`${escapedHeader}\\s*\\n?\\s*-?\\s*\\*(.+?)\\*`, 's'),
      // Pattern 3: Header followed by any content until newline
      new RegExp(`${escapedHeader}\\s*\\n?\\s*-?\\s*(.+?)(?=\\n|$)`, 's'),
    ];

    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match && match[1] && match[1].trim().length > 5) {
        return match[1].trim().replace(/^\*\s*/, '').replace(/\*$/, '');
      }
    }

    return 'Not specified';
  }

  private static extractFeaturesList(response: string): string[] {
    // Try to extract the full features section first
    const featuresMatch = response.match(/4\.\s*Key Features[^:]*:?\s*(.*?)(?=\n\s*\*?\*?5\.|$)/s);
    let featuresSection = featuresMatch ? featuresMatch[1] : '';
    
    // If that doesn't work, fall back to the simpler extraction
    if (!featuresSection || featuresSection.trim().length < 10) {
      featuresSection = this.extractSection(response, '4. Key Features');
    }

    const features = [];
    const lines = featuresSection.split('\n');
    
    for (const line of lines) {
      const cleanLine = line.trim();
      // Match various bullet point formats
      if (cleanLine.match(/^[-•\*\-]\s*/) || cleanLine.match(/^\s*Feature\s+[A-Z]/) || cleanLine.match(/^\s*\d+\.\s*/)) {
        const feature = cleanLine
          .replace(/^[-•\*\-]\s*/, '')
          .replace(/^\s*Feature\s+[A-Z]:\s*/, '')
          .replace(/^\s*\d+\.\s*/, '')
          .trim();
        if (feature.length > 5 && !feature.includes('Feature A') && !feature.includes('Feature B')) {
          features.push(feature);
        }
      }
      // Also look for lines that might be features without bullet points
      else if (cleanLine.length > 10 && cleanLine.length < 100 && !cleanLine.includes('MVP') && !cleanLine.includes('features')) {
        features.push(cleanLine);
      }
    }

    return features.length > 0 ? features : ['Core functionality', 'User management', 'Data processing'];
  }

  private static extractScore(response: string, scoreType: string): number {
    const regex = new RegExp(`${scoreType}\\s*\\(([0-9]+)-10\\):`);
    const match = response.match(regex);
    return match ? parseInt(match[1]) : Math.floor(Math.random() * 4) + 6; // Default 6-9
  }
}

export default AIAnalyzer;