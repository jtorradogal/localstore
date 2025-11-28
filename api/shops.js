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
    let query = supabase
      .from('shops')
      .select('*')

    // Filtro por categoría (campo text)
    if (category) {
      query = query.ilike('category', `%${category}%`)
    }

    // Filtro por address (campo text para localizar por ciudad/barrio)
    if (place) {
      query = query.ilike('address', `%${place}%`)
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

    return res.status(200).json({
      status: 'success',
      categoryQuery: category,
      placeQuery: place,
      data: data || []
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
