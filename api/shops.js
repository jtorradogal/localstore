// pages/api/shops.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // leemos ambos parámetros: category_id (id numérico) y place_id (id numérico opcional)
  // mantenemos compatibilidad con `place` (texto) si se envía así
  const category_id = req.query.category_id ?? req.query.category ?? '';
  const place_id = req.query.place_id ?? '';
  const place_text = req.query.place ?? '';

  try {
    let query = supabase
      .from('shops')
      .select(`
        id,
        name,
        category,
        place_id,
        categories:category ( category ),
        places:place_id ( placename )
      `);

    // filtro por category (en tu tabla shops la columna se llama `category`)
    if (category_id) {
      const catNum = Number(category_id);
      if (!Number.isNaN(catNum)) query = query.eq('category', catNum);
    }

    // si nos pasan place_id (preferencia), filtramos por FK numérica
    if (place_id) {
      const pNum = Number(place_id);
      if (!Number.isNaN(pNum)) {
        query = query.eq('place_id', pNum);
      }
    } else if (place_text) {
      // compatibilidad: si no hay place_id pero sí texto, filtramos por nombre en places
      query = query.ilike('places.placename', `%${place_text}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error al consultar la base de datos Supabase',
        details: error.message
      });
    }

    const formatted = (data || []).map(s => ({
      id: s.id,
      name: s.name,
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
