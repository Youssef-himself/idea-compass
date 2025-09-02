export interface PricingPlan {
  name: string;
  price: string;
  credits: number;
  dailyCreditLimit?: number;
  features: string[];
  limitations?: string[];
}

export const PLAN_DETAILS: PricingPlan[] = [
  {
    name: 'Free',
    price: '€0',
    credits: 15,
    dailyCreditLimit: 3,
    features: [
      '15 Monthly Credits',
      '3 Credits per Day Limit',
      'Select 1 Subreddit per Research',
      'Select 1 Idea per Generation',
      'Export Lite Report (Summary only)'
    ],
    limitations: [
      'No Raw Data Export (CSV)',
      'No Data Upload Feature'
    ]
  },
  {
    name: 'Pro',
    price: 'Waitlist',
    credits: 50,
    features: [
      '50 Monthly Credits',
      'All Features Unlocked',
      'Advanced AI-powered Analysis',
      'Analyze Multiple Subreddits',
      'Full Detailed Report Generation',
      'CSV Data Export',
      'Data Upload Support'
    ]
  },
  {
    name: 'Premium',
    price: 'Waitlist',
    credits: 150,
    features: [
      '150 Monthly Credits',
      'All Pro Features Included',
      'Priority Support',
      'API Access (soon)'
    ]
  }
];

// Helper functions for easy access
export const getFreeplan = () => PLAN_DETAILS.find(plan => plan.name === 'Free')!;
export const getProPlan = () => PLAN_DETAILS.find(plan => plan.name === 'Pro')!;
export const getPremiumPlan = () => PLAN_DETAILS.find(plan => plan.name === 'Premium')!;

export const getPlanByName = (name: string) => PLAN_DETAILS.find(plan => plan.name === name);