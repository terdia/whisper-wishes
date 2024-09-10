// pages/api/update-wish-progress.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../utils/secrets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { wishId, progress } = req.body;

    const supabaseResponse = await fetch(`${SUPABASE_URL}/functions/v1/update-wish-progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ wishId, progress }),
    });

    const data = await supabaseResponse.json();

    if (supabaseResponse.ok) {
      res.status(200).json(data);
    } else {
      res.status(supabaseResponse.status).json({ error: data.error });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}