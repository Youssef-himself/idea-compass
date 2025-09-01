import { NextRequest, NextResponse } from 'next/server';
import { paypalClient } from '@/lib/paypal';
import { createServiceRoleClient } from '@/lib/supabase';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Capture the PayPal order
    const requestPaypal = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    requestPaypal.requestBody({});

    const client = paypalClient();
    const capture = await client.execute(requestPaypal);
    
    if (capture.result.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Extract user data from the order
    const purchaseUnit = capture.result.purchase_units[0];
    const customData = JSON.parse(purchaseUnit.custom_id);
    const { userId, plan, email } = customData;

    if (!userId || !plan) {
      console.error('Missing user data in PayPal order:', customData);
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      );
    }

    // Update user's plan in Supabase
    const supabase = createServiceRoleClient();
    
    const { error } = await supabase
      .from('profiles')
      .update({
        plan: plan as 'pro' | 'premium',
        research_credits: plan === 'premium' ? 999999 : 50, // Unlimited for premium, 50 for pro
        paypal_subscription_id: capture.result.id,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to update user plan after PayPal payment:', error);
      return NextResponse.json(
        { error: 'Failed to update user plan' },
        { status: 500 }
      );
    }

    // Log the usage
    const { error: logError } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        action: 'plan_upgrade',
        credits_used: 0,
        metadata: {
          from_plan: 'free',
          to_plan: plan,
          payment_provider: 'paypal',
          transaction_id: capture.result.id,
          amount: purchaseUnit.amount.value
        }
      });

    if (logError) {
      console.error('Failed to log PayPal payment:', logError);
    }

    console.log(`Successfully upgraded user ${userId} to ${plan} plan via PayPal`);

    return NextResponse.json({
      success: true,
      orderId: capture.result.id,
      plan: plan,
      message: `Successfully upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan`
    });

  } catch (error: any) {
    console.error('PayPal capture error:', error);
    return NextResponse.json(
      { error: 'Failed to process PayPal payment' },
      { status: 500 }
    );
  }
}