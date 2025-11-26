// api/shops.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const search = req.query.search?.trim() || ''

  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .or(`name.ilike.%${search}%,category.ilike.%${search}%`)

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({
        status: 'error',
        message: 'Error al consultar la base de datos Supabase',
        searchQuery: search,
        details: error.message
      })
    }

    return res.status(200).json({
      status: 'success',
      searchQuery: search,
      data: data || []
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return res.status(500).json({
      status: 'error',
      message: 'Error inesperado al procesar la solicitud',
      searchQuery: search,
      details: err.message
    })
  }
}
