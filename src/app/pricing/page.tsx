'use client';

import Link from 'next/link';
import { ArrowRight, Check, BarChart3, Users, Zap, Crown, Star } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentService } from '@/lib/payments';
import { useState } from 'react';
import { PLAN_DETAILS } from '@/config/plans';

export default function PricingPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  // Handle plan selection
  const handlePlanSelect = (planName: string, isCurrentPlan: boolean) => {
    if (isCurrentPlan) {
      window.location.href = '/dashboard';
      return;
    }
    
    if (planName === 'Free') {
      if (!user) {
        window.location.href = `/auth?plan=free&redirect=research`;
      } else {
        window.location.href = '/research';
      }
      return;
    }

    // Redirect to waitlist for paid plans
    if (['Pro', 'Premium'].includes(planName)) {
      window.location.href = `/waitlist?plan=${planName.toLowerCase()}`;
      return;
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'Free':
        return <BarChart3 className="w-8 h-8 text-blue-600" />;
      case 'Pro':
        return <Zap className="w-8 h-8 text-purple-600" />;
      case 'Premium':
        return <Crown className="w-8 h-8 text-amber-600" />;
      default:
        return <BarChart3 className="w-8 h-8 text-blue-600" />;
    }
  };

  const getPlanDescription = (planName: string) => {
    switch (planName) {
      case 'Free':
        return 'Perfect for trying out IdeaCompass with limited features';
      case 'Pro':
        return 'For serious market researchers and businesses';
      case 'Premium':
        return 'For teams and growing organizations';
      default:
        return '';
    }
  };

  const plans = PLAN_DETAILS.map((planDetail) => ({
    name: planDetail.name,
    price: planDetail.price,
    period: planDetail.price === 'Waitlist' ? '' : '/month',
    description: getPlanDescription(planDetail.name),
    icon: getPlanIcon(planDetail.name),
    credits: planDetail.name === 'Free' 
      ? `${planDetail.credits} research credits (${planDetail.dailyCreditLimit} per day)`
      : planDetail.name === 'Premium'
      ? `${planDetail.credits} research credits`
      : `${planDetail.credits} research credits per month`,
    users: '1 user', // This remains hardcoded as it's not in the config
    features: planDetail.features,
    limitations: planDetail.limitations,
    popular: planDetail.name === 'Pro',
    current: profile?.plan === planDetail.name.toLowerCase()
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that's right for your research needs. Start free and scale with our credit-based system.
          </p>
          {user && profile && (
            <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
              <Star className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                You're on the {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)} plan with {profile.plan === 'premium' ? 'unlimited' : profile.researchCredits} credits remaining
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border ${
                plan.current
                  ? 'border-green-500 shadow-lg ring-2 ring-green-200'
                  : plan.popular
                  ? 'border-blue-500 shadow-lg scale-105'
                  : 'border-gray-200 shadow-sm'
              } p-8 ${plan.current ? 'bg-green-50' : 'bg-white'}`}
            >
              {plan.current && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-green-600 text-white px-4 py-1 text-sm font-medium rounded-full">
                    Current Plan
                  </span>
                </div>
              )}
              
              {plan.popular && !plan.current && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 text-sm font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                
                <div className="mt-6">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>

                {/* Credit Information */}
                <div className="mt-4 space-y-2">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                    <Zap className="w-4 h-4 mr-1" />
                    {plan.credits}
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium ml-2">
                    <Users className="w-4 h-4 mr-1" />
                    {plan.users}
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => handlePlanSelect(plan.name, plan.current)}
                    disabled={loading === plan.name}
                    className={`w-full py-3 px-6 rounded-lg text-center font-medium transition-colors ${
                      plan.current
                        ? 'bg-green-600 text-white'
                        : plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : plan.name === 'Free'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    } ${loading === plan.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading === plan.name ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        {plan.current 
                          ? 'Current Plan' 
                          : !user 
                          ? plan.name === 'Free' 
                            ? 'Start Free' 
                            : `Join ${plan.name} Waitlist`
                          : plan.name === 'Free'
                          ? 'Switch to Free'
                          : `Join ${plan.name} Waitlist`
                        }
                        {!plan.current && <ArrowRight className="inline-block ml-2 w-4 h-4" />}
                      </>
                    )}
                  </button>
                </div>
                
                {!user && (
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    {plan.name === 'Free' ? 'No credit card required' : 'Sign up to get started'}
                  </p>
                )}
              </div>

              <div className="mt-8">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" />
                      <span className="ml-3 text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Comparison Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            How our credit system works
          </h2>
          
          <div className="bg-white rounded-xl shadow-sm border p-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Actions</h3>
                <p className="text-gray-600 text-sm">
                  One (1) credit is consumed the moment you select a subreddit and proceed to the data scraping step. Actions like generating ideas or reports afterwards do not consume additional credits for the same research.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Replenishment</h3>
                <p className="text-gray-600 text-sm">
                  Free plan: {PLAN_DETAILS[0].dailyCreditLimit} credits replenish daily (max {PLAN_DETAILS[0].credits}). Pro plan: {PLAN_DETAILS[1].credits} credits refresh monthly.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlimited Access</h3>
                <p className="text-gray-600 text-sm">
                  Premium users get {PLAN_DETAILS[2].credits} credits and can perform as many research actions as needed
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                How do research credits work?
              </h3>
              <p className="text-gray-600">
                One (1) credit is consumed the moment you select a subreddit and proceed to the data scraping step. Actions like generating ideas or reports afterwards do not consume additional credits for the same research. Free users get {PLAN_DETAILS[0].credits} total credits ({PLAN_DETAILS[0].dailyCreditLimit} replenish daily), Pro users get {PLAN_DETAILS[1].credits} per month, and Premium users get {PLAN_DETAILS[2].credits}.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                What happens when I run out of credits?
              </h3>
              <p className="text-gray-600">
                When you run out of credits, you'll need to upgrade your plan to continue using research features. You can still access your existing research and reports.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Do unused credits roll over?
              </h3>
              <p className="text-gray-600">
                Pro plan credits refresh monthly and don't roll over. Premium plans have {PLAN_DETAILS[2].credits} credits. Free plan credits replenish daily ({PLAN_DETAILS[0].dailyCreditLimit} per day, max {PLAN_DETAILS[0].credits} total).
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Is there a free trial for paid plans?
              </h3>
              <p className="text-gray-600">
                Our Free plan lets you try core features with {PLAN_DETAILS[0].credits} research credits ({PLAN_DETAILS[0].dailyCreditLimit} replenish daily). This gives you a full experience of the platform before deciding to upgrade.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards through Stripe. Enterprise customers can also pay via wire transfer and purchase orders.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white">
            {user ? 'Ready to unlock more research power?' : 'Ready to start your market research?'}
          </h2>
          <p className="mt-4 text-xl text-blue-200">
            {user && profile 
              ? profile.plan === 'premium' 
                ? 'You have unlimited access to all research features!'
                : 'Upgrade your plan to get more credits and advanced features.'
              : `Start with ${PLAN_DETAILS[0].dailyCreditLimit} free research credits and upgrade when you need more.`
            }
          </p>
          <div className="mt-8">
            {user ? (
              <div className="flex justify-center space-x-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                {profile?.plan !== 'premium' && (
                  <Link
                    href={`/waitlist?plan=${profile?.plan === 'free' ? 'pro' : 'premium'}`}
                    className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-700 transition-colors"
                  >
                    {profile?.plan === 'free' ? 'Join Pro Waitlist' : 'Join Premium Waitlist'}
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex justify-center space-x-4">
                <Link
                  href="/auth?plan=free&redirect=research"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                >
                  Start Free Research
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/auth?plan=pro&redirect=research"
                  className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-700 transition-colors"
                >
                  Choose Pro Plan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}