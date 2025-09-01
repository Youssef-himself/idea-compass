import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { APIResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Supabase signout error:', error)
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'Failed to sign out'
      }, { status: 500 })
    }

    return NextResponse.json<APIResponse<null>>({
      success: true,
      message: 'Successfully signed out!'
    })

  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}