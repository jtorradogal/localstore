// api/shop.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const id = req.query.id;

  if (!id) {
    return res.status(400).json({ error: "Missing id" });
  }

  try {
    const { data, error } = await supabase
      .from("shops")
      .select(`
        *,
        categories:category ( category ),
        places:place_id ( placename )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    res.status(200).json({
      data: {
        id: data.id,
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        description: data.description,
        category_name: data.categories?.category || null,
        place_name: data.places?.placename || null
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
