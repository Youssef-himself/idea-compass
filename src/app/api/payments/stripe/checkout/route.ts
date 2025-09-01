import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPriceId } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase';
import { AuthHelpers } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();
    
    // Validate the plan
    if (!plan || !['pro', 'premium'].includes(plan.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid plan specified' },
        { status: 400 }
      );
    }

    // Get user from Supabase
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user profile
    const profile = await AuthHelpers.getUserProfile(user.id);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get the price ID for the plan
    const priceId = getPriceId(plan);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: profile.email,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}&payment=success`,
      cancel_url: `${request.headers.get('origin')}/pricing?payment=cancelled`,
      metadata: {
        userId: user.id,
        plan: plan.toLowerCase(),
        email: profile.email,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: plan.toLowerCase(),
        },
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}