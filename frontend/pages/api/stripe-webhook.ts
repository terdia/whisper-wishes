import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { supabase } from '../../utils/supabaseClient';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '../../utils/secret';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
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
    event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.updated') {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutSessionCompleted(session);
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

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const { error } = await supabase.rpc('update_user_subscription', {
    p_user_id: userId,
    p_plan_id: planId,
    p_stripe_subscription_id: subscriptionId,
    p_status: subscription.status,
    p_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  });

  if (error) {
    console.error('Error updating user subscription:', error);
  }
}
