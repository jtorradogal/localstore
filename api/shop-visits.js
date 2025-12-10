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

    // 1. Obtener visitas actuales
    const { data: shop, error: getErr } = await supabase
      .from('shops')
      .select('visits')
      .eq('id', id)
      .single();

    if (getErr) throw getErr;

    const newVisits = Number(shop.visits || 0) + 1;

    // 2. Actualizar visitas
    const { error: updateErr } = await supabase
      .from('shops')
      .update({ visits: newVisits })
      .eq('id', id);

    if (updateErr) throw updateErr;

    return res.status(200).json({
      status: 'success',
      visits: newVisits
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
