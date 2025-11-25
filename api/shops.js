// api/shops.js
import { createClient } from '@supabase/supabase-js'

// Conecta con Supabase usando variables de entorno
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY // usa la anon key para lectura
)

export default async function handler(req, res) {
  const search = req.query.search || ''

  try {
    // Consulta la tabla 'shops', filtrando por nombre
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .ilike('name', `%${search}%`)

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({
        status: 'error',
        message: 'Error al consultar la base de datos Supabase',
        searchQuery: search,
        details: error.message
      })
    }

    if (!data || data.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No se encontraron tiendas que coincidan con la búsqueda',
        searchQuery: search,
        data: []
      })
    }

    // Todo bien, devuelve los datos encontrados
    res.status(200).json({
      status: 'success',
      message: `${data.length} tienda(s) encontrada(s)`,
      searchQuery: search,
      data
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({
      status: 'error',
      message: 'Error inesperado al procesar la solicitud',
      searchQuery: search,
      details: err.message
    })
  }
}
