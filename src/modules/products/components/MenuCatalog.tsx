"use client";

import type {
  MenuCategory,
  MenuProduct,
} from "@/src/modules/products/types.products";
import { routes } from "@/src/config/navigation";
import Categories from "@/src/modules/products/components/Categories";
import CategoryMenuHeader from "@/src/modules/products/components/CategoryMenuHeader";
import ProductCard from "@/src/modules/products/components/ProductCard";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

interface MenuCatalogProps {
  categories: MenuCategory[];
  products: MenuProduct[];
}

export default function MenuCatalog({
  categories,
  products,
}: MenuCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const param = searchParams.get("category")?.trim().toLowerCase();

  const selectedCategoryId = useMemo(() => {
    if (!param) return null;
    return categories.find((c) => c.slug === param)?.id ?? null;
  }, [categories, param]);

  const isAllCategories = selectedCategoryId === null;

  const sections = useMemo(() => {
    if (!isAllCategories) return [];

    return categories
      .map((category) => ({
        category,
        products: products.filter((p) => p.categoryId === category.id),
      }))
      .filter((section) => section.products.length > 0);
  }, [categories, products, isAllCategories]);

  const visibleProducts = useMemo(() => {
    if (isAllCategories) return [];
    return products.filter((p) => p.categoryId === selectedCategoryId);
  }, [products, selectedCategoryId, isAllCategories]);

  const handleSelectCategory = useCallback(
    (id: string | null) => {
      if (id === null) {
        router.replace(routes.menu, { scroll: false });
        return;
      }

      const category = categories.find((c) => c.id === id);
      if (!category) return;

      router.replace(`${routes.menu}?category=${category.slug}`, {
        scroll: false,
      });
    },
    [categories, router],
  );

  return (
    <>
      <Categories
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
      />

      {isAllCategories ? (
        sections.length === 0 ? (
          <p className="mt-2 text-center text-muted-foreground">
            No hay productos en esta categoría.
          </p>
        ) : (
          sections.map(({ category, products: sectionProducts }) => (
            <section key={category.id}>
              <CategoryMenuHeader name={category.name} />
              <ul className="flex flex-col">
                {sectionProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ul>
            </section>
          ))
        )
      ) : (
        <section>
          <CategoryMenuHeader
            name={
              categories.find((c) => c.id === selectedCategoryId)?.name ?? ""
            }
          />

          {visibleProducts.length === 0 ? (
            <p className="mt-2 text-center text-muted-foreground">
              No hay productos en esta categoría.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
