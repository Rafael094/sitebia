import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logo "Bianca Martins" reconstruída 100% em SVG:
 *  - Monograma "BM" central
 *  - Órbita elíptica ao redor da esfera
 *  - Esfera dourada (champagne)
 *  - Tipografia institucional ao lado
 *
 * Prop `compact`: exibe apenas o símbolo (header sobre fundo claro/escuro).
 */
export default function Logo({
  variant = "default",
  className,
  symbolClassName
}: {
  /** default = símbolo + texto | compact = somente átomo | light = texto branco */
  variant?: "default" | "compact" | "light";
  className?: string;
  symbolClassName?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-3", className)}
      aria-label="Bianca Martins — Início"
    >
      {/* Símbolo: monograma + órbita + esfera */}
      <span className={cn("relative block h-11 w-11 shrink-0", symbolClassName)}>
        <svg
          viewBox="0 0 64 64"
          className="h-full w-full"
          role="img"
          aria-label="Monograma BM com órbita e esfera dourada"
        >
          {/* Órbita elíptica inclinada */}
          <ellipse
            cx="32"
            cy="32"
            rx="29"
            ry="11.5"
            fill="none"
            stroke="var(--orbit, #C5A059)"
            strokeWidth="1.6"
            transform="rotate(-24 32 32)"
            opacity="0.9"
          />
          {/* Esfera dourada sobre a órbita */}
          <circle cx="51" cy="17" r="4.5" fill="#C5A059" className="drop-shadow-sm" />

          {/* Anel/círculo de fundo do monograma */}
          <circle cx="32" cy="32" r="16.5" fill="none" stroke="#0D1B2A" strokeWidth="1" opacity="0.35" />

          {/* Monograma BM em serifa central */}
          <text
            x="32"
            y="32.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Cinzel', serif"
            fontSize="15"
            fontWeight="700"
            fill="var(--mono, #0D1B2A)"
            letterSpacing="0.5"
          >
            BM
          </text>
        </svg>
      </span>

      {/* Tipografia institucional */}
      {variant !== "compact" && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-lg font-bold tracking-wide",
              variant === "light" ? "text-white" : "text-navy-900"
            )}
          >
            Bianca Martins
          </span>
          <span
            className={cn(
              "mt-1 text-[10px] font-medium uppercase tracking-[0.18em]",
              variant === "light" ? "text-gold-300" : "text-gold-600"
            )}
          >
            Transferência de Tecnologia
          </span>
        </span>
      )}
    </Link>
  );
}
