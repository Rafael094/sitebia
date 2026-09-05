import Link from "next/link";

/**
 * Logo "Bianca Martins" — vetorial, 100% SVG, fiel à marca original:
 *   • Monograma com o BIANCA "B" no topo e o "M" na base, encaixado na curva
 *     inferior do "B" (cria o nó visual característico da logomarca);
 *   • Órbita elíptica em dourado champagne cortando na diagonal com a esfera
 *     no seu topo;
 *   • Tipografia BIANCA MARTINS (Cinzel/Georgia, caixa alta) + subtítulo
 *     "TRANSFERÊNCIA DE TECNOLOGIA E PI".
 *
 * As cores são controladas pela prop `variant` (sem CSS variables):
 *   - "dark"  → monograma #0D1B2A + dourado #C5A059  (para fundos claros)
 *   - "light" → monograma #FFFFFF + dourado #C5A059  (para fundos navy/escuros)
 *
 * Uso típico: <Logo variant="light" height={56} />
 */
export default function Logo({
  variant = "dark",
  height = 52,
  className = ""
}: {
  /** dark = header/área clara | light = sobre fundo escuro (navy/footer). */
  variant?: "light" | "dark";
  /** Altura (px) do símbolo/átomo. */
  height?: number;
  className?: string;
}) {
  const mono = variant === "dark" ? "#0D1B2A" : "#FFFFFF";
  const gold = "#C5A059";
  const sub = variant === "dark" ? "#a9843f" : gold;

  return (
    <Link
      href="/"
      aria-label="Bianca Martins — Início"
      className={`group inline-flex items-center gap-3 text-left ${className}`.trim()}
    >
      {/* Símbolo: monograma B/M encaixado + órbita + esfera dourada */}
      <span
        aria-hidden="true"
        style={{ width: height, height }}
        className="block shrink-0"
      >
        <svg
          viewBox="0 0 220 220"
          width="100%"
          height="100%"
          role="img"
          aria-label="Monograma BM com órbita elíptica e esfera dourada"
        >
          {/* Órbita diagonal — arco traseiro */}
          <path
            d="M 40,132 C 14,180 96,206 166,152 C 214,108 198,40 150,44"
            stroke={gold}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Monograma "B" (topo) e "M" (base, encaixada na curva inferior do B) */}
          <text
            x="46"
            y="120"
            fontFamily="'Cinzel', 'Times New Roman', serif"
            fontWeight="700"
            fontSize="104"
            fill={mono}
          >
            B
          </text>
          <text
            x="100"
            y="196"
            fontFamily="'Cinzel', 'Times New Roman', serif"
            fontWeight="700"
            fontSize="104"
            fill={mono}
          >
            M
          </text>

          {/* Arco frontal da órbita + esfera dourada no topo */}
          <path
            d="M 150,44 C 108,58 60,100 40,132"
            stroke={gold}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="184" cy="30" r="9" fill={gold} />
        </svg>
      </span>

      {/* Palavra/o texto institucional */}
      <span className="flex min-w-0 flex-col leading-tight">
        <span
          className="font-display text-[0.98rem] font-bold uppercase tracking-[0.12em] sm:text-xl sm:tracking-[0.15em]"
          style={{ color: mono }}
        >
          Bianca Martins
        </span>
        <span
          className="mt-0.5 text-[0.52rem] font-semibold uppercase tracking-[0.12em] sm:text-[0.66rem] sm:tracking-[0.16em]"
          style={{ color: sub }}
        >
          Transferência de Tecnologia e PI
        </span>
      </span>
    </Link>
  );
}
