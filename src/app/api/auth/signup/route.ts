import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { AuthHelpers, EmailValidator } from '@/lib/auth'
import { APIResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    // Input validation
    if (!email || !password) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    // Validate email format
    if (!EmailValidator.validateEmailFormat(email)) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Please enter a valid email address'
      }, { status: 400 })
    }

    // Check for disposable email addresses
    if (await EmailValidator.isDisposableEmail(email)) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Temporary email addresses are not allowed. Please use a permanent email address.'
      }, { status: 400 })
    }

    // Enhanced email validation (professional domains only)
    if (!(await EmailValidator.isAllowedEmail(email))) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Please use a professional email address (Gmail, Outlook, or company email)'
      }, { status: 400 })
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Password must be at least 8 characters long'
      }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          full_name: fullName || null,
        }
      }
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: authError.message === 'User already registered' 
          ? 'An account with this email already exists' 
          : 'Failed to create account. Please try again.'
      }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Failed to create user account'
      }, { status: 500 })
    }

    // Create user profile in our database
    const profile = await AuthHelpers.createUserProfile({
      userId: authData.user.id,
      email: email.toLowerCase().trim(),
      fullName: fullName || undefined,
    })

    if (!profile) {
      // If profile creation fails, we should clean up the auth user
      // But for now, we'll just log the error and continue
      console.error('Failed to create user profile for user:', authData.user.id)
    }

    return NextResponse.json<APIResponse<{ 
      user: typeof authData.user
      needsEmailConfirmation: boolean 
    }>>({
      success: true,
      data: {
        user: authData.user,
        needsEmailConfirmation: !authData.user.email_confirmed_at
      },
      message: authData.user.email_confirmed_at 
        ? 'Account created successfully!' 
        : 'Account created! Please check your email to confirm your account.'
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}