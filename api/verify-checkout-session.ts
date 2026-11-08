import Stripe from 'stripe';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return res.status(503).json({ error: 'STRIPE_SECRET_KEY not set in environment.' });
  }

  const sessionId = req.query?.session_id || req.body?.session_id;
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Missing session_id parameter.' });
  }

  try {
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return res.status(200).json({
      paid: session.payment_status === 'paid',
      status: session.status,
      customerEmail: session.customer_details?.email || session.customer_email,
      orderId: session.client_reference_id || session.metadata?.orderId,
      amountTotal: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
    });
  } catch (err: any) {
    console.error('Error verifying Stripe session:', err);
    return res.status(500).json({ error: err.message || 'Failed to verify session' });
  }
}
