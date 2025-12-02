import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const id = Number(req.query.id);

    if (!id) {
      return res.status(400).json({ status: 'error', message: 'Missing shop id' });
    }

    const { data, error } = await supabase
      .from('shops')
      .select(`
        id,
        name,
        address,
        phone,
        email,
        website,
        description,
        category:category (category),
        place:place_id (placename)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }

    return res.status(200).json({ status: 'success', data });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
