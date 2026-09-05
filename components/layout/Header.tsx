"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import Logo from "@/components/brand/Logo";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Cabeçalho fixo com menu responsivo e tema dinâmico pela rolagem.
 *
 * O header entende em que altura ele está em relação às seções da página,
 * que são demarcadas com o atributo `data-header-theme`:
 *   - "light" indica seção de fundo CLARO (off-white/ivory)
 *       -> o header fica ESCURO (#0D1B2A), texto/elementos claros e dourados;
 *   - "dark"  indica seção de fundo ESCURO (#0D1B2A)
 *       -> o header fica CLARO (#FAF8F5), textos marinhos e detalhes dourados.
 *
 * Dessa forma o logotipo também alterna automaticamente:
 *   - No header claro  (ivory): monograma escuro #0D1B2A + detalhes dourados.
 *   - No header escuro (navy) : monograma branco #FFFFFF + detalhes dourados.
 *
 * Oculta-se em rotas administrativas (/admin...) que possuem layout próprio.
 */
const THEME_ATTR = "data-header-theme";

export default function Header() {
  const pathname = usePathname();
  // "navy"  => header escuro #0D1B2A (a seção ao fundo é clara)
  // "ivory" => header claro  #FAF8F5 (a seção ao fundo é escura)
  const [band, setBand] = useState<"navy" | "ivory">("navy");
  const [open, setOpen] = useState(false);

  const isAdmin = pathname?.startsWith("/admin");

  // Detecta qual faixa de seção está passando por baixo do header e troca o tema.
  useEffect(() => {
    const update = () => {
      const nodes = document.querySelectorAll<HTMLElement>(`[${THEME_ATTR}]`);
      const sections = Array.from(nodes);
      if (!sections.length) {
        setBand("navy");
        return;
      }
      // Linha vertical onde o header "morada" (aprox. altura do header fixo).
      const detectY = 96;
      let chosen = sections[0];
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= detectY) chosen = el;
      }
      const isLight = chosen.getAttribute(THEME_ATTR) === "light";
      setBand(isLight ? "navy" : "ivory");
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  // Fecha o menu no mobile a cada navegação.
  useEffect(() => setOpen(false), [pathname]);

  if (isAdmin) return null;

  const isNavy = band === "navy";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        isNavy ? "bg-navy-900 text-ivory-100" : "bg-ivory-100 text-navy-900",
        isNavy
          ? "shadow-[0_6px_20px_-8px_rgba(0,0,0,0.5)]"
          : "shadow-[0_6px_20px_-12px_rgba(13,27,42,0.35)]"
      )}
    >
      <div className="container-site flex items-center justify-between py-3.5 sm:py-4">
        <Logo variant={isNavy ? "light" : "dark"} />

        {/* Navegação desktop */}
        <nav className="hidden items-center gap-7 md:flex lg:gap-8">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative text-sm font-medium tracking-wide transition-colors",
                  isNavy
                    ? active
                      ? "text-gold-300"
                      : "text-ivory-100/75 hover:text-white"
                    : active
                      ? "text-navy-900"
                      : "text-navy-600 hover:text-navy-900"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute -bottom-1.5 left-0 h-0.5 bg-gold-500 transition-all duration-300",
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

        {/* Botão de menu mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className={cn(
            "rounded-sm p-2 transition-colors md:hidden",
            isNavy ? "text-ivory-100" : "text-navy-800"
          )}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <nav
          className={cn(
            "md:hidden",
            isNavy
              ? "border-t border-white/10 bg-navy-900 shadow-[0_14px_30px_-14px_rgba(0,0,0,0.5)]"
              : "border-t border-navy-800/10 bg-ivory-100"
          )}
        >
          <div className="container-site py-3">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active =
                  pathname === link.href || pathname?.startsWith(link.href + "/");
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-sm px-3 py-2.5 text-base font-medium transition-colors",
                        isNavy
                          ? active
                            ? "bg-white/10 text-gold-300"
                            : "text-ivory-100/80 hover:bg-white/10 hover:text-white"
                          : active
                            ? "bg-navy-900 text-white"
                            : "text-navy-700 hover:bg-navy-900/5"
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
          </div>
        </nav>
      )}
    </header>
  );
}

