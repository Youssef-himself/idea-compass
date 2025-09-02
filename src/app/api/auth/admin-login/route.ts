export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createServiceRoleClient, createServerSupabaseClient } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';
const JWT_EXPIRES_IN = '24h';

interface AdminLoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AdminLoginRequest;
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create server-side Supabase client
    const supabase = await createServerSupabaseClient();

    // Authenticate user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get user profile and check role
    const serviceClient = createServiceRoleClient();
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('role, email, full_name, id')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if user has ADMIN role
    if (profile.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Generate JWT token with user info and role
    const tokenPayload = {
      userId: authData.user.id,
      email: profile.email,
      role: profile.role,
      fullName: profile.full_name,
      profileId: profile.id,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Create response with secure cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
      },
      message: 'Admin login successful',
    });

    // Set secure HTTP-only cookie
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Handle logout - clear the admin token cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}