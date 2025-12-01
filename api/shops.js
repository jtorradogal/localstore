import { supabase } from "@/utils/supabaseClient";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get("category_id");
    const place_id = searchParams.get("place_id");

    let query = supabase
      .from("shops")
      .select(`
        id,
        name,
        address,
        phone,
        website,
        category,
        place_id,
        categories:category ( category ),
        places:place_id ( placename )
      `);

    if (category_id) {
      query = query.eq("category", Number(category_id));
    }

    if (place_id) {
      query = query.eq("place_id", Number(place_id));
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return Response.json({ status: "error", message: error.message }, { status: 400 });
    }

    const formatted = data.map((shop) => ({
      id: shop.id,
      name: shop.name,
      address: shop.address,
      phone: shop.phone,
      website: shop.website,
      category_name: shop.categories?.category ?? "",
      place_name: shop.places?.placename ?? ""
    }));

    return Response.json({ status: "success", data: formatted }, { status: 200 });
  } catch (err) {
    return Response.json({ status: "error", message: err.message }, { status: 500 });
  }
}
