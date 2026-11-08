# STRIPE HOSTED CHECKOUT SETUP GUIDE (NO WEBHOOKS)

This document provides clear, step-by-step instructions for activating Stripe Hosted Checkout for Rashoi Restaurant when you are ready to configure payments.

---

## 1. WHERE TO FIND YOUR STRIPE SECRET KEY

1. Sign in to your [Stripe Dashboard](https://dashboard.stripe.com).
2. For testing, toggle the **Test mode** switch at the top right of the dashboard.
3. In the left navigation, click on **Developers** -> **API keys**.
4. Under **Standard keys**, locate the **Secret key**:
   - For testing: Begins with `sk_test_...`
   - For live payments: Begins with `sk_live_...`
5. Click **Reveal test key** (or **Reveal live key**) and copy the secret key.

---

## 2. HOW TO ADD STRIPE_SECRET_KEY IN NETLIFY

1. Log in to your [Netlify Dashboard](https://app.netlify.com).
2. Select your site for **Rashoi Restaurant**.
3. Go to **Site configuration** -> **Environment variables**.
4. Click **Add a variable** -> **Add a single variable**:
   - **Key:** `STRIPE_SECRET_KEY`
   - **Value:** Your secret key (`sk_test_...` or `sk_live_...`)
   - **Scopes:** Select `Functions` (or All scopes).
5. Add a second environment variable to enable payments when ready:
   - **Key:** `ENABLE_ONLINE_PAYMENTS`
   - **Value:** `true`
6. Click **Save**.

---

## 3. HOW TO DEPLOY NETLIFY FUNCTIONS

The project includes pre-configured serverless functions located in `/netlify/functions`:
- `create-checkout-session.ts`: Authenticates orders and creates Stripe Checkout redirect sessions.
- `verify-checkout-session.ts`: Retrieves and verifies the session directly from the Stripe API upon redirect to the success page.
- `get-order-payment-status.ts`: Returns current payment configuration status.

To deploy changes to Netlify:
- Trigger a new deployment from the Netlify UI (or push your repository to your connected GitHub branch).
- Netlify automatically detects and compiles functions under `/netlify/functions`.

---

## 4. HOW TO TEST STRIPE CHECKOUT (TEST MODE)

1. Set `STRIPE_SECRET_KEY` to your `sk_test_...` key in Netlify.
2. In the Admin Dashboard under **Payment Settings**, toggle **Online Payment** to **Enabled** (or set `ENABLE_ONLINE_PAYMENTS=true`).
3. Add dishes to the cart on the public website.
4. Go to Checkout and click **Proceed to Online Payment**.
5. You will be redirected to the secure Stripe-hosted checkout page.
6. Use Stripe's official test card numbers (e.g., `4242 4242 4242 4242` with any future expiry date and any 3-digit CVC).
7. Complete payment.
8. Stripe will redirect back to `/order/success?session_id=...`.
9. The success page queries `verify-checkout-session`, checks `payment_status === 'paid'`, and updates the order status.

---

## 5. HOW TO VERIFY PAYMENT UPDATES IN FIRESTORE

1. Open your Firebase Console -> Firestore Database.
2. Navigate to the `orders` collection.
3. Find your order document:
   - `paymentStatus`: updates from `'unpaid'` to `'paid'`
   - `stripeCheckoutSessionId`: contains the verified session ID
   - `paidAt`: contains the verified ISO timestamp
4. In the Rashoi Admin Dashboard under **Orders Management**, the order displays a green **PAID** badge with the total amount in GBP (£).

---

## 6. HOW TO SWITCH FROM TEST MODE TO LIVE MODE

1. Complete Stripe account activation in your Stripe Dashboard.
2. Under **Developers** -> **API keys**, toggle off Test mode to get your **Live Secret Key** (`sk_live_...`).
3. In Netlify Site configuration -> Environment variables, update `STRIPE_SECRET_KEY` to the live key.
4. Trigger a redeploy in Netlify.
5. In the Rashoi Admin Dashboard, verify that Live Mode is active.

---

## 7. NO WEBHOOKS REQUIRED

Per project requirements, this initial implementation uses direct Stripe Checkout Session verification on return to the success page.
- No webhook endpoints are configured.
- No Stripe Webhook Secret (`whsec_...`) is needed.
- If a customer completes payment but closes their tab before returning, the order remains in Pending status until verified by admin in the dashboard.
