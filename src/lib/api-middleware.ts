import { NextRequest, NextResponse } from 'next/server'
import { AuthHelpers } from '@/lib/auth'
import { APIResponse } from '@/types'

export interface AuthenticatedUser {
  id: string
  email: string
}

export type AuthMiddlewareResult = {
  success: true
  user: AuthenticatedUser
} | {
  success: false
  response: NextResponse
}

export async function requireAuthentication(request: NextRequest): Promise<AuthMiddlewareResult> {
  try {
    const user = await AuthHelpers.getCurrentUser()
    
    if (!user) {
      return {
        success: false,
        response: NextResponse.json<APIResponse<null>>({
          success: false,
          error: 'Authentication required. Please sign in to continue.',
        }, { status: 401 })
      }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email!,
      }
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      response: NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Authentication failed',
      }, { status: 401 })
    }
  }
}

export type CreditCheckResult = {
  success: true
  remainingCredits: number
} | {
  success: false
  response: NextResponse
}

export async function requireResearchCredits(
  userId: string, 
  action: string = 'research'
): Promise<CreditCheckResult> {
  try {
    // Check if user has research credits available
    const { hasCredits, remainingCredits } = await AuthHelpers.hasResearchCredits(userId)
    
    if (!hasCredits) {
      return {
        success: false,
        response: NextResponse.json<APIResponse<null>>({
          success: false,
          error: 'You have run out of research credits. Please upgrade your plan to continue.',
        }, { status: 403 })
      }
    }

    // Consume a research credit
    const creditConsumed = await AuthHelpers.consumeResearchCredit(userId, action)
    
    if (!creditConsumed) {
      return {
        success: false,
        response: NextResponse.json<APIResponse<null>>({
          success: false,
          error: 'Failed to process research credit. Please try again.',
        }, { status: 500 })
      }
    }

    return {
      success: true,
      remainingCredits: remainingCredits > 0 ? remainingCredits - 1 : -1 // -1 for unlimited
    }
  } catch (error) {
    console.error('Credit check error:', error)
    return {
      success: false,
      response: NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Failed to process research credits',
      }, { status: 500 })
    }
  }
}

export function validateInput(data: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = []

  for (const rule of rules) {
    const value = data[rule.field]
    
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${rule.field} is required`)
      continue
    }

    if (value !== undefined && value !== null) {
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${rule.field} must be a string`)
      } else if (rule.type === 'number' && typeof value !== 'number') {
        errors.push(`${rule.field} must be a number`)
      } else if (rule.type === 'array' && !Array.isArray(value)) {
        errors.push(`${rule.field} must be an array`)
      } else if (rule.type === 'string' && typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters long`)
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${rule.field} must be no more than ${rule.maxLength} characters long`)
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${rule.field} format is invalid`)
        }
      } else if (rule.type === 'array' && Array.isArray(value)) {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${rule.field} must have at least ${rule.minLength} items`)
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${rule.field} must have no more than ${rule.maxLength} items`)
        }
      } else if (rule.type === 'number' && typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`${rule.field} must be at least ${rule.min}`)
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(`${rule.field} must be no more than ${rule.max}`)
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export interface ValidationRule {
  field: string
  type: 'string' | 'number' | 'array' | 'boolean'
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Basic HTML/script tag removal and trim
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item))
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key])
      }
    }
    return sanitized
  }
  
  return input
}

// Rate limiting helper (basic implementation)
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>()
  
  static checkRateLimit(
    identifier: string, 
    windowMs: number = 60000, // 1 minute
    maxRequests: number = 60
  ): { allowed: boolean; remainingRequests: number; resetTime: number } {
    const now = Date.now()
    const userRequests = this.requests.get(identifier)
    
    // If no previous requests or window has expired, reset
    if (!userRequests || now > userRequests.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      })
      
      return {
        allowed: true,
        remainingRequests: maxRequests - 1,
        resetTime: now + windowMs
      }
    }
    
    // Check if under limit
    if (userRequests.count < maxRequests) {
      userRequests.count++
      
      return {
        allowed: true,
        remainingRequests: maxRequests - userRequests.count,
        resetTime: userRequests.resetTime
      }
    }
    
    // Over limit
    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: userRequests.resetTime
    }
  }
}