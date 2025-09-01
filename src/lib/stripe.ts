import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Deactivated Stripe configuration - will be used when Stripe is set up
const STRIPE_ENABLED = false;

// Server-side Stripe instance
export const stripe = STRIPE_ENABLED ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
}) : null;

// Client-side Stripe instance
let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!STRIPE_ENABLED) {
    console.warn('Stripe payments are currently disabled');
    return null;
  }

  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Price IDs for our plans
export const STRIPE_PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
  premium_monthly: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly',
};

// Helper function to get price ID by plan
export const getPriceId = (plan: string): string => {
  if (!STRIPE_ENABLED) {
    console.warn('Stripe payments are currently disabled');
    return '';
  }

  switch (plan.toLowerCase()) {
    case 'pro':
      return STRIPE_PRICE_IDS.pro_monthly;
    case 'premium':
      return STRIPE_PRICE_IDS.premium_monthly;
    default:
      throw new Error(`Invalid plan: ${plan}`);
  }
};
