import { kv } from '@vercel/kv';
import { sql } from '@vercel/postgres';
import { ResearchSession, RedditPost, Category, GeneratedReport } from '@/types';

// In-memory fallback storage for local development
class MemoryStorage {
  private static data: Map<string, any> = new Map();

  static set(key: string, value: string, options?: { ex?: number }): Promise<void> {
    this.data.set(key, { value, expires: options?.ex ? Date.now() + (options.ex * 1000) : null });
    return Promise.resolve();
  }

  static get(key: string): Promise<string | null> {
    const item = this.data.get(key);
    if (!item) return Promise.resolve(null);
    
    if (item.expires && Date.now() > item.expires) {
      this.data.delete(key);
      return Promise.resolve(null);
    }
    
    return Promise.resolve(item.value);
  }

  static del(key: string): Promise<void> {
    this.data.delete(key);
    return Promise.resolve();
  }

  static clear(): void {
    this.data.clear();
  }
}

// Check if Vercel KV is available
const hasKVConfig = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
const kvClient = hasKVConfig ? kv : MemoryStorage;

// Vercel KV (Redis) configuration for sessions and temporary data
export class KVDatabase {
  // Session management
  static async saveSession(sessionId: string, session: ResearchSession): Promise<void> {
    await kvClient.set(`session:${sessionId}`, JSON.stringify(session), { ex: 604800 }); // 7 days
  }

  static async getSession(sessionId: string): Promise<ResearchSession | null> {
    const sessionData = await kvClient.get(`session:${sessionId}`);
    return sessionData ? JSON.parse(sessionData as string) : null;
  }

  static async deleteSession(sessionId: string): Promise<void> {
    await kvClient.del(`session:${sessionId}`);
  }

  // Temporary data storage (scraped posts, categories)
  static async saveScrapedData(sessionId: string, data: RedditPost[]): Promise<void> {
    await kvClient.set(`scraped:${sessionId}`, JSON.stringify(data), { ex: 604800 });
  }

  static async getScrapedData(sessionId: string): Promise<RedditPost[] | null> {
    const data = await kvClient.get(`scraped:${sessionId}`);
    return data ? JSON.parse(data as string) : null;
  }

  // Progress tracking for scraping operations
  static async saveScrapingProgress(sessionId: string, progress: any[]): Promise<void> {
    await kvClient.set(`progress:${sessionId}`, JSON.stringify(progress), { ex: 604800 });
  }

  static async getScrapingProgress(sessionId: string): Promise<any[] | null> {
    const data = await kvClient.get(`progress:${sessionId}`);
    return data ? JSON.parse(data as string) : null;
  }

  static async saveCategories(sessionId: string, categories: Category[]): Promise<void> {
    await kvClient.set(`categories:${sessionId}`, JSON.stringify(categories), { ex: 604800 });
  }

  static async getCategories(sessionId: string): Promise<Category[] | null> {
    const data = await kvClient.get(`categories:${sessionId}`);
    return data ? JSON.parse(data as string) : null;
  }

  // Business ideas storage (Phase 1)
  static async saveBusinessIdeas(sessionId: string, businessIdeas: any[]): Promise<void> {
    await kvClient.set(`business_ideas:${sessionId}`, JSON.stringify(businessIdeas), { ex: 604800 });
  }

  static async getBusinessIdeas(sessionId: string): Promise<any[] | null> {
    const data = await kvClient.get(`business_ideas:${sessionId}`);
    return data ? JSON.parse(data as string) : null;
  }

  // Business plans storage (Phase 2)
  static async saveBusinessPlans(sessionId: string, businessPlans: any[]): Promise<void> {
    await kvClient.set(`business_plans:${sessionId}`, JSON.stringify(businessPlans), { ex: 604800 });
  }

  static async getBusinessPlans(sessionId: string): Promise<any[] | null> {
    const data = await kvClient.get(`business_plans:${sessionId}`);
    return data ? JSON.parse(data as string) : null;
  }

  // Cache frequently accessed data
  static async cacheSubredditMetadata(subreddit: string, metadata: any): Promise<void> {
    await kvClient.set(`subreddit:${subreddit}`, JSON.stringify(metadata), { ex: 86400 }); // 24 hours
  }

  static async getCachedSubredditMetadata(subreddit: string): Promise<any | null> {
    const data = await kvClient.get(`subreddit:${subreddit}`);
    return data ? JSON.parse(data as string) : null;
  }
}

