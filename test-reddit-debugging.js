#!/usr/bin/env node
/**
 * Reddit API Debugging Test Script
 * 
 * This script tests the Reddit API implementation with comprehensive logging
 * to help identify connection issues, rate limiting, and authentication problems.
 */

console.log('='.repeat(80));
console.log('🔧 REDDIT API DEBUG TEST SCRIPT');
console.log('='.repeat(80));

// Test environment variables
console.log('\n📋 ENVIRONMENT VARIABLES CHECK:');
console.log(`REDDIT_CLIENT_ID: ${process.env.REDDIT_CLIENT_ID || 'NOT SET'}`);
console.log(`REDDIT_CLIENT_SECRET: ${process.env.REDDIT_CLIENT_SECRET ? process.env.REDDIT_CLIENT_SECRET.substring(0, 4) + '...' : 'NOT SET'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);

// Test basic Reddit API connectivity
async function testRedditConnectivity() {
  console.log('\n🌐 TESTING BASIC REDDIT CONNECTIVITY...');
  
  const testUrl = 'https://www.reddit.com/r/test/hot.json?limit=5';
  const userAgent = 'IdeaCompass/1.0 (Market Research Tool) by /u/IdeaCompass';
  
  try {
    console.log(`📡 Making request to: ${testUrl}`);
    console.log(`🏷️  User-Agent: ${userAgent}`);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': userAgent,
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error Response Body: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const posts = data.data?.children?.length || 0;
    
    console.log(`✅ SUCCESS: Got ${posts} posts from r/test`);
    
    // Test subreddit search
    await testSubredditSearch();
    
  } catch (error) {
    console.log(`❌ CONNECTIVITY TEST FAILED:`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Type: ${error.constructor.name}`);
    console.log(`   Stack: ${error.stack}`);
  }
}

async function testSubredditSearch() {
  console.log('\n🔍 TESTING SUBREDDIT SEARCH...');
  
  const searchUrl = 'https://www.reddit.com/subreddits/search.json?q=technology&type=sr&limit=5&sort=relevance';
  const userAgent = 'IdeaCompass/1.0 (Market Research Tool) by /u/IdeaCompass';
  
  try {
    console.log(`📡 Making search request to: ${searchUrl}`);
    console.log(`🏷️  User-Agent: ${userAgent}`);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': userAgent,
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    console.log(`📊 Search Response Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error Response Body: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const subreddits = data.data?.children?.length || 0;
    
    console.log(`✅ SUCCESS: Found ${subreddits} subreddits for 'technology'`);
    
    if (subreddits > 0) {
      console.log(`📋 First subreddit: ${data.data.children[0].data.display_name} (${data.data.children[0].data.subscribers} subscribers)`);
    }
    
  } catch (error) {
    console.log(`❌ SEARCH TEST FAILED:`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Type: ${error.constructor.name}`);
    console.log(`   Stack: ${error.stack}`);
  }
}

// Test rate limiting simulation
async function testRateLimiting() {
  console.log('\n⏱️ TESTING RATE LIMITING BEHAVIOR...');
  
  const userAgent = 'IdeaCompass/1.0 (Market Research Tool) by /u/IdeaCompass';
  
  for (let i = 1; i <= 3; i++) {
    try {
      console.log(`📡 Making rapid request ${i}/3...`);
      
      const response = await fetch('https://www.reddit.com/r/test/hot.json?limit=1', {
        headers: {
          'User-Agent': userAgent,
        },
        signal: AbortSignal.timeout(5000)
      });
      
      console.log(`📊 Request ${i} Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 429) {
        console.log(`⚠️ Rate limited on request ${i}`);
        const rateLimitReset = response.headers.get('X-Ratelimit-Reset');
        const rateLimitRemaining = response.headers.get('X-Ratelimit-Remaining');
        console.log(`   Reset: ${rateLimitReset}, Remaining: ${rateLimitRemaining}`);
      }
      
    } catch (error) {
      console.log(`❌ Request ${i} failed: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Main test execution
async function runAllTests() {
  console.log(`🚀 Starting Reddit API debug tests at ${new Date().toISOString()}`);
  
  await testRedditConnectivity();
  await testRateLimiting();
  
  console.log('\n' + '='.repeat(80));
  console.log('🏁 DEBUG TESTS COMPLETED');
  console.log('='.repeat(80));
  
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Check the server logs in Vercel for detailed API call information');
  console.log('2. If tests pass but API still fails, the issue may be environment-specific');
  console.log('3. Verify environment variables are properly set in Vercel dashboard');
  console.log('4. Check if there are any network restrictions or firewalls blocking Reddit API');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
runAllTests().catch((error) => {
  console.log('❌ Test suite failed:', error);
  process.exit(1);
});