// pages/api/shops.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { category_id, place } = req.query;

  let query = supabase
    .from('shops')
    .select(`
      id,
      name,
      category_id,
      place_id,
      categories ( category ),
      places ( placename )
    `);

  // Filtro por categoría
  if (category_id) {
    query = query.eq('category_id', Number(category_id));
  }

  // Filtro por lugar (por nombre, no ID)
  if (place) {
    query = query.ilike('places.placename', `%${place}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }

  // Normalizamos resultado
  const formatted = data.map(s => ({
    id: s.id,
    name: s.name,
    category_name: s.categories?.category || '',
    place_name: s.places?.placename || ''
  }));

  res.status(200).json({
    status: 'success',
    data: formatted
  });
}