// Vercel Postgres configuration for persistent data
export class PostgresDatabase {
  // Initialize database tables
  static async initializeTables(): Promise<void> {
    try {
      // Research sessions table
      await sql`
        CREATE TABLE IF NOT EXISTS research_sessions (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255),
          keywords TEXT[],
          filters JSONB,
          selected_subreddits TEXT[],
          status VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // Generated reports table
      await sql`
        CREATE TABLE IF NOT EXISTS generated_reports (
          id VARCHAR(255) PRIMARY KEY,
          session_id VARCHAR(255) REFERENCES research_sessions(id),
          title TEXT,
          executive_summary TEXT,
          key_findings TEXT[],
          sections JSONB,
          metadata JSONB,
          recommendations TEXT[],
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // User analytics table
      await sql`
        CREATE TABLE IF NOT EXISTS user_analytics (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(255),
          action VARCHAR(100),
          step_number INTEGER,
          metadata JSONB,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // Subreddit analytics cache
      await sql`
        CREATE TABLE IF NOT EXISTS subreddit_analytics (
          subreddit VARCHAR(255) PRIMARY KEY,
          metadata JSONB,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database tables:', error);
      throw error;
    }
  }

  // Research session operations
  static async saveResearchSession(session: ResearchSession): Promise<void> {
    await sql`
      INSERT INTO research_sessions (
        id, user_id, keywords, filters, selected_subreddits, status, updated_at
      ) VALUES (
        ${session.id}, ${session.userId || null}, ${JSON.stringify(session.keywords)}, 
        ${JSON.stringify(session.filters)}, ${JSON.stringify(session.selectedSubreddits)}, 
        ${session.status}, ${new Date().toISOString()}
      )
      ON CONFLICT (id) DO UPDATE SET
        keywords = ${JSON.stringify(session.keywords)},
        filters = ${JSON.stringify(session.filters)},
        selected_subreddits = ${JSON.stringify(session.selectedSubreddits)},
        status = ${session.status},
        updated_at = ${new Date().toISOString()};
    `;
  }

  static async getResearchSession(sessionId: string): Promise<ResearchSession | null> {
    const result = await sql`
      SELECT * FROM research_sessions WHERE id = ${sessionId};
    `;
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      keywords: JSON.parse(row.keywords),
      filters: row.filters,
      selectedSubreddits: JSON.parse(row.selected_subreddits),
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      // Additional fields will be populated from KV storage
    } as ResearchSession;
  }

  // Report operations
  static async saveGeneratedReport(report: GeneratedReport, sessionId: string): Promise<void> {
    await sql`
      INSERT INTO generated_reports (
        id, session_id, title, executive_summary, key_findings, 
        sections, metadata, recommendations
      ) VALUES (
        ${report.id}, ${sessionId}, ${report.title}, ${report.executiveSummary},
        ${JSON.stringify(report.keyFindings)}, ${JSON.stringify(report.sections)},
        ${JSON.stringify(report.metadata)}, ${JSON.stringify(report.recommendations)}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = ${report.title},
        executive_summary = ${report.executiveSummary},
        key_findings = ${JSON.stringify(report.keyFindings)},
        sections = ${JSON.stringify(report.sections)},
        metadata = ${JSON.stringify(report.metadata)},
        recommendations = ${JSON.stringify(report.recommendations)};
    `;
  }

  static async getGeneratedReport(reportId: string): Promise<GeneratedReport | null> {
    const result = await sql`
      SELECT * FROM generated_reports WHERE id = ${reportId};
    `;
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      executiveSummary: row.executive_summary,
      keyFindings: JSON.parse(row.key_findings),
      sections: row.sections,
      businessPlans: row.business_plans ? JSON.parse(row.business_plans) : [], // Parse business plans or empty array
      metadata: row.metadata,
      recommendations: JSON.parse(row.recommendations),
      sourceCitation: [], // Will be populated from metadata
    } as GeneratedReport;
  }

  // Analytics operations
  static async logUserAction(
    sessionId: string, 
    action: string, 
    stepNumber: number, 
    metadata?: any
  ): Promise<void> {
    await sql`
      INSERT INTO user_analytics (session_id, action, step_number, metadata)
      VALUES (${sessionId}, ${action}, ${stepNumber}, ${JSON.stringify(metadata || {})});
    `;
  }

  static async getSessionAnalytics(sessionId: string): Promise<any[]> {
    const result = await sql`
      SELECT * FROM user_analytics 
      WHERE session_id = ${sessionId} 
      ORDER BY timestamp DESC;
    `;
    return result.rows;
  }

  // Subreddit analytics caching
  static async cacheSubredditAnalytics(subreddit: string, metadata: any): Promise<void> {
    await sql`
      INSERT INTO subreddit_analytics (subreddit, metadata)
      VALUES (${subreddit}, ${JSON.stringify(metadata)})
      ON CONFLICT (subreddit) DO UPDATE SET
        metadata = ${JSON.stringify(metadata)},
        last_updated = CURRENT_TIMESTAMP;
    `;
  }

  static async getCachedSubredditAnalytics(subreddit: string): Promise<any | null> {
    const result = await sql`
      SELECT metadata, last_updated FROM subreddit_analytics 
      WHERE subreddit = ${subreddit} 
      AND last_updated > (CURRENT_TIMESTAMP - INTERVAL '24 hours');
    `;
    
    return result.rows.length > 0 ? result.rows[0].metadata : null;
  }
}

// Utility functions for database operations
export class DatabaseUtils {
  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static async cleanupExpiredSessions(): Promise<void> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Clean up expired sessions from Postgres
    await sql`
      DELETE FROM research_sessions 
      WHERE updated_at < ${sevenDaysAgo.toISOString()};
    `;

    // Clean up expired reports (keep for 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await sql`
      DELETE FROM generated_reports 
      WHERE created_at < ${thirtyDaysAgo.toISOString()};
    `;
  }

  static async getSystemStats(): Promise<any> {
    const sessionCount = await sql`SELECT COUNT(*) as count FROM research_sessions;`;
    const reportCount = await sql`SELECT COUNT(*) as count FROM generated_reports;`;
    const recentSessions = await sql`
      SELECT COUNT(*) as count FROM research_sessions 
      WHERE created_at > (CURRENT_TIMESTAMP - INTERVAL '24 hours');
    `;

    return {
      totalSessions: sessionCount.rows[0].count,
      totalReports: reportCount.rows[0].count,
      recentSessions: recentSessions.rows[0].count,
    };
  }
}

// Export database instances
export const kvDb = KVDatabase;
export const pgDb = PostgresDatabase;
export const dbUtils = DatabaseUtils;