// api/shops.js
import { createClient } from '@supabase/supabase-js'

// Conecta con Supabase usando variables de entorno
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY // usa la anon key para lectura
)

export default async function handler(req, res) {
  try {
    const search = req.query.search || '' // recoge el parámetro ?search=...

    // Consulta la tabla 'shops', filtrando por nombre
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .ilike('name', `%${search}%`) // búsqueda insensible a mayúsculas/minúsculas

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.status(200).json({ data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
