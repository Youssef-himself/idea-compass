import { RedditPost, RedditComment, SubredditMetadata, SearchFilters, ScrapingProgress } from '@/types';

// Ultra-conservative configuration to prevent rate limits and infinite loops
const SCRAPING_CONFIG = {
  postsPerBatch: 25,        // Reduced from 50 to 25 for even faster processing
  commentsPerPost: 2,       // Reduced from 3 to 2 for speed
  requestTimeout: 10000,    // Increased to 10 seconds for reliability
  delayBetweenRequests: 1500, // Increased from 1000 to 1500ms to be more conservative
  maxRetries: 1,            // Reduced to 1 retry to fail fast
  maxConcurrentSubreddits: 1, // Process only 1 subreddit at a time for maximum stability
};

// Enhanced rate limiter with ultra-conservative circuit breaker
class SimpleRateLimiter {
  private lastRequest: number = 0;
  private failureCount: number = 0;
  private circuitBreakerThreshold: number = 2; // Reduced from 3 to 2
  private circuitBreakerTimeout: number = 60000; // Increased to 60 seconds
  private lastFailure: number = 0;
  
  async wait(): Promise<void> {
    // Check circuit breaker with more aggressive timeout
    if (this.failureCount >= this.circuitBreakerThreshold) {
      const timeSinceLastFailure = Date.now() - this.lastFailure;
      if (timeSinceLastFailure < this.circuitBreakerTimeout) {
        const remainingTime = Math.round((this.circuitBreakerTimeout - timeSinceLastFailure) / 1000);
        throw new Error(`Rate limit circuit breaker active. Wait ${remainingTime}s before retrying.`);
      } else {
        // Reset circuit breaker
        console.log('🔄 Circuit breaker reset - retrying requests');
        this.failureCount = 0;
      }
    }
    
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    
    if (elapsed < SCRAPING_CONFIG.delayBetweenRequests) {
      const waitTime = SCRAPING_CONFIG.delayBetweenRequests - elapsed;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequest = Date.now();
  }
  
  recordFailure(): void {
    this.failureCount++;
    this.lastFailure = Date.now();
    console.warn(`⚠️ Rate limiter failure ${this.failureCount}/${this.circuitBreakerThreshold}`);
  }
  
  recordSuccess(): void {
    if (this.failureCount > 0) {
      this.failureCount = Math.max(0, this.failureCount - 1);
      console.log(`✅ Rate limiter success - failure count: ${this.failureCount}`);
    }
  }
}

// Keyword matching functions (adapted from desktop version)
function calculateKeywordMatches(text: string, keywords: string[]): string[] {
  // If no keywords provided, return a match (get all posts)
  if (!keywords || keywords.length === 0 || (keywords.length === 1 && keywords[0] === '')) {
    return ['*']; // Wildcard match
  }
  
  const lowerText = text.toLowerCase();
  const matchedKeywords: string[] = [];
  
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase().trim();
    if (lowerKeyword && lowerText.includes(lowerKeyword)) {
      matchedKeywords.push(keyword);
    }
  }
  
  return matchedKeywords;
}

export class RedditAPI {
  private static rateLimiter = new SimpleRateLimiter();
  private static baseUrl = 'https://www.reddit.com';

