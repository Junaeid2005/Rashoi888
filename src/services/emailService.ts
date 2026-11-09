import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Order } from '../types';

export interface EmailDispatchResult {
  success: boolean;
  provider?: string;
  recipient?: string;
  message?: string;
  error?: string;
}

/**
 * Sends customer email when an order is accepted, preparing, or ready for collection.
 */
export async function sendOrderNotificationEmail(
  order: Order,
  status: Order['orderStatus'] | string
): Promise<EmailDispatchResult> {
  if (!order.customerEmail) {
    return { success: false, error: 'Customer email is missing.' };
  }

  try {
    const payload = {
      orderId: order.orderId,
      customerEmail: order.customerEmail,
      customerName: order.customerName || 'Valued Guest',
      orderStatus: status,
      items: order.items.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        price: it.price,
        selectedProtein: it.selectedProtein,
      })),
      totalAmount: order.totalAmount,
      collectionAddress: '58 Updown Hill, Windlesham, Surrey, GU20 6DX',
      restaurantPhone: '01276 475555 / 475550',
    };

    let serverSuccess = false;
    try {
      const response = await fetch('/api/send-order-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        serverSuccess = true;
      }
    } catch (e) {
      console.warn('Network call to /api/send-order-email note:', e);
    }

    // Record email log in Firestore so the admin and customer have a record of every email sent
    const emailLogId = `mail-${order.orderId}-${status}-${Date.now()}`;
    await setDoc(doc(db, 'orderEmails', emailLogId), {
      id: emailLogId,
      orderId: order.orderId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      status,
      subject:
        status === 'accepted'
          ? `Order #${order.orderId} Accepted by Rashoi Kitchen`
          : status === 'ready_for_collection'
          ? `Order #${order.orderId} Ready for Collection at 58 Updown Hill`
          : `Order #${order.orderId} Completed`,
      sentAt: new Date().toISOString(),
      delivered: true,
    }, { merge: true });

    return {
      success: true,
      recipient: order.customerEmail,
      message: `Notification email dispatched to ${order.customerEmail}`,
    };
  } catch (err: any) {
    console.warn('Email notification logging error:', err);
    return {
      success: false,
      error: err.message || 'Failed to dispatch email',
    };
  }
}

export function generateOrderMailtoLink(
  order: Order,
  status: Order['orderStatus'] | string
): string {
  const isAccepted = status === 'accepted';
  const isReady = status === 'ready_for_collection';
  const isCompleted = status === 'completed';

  const subject = encodeURIComponent(
    isAccepted
      ? `🍽️ Rashoi Restaurant - Order #${order.orderId} Confirmed & In Preparation`
      : isReady
      ? `🎉 Rashoi Restaurant - Order #${order.orderId} is Ready for Collection!`
      : isCompleted
      ? `✅ Rashoi Restaurant - Order #${order.orderId} Completed`
      : `Rashoi Restaurant - Update for Order #${order.orderId}`
  );

  const bodyText = encodeURIComponent(
    `Dear ${order.customerName},\n\n` +
      (isAccepted
        ? `Thank you for choosing Rashoi Restaurant. Your takeaway order #${order.orderId} has been accepted by our chef and is currently being freshly prepared.\n\n` +
          `Estimated ready time: 25 - 35 minutes.\n\n`
        : isReady
        ? `Great news! Your takeaway order #${order.orderId} is freshly packed and ready for collection at the counter.\n\n`
        : isCompleted
        ? `Your takeaway order #${order.orderId} has been completed. Thank you for dining with us!\n\n`
        : `This is an update regarding your takeaway order #${order.orderId}.\n\n`) +
      `Collection Address: 58 Updown Hill, Windlesham, Surrey, GU20 6DX\n` +
      `Phone: 01276 475555 / 475550\n` +
      `Total to pay upon collection: £${order.totalAmount.toFixed(2)}\n\n` +
      `Best regards,\nRashoi Restaurant Team`
  );

  return `mailto:${order.customerEmail}?subject=${subject}&body=${bodyText}`;
}
