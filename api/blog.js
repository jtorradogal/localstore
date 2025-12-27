// api/blog.js
import { createClient } from '@supabase/supabase-js';

// Obtener variables de entorno (funciona en Vercel)
const supabaseUrl = process.env.SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY;

// Verificar que las variables existan
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  // En desarrollo, podrías usar valores por defecto (NO en producción)
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Usando variables de desarrollo - NO para producción');
  }
}

// Crear cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchPosts() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception in fetchPosts:', error);
    return { data: null, error };
  }
}

export async function fetchFeaturedPost() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true) // Si tienes campo para destacados
      .order('published_at', { ascending: false })
      .limit(1)
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Exception in fetchFeaturedPost:', error);
    return { data: null, error };
  }
}

export async function fetchPostBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Exception in fetchPostBySlug:', error);
    return { data: null, error };
  }
}

export function renderFeaturedPost(post) {
  if (!post) return '<div class="error">No hay post destacado</div>';
  
  return `
    <article class="featured">
      <img src="${post.thumbnail_url || '/default-thumbnail.jpg'}" 
           alt="${post.title}"
           class="featured-image"
           loading="lazy">
      <div class="featured-content">
        <h1><a href="/post/${post.slug}.html" class="featured-link">${post.title}</a></h1>
        <p class="excerpt">${post.excerpt || ''}</p>
        <div class="meta">
          <span class="author">Por ${post.author || 'Anónimo'}</span>
          <span class="separator">•</span>
          <time datetime="${post.published_at}">
            ${new Date(post.published_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </div>
      </div>
    </article>
  `;
}

export function renderPostCard(post) {
  return `
    <article class="post-card">
      <img src="${post.thumbnail_url || '/default-thumbnail.jpg'}" 
           alt="${post.title}"
           class="card-image"
           loading="lazy">
      <div class="card-content">
        <h3><a href="/post/${post.slug}.html">${post.title}</a></h3>
        <p class="card-excerpt">${post.excerpt ? post.excerpt.substring(0, 100) + '...' : ''}</p>
        <div class="card-meta">
          <span class="date">
            ${new Date(post.published_at).toLocaleDateString('es-ES')}
          </span>
        </div>
      </div>
    </article>
  `;
}

// Función de inicialización para verificar conexión
export async function initBlog() {
  console.log('🔄 Inicializando blog...');
  console.log('Supabase URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
  console.log('Supabase Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Faltante');
  
  // Test de conexión simple
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error conectando a Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Conexión a Supabase establecida');
    return true;
  } catch (error) {
    console.error('❌ Error en conexión:', error);
    return false;
  }
}

// Exportar el cliente si necesitas usarlo directamente
export { supabase };
