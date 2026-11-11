import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courier · Comal",
  robots: { index: false, follow: false },
};

export default function CourierLayout({
  children,
}: LayoutProps<"/courier">) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      {children}
    </div>
  );
}
