import Stripe from 'stripe'

// Server-side Stripe instance (use secret key)
// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null

function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// Lazy getter
export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    const instance = getStripeInstance()
    const value = (instance as any)[prop]
    return typeof value === 'function' ? value.bind(instance) : value
  }
})

// Stripe product/price IDs
export const STRIPE_CONFIG = {
  pro: {
    monthly: {
      priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
      amount: 1900, // $19.00 in cents
    },
  },
}

// Create Stripe Checkout Session
export async function createCheckoutSession({
  userId,
  userEmail,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string
  userEmail: string
  priceId: string
  successUrl: string
  cancelUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  })

  return session
}

// Create Stripe Customer Portal session (for managing subscriptions)
export async function createPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}
