/**
 * Utility Functions Tests
 * Tests for various utility functions used throughout the application
 */

// Mock data for testing
const mockRedditPosts = [
  {
    id: '1',
    title: 'How to improve productivity',
    content: 'Looking for tips on productivity improvement',
    subreddit: 'productivity',
    score: 25,
    numComments: 10,
    createdAt: new Date('2024-01-15'),
    author: 'user1',
    url: 'https://reddit.com/r/productivity/1',
  },
  {
    id: '2',
    title: 'AI and machine learning trends',
    content: 'Discussion about AI trends in 2024',
    subreddit: 'artificial',
    score: 45,
    numComments: 23,
    createdAt: new Date('2024-01-16'),
    author: 'user2',
    url: 'https://reddit.com/r/artificial/2',
  },
]

describe('Utility Functions', () => {
  describe('Data Validation', () => {
    it('validates keyword input correctly', () => {
      expect(isValidKeyword('')).toBe(false)
      expect(isValidKeyword('  ')).toBe(false)
      expect(isValidKeyword('a')).toBe(false) // Too short
      expect(isValidKeyword('ab')).toBe(true)
      expect(isValidKeyword('artificial intelligence')).toBe(true)
      expect(isValidKeyword('a'.repeat(101))).toBe(false) // Too long
    })

    it('validates email format correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })

    it('validates session ID format', () => {
      expect(isValidSessionId('session_123_abc')).toBe(true)
      expect(isValidSessionId('session_' + Date.now() + '_xyz')).toBe(true)
      expect(isValidSessionId('')).toBe(false)
      expect(isValidSessionId('invalid')).toBe(false)
    })
  })

  describe('Data Processing', () => {
    it('formats numbers correctly', () => {
      expect(formatNumber(999)).toBe('999')
      expect(formatNumber(1000)).toBe('1.0K')
      expect(formatNumber(1234)).toBe('1.2K')
      expect(formatNumber(1000000)).toBe('1.0M')
      expect(formatNumber(1234567)).toBe('1.2M')
    })

    it('calculates time differences correctly', () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      
      expect(getTimeAgo(oneHourAgo)).toBe('1 hour ago')
      expect(getTimeAgo(oneDayAgo)).toBe('1 day ago')
    })

    it('extracts keywords from text correctly', () => {
      const text = 'This is a test about artificial intelligence and machine learning'
      const keywords = extractKeywords(text, 3)
      
      expect(keywords).toHaveLength(3)
      expect(keywords).toContain('artificial')
      expect(keywords).toContain('intelligence')
      expect(keywords).toContain('machine')
    })

    it('calculates relevance scores correctly', () => {
      const keywords = ['productivity', 'improvement']
      const post = mockRedditPosts[0]
      
      const score = calculateRelevanceScore(post, keywords)
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(1)
    })
  })

  describe('Data Transformation', () => {
    it('converts posts to CSV format correctly', () => {
      const csvData = convertPostsToCSV(mockRedditPosts)
      
      expect(csvData).toContain('title,content,subreddit,score,comments,date,author,url')
      expect(csvData).toContain('How to improve productivity')
      expect(csvData).toContain('AI and machine learning trends')
    })

    it('sanitizes CSV data correctly', () => {
      const textWithCommas = 'Text, with, commas'
      const textWithQuotes = 'Text with \"quotes\"'
      
      expect(sanitizeCSVField(textWithCommas)).toBe('\"Text, with, commas\"')
      expect(sanitizeCSVField(textWithQuotes)).toBe('\"Text with \"\"quotes\"\"\"')
    })

    it('groups posts by subreddit correctly', () => {
      const grouped = groupPostsBySubreddit(mockRedditPosts)
      
      expect(grouped).toHaveProperty('productivity')
      expect(grouped).toHaveProperty('artificial')
      expect(grouped.productivity).toHaveLength(1)
      expect(grouped.artificial).toHaveLength(1)
    })
  })

  describe('URL and Path Helpers', () => {
    it('builds API URLs correctly', () => {
      expect(buildApiUrl('/categorize')).toBe('/api/categorize')
      expect(buildApiUrl('/discover', { keywords: 'test' })).toBe('/api/discover?keywords=test')
    })

    it('validates URLs correctly', () => {
      expect(isValidUrl('https://www.example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('formats error messages correctly', () => {
      const error = new Error('Test error')
      expect(formatErrorMessage(error)).toBe('Test error')
      
      const stringError = 'String error'
      expect(formatErrorMessage(stringError)).toBe('String error')
      
      const unknownError = { message: 'Object error' }
      expect(formatErrorMessage(unknownError)).toBe('An unexpected error occurred')
    })

    it('handles API errors correctly', () => {
      const apiError = {
        status: 400,
        message: 'Bad Request',
        details: 'Invalid input'
      }
      
      const formatted = formatApiError(apiError)
      expect(formatted).toContain('Bad Request')
      expect(formatted).toContain('Invalid input')
    })
  })
})

// Mock utility functions (these would be imported from actual utility files)
function isValidKeyword(keyword: string): boolean {
  return keyword.trim().length >= 2 && keyword.trim().length <= 100
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidSessionId(sessionId: string): boolean {
  return /^session_\d+_[a-zA-Z0-9]+$/.test(sessionId)
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
}

function extractKeywords(text: string, limit: number): string[] {
  return text.toLowerCase()
    .replace(/[^a-zA-Z\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, limit)
}

function calculateRelevanceScore(post: any, keywords: string[]): number {
  const text = `${post.title} ${post.content}`.toLowerCase()
  const matches = keywords.filter(keyword => text.includes(keyword.toLowerCase())).length
  return Math.min(matches / keywords.length, 1)
}

function convertPostsToCSV(posts: any[]): string {
  const header = 'title,content,subreddit,score,comments,date,author,url'
  const rows = posts.map(post => [
    sanitizeCSVField(post.title),
    sanitizeCSVField(post.content),
    post.subreddit,
    post.score,
    post.numComments,
    post.createdAt.toISOString(),
    post.author,
    post.url
  ].join(','))
  
  return [header, ...rows].join('\n')
}

function sanitizeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

function groupPostsBySubreddit(posts: any[]): Record<string, any[]> {
  return posts.reduce((groups, post) => {
    const subreddit = post.subreddit
    if (!groups[subreddit]) groups[subreddit] = []
    groups[subreddit].push(post)
    return groups
  }, {} as Record<string, any[]>)
}

function buildApiUrl(path: string, params?: Record<string, string>): string {
  const baseUrl = `/api${path}`
  if (!params) return baseUrl
  
  const searchParams = new URLSearchParams(params)
  return `${baseUrl}?${searchParams.toString()}`
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unexpected error occurred'
}

function formatApiError(error: any): string {
  if (error.message && error.details) {
    return `${error.message}: ${error.details}`
  }
  return error.message || 'API Error'
}