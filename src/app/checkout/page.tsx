'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentService } from '@/lib/payments';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const plan = searchParams.get('plan')?.toLowerCase() as 'pro' | 'premium';
  const amount = plan === 'pro' ? '$19' : '$49';

  useEffect(() => {
    // Store the plan in session storage before redirecting to auth
    if (!user && plan) {
      sessionStorage.setItem('selectedPlan', plan);
      router.push('/auth?redirect=checkout');
      return;
    }

    if (!plan || !['pro', 'premium'].includes(plan)) {
      router.push('/pricing');
      return;
    }

    // Restore the plan from session storage after auth
    const storedPlan = sessionStorage.getItem('selectedPlan');
    if (user && storedPlan) {
      if (storedPlan !== plan) {
        router.push(`/checkout?plan=${storedPlan}`);
      }
      sessionStorage.removeItem('selectedPlan');
    }
  }, [user, plan, router]);

  const handlePayPalPayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await PaymentService.createPayPalPayment(plan);
      
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing your payment');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !plan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl mx-auto px-4">
        <button
          onClick={() => router.push('/pricing')}
          className="mb-8 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pricing
        </button>

        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Complete Your Purchase
          </h1>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Order Summary
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</p>
                  <p className="text-sm text-gray-600">Monthly subscription</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{amount}/mo</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              onClick={handlePayPalPayment}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-3 rounded-lg bg-[#ffc439] hover:bg-[#ffcd5d] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#003087] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Image
                  src="/paypal.svg"
                  alt="PayPal"
                  width={80}
                  height={20}
                  className="w-auto h-5"
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="animate-pulse flex flex-col items-center justify-center">
              <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
