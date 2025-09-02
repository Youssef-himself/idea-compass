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

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (users who logged in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo);

    // Get total research actions from usage logs
    const { count: totalResearches } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true });

    // Get total credits consumed
    const { data: creditData } = await supabase
      .from('usage_logs')
      .select('credits_used');

    const creditsConsumed = creditData?.reduce((sum, log) => sum + (log.credits_used || 0), 0) || 0;

    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalResearches: totalResearches || 0,
      creditsConsumed: creditsConsumed
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
