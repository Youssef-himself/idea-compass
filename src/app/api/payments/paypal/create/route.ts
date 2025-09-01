import { NextRequest, NextResponse } from 'next/server';
import { paypalClient, getPlanPrice } from '@/lib/paypal';
import { createServerSupabaseClient } from '@/lib/supabase';
import { AuthHelpers } from '@/lib/auth';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

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

    // Get plan pricing
    const planPrice = getPlanPrice(plan.toLowerCase() as 'pro' | 'premium');
    
    // Create PayPal order
    const requestPaypal = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    requestPaypal.prefer("return=representation");
    requestPaypal.requestBody({
      intent: 'CAPTURE',
      application_context: {
        return_url: `${request.headers.get('origin')}/dashboard?payment=success&provider=paypal`,
        cancel_url: `${request.headers.get('origin')}/pricing?payment=cancelled`,
        brand_name: 'IdeaCompass',
        locale: 'en-US',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW'
      },
      purchase_units: [
        {
          reference_id: `${user.id}-${plan}-${Date.now()}`,
          description: planPrice.description,
          custom_id: JSON.stringify({
            userId: user.id,
            plan: plan.toLowerCase(),
            email: profile.email
          }),
          amount: {
            currency_code: planPrice.currency,
            value: planPrice.value,
            breakdown: {
              item_total: {
                currency_code: planPrice.currency,
                value: planPrice.value
              }
            }
          },
          items: [
            {
              name: planPrice.name,
              description: planPrice.description,
              unit_amount: {
                currency_code: planPrice.currency,
                value: planPrice.value
              },
              quantity: '1',
              category: 'DIGITAL_GOODS'
            }
          ]
        }
      ]
    });

    const client = paypalClient();
    const order = await client.execute(requestPaypal);
    
    // Extract approval URL
    const approvalUrl = order.result.links?.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      return NextResponse.json(
        { error: 'Failed to get PayPal approval URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: order.result.id,
      approvalUrl: approvalUrl
    });

  } catch (error: any) {
    console.error('PayPal order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}