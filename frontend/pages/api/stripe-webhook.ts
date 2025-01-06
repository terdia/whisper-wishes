import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { supabase } from '../../utils/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // @ts-ignore
  apiVersion: '2023-10-16',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutSessionCompleted(session);
  } else if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    await handleSubscriptionUpdated(subscription);
  } else if (event.type === 'checkout.session.expired') {
    console.log('Checkout session expired');
  } else if (event.type === 'checkout.session.async_payment_failed') {
    console.log('Async payment failed');
  }

  res.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session);
  const userId = session.client_reference_id;
  const subscriptionId = session.subscription as string;
  const planId = session.metadata?.plan_id;
  const customerId = session.customer as string;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update subscription status
  const { error: subscriptionError } = await supabase.rpc('update_user_subscription', {
    p_user_id: userId,
    p_plan_id: planId,
    p_stripe_subscription_id: subscriptionId,
    p_status: subscription.status,
    p_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  });

  if (subscriptionError) {
    console.error('Error updating user subscription:', subscriptionError);
  }

  // Update user profile with Stripe customer ID only
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({
      stripe_customer_id: customerId
    })
    .eq('id', userId);

  if (profileError) {
    console.error('Error updating user profile:', profileError);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription);
  
  // First, get the user ID using the Stripe customer ID
  const { data: userData, error: userError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('stripe_customer_id', subscription.customer)
    .single();

  if (userError) {
    console.error('Error finding user:', userError);
    return;
  }

  // Get the subscription plan ID using the Stripe price ID
  const priceId = subscription.items.data[0].price.id;
  
  const { data: planData, error: planError } = await supabase
    .from('subscription_plans')
    .select('id')
    .eq('stripe_price_id', priceId)
    .single();

  if (planError) {
    console.error('Error finding subscription plan:', planError);
    return;
  }

  // Update subscription status matching the function parameters order
  const { error: subscriptionError } = await supabase.rpc('update_user_subscription', {
    p_user_id: userData.id,  // Using the user ID from user_profiles
    p_plan_id: planData.id,
    p_stripe_subscription_id: subscription.id,
    p_status: subscription.status,
    p_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
  });

  if (subscriptionError) {
    console.error('Error updating user subscription:', subscriptionError);
  }
}

