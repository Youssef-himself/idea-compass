
'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { BarChart3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Suspense } from 'react';

function AuthPageInner() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedPlan = searchParams.get('plan') || 'free';
  const redirectTo = searchParams.get('redirect') || 'dashboard';

  useEffect(() => {
    if (!loading && user) {
      // User is already logged in, redirect to intended destination
      router.push(`/${redirectTo}`);
    }
  }, [user, loading, redirectTo, router]);

  const handleSuccess = (message?: string) => {
    if (message) {
      setSuccessMessage(message);
      setTimeout(() => {
        setSuccessMessage(null);
        router.push(`/${redirectTo}`);
      }, 3000);
    } else {
      router.push(`/${redirectTo}`);
    }
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setSuccessMessage(null);
  };

  const getPlanInfo = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'pro':
        return { name: 'Pro', price: '$19/month', credits: '50 credits/month' };
      case 'premium':
        return { name: 'Premium', price: '$49/month', credits: 'Unlimited credits' };
      default:
        return { name: 'Free', price: 'Free', credits: '3 total credits' };
    }
  };

  const planInfo = getPlanInfo(selectedPlan);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">IdeaCompass</span>
          </Link>
          
          {selectedPlan !== 'free' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Get started with {planInfo.name}
              </h3>
              <div className="text-sm text-blue-700">
                <div className="font-medium">{planInfo.price}</div>
                <div>{planInfo.credits}</div>
              </div>
            </div>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6">
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Auth Forms */}
        {!successMessage && (
          <>
            {mode === 'login' ? (
              <LoginForm
                onSuccess={() => handleSuccess()}
                onSwitchToSignup={handleSwitchMode}
              />
            ) : (
              <SignupForm
                onSuccess={handleSuccess}
                onSwitchToLogin={handleSwitchMode}
              />
            )}
          </>
        )}

        {/* Back to Pricing */}
        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to pricing
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageInner />
    </Suspense>
  );
}