  // Simple subreddit discovery (based on desktop discover_subreddits function)
  static async discoverSubreddits(keywords: string[]): Promise<SubredditMetadata[]> {
    if (!keywords || keywords.length === 0) {
      throw new Error('Keywords are required for subreddit discovery');
    }

    console.log('🔍 Starting subreddit discovery for:', keywords);
    const discoveredSubreddits: SubredditMetadata[] = [];
    const seenSubreddits = new Set<string>();
    
    try {
      // Search for each keyword (like desktop version)
      for (const keyword of keywords) {
        console.log(`Searching for: "${keyword}"`);
        
        await this.rateLimiter.wait();
        
        const searchUrl = `${this.baseUrl}/subreddits/search.json?q=${encodeURIComponent(keyword)}&type=sr&limit=10&sort=relevance`;
        
        try {
          const response = await fetch(searchUrl, {
            headers: {
              'User-Agent': 'IdeaCompass/1.0 (Market Research Tool)',
            },
            signal: AbortSignal.timeout(SCRAPING_CONFIG.requestTimeout)
          });
          
          console.log(`📨 API Response for "${keyword}": ${response.status}`);
          
          if (!response.ok) {
            this.rateLimiter.recordFailure();
            console.warn(`⚠️ Search failed for "${keyword}": ${response.status}`);
            continue;
          }
          
          this.rateLimiter.recordSuccess();

          const data = await response.json();
          const subreddits = data.data?.children || [];
          
          console.log(`Found ${subreddits.length} raw results for "${keyword}"`);
          
          let addedCount = 0;
          
          for (const child of subreddits) {
            const sr = child.data;
            
            // Filter like desktop version (no NSFW, avoid duplicates)
            if (sr.over18 || seenSubreddits.has(sr.display_name)) {
              continue;
            }
            
            // Skip very small subreddits (less than 100 subscribers)
            if ((sr.subscribers || 0) < 100) {
              continue;
            }
            
            seenSubreddits.add(sr.display_name);
            
            const metadata: SubredditMetadata = {
              id: sr.id,
              name: sr.display_name,
              displayName: sr.display_name_prefixed,
              description: sr.public_description || sr.description || `Discussion community for ${keyword}`,
              subscribers: sr.subscribers || 0,
              activeUsers: sr.active_user_count || 0,
              postsPerDay: Math.max(1, Math.floor((sr.subscribers || 0) / 1000)),
              commentsPerDay: Math.max(1, Math.floor((sr.subscribers || 0) / 500)),
              relevanceScore: 0.8, // Simple scoring
              qualityIndicator: sr.subscribers > 10000 ? 'high' : sr.subscribers > 1000 ? 'medium' : 'low',
              tags: [keyword],
              rules: [],
              lastUpdated: new Date(),
            };
            
            discoveredSubreddits.push(metadata);
            addedCount++;
          }
          
          console.log(`Added ${addedCount} subreddits for "${keyword}"`);
          
        } catch (error) {
          console.error(`Search error for "${keyword}":`, error);
        }
      }
      
      // Sort by subscriber count and return top results (simple approach)
      const sortedResults = discoveredSubreddits
        .sort((a, b) => b.subscribers - a.subscribers)
        .slice(0, 15);
      
      // If no results found, provide fallback popular subreddits
      if (sortedResults.length === 0) {
        console.log('No subreddits found via API, providing fallback communities');
        const fallbackSubreddits = this.getFallbackSubreddits(keywords);
        console.log(`✅ Discovery complete: ${fallbackSubreddits.length} fallback subreddits provided`);
        return fallbackSubreddits;
      }
      
      console.log(`✅ Discovery complete: ${sortedResults.length} subreddits found`);
      return sortedResults;
      
    } catch (error) {
      console.error('❌ Subreddit discovery failed:', error);
      throw new Error(`Discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fallback subreddits when discovery returns no results
  private static getFallbackSubreddits(keywords: string[]): SubredditMetadata[] {
    const keywordStr = keywords.join(' ').toLowerCase();
    
    // Popular general subreddits that are good for various topics
    const fallbackList: Partial<SubredditMetadata>[] = [];
    
    // Business/startup related
    if (keywordStr.includes('business') || keywordStr.includes('startup') || keywordStr.includes('entrepreneur')) {
      fallbackList.push(
        { name: 'entrepreneur', displayName: 'r/entrepreneur', description: 'A community for entrepreneurs', subscribers: 800000 },
        { name: 'startups', displayName: 'r/startups', description: 'Community for startup discussions', subscribers: 500000 },
        { name: 'business', displayName: 'r/business', description: 'Business news and discussions', subscribers: 600000 }
      );
    }
    
    // Technology related
    if (keywordStr.includes('tech') || keywordStr.includes('ai') || keywordStr.includes('programming') || keywordStr.includes('software')) {
      fallbackList.push(
        { name: 'technology', displayName: 'r/technology', description: 'Technology news and discussions', subscribers: 12000000 },
        { name: 'programming', displayName: 'r/programming', description: 'Programming discussions', subscribers: 4000000 },
        { name: 'artificial', displayName: 'r/artificial', description: 'AI and machine learning', subscribers: 200000 }
      );
    }
    
    // General popular communities
    fallbackList.push(
      { name: 'AskReddit', displayName: 'r/AskReddit', description: 'Ask and answer thought-provoking questions', subscribers: 40000000 },
      { name: 'todayilearned', displayName: 'r/todayilearned', description: 'Today I learned something new', subscribers: 28000000 },
      { name: 'explainlikeimfive', displayName: 'r/explainlikeimfive', description: 'Explain complex topics simply', subscribers: 20000000 }
    );
    
    return fallbackList.slice(0, 10).map((partial, index) => ({
      id: `fallback_${index}`,
      name: partial.name || 'unknown',
      displayName: partial.displayName || 'r/unknown',
      description: partial.description || 'Popular Reddit community',
      subscribers: partial.subscribers || 100000,
      activeUsers: Math.floor((partial.subscribers || 100000) * 0.01),
      postsPerDay: Math.max(1, Math.floor((partial.subscribers || 100000) / 1000)),
      commentsPerDay: Math.max(1, Math.floor((partial.subscribers || 100000) / 500)),
      relevanceScore: 0.6,
      qualityIndicator: (partial.subscribers || 0) > 1000000 ? 'high' : 'medium' as any,
      tags: keywords,
      rules: [],
      lastUpdated: new Date(),
    }));
  }

  // Main scraping method (based on desktop find_reddit_ideas function)
  static async scrapeSubreddit(
    subredditName: string,
    keywords: string[],
    onProgress?: (progress: ScrapingProgress) => void
  ): Promise<RedditPost[]> {
    if (!subredditName) {
      throw new Error('Subreddit name is required');
    }

    // Handle empty keywords - get all posts
    const effectiveKeywords = keywords && keywords.length > 0 && keywords[0] !== '' ? keywords : ['*'];
    console.log(`🔎 Starting scraping of r/${subredditName} with keywords:`, effectiveKeywords);
    const scrapedPosts: RedditPost[] = [];
    const startTime = new Date();
    
    try {
      await this.rateLimiter.wait();
      
      // Fetch posts (new posts like desktop version)
      const postsUrl = `${this.baseUrl}/r/${subredditName}/new.json?limit=${SCRAPING_CONFIG.postsPerBatch}`;
      
      onProgress?.({
        subreddit: subredditName,
        totalPosts: 0,
        processedPosts: 0,
        status: 'in-progress',
        errors: [],
        startTime
      });
      
      const response = await fetch(postsUrl, {
        headers: {
          'User-Agent': 'IdeaCompass/1.0 (Market Research Tool)',
        },
        signal: AbortSignal.timeout(SCRAPING_CONFIG.requestTimeout)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const posts = data.data?.children || [];
      
      if (posts.length === 0) {
        console.warn(`No posts found in r/${subredditName}`);
        onProgress?.({
          subreddit: subredditName,
          totalPosts: 0,
          processedPosts: 0,
          status: 'completed',
          errors: [],
          startTime,
          endTime: new Date()
        });
        return [];
      }
      
      console.log(`Processing ${posts.length} posts from r/${subredditName}`);
      
      // Process each post (like desktop version)
      for (let i = 0; i < posts.length; i++) {
        const postData = posts[i].data;
        const postContent = `${postData.title} ${postData.selftext || ''}`;
        
        // Check for keyword matches (like desktop version)
        const matchedKeywords = calculateKeywordMatches(postContent, effectiveKeywords);
        
        if (matchedKeywords.length > 0) {
          const redditPost: RedditPost = {
            id: postData.id,
            title: postData.title,
            content: postData.selftext || '',
            author: postData.author,
            score: postData.score,
            upvoteRatio: postData.upvote_ratio,
            numComments: postData.num_comments,
            createdAt: new Date(postData.created_utc * 1000),
            isNSFW: postData.over_18 || false,
            url: postData.url,
            permalink: `https://www.reddit.com${postData.permalink}`,
            subreddit: subredditName,
            flair: postData.link_flair_text || '',
            isStickied: postData.stickied,
            comments: [] // Will be populated if needed
          };
          
          scrapedPosts.push(redditPost);
        }
        
        // Update progress
        onProgress?.({
          subreddit: subredditName,
          totalPosts: posts.length,
          processedPosts: i + 1,
          status: 'in-progress',
          errors: [],
          startTime
        });
      }
      
