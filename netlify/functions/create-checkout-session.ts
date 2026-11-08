/**
 * Netlify Function: create-checkout-session
 * 
 * Creates a Stripe Checkout Session for Rashoi Restaurant takeaway orders.
 * REJECTS requests if STRIPE_SECRET_KEY is not configured or payments are disabled.
 * 
 * NOTE: Online payment is initially disabled per system instructions.
 */

interface RequestBody {
  orderId: string;
  customerEmail: string;
  customerName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    selectedProtein?: string;
  }[];
  totalAmount: number;
  currency?: string;
}

export const handler = async (event: { httpMethod: string; body: string | null }) => {
  // Only POST allowed
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // 1. Verify Stripe Configuration
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const isOnlinePaymentEnabled = process.env.ENABLE_ONLINE_PAYMENTS === 'true';

  if (!stripeSecretKey || !isOnlinePaymentEnabled) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Online payment is currently disabled. Please choose pay on collection.',
        stripeConfigured: Boolean(stripeSecretKey),
        stripeEnabled: isOnlinePaymentEnabled,
      }),
    };
  }

  try {
    const body: RequestBody = JSON.parse(event.body || '{}');
    const { orderId, customerEmail, customerName, items, totalAmount } = body;

    if (!orderId || !customerEmail || !items || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid order payload' }),
      };
    }

    // Dynamic import stripe to prevent bundle issues if not installed
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16' as any,
    });

    const origin = process.env.URL || 'http://localhost:3000';

    // Map verified line items
    const line_items = items.map((item) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.selectedProtein ? `${item.name} (${item.selectedProtein})` : item.name,
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects amounts in pence
      },
      quantity: item.quantity,
    }));

    const sessionParams: any = {
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      client_reference_id: orderId,
      metadata: {
        orderId,
        customerName,
      },
      line_items,
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?payment=cancelled&order_id=${orderId}`,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        checkoutUrl: session.url,
      }),
    };
  } catch (error: any) {
    console.error('Stripe checkout session error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Failed to create checkout session' }),
    };
  }
};
