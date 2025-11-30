// api/categories.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const q = req.query.q?.trim() || ''

  try {
    let query = supabase
      .from('categories')
      .select('id, category, cat_singular')

    // Solo filtramos si hay texto
    if (q.length > 0) {
      query = query.ilike('category', `%${q}%`)
    }

    const { data, error } = await query

    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error fetching categories',
        details: error.message
      })
    }

    return res.status(200).json({
      status: 'success',
      categories: data
    })

  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Unexpected error',
      details: err.message
    })
  }
}
