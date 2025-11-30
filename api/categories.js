// api/categories.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const q = req.query.q?.trim() || ''

  const { data, error } = await supabase
    .from('categories')
    .select('id, category')
    .ilike('category', `%${q}%`)

  if (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error al consultar categorías',
      details: error.message
    })
  }

  return res.status(200).json({
    status: 'success',
    categories: data
  })
}
