import type { IncomingMessage, ServerResponse } from 'http';
import Stripe from 'stripe';

interface RequestBody {
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    selectedProtein?: string;
  }[];
  totalAmount: number;
  discount?: number;
  subtotal?: number;
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return res.status(503).json({
      error: 'Stripe is not yet configured with STRIPE_SECRET_KEY in Vercel environment variables.',
      configured: false,
    });
  }

  try {
    const body: RequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { orderId, customerEmail, customerName, items, totalAmount } = body;

    if (!orderId || !customerEmail || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required order details.' });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const origin = `${protocol}://${host}`;

    // Line items for Stripe Checkout
    const line_items = items.map((item) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.selectedProtein ? `${item.name} (${item.selectedProtein})` : item.name,
          description: 'Rashoi Restaurant — Windlesham, Surrey (Takeaway Order)',
        },
        unit_amount: Math.round(item.price * 100), // In pence
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail,
      client_reference_id: orderId,
      metadata: {
        orderId,
        customerName,
      },
      line_items,
      success_url: `${origin}/?payment_status=success&session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${origin}/?payment_status=cancelled&order_id=${orderId}`,
    });

    return res.status(200).json({
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (error: any) {
    console.error('Error creating Stripe session:', error);
    return res.status(500).json({
      error: error.message || 'Failed to initialize Stripe checkout.',
    });
  }
}
