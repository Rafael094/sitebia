"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import Logo from "@/components/brand/Logo";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Cabeçalho fixo com menu responsivo.
 * - Fica transparente sobre a hero e ganha fundo sólido ao rolar.
 * - Some em rotas administrativas (/admin...), que possuem layout próprio.
 */
export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu mobile a cada navegação.
  useEffect(() => setOpen(false), [pathname]);

  if (isAdmin) return null;

  const solid = scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "bg-ivory-100/95 shadow-sm backdrop-blur"
          : "bg-transparent"
      )}
    >
      <div className="container-site flex items-center justify-between py-4">
        <Logo symbolClassName={solid ? undefined : undefined} />

        {/* Navegação desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative text-sm font-medium tracking-wide transition-colors",
                  active ? "text-navy-800" : "text-navy-600 hover:text-navy-800"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-0.5 bg-gold-500 transition-all duration-300",
                    active ? "w-full" : "w-0 group-hover:w-full"
                  )}
                />
              </Link>
            );
          })}
          <Link href="/contato" className="btn-gold !py-2.5 !px-5">
            Falar comigo
          </Link>
        </nav>

        {/* Botão menu mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-sm p-2 text-navy-800 md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <nav className="border-t border-navy-800/10 bg-ivory-100 px-5 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-sm px-3 py-2.5 text-base font-medium transition-colors",
                      active
                        ? "bg-navy-800 text-white"
                        : "text-navy-700 hover:bg-navy-800/5"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="mt-2">
              <Link href="/contato" className="btn-gold w-full">
                Falar comigo
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
