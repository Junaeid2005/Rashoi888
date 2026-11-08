# Rashoi Restaurant — Vercel Deployment & Stripe Setup Guide

This guide explains how to deploy Rashoi Restaurant to **Vercel** and activate **Stripe Online Payments** with zero code changes.

---

## 1. Deploying to Vercel (Step-by-Step)

1. Push this project to your **GitHub Repository** (e.g., `github.com/your-username/rashoi-restaurant`).
2. Log in to [Vercel](https://vercel.com) and click **"Add New..." > "Project"**.
3. Import your GitHub repository.
4. Framework Preset: **Vite** (Vercel auto-detects this).
5. Root Directory: `./` (leave default).
6. Click **Deploy**.

---

## 2. Adding the 2 Stripe Keys in Vercel

When your owner gives you the Stripe keys:

1. Open your project on the **Vercel Dashboard**.
2. Navigate to **Settings** (top menu) -> **Environment Variables** (left sidebar).
3. Add the following 2 variables:

| Variable Name | Value | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` (or `sk_test_...`) | Backend secret used by `/api/create-checkout-session` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (or `pk_test_...`) | Frontend publishable key used to activate online card payments |

4. Check all environments (**Production**, **Preview**, **Development**).
5. Click **Save**.
6. Go to the **Deployments** tab and click **"Redeploy"** on the latest deployment so the environment variables take effect.

---

## 3. How It Works Automatically

- **Current State (Keys not set yet)**:
  - The website displays the online card payment button with a neat **"Coming Soon"** badge.
  - Customers can smoothly place takeaway orders using **"Pay upon Collection"**.
- **Once Keys are Added in Vercel**:
  - The website automatically detects `VITE_STRIPE_PUBLISHABLE_KEY`.
  - The online payment button becomes **Active**!
  - Customers clicking **"Pay Online with Card"** are securely redirected to Stripe's hosted checkout to pay via Visa, Mastercard, Apple Pay, or Google Pay in **GBP (£)**.
  - Upon successful payment, Stripe redirects back to Rashoi with the verified session, records the order in Firestore, and displays the confirmation receipt.

---

## ৪. বাংলায় সংক্ষিপ্ত নির্দেশিকা

1. আপনার গিটহাব রিপোজিটরিটি Vercel-এ ইমপোর্ট করে Deploy করুন।
2. ওনারের থেকে পাওয়া ২টা কি (Key) Vercel-এর **Settings > Environment Variables**-এ যুক্ত করুন:
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
3. Vercel-এ **Redeploy** করুন।
4. ব্যাস! আর কোনো কোড পরিবর্তন করতে হবে না। ওয়েবসাইট স্বয়ংক্রিয়ভাবে লাইভ কার্ড পেমেন্ট গ্রহণ করা শুরু করবে।
