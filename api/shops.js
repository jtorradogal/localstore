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
      .select(`
        id,
        name,
        category,
        address,
        phone,
        email,
        website,
        description,
        place_id,
        places:place_id (placename, province, community)
      `)

    if (category) {
      query = query.eq('category', category)
    }

    if (place) {
      // Ahora sí funciona porque el alias 'places' existe
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

    const formatted = (data || []).map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      address: s.address,
      phone: s.phone,
      email: s.email,
      website: s.website,
      description: s.description,
      place: s.places?.placename || '',
      province: s.places?.province || '',
      community: s.places?.community || ''
    }))

    return res.status(200).json({
      status: 'success',
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
