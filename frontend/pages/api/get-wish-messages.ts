// pages/api/get-wish-messages.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../utils/secrets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { wishId, userId, page, limit } = req.query;

    const supabaseResponse = await fetch(`${SUPABASE_URL}/functions/v1/get-wish-messages?wishId=${wishId}&userId=${userId}&page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    const data = await supabaseResponse.json();

    if (supabaseResponse.ok) {
      res.status(200).json(data);
    } else {
      res.status(supabaseResponse.status).json({ error: data.error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}