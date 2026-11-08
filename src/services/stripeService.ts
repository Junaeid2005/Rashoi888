import { loadStripe } from '@stripe/stripe-js';
import { CartItem } from '../types';

export const getStripePublishableKey = (): string | undefined => {
  return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
};

export const isStripeOnlinePaymentActive = (): boolean => {
  const key = getStripePublishableKey();
  return Boolean(key && key.trim().startsWith('pk_'));
};

interface CreateCheckoutParams {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: CartItem[];
  totalAmount: number;
  discount?: number;
  subtotal?: number;
}

export const createStripeCheckout = async (params: CreateCheckoutParams): Promise<{ checkoutUrl: string }> => {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to start Stripe checkout session.');
  }

  if (!data.checkoutUrl) {
    throw new Error('No checkout URL received from Stripe.');
  }

  return { checkoutUrl: data.checkoutUrl };
};
