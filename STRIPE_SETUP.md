# Stripe Integration Setup Guide

This guide will help you complete the Stripe integration for SITREP's subscription system.

## ✅ What's Already Built

- ✅ Database schema with subscription tracking
- ✅ Usage limit system (Free: 3/10/1/2, Pro: 50/500/5/5)
- ✅ Pricing page with monthly/annual options
- ✅ Upgrade modal when limits are reached
- ✅ Usage dashboard component
- ✅ Stripe API routes (checkout, webhook, portal)
- ✅ Stripe packages installed

## 📋 Prerequisites

1. **Stripe Account** - You should have already created one at https://stripe.com
2. **Test Mode** - Make sure you're in test mode (toggle in Stripe dashboard)

---

## 🚀 Setup Steps

### 1. Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Click "Reveal test key" and copy your **Secret key** (starts with `sk_test_`)
4. Add them to your `.env.local` file:

```bash
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

---

### 2. Create Products in Stripe

#### Create Pro Monthly ($19/month)

1. Go to https://dashboard.stripe.com/test/products
2. Click **"+ Add product"**
3. Fill in:
   - **Name:** SITREP Pro (Monthly)
   - **Description:** Monthly subscription to SITREP Pro features
   - **Pricing:**
     - **Pricing model:** Standard pricing
     - **Price:** $19.00 USD
     - **Billing period:** Monthly
     - **Recurring**
4. Click **"Save product"**
5. Copy the **Price ID** (starts with `price_`) from the product page
6. Add to `.env.local`:

```bash
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_monthly_id_here
```

#### Create Pro Annual ($199/year)

1. Click **"+ Add product"** again
2. Fill in:
   - **Name:** SITREP Pro (Annual)
   - **Description:** Annual subscription to SITREP Pro features (save $29/year)
   - **Pricing:**
     - **Pricing model:** Standard pricing
     - **Price:** $199.00 USD
     - **Billing period:** Yearly
     - **Recurring**
3. Click **"Save product"**
4. Copy the **Price ID** (starts with `price_`)
5. Add to `.env.local`:

```bash
STRIPE_PRO_ANNUAL_PRICE_ID=price_your_annual_id_here
```

---

### 3. Run Database Migration

Apply the subscription management migration:

```bash
# If using Supabase local dev
supabase migration up

# Or run the migration in Supabase Studio
# Go to SQL Editor and run:
# sitrep-platform/supabase/migrations/010_add_subscription_management.sql
```

---

### 4. Set Up Webhook Endpoint

Webhooks allow Stripe to notify your app about subscription events (payments, cancellations, etc.).

#### For Local Development (using Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the **webhook signing secret** (starts with `whsec_`) from the output
5. Add to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_signing_secret_here
   ```

#### For Production (Vercel)

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"+ Add endpoint"**
3. Enter your endpoint URL:
   ```
   https://your-domain.vercel.app/api/stripe/webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Click the endpoint you just created
7. Click **"Reveal"** under **Signing secret**
8. Add to your Vercel environment variables

---

### 5. Test the Integration

#### Test Checkout Flow

1. Run your app: `npm run dev`
2. Go to http://localhost:3000/pricing
3. Click **"Upgrade to Pro"**
4. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete checkout
6. Verify in Supabase that your profile was updated:
   - `subscription_tier` = 'pro'
   - `subscription_status` = 'active'
   - `stripe_customer_id` and `stripe_subscription_id` are set

#### Test Usage Limits

1. Log in as a free user
2. Try to create 4 assessments (should show upgrade modal on 4th)
3. Upgrade to Pro
4. Verify you can now create up to 50 assessments

---

### 6. Update Pricing Page (Optional)

Update the pricing page upgrade button to use actual Stripe checkout:

```typescript
// In app/pricing/page.tsx, replace the handleUpgrade function:

const handleUpgrade = async (plan: 'monthly' | 'annual') => {
  if (!user) {
    router.push('/login?redirect=/pricing')
    return
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ plan }),
    })

    const { url } = await response.json()
    if (url) {
      window.location.href = url
    }
  } catch (error) {
    console.error('Checkout error:', error)
  }
}
```

---

## 🧪 Test Cards

Use these test cards for different scenarios:

| Scenario | Card Number | Description |
|----------|-------------|-------------|
| Success | `4242 4242 4242 4242` | Payment succeeds |
| Decline | `4000 0000 0000 0002` | Payment declined |
| Requires auth | `4000 0025 0000 3155` | Requires 3D Secure |

---

## 📊 Monitor Subscriptions

- **Dashboard:** https://dashboard.stripe.com/test/subscriptions
- **Payments:** https://dashboard.stripe.com/test/payments
- **Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Customers:** https://dashboard.stripe.com/test/customers

---

## 🔄 Monthly Usage Reset

The usage limits reset automatically on the 1st of each month. To manually reset usage (for testing):

```sql
-- Run in Supabase SQL Editor
SELECT reset_monthly_usage();
```

You can also set up a cron job in Supabase to run this automatically:

1. Go to Supabase Dashboard > Database > Cron Jobs
2. Create new job:
   - Name: Reset monthly usage
   - Schedule: `0 0 1 * *` (runs at midnight on the 1st of each month)
   - SQL: `SELECT reset_monthly_usage();`

---

## 🚀 Going Live

When you're ready to accept real payments:

1. Switch Stripe to **Live mode**
2. Get your **live API keys** from https://dashboard.stripe.com/apikeys
3. Create **live products** (same as test products)
4. Update environment variables with live keys
5. Set up **live webhook endpoint**
6. Test with a real card (use a low amount first!)

---

## 🆘 Troubleshooting

### Checkout not working
- Check that `STRIPE_SECRET_KEY` is set correctly
- Verify product price IDs match what's in `.env.local`
- Check browser console for errors

### Webhooks not received
- Make sure Stripe CLI is running for local dev
- Verify webhook endpoint URL is correct
- Check webhook signing secret matches
- Look at webhook logs in Stripe Dashboard

### Subscription not updating in database
- Check webhook events in Stripe Dashboard
- Verify webhook handler is logging events
- Check Supabase logs for errors
- Ensure `userId` is in metadata

---

## ✅ Checklist

- [ ] Stripe account created
- [ ] API keys added to `.env.local`
- [ ] Pro Monthly product created
- [ ] Pro Annual product created
- [ ] Price IDs added to `.env.local`
- [ ] Database migration run
- [ ] Webhook endpoint configured
- [ ] Webhook secret added to `.env.local`
- [ ] Test checkout completed successfully
- [ ] Subscription shows in database
- [ ] Usage limits working correctly
- [ ] Stripe CLI running for local webhooks

---

## 📚 Resources

- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)

---

**Need help?** Check the Stripe docs or reach out!
