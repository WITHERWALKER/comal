"use client";

import Link from "next/link";
import { useState } from "react";

import { publicNavLinks } from "@/src/config/navigation";

import { Menu } from "./animate-ui/icons/menu";
import { ToggleIcon } from "./animate-ui/toggle-icon";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Comal, inicio"
      className="font-serif text-secondary"
    >
      <span className="flex flex-col text-[1.7rem] font-black leading-[0.78] tracking-tight">
        <span>CO</span>
        <span className="pl-3 text-[1.35rem]">mal</span>
      </span>
    </Link>
  );
}

const links = publicNavLinks;

export function Navbar({ title }: { title?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border backdrop-blur">
      <div className="flex items-center justify-between px-5 py-4">
        <Logo />

        {title && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </span>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="relative flex size-10 items-center justify-center text-primary-800"
        >
          <ToggleIcon icon={Menu} active={open} />
        </button>
      </div>

      {open && (
        <nav
          id="site-nav"
          className="border-t border-border bg-background px-5 pb-6 pt-2"
        >
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-border py-3 font-serif text-2xl font-bold text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
