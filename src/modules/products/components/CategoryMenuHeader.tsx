interface CategoryMenuHeaderProps {
  name: string;
}

export default function CategoryMenuHeader({ name }: CategoryMenuHeaderProps) {
  return (
    <header className="sticky top-16 z-20 bg-background py-4 text-center">
      <h2 className="font-serif text-4xl font-bold leading-none">{name}</h2>
    </header>
  );
}
