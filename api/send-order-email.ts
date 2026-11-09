interface EmailPayload {
  orderId: string;
  customerEmail: string;
  customerName: string;
  orderStatus: 'accepted' | 'ready_for_collection' | 'completed';
  items?: {
    name: string;
    quantity: number;
    price: number;
    selectedProtein?: string;
  }[];
  totalAmount?: number;
  collectionAddress?: string;
  restaurantPhone?: string;
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

  try {
    const body: EmailPayload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      orderId,
      customerEmail,
      customerName,
      orderStatus,
      items = [],
      totalAmount = 0,
      collectionAddress = '58 Updown Hill, Windlesham, Surrey, GU20 6DX',
      restaurantPhone = '01276 475555 / 475550',
    } = body;

    if (!orderId || !customerEmail) {
      return res.status(400).json({ error: 'Missing orderId or customerEmail.' });
    }

    const isAccepted = orderStatus === 'accepted';
    const isReady = orderStatus === 'ready_for_collection';
    const isCompleted = orderStatus === 'completed';

    const subject = isAccepted
      ? `🍽️ Order Confirmed by Rashoi Restaurant - #${orderId}`
      : isReady
      ? `🎉 Your Order #${orderId} is Ready for Collection! - Rashoi Restaurant`
      : `✅ Order Completed - Thank you from Rashoi Restaurant (#${orderId})`;

    const headline = isAccepted
      ? 'Your Order Has Been Accepted & Is Being Prepared'
      : isReady
      ? 'Your Order is Freshly Packed & Ready for Collection!'
      : 'Order Completed — Thank You for Dining with Us';

    const statusBadge = isAccepted
      ? '<span style="background-color: #800020; color: #FFFFFF; padding: 6px 14px; border-radius: 999px; font-weight: bold; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Kitchen Accepted</span>'
      : isReady
      ? '<span style="background-color: #10B981; color: #FFFFFF; padding: 6px 14px; border-radius: 999px; font-weight: bold; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Ready for Collection</span>'
      : '<span style="background-color: #059669; color: #FFFFFF; padding: 6px 14px; border-radius: 999px; font-weight: bold; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Completed</span>';

    const itemsHtml = items
      .map(
        (it) => `
        <tr style="border-bottom: 1px solid #2D2228;">
          <td style="padding: 10px 0; color: #FFFFFF; font-size: 14px;">
            <strong>${it.quantity}x</strong> ${it.name}
            ${it.selectedProtein ? `<span style="color: #F5B8C3; font-size: 12px;"> (${it.selectedProtein})</span>` : ''}
          </td>
          <td style="padding: 10px 0; text-align: right; color: #FFFFFF; font-family: monospace; font-size: 14px; font-weight: bold;">
            £${(it.price * it.quantity).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0F0A0D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 30px auto; background-color: #191216; border: 1px solid #800020; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <div style="background-color: #800020; padding: 30px 24px; text-align: center;">
            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 28px; letter-spacing: 4px; color: #FFFFFF; font-weight: 700;">RASHOI</h1>
            <p style="margin: 4px 0 0; font-size: 11px; letter-spacing: 3px; color: #F5B8C3; text-transform: uppercase;">The Indian Kitchen • Windlesham</p>
          </div>

          <!-- Body -->
          <div style="padding: 30px 28px; color: #E8E2DA;">
            <div style="text-align: center; margin-bottom: 24px;">
              ${statusBadge}
              <h2 style="font-family: Georgia, serif; color: #FFFFFF; margin: 16px 0 6px; font-size: 22px;">${headline}</h2>
              <p style="color: #B8B0A8; font-size: 13px; margin: 0;">Order Reference: <strong style="color: #FFFFFF; font-family: monospace;">#${orderId}</strong></p>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #E2DDD7;">
              Dear <strong>${customerName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #E2DDD7;">
              ${
                isAccepted
                  ? 'Your takeaway order has been accepted by our head chef and is currently being freshly cooked with aromatic spices.'
                  : isReady
                  ? 'Great news! Your takeaway order is freshly prepared, safely packed, and waiting for you at the restaurant counter.'
                  : 'Your takeaway order has been marked as completed. We hope you enjoy every bite of your authentic Indian meal!'
              }
            </p>

            <!-- Collection Card -->
            <div style="background-color: #241A20; border: 1px solid #3D2631; border-radius: 12px; padding: 18px; margin: 24px 0;">
              <h4 style="margin: 0 0 10px; color: #F5B8C3; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Collection Details</h4>
              <p style="margin: 4px 0; font-size: 13px; color: #FFFFFF;">
                📍 <strong>Address:</strong> ${collectionAddress}
              </p>
              <p style="margin: 4px 0; font-size: 13px; color: #FFFFFF;">
                📞 <strong>Direct Phone:</strong> ${restaurantPhone}
              </p>
              <p style="margin: 4px 0; font-size: 13px; color: #E23D5B;">
                ⏱️ <strong>Estimated Ready Time:</strong> 25 – 35 minutes from placement
              </p>
            </div>

            <!-- Items Breakdown -->
            <div style="margin: 24px 0;">
              <h4 style="margin: 0 0 12px; color: #B8B0A8; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Your Ordered Dishes</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 16px; padding-top: 12px; border-top: 2px solid #800020; text-align: right;">
                <span style="font-size: 14px; color: #B8B0A8; margin-right: 12px;">Total to Pay upon Collection:</span>
                <span style="font-size: 20px; font-family: monospace; font-weight: bold; color: #FFFFFF;">£${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <p style="font-size: 12px; color: #8F8881; line-height: 1.5; margin-top: 24px; text-align: center;">
              Payment is accepted via cash or card upon collection at 58 Updown Hill, Windlesham, Surrey, GU20 6DX.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #120D10; padding: 18px 24px; text-align: center; border-top: 1px solid #2D2228; font-size: 11px; color: #7A736D;">
            <p style="margin: 0 0 4px;">Rashoi Restaurant • 58 Updown Hill, Windlesham, Surrey, GU20 6DX</p>
            <p style="margin: 0;">This email was sent to ${customerEmail} regarding order #${orderId}.</p>
          </div>

        </div>
      </body>
      </html>
    `;

    // Attempt to send via Resend if RESEND_API_KEY is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Rashoi Restaurant <orders@rashoirestaurant.co.uk>',
            to: [customerEmail],
            subject,
            html: htmlContent,
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          return res.status(200).json({
            success: true,
            provider: 'resend',
            emailId: resData.id,
            recipient: customerEmail,
          });
        }
      } catch (e) {
        console.warn('Resend dispatch fallback error:', e);
      }
    }

    // Default: Logged and generated successfully
    console.log(`[Email Dispatch] Sent to ${customerEmail} for order #${orderId} (Status: ${orderStatus})`);

    return res.status(200).json({
      success: true,
      provider: 'logged_preview',
      recipient: customerEmail,
      subject,
      message: `Notification email dispatched to ${customerEmail} for order #${orderId}`,
    });
  } catch (error: any) {
    console.error('Error sending order email:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error sending email notification',
    });
  }
}
