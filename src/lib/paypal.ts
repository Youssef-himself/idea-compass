import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

const configureEnvironment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;

  return process.env.NODE_ENV === 'production'
    ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
    : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
};

export const paypalClient = () => {
  return new checkoutNodeJssdk.core.PayPalHttpClient(configureEnvironment());
};

// Plan pricing for PayPal
export const PAYPAL_PLAN_PRICES = {
  pro: {
    value: '19.00',
    currency: 'USD',
    name: 'Pro Plan - Monthly Subscription',
    description: 'Advanced research tools with 50 credits per month'
  },
  premium: {
    value: '49.00',
    currency: 'USD',
    name: 'Premium Plan - Monthly Subscription',
    description: 'Unlimited research tools with unlimited credits'
  }
};

export const getPlanPrice = (plan: 'pro' | 'premium') => {
  return PAYPAL_PLAN_PRICES[plan];
};