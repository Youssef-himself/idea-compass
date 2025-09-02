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

    // Get users with their profiles and usage stats
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        *,
        usage_logs(
          credits_used,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Process users data to include usage statistics
    const processedUsers = users?.map(user => {
      const totalCreditsUsed = user.usage_logs?.reduce((sum: number, log: any) => sum + (log.credits_used || 0), 0) || 0;
      const lastActivity = user.usage_logs?.[0]?.created_at || user.updated_at;

      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        plan: user.plan,
        researchCredits: user.research_credits,
        dailyCreditsUsed: user.daily_credits_used,
        totalCreditsUsed,
        lastActivity,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    }) || [];

    return NextResponse.json(processedUsers);

  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users data' },
      { status: 500 }
    );
  }
}
