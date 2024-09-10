// pages/api/add-wish-milestone.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../utils/secrets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { wishId, milestone, userSubscription } = req.body;

    const supabaseResponse = await fetch(`${SUPABASE_URL}/functions/v1/add-wish-milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ wishId, milestone, userSubscription }),
    });

    const data = await supabaseResponse.json();

    if (supabaseResponse.ok) {
      res.status(200).json(data);
    } else {
      res.status(supabaseResponse.status).json({ error: data.error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}