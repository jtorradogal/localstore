// pages/api/shops.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const category_id = req.query.category_id ?? req.query.category ?? '';
    const place_id_param = req.query.place_id ?? '';
    const place_text = req.query.place ?? '';

    // Procesar place (texto o id)
    let placeIds = null;

    if (place_id_param) {
      const pNum = Number(place_id_param);
      placeIds = Number.isNaN(pNum) ? [] : [pNum];
    } else if (place_text) {
      const { data: pRows, error: pErr } = await supabase
        .from('places')
        .select('id')
        .ilike('placename', `%${place_text}%`);

      if (pErr) {
        console.error('Supabase error (places):', pErr);
        return res.status(500).json({ status: 'error', message: pErr.message });
      }

      if (!pRows || pRows.length === 0) {
        return res.status(200).json({ status: 'success', data: [] });
      }

      placeIds = pRows.map(r => r.id);
    }

    // Query principal
    let query = supabase
      .from('shops')
      .select(`
        id,
        name,
        address,
        phone,
        email,
        website,
        description,
        image_url,
        categories:category ( category ),
        places:place_id ( placename ),
        visits
      `);

    if (category_id) {
      const cNum = Number(category_id);
      if (!Number.isNaN(cNum)) query = query.eq('category', cNum);
    }

    if (placeIds !== null) {
      if (placeIds.length === 0) {
        return res.status(200).json({ status: 'success', data: [] });
      }
      query = query.in('place_id', placeIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error (shops):', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al consultar Supabase',
        details: error.message
      });
    }

    // Formato final
    const formatted = (data || []).map(s => ({
      id: s.id,
      name: s.name,
      address: s.address,
      phone: s.phone,
      email: s.email,
      website: s.website,
      description: s.description,
      category_name: s.categories?.category || '',
      place_name: s.places?.placename || '',
      image_url: s.image_url || ''   // <- NUEVO
    }));

    return res.status(200).json({ status: 'success', data: formatted });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Error inesperado',
      details: err.message
    });
  }
}
