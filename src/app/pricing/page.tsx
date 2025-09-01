'use client';

import Link from 'next/link';
import { ArrowRight, Check, BarChart3 } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for trying out IdeaCompass',
      features: [
        'Up to 3 research projects per month',
        '5 subreddits per project',
        'Basic AI categorization',
        'PDF report export',
        'Email support'
      ],
      cta: 'Start Free',
      href: '/research',
      popular: false
    },
    {
      name: 'Pro',
      price: 'TBD',
      period: '/month',
      description: 'For serious market researchers',
      features: [
        'Unlimited research projects',
        'Unlimited subreddits per project',
        'Advanced AI analysis',
        'PDF & Word export',
        'Custom analysis prompts',
        'Priority support',
        'API access'
      ],
      cta: 'Coming Soon',
      href: '#',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'TBD',
      period: '/month',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'White-label reports',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'On-premise deployment'
      ],
      cta: 'Contact Sales',
      href: '/contact',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that's right for your research needs. Start free and upgrade as you grow.
          </p>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? 'border-blue-500 shadow-lg scale-105'
                  : 'border-gray-200 shadow-sm'
              } p-8`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 text-sm font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                
                <div className="mt-6">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>

                <Link
                  href={plan.href}
                  className={`mt-8 block w-full py-3 px-6 rounded-lg text-center font-medium transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : plan.name === 'Free'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-not-allowed'
                  }`}
                  onClick={plan.href === '#' ? (e) => e.preventDefault() : undefined}
                >
                  {plan.cta}
                  {plan.href !== '#' && <ArrowRight className="inline-block ml-2 w-4 h-4" />}
                </Link>
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

      {/* FAQ Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                What does "TBD" mean for pricing?
              </h3>
              <p className="text-gray-600">
                We're currently in beta and finalizing our pricing structure. Pro and Enterprise plans will be available soon with competitive pricing.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Can I upgrade or downgrade anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can change your plan at any time. Changes take effect immediately with prorated billing.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Is there a free trial for paid plans?
              </h3>
              <p className="text-gray-600">
                Our Free plan lets you try core features. When paid plans launch, we'll offer free trials for Pro and Enterprise.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We'll accept all major credit cards, PayPal, and wire transfers for Enterprise customers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white">
            Ready to start your market research?
          </h2>
          <p className="mt-4 text-xl text-blue-200">
            Begin with our free plan and upgrade when you're ready for more features.
          </p>
          <div className="mt-8">
            <Link
              href="/research"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
            >
              Start Free Research
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}