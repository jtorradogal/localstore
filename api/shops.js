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

    // Preprocesar place_text: si viene texto, resolver ids en places
    let placeIds = null; // null = no filtro por places aún; [] = filtro vacío (forzar 0 resultados)

    if (place_id_param) {
      const pNum = Number(place_id_param);
      if (!Number.isNaN(pNum)) {
        placeIds = [pNum];
      } else {
        placeIds = []; // inválido -> nada
      }
    } else if (place_text) {
      // buscar ids coincidentes en places
      const { data: pRows, error: pErr } = await supabase
        .from('places')
        .select('id')
        .ilike('placename', `%${place_text}%`);

      if (pErr) {
        console.error('Supabase error (places):', pErr);
        return res.status(500).json({ status: 'error', message: pErr.message });
      }

      if (!pRows || pRows.length === 0) {
        // No hay lugares que coincidan -> devolver vacio (cumplir AND)
        return res.status(200).json({ status: 'success', data: [] });
      }

      placeIds = pRows.map(r => r.id);
    }

    // Construir query principal sobre shops
    let query = supabase
      .from('shops')
      .select(`
        id,
        name,
        category,
        place_id,
        address,
        phone,
        email,
        website,
        description,
        categories:category ( category ),
        places:place_id ( placename )
      `);

    // Aplicar filtro categoría si viene
    if (category_id) {
      const cNum = Number(category_id);
      if (!Number.isNaN(cNum)) query = query.eq('category', cNum);
    }

    // Aplicar filtro por placeIds si se resolvieron
    if (placeIds !== null) {
      // placeIds es array (no null)
      if (placeIds.length === 0) {
        // seguridad adicional: si array vacío devolvemos vacío
        return res.status(200).json({ status: 'success', data: [] });
      }
      query = query.in('place_id', placeIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error (shops):', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al consultar la base de datos Supabase',
        details: error.message
      });
    }

    const formatted = (data || []).map(s => ({
      id: s.id,
      name: s.name,
      address: s.address,
      phone: s.phone,
      email: s.email,
      website: s.website,
      description: s.description,
      category_name: s.categories?.category || '',
      place_name: s.places?.placename || ''
    }));

    return res.status(200).json({
      status: 'success',
      data: formatted
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Error inesperado al procesar la solicitud',
      details: err.message
    });
  }
}
