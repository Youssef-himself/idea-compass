import { POST, GET } from '@/app/api/categorize/route'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/openai', () => ({
  categorizePost: jest.fn(),
}))

jest.mock('@/lib/database', () => ({
  kvDb: {
    saveCategories: jest.fn(),
    getCategories: jest.fn(),
  },
}))

const mockAIAnalyzer = require('@/lib/openai')
const mockKvDb = require('@/lib/database').kvDb

describe('/api/categorize API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variables
    delete process.env.OPENAI_API_KEY
  })

  describe('POST /api/categorize', () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Test post 1',
        content: 'Test content 1',
        subreddit: 'test',
        score: 10,
        numComments: 5,
        createdAt: new Date(),
        author: 'testuser',
        url: 'https://reddit.com/test1',
      },
    ]

    it('successfully categorizes posts with OpenAI', async () => {
      // Set up environment
      process.env.OPENAI_API_KEY = 'test-api-key'
      
      const mockCategories = [
        {
          id: 'cat1',
          name: 'Test Category',
          description: 'Test description',
          keywords: ['test'],
          postCount: 1,
          percentage: 100,
          confidence: 0.9,
          samplePosts: [mockPosts[0]],
          tags: ['test'],
        },
      ]

      mockAIAnalyzer.categorizePost.mockResolvedValue(mockCategories)
      mockKvDb.saveCategories.mockResolvedValue(undefined)

      const request = new NextRequest('http://localhost:3000/api/categorize', {
        method: 'POST',
        body: JSON.stringify({
          posts: mockPosts,
          sessionId: 'test-session',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockCategories)
      expect(mockAIAnalyzer.categorizePost).toHaveBeenCalledWith(mockPosts)
      expect(mockKvDb.saveCategories).toHaveBeenCalledWith('test-session', mockCategories)
    })

    it('falls back to mock categorization when OpenAI API key is missing', async () => {
      // No OpenAI API key set
      mockKvDb.saveCategories.mockResolvedValue(undefined)

      const request = new NextRequest('http://localhost:3000/api/categorize', {
        method: 'POST',
        body: JSON.stringify({
          posts: mockPosts,
          sessionId: 'test-session',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('demo mode')
      expect(data.data).toBeDefined()
      expect(Array.isArray(data.data)).toBe(true)
      expect(mockAIAnalyzer.categorizePost).not.toHaveBeenCalled()
    })

    it('falls back to mock categorization on AI error', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key'
      
      mockAIAnalyzer.categorizePost.mockRejectedValue(new Error('AI service error'))
      mockKvDb.saveCategories.mockResolvedValue(undefined)

      const request = new NextRequest('http://localhost:3000/api/categorize', {
        method: 'POST',
        body: JSON.stringify({
          posts: mockPosts,
          sessionId: 'test-session',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('fallback mode')
    })

    it('returns 400 for missing posts', async () => {
      const request = new NextRequest('http://localhost:3000/api/categorize', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: 'test-session',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Posts array is required')
    })

    it('returns 400 for empty posts array', async () => {
      const request = new NextRequest('http://localhost:3000/api/categorize', {
        method: 'POST',
        body: JSON.stringify({
          posts: [],
          sessionId: 'test-session',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Posts array is required')
    })

    it('returns 400 for missing session ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/categorize', {
        method: 'POST',
        body: JSON.stringify({
          posts: mockPosts,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Session ID is required')
    })
  })

  describe('GET /api/categorize', () => {
    it('successfully retrieves categories', async () => {
      const mockCategories = [
        {
          id: 'cat1',
          name: 'Test Category',
          description: 'Test description',
          keywords: ['test'],
          postCount: 1,
          percentage: 100,
          confidence: 0.9,
          samplePosts: [],
          tags: ['test'],
        },
      ]

      mockKvDb.getCategories.mockResolvedValue(mockCategories)

      const request = new NextRequest('http://localhost:3000/api/categorize?sessionId=test-session')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockCategories)
      expect(mockKvDb.getCategories).toHaveBeenCalledWith('test-session')
    })

    it('returns empty array when no categories found', async () => {
      mockKvDb.getCategories.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/categorize?sessionId=test-session')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
    })

    it('returns 400 for missing session ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/categorize')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Session ID is required')
    })

    it('handles database errors gracefully', async () => {
      mockKvDb.getCategories.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/categorize?sessionId=test-session')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to get categories')
    })
  })
})