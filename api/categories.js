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
      .select('id, category')
      .order('category', { ascending: true })

    if (q) {
      query = query.ilike('category', `%${q}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error(error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
