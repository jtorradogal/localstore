import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const id = parseInt(req.query.id, 10)

  if (isNaN(id)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid id'
    })
  }

  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching shop',
      details: error.message
    })
  }

  return res.status(200).json({
    status: 'success',
    data
  })
}
