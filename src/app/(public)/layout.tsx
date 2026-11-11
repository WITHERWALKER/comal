import { Navbar } from "@/src/shared/components/Navbar";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
