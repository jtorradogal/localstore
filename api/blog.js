// pages/api/blog.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Configurar CORS y cache
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
  
  try {
    const { 
      slug,          // Para obtener un post específico
      limit = 10,    // Límite de posts
      offset = 0     // Para paginación
    } = req.query;
    
    let query = supabase
      .from('posts')
      .select('*');
    
    // Si se solicita un post específico
    if (slug) {
      const { data, error } = await query
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      
      if (error) {
        console.error('Error fetching post:', error);
        return res.status(404).json({ 
          status: 'error', 
          message: 'Post no encontrado' 
        });
      }
      
      return res.status(200).json({ 
        status: 'success', 
        data 
      });
    }
    
    // Obtener todos los posts publicados
    const { data, error, count } = await query
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching posts:', error);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Error al obtener posts',
        details: error.message 
      });
    }
    
    // Formatear datos si es necesario
    const formatted = (data || []).map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || post.content?.substring(0, 150) + '...',
      content: post.content,
      thumbnail_url: post.thumbnail_url || '/default-thumbnail.jpg',
      author: post.author,
      published_at: post.published_at,
      created_at: post.created_at
    }));
    
    return res.status(200).json({ 
      status: 'success', 
      data: formatted,
      count: count || formatted.length
    });
    
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Error inesperado',
      details: err.message
    });
  }
}
