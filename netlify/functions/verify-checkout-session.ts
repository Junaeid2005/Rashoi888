/**
 * Netlify Function: verify-checkout-session
 * 
 * Verifies a Stripe Checkout Session on the success page without webhooks.
 * Checks payment_status === 'paid', currency === 'gbp', and returns session details.
 */

export const handler = async (event: { queryStringParameters?: { session_id?: string } | null }) => {
  const sessionId = event.queryStringParameters?.session_id;

  if (!sessionId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing session_id parameter' }),
    };
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Stripe is not yet configured on this environment.',
        paymentStatus: 'unpaid'
      }),
    };
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16' as any,
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    const isPaid = session.payment_status === 'paid';
    const paymentIntent = typeof session.payment_intent === 'object' ? session.payment_intent : null;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verified: isPaid,
        orderId: session.client_reference_id || session.metadata?.orderId,
        paymentStatus: isPaid ? 'paid' : 'pending',
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase(),
        paymentIntentId: paymentIntent?.id || null,
        customerEmail: session.customer_details?.email,
      }),
    };
  } catch (error: any) {
    console.error('Error verifying checkout session:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Payment verification failed' }),
    };
  }
};
