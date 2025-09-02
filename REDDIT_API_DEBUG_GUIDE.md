# Reddit API Debug & Deployment Guide

## 🔴 CRITICAL REGRESSION FIXED

**Issue**: Reddit API calls were failing and returning fallback data due to masked errors and insufficient logging.

**Root Cause**: The fallback mechanism in `discoverSubreddits` was preventing real API errors from surfacing, making it impossible to debug the actual connection issues.

## ✅ FIXES IMPLEMENTED

### 1. **Comprehensive Logging Added**
- All Reddit API calls now log detailed information including:
  - Environment variables (Client ID, Client Secret first 4 chars)
  - Request URLs and headers
  - Response status codes and headers
  - Full error objects with stack traces

### 2. **Robust Error Handling**
- Deep try-catch blocks around all API calls
- Detailed error logging for debugging
- Specific error messages for rate limiting, connectivity issues, etc.

### 3. **Fallback Data Removed**
- The `getFallbackSubreddits()` mechanism has been completely removed
- Real API errors now surface properly
- Users get clear error messages when Reddit API is unavailable

### 4. **Enhanced User-Agent**
- Updated to `IdeaCompass/1.0 (Market Research Tool) by /u/IdeaCompass`
- Complies with Reddit API guidelines
- Consistent across all API calls

### 5. **Comprehensive Test Endpoint**
- Enhanced `/api/test-reddit` endpoint with 3-stage testing:
  1. Direct Reddit API connectivity test
  2. Subreddit discovery test
  3. Post scraping test
- Includes environment variable checking and detailed logging

## 🚀 DEPLOYMENT TESTING

### Step 1: Test Locally
```bash
# Run the debug script
node test-reddit-debugging.js

# Test the Next.js API endpoint
curl http://localhost:3000/api/test-reddit
```

### Step 2: Deploy to Vercel
1. Push changes to your repository
2. Deploy to Vercel
3. Check the comprehensive test endpoint: `https://your-app.vercel.app/api/test-reddit`

### Step 3: Monitor Vercel Logs
After deployment, check Vercel function logs for detailed Reddit API debugging information:

```
[Reddit API] =================================================
[Reddit API] Environment Variables Check:
[Reddit API] Using Client ID: NOT SET
[Reddit API] Using Client Secret starting with: NOT SET...
[Reddit API] Using User Agent: IdeaCompass/1.0 (Market Research Tool) by /u/IdeaCompass
[Reddit API] Base URL: https://www.reddit.com
[Reddit API] =================================================
```

## 🔍 DEBUGGING CHECKLIST

### If Reddit API Still Fails:

1. **Environment Variables** (Most Likely Issue)
   ```bash
   # Check if these are set in Vercel Dashboard > Settings > Environment Variables
   REDDIT_CLIENT_ID=your_client_id_here
   REDDIT_CLIENT_SECRET=your_client_secret_here
   ```

2. **Rate Limiting**
   - Check logs for `x-ratelimit-*` headers
   - Look for HTTP 429 responses
   - Circuit breaker will activate after 2 consecutive failures

3. **Network/Firewall Issues**
   - Check if Vercel can reach Reddit API
   - Look for connection timeout errors
   - Verify no IP blocking

4. **User-Agent Issues**
   - Ensure Reddit accepts our User-Agent string
   - Check for HTTP 403/User-Agent related errors

### Expected Log Output on Success:
```
[Reddit API] Making search request to: https://www.reddit.com/subreddits/search.json?q=technology&type=sr&limit=10&sort=relevance
[Reddit API] Raw response status: 200 OK
[Reddit API] Response headers: {"x-ratelimit-remaining":"98.0","x-ratelimit-reset":"277","x-ratelimit-used":"2"}
✅ Discovery complete: 5 subreddits found
```

### Expected Log Output on Failure:
```
[Reddit API] CRITICAL ERROR - Search failed for "technology":
[Reddit API] Status: 429 Too Many Requests
[Reddit API] URL: https://www.reddit.com/subreddits/search.json?q=technology&type=sr&limit=10&sort=relevance
[Reddit API] Response body: {"error": "rate_limited", "message": "you are doing that too much. try again in X minutes."}
```

## 📊 MONITORING

### Key API Endpoints to Monitor:
1. `/api/test-reddit` - Comprehensive API health check
2. `/api/discover` - Subreddit discovery (main user-facing feature)
3. `/api/scrape/start` - Post scraping functionality

### Log Patterns to Watch:
- `[Reddit API] CRITICAL ERROR` - Immediate attention required
- `Rate limit circuit breaker active` - Temporary rate limiting
- `Could not fetch results from Reddit API` - Connectivity issues

## 🎯 NEXT STEPS

1. **Deploy immediately** to test in Vercel environment
2. **Monitor logs** for the first few API calls to verify logging is working
3. **Check environment variables** if you see "NOT SET" in logs
4. **Verify rate limiting behavior** - should be conservative (1.5s between requests)

The Reddit API should now be completely transparent about failures, making it much easier to diagnose and fix any remaining issues in the production environment.

---

## 🔧 FILES MODIFIED

- `src/lib/reddit.ts` - Added comprehensive logging, removed fallback, enhanced error handling
- `src/app/api/discover/route.ts` - Enhanced error handling and logging
- `src/app/api/test-reddit/route.ts` - Comprehensive 3-stage test endpoint
- `test-reddit-debugging.js` - Standalone debugging script (NEW)
- `REDDIT_API_DEBUG_GUIDE.md` - This deployment guide (NEW)

All changes maintain backward compatibility while dramatically improving debuggability and reliability.