import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../../utils/secret';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  // @ts-ignore
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    switch (session.payment_status) {
      case 'paid':
        return res.status(200).json({ status: 'success' });
      case 'unpaid':
        return res.status(200).json({ status: 'failed', message: 'Payment was not successful. Please try again.' });
      default:
        return res.status(200).json({ status: 'failed', message: 'Unexpected payment status. Please contact support.' });
    }
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return res.status(400).json({ status: 'failed', message: 'An error occurred while checking the subscription status.' });
  }
}
