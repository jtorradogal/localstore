// api/shops.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const category_id = req.query.category_id?.trim() || ''
  const place = req.query.place?.trim() || ''

  try {
    // Base query con joins para obtener el nombre de categoría y lugar
    let query = supabase
      .from('shops')
      .select(`
        id,
        name,
        category_id,
        place_id,
        categories:categories(category),
        places:places(placename)
      `)

    // Filtro por categoría exacta (ID numérico)
    if (category_id) {
      query = query.eq('category_id', category_id)
    }

    // Filtro por lugar mediante texto parcial
    if (place) {
      query = query.ilike('places.placename', `%${place}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({
        status: 'error',
        message: 'Error al consultar la base de datos Supabase',
        details: error.message
      })
    }

    // Formateo final para el front-end
    const formatted = (data || []).map(s => ({
      id: s.id,
      name: s.name,
      category_name: s.categories?.category || '',
      place_name: s.places?.placename || ''
    }))

    return res.status(200).json({
      status: 'success',
      categoryIdQuery: category_id,
      placeQuery: place,
      data: formatted
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return res.status(500).json({
      status: 'error',
      message: 'Error inesperado al procesar la solicitud',
      details: err.message
    })
  }
}
