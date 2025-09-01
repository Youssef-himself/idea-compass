# 🚀 Supabase Connection Guide for IdeaCompass

This guide will help you connect your local IdeaCompass development environment to your live Supabase project, fixing the "cannot create your account" error.

## 📋 Prerequisites

- Your Supabase project is already created and running
- You have access to your Supabase project dashboard
- Your local development environment is set up with the IdeaCompass code

## 🔑 Step 1: Find Your Supabase Credentials

### 1.1 Access Your Supabase Dashboard
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in to your account
3. Select your IdeaCompass project from the dashboard

### 1.2 Locate the Project URL
1. In your project dashboard, click on the **"Settings"** icon in the left sidebar
2. Click on **"API"** in the settings menu
3. You'll see a section called **"Project URL"**
4. Copy the URL that looks like: `https://your-project-id.supabase.co`

### 1.3 Locate the Anon Key
1. In the same API settings page, scroll down to find **"Project API keys"**
2. Find the key labeled **"anon public"** 
3. Click the **"Copy"** button next to it
4. It will look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (a very long string)

### 1.4 Locate the Service Role Key (Optional - for admin functions)
1. In the same section, find the key labeled **"service_role"**
2. Click the **"Copy"** button next to it
3. **⚠️ Important:** This key has admin privileges - keep it secure!

## 📁 Step 2: Create the Environment File

### 2.1 Create .env.local File
1. Open your IdeaCompass project folder in your file explorer
2. In the **root directory** (where you see `package.json`), create a new file
3. Name this file exactly: `.env.local` (note the dot at the beginning)

### 2.2 Add Your Credentials
Open the `.env.local` file in any text editor and add these lines:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Stripe Configuration (for payments - add when ready)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_PRO_PRICE_ID="price_pro_monthly_id"
STRIPE_PREMIUM_PRICE_ID="price_premium_monthly_id"

# PayPal Configuration (for payments - add when ready)
PAYPAL_CLIENT_ID="your_paypal_client_id"
PAYPAL_CLIENT_SECRET="your_paypal_client_secret"
```

**Replace the placeholder values with your actual credentials:**
- Replace `https://your-project-id.supabase.co` with your Project URL
- Replace `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` with your actual keys

## 🗄️ Step 3: Set Up Your Database Schema

Your Supabase database needs specific tables for IdeaCompass to work properly.

### 3.1 Access SQL Editor
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**

### 3.2 Create Required Tables
Copy and paste this SQL code and click **"Run"**:

```sql
-- Create profiles table with payment fields
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

-- Create usage_logs table
CREATE TABLE public.usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  credits_used INTEGER DEFAULT 0 NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON public.usage_logs(created_at);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Create policies for usage_logs
CREATE POLICY "Users can view their own usage logs" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage logs" ON public.usage_logs
  FOR ALL USING (auth.role() = 'service_role');

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

## 🔄 Step 4: Restart Your Development Server

**This is crucial!** After creating or modifying the `.env.local` file:

### 4.1 Stop Your Current Server
- If your development server is running, stop it by pressing `Ctrl + C` in your terminal

### 4.2 Start the Server Again
- Run `npm run dev` in your terminal
- Wait for the server to fully start (you'll see "Ready - started server on...")

## ✅ Step 5: Test the Connection

### 5.1 Test User Registration
1. Open your browser and go to `http://localhost:3000`
2. Click on "Start Free Research" or go to `/auth`
3. Try creating a new account with a valid email
4. If successful, you should see a success message and be redirected

### 5.2 Verify in Supabase Dashboard
1. Go back to your Supabase dashboard
2. Click **"Table Editor"** in the left sidebar
3. Select the **"profiles"** table
4. You should see your new user profile listed there

## 🐛 Troubleshooting Common Issues

### Issue 1: "Cannot create your account" Error
**Solution:**
- Double-check your `.env.local` file has the correct variable names
- Ensure there are no extra spaces or quotes around the values
- Make sure you restarted the development server after creating the file

### Issue 2: "Profile not found" Error
**Solution:**
- Verify the database schema was created correctly
- Check that the `handle_new_user()` function and trigger are set up
- Try deleting the test user from Supabase Auth and registering again

### Issue 3: Environment Variables Not Loading
**Solution:**
- Ensure the file is named exactly `.env.local` (not `.env` or `.env.txt`)
- Make sure it's in the root directory (same level as `package.json`)
- Restart your development server completely

### Issue 4: Database Permission Errors
**Solution:**
- Verify Row Level Security policies are set up correctly
- Check that the service role key is properly configured
- Ensure the user trigger function has SECURITY DEFINER set

## 🎯 Next Steps After Connection

Once your Supabase connection is working:

1. **Test All Features:** Try user registration, login, and logout
2. **Set Up Payments:** Configure Stripe and PayPal credentials when ready
3. **Monitor Usage:** Check the usage_logs table to see user activity
4. **Production Setup:** When ready, update environment variables for production

## 📞 Getting Help

If you continue experiencing issues:

1. **Check the Browser Console:** Press F12 and look for error messages
2. **Check Terminal Output:** Look for detailed error messages in your development server
3. **Verify Supabase Dashboard:** Ensure your project is active and tables exist
4. **Review Environment Variables:** Double-check all credentials are correct

## 🔐 Security Reminders

- **Never commit `.env.local`** to version control (it should be in your `.gitignore`)
- **Keep your service role key secure** - it has admin access to your database
- **Use different credentials** for development and production environments
- **Regularly rotate your API keys** for security

---

🎉 **Congratulations!** Once you've completed these steps, your IdeaCompass application should be fully connected to Supabase and ready for user registration and authentication!