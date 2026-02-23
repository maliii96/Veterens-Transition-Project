import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Create server-side Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Handle successful checkout
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) return

  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  // Update user profile with Stripe customer and subscription IDs
  await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_tier: 'pro',
      subscription_status: 'active',
    })
    .eq('id', userId)

  console.log(`Checkout completed for user ${userId}`)
}

// Handle subscription updates
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  if (!userId) return

  const status = subscription.status
  const sub = subscription as any
  const currentPeriodStart = sub.current_period_start
    ? new Date(sub.current_period_start * 1000)
    : new Date()
  const currentPeriodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : new Date()

  await supabase
    .from('profiles')
    .update({
      subscription_status: status,
      subscription_current_period_start: currentPeriodStart.toISOString(),
      subscription_current_period_end: currentPeriodEnd.toISOString(),
      subscription_cancel_at_period_end: sub.cancel_at_period_end || false,
    })
    .eq('stripe_subscription_id', subscription.id)

  console.log(`Subscription updated for user ${userId}: ${status}`)
}

// Handle subscription deletion/cancellation
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await supabase
    .from('profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'inactive',
      stripe_subscription_id: null,
    })
    .eq('stripe_subscription_id', subscription.id)

  console.log(`Subscription deleted: ${subscription.id}`)
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const inv = invoice as any
  const subscriptionId = inv.subscription as string
  if (!subscriptionId) return

  // Payment succeeded - ensure subscription is active
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
    })
    .eq('stripe_subscription_id', subscriptionId)

  console.log(`Payment succeeded for subscription ${subscriptionId}`)
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const inv = invoice as any
  const subscriptionId = inv.subscription as string
  if (!subscriptionId) return

  // Mark subscription as past_due
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
    })
    .eq('stripe_subscription_id', subscriptionId)

  console.log(`Payment failed for subscription ${subscriptionId}`)
}
