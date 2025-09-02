export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Insert email into waitlist
    const { data, error } = await supabase
      .from('waitlist_emails')
      .insert([{ email: email.toLowerCase().trim() }])
      .select()
      .single();

    if (error) {
      // Check if it's a unique constraint violation (email already exists)
      if (error.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'You\'re already on our waitlist! We\'ll notify you when we launch.',
          data: null,
        });
      }

      console.error('Error adding to waitlist:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to add email to waitlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully added to waitlist! We\'ll notify you when we launch.',
      data: {
        id: data.id,
        email: data.email,
        created_at: data.created_at,
      },
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}