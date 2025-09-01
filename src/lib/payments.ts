import { getStripe } from '@/lib/stripe';

export interface PaymentRequest {
  plan: 'pro' | 'premium';
}

export interface PaymentResponse {
  success: boolean;
  error?: string;
  sessionId?: string;
}

export class PaymentService {
  /**
   * Create a Stripe checkout session and redirect to payment
   * Currently disabled until Stripe is configured
   */
  static async createStripeCheckout(plan: 'pro' | 'premium'): Promise<PaymentResponse> {
    return {
      success: false,
      error: 'Stripe payments are currently disabled'
    };
  }

  /**
   * Create a PayPal payment session
   */
  static async createPayPalPayment(plan: 'pro' | 'premium'): Promise<PaymentResponse> {
    try {
      const response = await fetch('/api/payments/paypal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to create PayPal payment',
        };
      }

      // Redirect to PayPal
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      }

      return {
        success: true,
        sessionId: data.orderId,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  /**
   * Get plan details for display
   */
  static getPlanDetails(plan: 'pro' | 'premium') {
    const plans = {
      pro: {
        name: 'Pro',
        price: 19,
        priceDisplay: '$19',
        credits: 50,
        features: [
          'Advanced research tools',
          'Priority support',
          'Detailed analytics',
          'Export to multiple formats',
          'Custom analysis prompts',
          'Advanced AI categorization',
          'Monthly credit refresh'
        ]
      },
      premium: {
        name: 'Premium',
        price: 49,
        priceDisplay: '$49',
        credits: 999999, // Unlimited
        features: [
          'All Pro features',
          'Team collaboration',
          'Unlimited research',
          'Custom branding',
          'API access',
          'Dedicated account manager',
          'Priority feature requests',
          'Advanced integrations'
        ]
      }
    };

    return plans[plan];
  }
}