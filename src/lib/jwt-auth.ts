import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

export interface AdminTokenPayload {
  userId: string;
  email: string;
  role: 'ADMIN';
  fullName?: string;
  profileId: string;
  iat: number;
  exp: number;
}

export interface AdminAuthResult {
  success: boolean;
  user?: AdminTokenPayload;
  error?: string;
}

export async function validateAdminJWT(request: NextRequest): Promise<AdminAuthResult> {
  try {
    // Get token from cookie
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return {
        success: false,
        error: 'No admin token provided'
      };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
    
    // Ensure the user has ADMIN role
    if (decoded.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Insufficient permissions'
      };
    }

    return {
      success: true,
      user: decoded
    };

  } catch (error) {
    console.error('JWT validation error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        error: 'Token expired'
      };
    }

    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

export async function requireAdminJWT(request: NextRequest): Promise<AdminAuthResult | NextResponse> {
  const authResult = await validateAdminJWT(request);
  
  if (!authResult.success) {
    return NextResponse.json(
      { 
        success: false, 
        error: authResult.error || 'Admin authentication required' 
      },
      { status: 401 }
    );
  }
  
  return authResult;
}

export function createAdminMiddleware() {
  return async (request: NextRequest) => {
    const authResult = await requireAdminJWT(request);
    
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }
    
    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-admin-user-id', authResult.user!.userId);
    requestHeaders.set('x-admin-email', authResult.user!.email);
    requestHeaders.set('x-admin-role', authResult.user!.role);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  };
}