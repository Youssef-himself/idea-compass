import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { APIResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Input validation
    if (!email || !password) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (authError) {
      console.error('Supabase signin error:', authError)
      
      // Handle different types of auth errors
      let errorMessage = 'Invalid email or password'
      
      if (authError.message.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email address before signing in'
      } else if (authError.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password'
      } else if (authError.message.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please try again later'
      }

      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: errorMessage
      }, { status: 401 })
    }

    if (!authData.user) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Failed to sign in'
      }, { status: 500 })
    }

    return NextResponse.json<APIResponse<{
      user: typeof authData.user
      session: typeof authData.session
    }>>({
      success: true,
      data: {
        user: authData.user,
        session: authData.session
      },
      message: 'Successfully signed in!'
    })

  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}