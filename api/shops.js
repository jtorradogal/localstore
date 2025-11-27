// api/shops.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const category = req.query.category?.trim() || ''
  const place = req.query.place?.trim() || ''

  try {
    // Base query con joins
    let query = supabase
      .from('shops')
      .select(`
        id,
        name,
        category,
        place_id,
        categories!inner(category) ,
        places!inner(placename)
      `)

    // Filtro por categoría
    if (category) {
      query = query.ilike('categories.category', `%${category}%`)
    }

    // Filtro por lugar
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
      categoryQuery: category,
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
