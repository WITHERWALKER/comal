export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  imagePath: string | null;
};

export type MenuProduct = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
};
