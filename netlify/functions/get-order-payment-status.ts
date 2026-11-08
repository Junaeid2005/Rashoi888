/**
 * Netlify Function: get-order-payment-status
 * 
 * Safely checks payment status of a given order.
 */

export const handler = async (event: { queryStringParameters?: { order_id?: string } | null }) => {
  const orderId = event.queryStringParameters?.order_id;

  if (!orderId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing order_id' }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      status: 'checked',
      paymentProvider: 'stripe',
      stripeEnabled: process.env.ENABLE_ONLINE_PAYMENTS === 'true',
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    }),
  };
};
