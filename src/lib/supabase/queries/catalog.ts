import type {
  MenuCategory,
  MenuProduct,
} from "@/src/modules/products/types.products";
import { getSupabase } from "@/src/lib/supabase/server";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  image_path: string | null;
};

type ProductRow = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | string;
};

function mapProductRow(row: ProductRow): MenuProduct {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
  };
}

export async function getCategories(): Promise<MenuCategory[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order, image_path")
    .is("archived_at", null)
    .eq("is_available", true)
    .order("sort_order");

  if (error) {
    throw new Error(`No se pudieron cargar las categorías: ${error.message}`);
  }

  return (data as CategoryRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
    imagePath: row.image_path,
  }));
}

export async function getProducts(): Promise<MenuProduct[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("products")
    .select("id, category_id, name, description, price")
    .is("archived_at", null)
    .eq("is_available", true)
    .order("name");

  if (error) {
    throw new Error(`No se pudieron cargar los productos: ${error.message}`);
  }

  return (data as ProductRow[]).map(mapProductRow);
}
