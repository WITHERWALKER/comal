"use client";

import type { MenuCategory } from "@/src/modules/products/types.products";
import { cn } from "@/src/lib/utils";

type CategoriesProps = {
  categories: MenuCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
};

const activeClass =
  "bg-secondary text-primary-foreground hover:bg-secondary/80 hover:scale-[0.98]";
const inactiveClass =
  "bg-primary text-primary-foreground hover:bg-primary/80 hover:scale-[0.98]";

export default function Categories({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoriesProps) {
  return (
    <section className="grid grid-cols-3 gap-2 bg-background py-3">
      <button
        type="button"
        aria-pressed={selectedCategoryId === null}
        onClick={() => onSelectCategory(null)}
        className={cn(
          "rounded-lg px-1 py-3 text-xs font-semibold uppercase transition-all duration-200",
          selectedCategoryId === null ? activeClass : inactiveClass,
        )}
      >
        Todo
      </button>

      {categories.map((category) => {
        const isActive = selectedCategoryId === category.id;

        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "rounded-lg px-1 py-3 text-xs font-semibold uppercase transition-all duration-200",
              isActive ? activeClass : inactiveClass,
            )}
          >
            {category.name}
          </button>
        );
      })}
    </section>
  );
}
