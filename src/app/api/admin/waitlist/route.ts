export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { requireAdminJWT } from '@/lib/jwt-auth';

export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication
    const authResult = await requireAdminJWT(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return the error response
    }
    
    const supabase = createServiceRoleClient();

    // Get all waitlist entries ordered by most recent
    const { data: waitlistEntries, error } = await supabase
      .from('waitlist_emails')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500); // Limit to prevent excessive data transfer

    if (error) {
      console.error('Error fetching waitlist:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch waitlist entries' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: waitlistEntries || [],
      count: waitlistEntries?.length || 0
    });

  } catch (error) {
    console.error('Admin waitlist error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch waitlist data' },
      { status: 500 }
    );
  }
}