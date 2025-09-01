# IdeaCompass Database Schema

This document outlines the Supabase database schema required for the IdeaCompass application's authentication and subscription system.

## Overview

The database uses PostgreSQL (via Supabase) with the following main tables:
- `profiles` - User profiles with subscription and credit information
- `usage_logs` - Track user research activity and credit consumption

## Schema Setup

### 1. Enable Row Level Security (RLS)

First, ensure Row Level Security is enabled on all tables for data protection.

### 2. Profiles Table

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT CHECK (plan IN ('free', 'pro', 'premium')) DEFAULT 'free' NOT NULL,
  research_credits INTEGER DEFAULT 3 NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  paypal_subscription_id TEXT,
  subscription_status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for fast lookups
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read/update their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for service role to manage profiles
CREATE POLICY "Service role can manage profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');
```

### 3. Usage Logs Table

```sql
-- Create usage_logs table
CREATE TABLE public.usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  credits_used INTEGER DEFAULT 0 NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON public.usage_logs(created_at);
CREATE INDEX idx_usage_logs_user_id_created_at ON public.usage_logs(user_id, created_at);

-- Enable RLS
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own logs
CREATE POLICY "Users can view their own usage logs" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for service role to manage logs
CREATE POLICY "Service role can manage usage logs" ON public.usage_logs
  FOR ALL USING (auth.role() = 'service_role');
```

### 4. Functions and Triggers

```sql
-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', null)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile changes
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

## Subscription Plans

### Plan Details

| Plan | Price | Users | Research Credits | Features |
|------|-------|-------|------------------|----------|
| **Free** | $0/month | 1 | 3 total | Basic research tools, Reddit scraping, Basic reports |
| **Pro** | $19/month | 1 | 50/month | Advanced research tools, Priority support, Detailed analytics, Multi-format exports |
| **Premium** | $49/month | 3 | Unlimited | All Pro features, Team collaboration, Custom branding, API access |

### Credit System Logic

- **Free Plan**: Users start with 3 total research credits. No monthly reset.
- **Pro Plan**: Users get 50 credits per month (reset monthly).
- **Premium Plan**: Unlimited credits (no consumption tracking).

## Security Features

1. **Row Level Security**: All tables use RLS to ensure users can only access their own data.
2. **Service Role Access**: Administrative functions use the service role key for elevated permissions.
3. **Email Validation**: Signup process validates against disposable email providers.
4. **Professional Email Filtering**: Only allows common professional email domains.

## Usage Tracking

The `usage_logs` table tracks:
- Research actions performed
- Credits consumed per action
- Metadata about the research session
- Timestamps for analytics

## Migration Notes

When setting up a new Supabase project:

1. Run the table creation scripts in order
2. Set up the triggers and functions
3. Configure environment variables in your application
4. Test the authentication flow with different user types

## Environment Variables Required

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
STRIPE_PRO_PRICE_ID=price_pro_monthly_price_id
STRIPE_PREMIUM_PRICE_ID=price_premium_monthly_price_id

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

## Monitoring and Maintenance

### Monthly Credit Reset (Cron Job)

Set up a Supabase Edge Function or external cron job to reset Pro plan credits monthly:

```sql
-- Reset Pro plan credits (run monthly)
UPDATE public.profiles 
SET research_credits = 50, updated_at = now()
WHERE plan = 'pro';
```

### Usage Analytics Queries

```sql
-- Get user activity summary
SELECT 
  p.email,
  p.plan,
  p.research_credits,
  COUNT(ul.id) as total_actions,
  SUM(ul.credits_used) as total_credits_used
FROM profiles p
LEFT JOIN usage_logs ul ON p.user_id = ul.user_id
WHERE ul.created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY p.id, p.email, p.plan, p.research_credits
ORDER BY total_credits_used DESC;

-- Get daily usage statistics
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_actions,
  COUNT(DISTINCT user_id) as unique_users,
  SUM(credits_used) as total_credits_consumed
FROM usage_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```