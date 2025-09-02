import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check for missing environment variables at runtime
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-anon-key') {
    console.warn('⚠️  Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
}

// Browser client for client-side operations
export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!)
}

// Server client for server-side operations (API routes, server components)
export async function createServerSupabaseClient() {
  // Dynamic import to avoid issues with client-side bundling
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Server client for middleware
export function createMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  return { supabase, supabaseResponse }
}

// Service role client for administrative operations (user management, etc.)
export function createServiceRoleClient() {
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createBrowserClient(supabaseUrl!, supabaseServiceKey!)
}

// Database types for TypeScript support
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          plan: 'free' | 'pro' | 'premium'
          role: 'USER' | 'ADMIN'
          research_credits: number
          daily_credits_used: number
          last_credit_reset_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          paypal_subscription_id: string | null
          subscription_status: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'pro' | 'premium'
          role?: 'USER' | 'ADMIN'
          research_credits?: number
          daily_credits_used?: number
          last_credit_reset_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          paypal_subscription_id?: string | null
          subscription_status?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'pro' | 'premium'
          role?: 'USER' | 'ADMIN'
          research_credits?: number
          daily_credits_used?: number
          last_credit_reset_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          paypal_subscription_id?: string | null
          subscription_status?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          credits_used: number
          metadata: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          credits_used?: number
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          credits_used?: number
          metadata?: Record<string, any> | null
          created_at?: string
        }
      }
      waitlist_emails: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_plan: 'free' | 'pro' | 'premium'
    }
  }
}