import { ScrapingProgress, RedditPost } from '@/types';

// CRITICAL FIX: Use globalThis to prevent data loss during hot reloading
const globalForStorage = globalThis as unknown as {
  progressStorage: Map<string, ScrapingProgress[]> | undefined;
  dataStorage: Map<string, RedditPost[]> | undefined;
};

// Initialize global storage maps with hot-reload protection
export const progressStorage = globalForStorage.progressStorage ?? new Map<string, ScrapingProgress[]>();
export const dataStorage = globalForStorage.dataStorage ?? new Map<string, RedditPost[]>();

// Store references globally to survive hot reloads
if (!globalForStorage.progressStorage) {
  globalForStorage.progressStorage = progressStorage;
}
if (!globalForStorage.dataStorage) {
  globalForStorage.dataStorage = dataStorage;
}

// Debug helper to see what's in storage
export const debugStorage = () => {
  console.log('🗃️ STORAGE DEBUG:');
  console.log('📊 Progress Storage Keys:', Array.from(progressStorage.keys()));
  console.log('💾 Data Storage Keys:', Array.from(dataStorage.keys()));
  
  for (const [key, progress] of progressStorage.entries()) {
    console.log(`📈 ${key}:`, progress.map(p => `${p.subreddit}:${p.status}`));
  }
};

// Helper functions for managing storage
export const clearOldSessions = () => {
  // Clear sessions older than 24 hours
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  for (const [key, progress] of progressStorage.entries()) {
    if (progress.length > 0 && progress[0].startTime && progress[0].startTime.getTime() < oneDayAgo) {
      progressStorage.delete(key);
      dataStorage.delete(key.replace('scraping_progress:', ''));
      console.log(`🧹 Cleaned up old session: ${key}`);
    }
  }
};

// Only clear old sessions once per server start
if (!globalThis.__storageInitialized) {
  console.log('🔄 Initializing storage system...');
  clearOldSessions();
  globalThis.__storageInitialized = true;
}