      onProgress?.({
        subreddit: subredditName,
        totalPosts: posts.length,
        processedPosts: posts.length,
        status: 'completed',
        errors: [],
        startTime,
        endTime: new Date()
      });
      
      console.log(`✅ Finished scraping r/${subredditName}: ${scrapedPosts.length} matching posts`);
      return scrapedPosts;
      
    } catch (error) {
      console.error(`❌ Error scraping r/${subredditName}:`, error);
      onProgress?.({
        subreddit: subredditName,
        totalPosts: 0,
        processedPosts: 0,
        status: 'error',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        startTime,
        endTime: new Date()
      });
      throw error;
    }
  }

  // Ultra-conservative batch scraping method (sequential processing only)
  static async scrapeMultipleSubreddits(
    subreddits: string[],
    keywords: string[],
    onProgress?: (progress: ScrapingProgress) => void,
    onSubredditComplete?: (subreddit: string, posts: RedditPost[]) => void
  ): Promise<RedditPost[]> {
    const startTime = new Date();
    
    console.log(`🐌 Starting ultra-conservative sequential scraping of ${subreddits.length} subreddits`);
    
    // ULTRA-CONSERVATIVE: Process one subreddit at a time to avoid rate limits completely
    const allPosts: RedditPost[] = [];
    
    for (let i = 0; i < subreddits.length; i++) {
      const subreddit = subreddits[i];
      
      try {
        console.log(`📍 Processing ${i + 1}/${subreddits.length}: r/${subreddit}`);
        
        onProgress?.({
          subreddit,
          totalPosts: 0,
          processedPosts: 0,
          status: 'in-progress',
          errors: [],
          startTime
        });
        
        const posts = await this.scrapeSubreddit(subreddit, keywords, onProgress);
        allPosts.push(...posts);
        onSubredditComplete?.(subreddit, posts);
        
        console.log(`✅ Completed r/${subreddit}: ${posts.length} posts`);
        
        // Longer pause between subreddits for maximum rate limit safety
        if (i < subreddits.length - 1) {
          console.log('⏳ Waiting 3 seconds before next subreddit...');
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second pause
        }
        
      } catch (error) {
        console.error(`❌ Failed to scrape r/${subreddit}:`, error);
        onProgress?.({
          subreddit,
          totalPosts: 0,
          processedPosts: 0,
          status: 'error',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          startTime,
          endTime: new Date()
        });
      }
    }
    
    console.log(`🏁 Ultra-conservative scraping complete: ${allPosts.length} total posts from ${subreddits.length} subreddits`);
    return allPosts;
  }

  // Add comments to existing posts (like desktop comments handling)
  static async addCommentsToPost(post: RedditPost): Promise<RedditPost> {
    if (!post.permalink) {
      return post;
    }

    try {
      await this.rateLimiter.wait();
      
      // Fetch comments for the post (like desktop version with limit)
      const commentsUrl = `${this.baseUrl}${post.permalink}.json?limit=${SCRAPING_CONFIG.commentsPerPost}&sort=top`;
      
      const response = await fetch(commentsUrl, {
        headers: {
          'User-Agent': 'IdeaCompass/1.0 (Market Research Tool)',
        },
        signal: AbortSignal.timeout(SCRAPING_CONFIG.requestTimeout)
      });
      
      if (!response.ok) {
        console.warn(`Failed to fetch comments for post ${post.id}`);
        return post;
      }
      
      const data = await response.json();
      const commentData = data[1]?.data?.children || [];
      
      // Parse first 10 comments (like desktop version)
      const comments: RedditComment[] = [];
      for (let i = 0; i < Math.min(commentData.length, SCRAPING_CONFIG.commentsPerPost); i++) {
        const commentItem = commentData[i];
        if (commentItem.kind !== 't1') continue;
        
        const commentObj = commentItem.data;
        if (!commentObj.body || commentObj.body === '[deleted]' || commentObj.body === '[removed]') {
          continue;
        }
        
        comments.push({
          id: commentObj.id,
          body: commentObj.body,
          author: commentObj.author,
          score: commentObj.score,
          depth: 0, // Keep flat like desktop
          createdAt: new Date(commentObj.created_utc * 1000),
          parentId: commentObj.parent_id,
        });
      }
      
      return {
        ...post,
        comments
      };
      
    } catch (error) {
      console.warn(`Error fetching comments for post ${post.id}:`, error);
      return post;
    }
  }

  // Public method for backward compatibility
  static async scrapePosts(
    subreddits: string[],
    filters: SearchFilters,
    onProgress?: (progress: ScrapingProgress) => void
  ): Promise<RedditPost[]> {
    // For backward compatibility, use empty keywords to get all posts
    const keywords: string[] = ['*']; // Use wildcard to get all posts
    
    console.log('🚀 Using backward compatibility method with wildcard keyword');
    
    // Use the new batch scraping method
    return this.scrapeMultipleSubreddits(subreddits, keywords, onProgress);
  }
}

export default RedditAPI;