export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminJWT } from '@/lib/jwt-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminJWT(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authResult.user!.userId,
        email: authResult.user!.email,
        fullName: authResult.user!.fullName,
        role: authResult.user!.role,
      }
    });

  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication check failed' },
      { status: 500 }
    );
  }
}