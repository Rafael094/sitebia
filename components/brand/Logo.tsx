import Image from "next/image";
import Link from "next/link";

/**
 * Logo "Bianca Martins" — monograma BM com órbita elíptica dourada.
 *
 * As imagens ficam em `/public/images/brand/` e são quadradas (1:1):
 *   - `logo-monograma-dark.png`  → monograma navy #0D1B2A + dourado (fundos claros)
 *   - `logo-monograma-light.png` → monograma branco #FFFFFF + dourado (fundos navy)
 *
 * As cores são controladas pela prop `variant` (sem CSS variables):
 *   - "dark"  → monograma #0D1B2A + dourado #C5A059  (para fundos claros)
 *   - "light" → monograma #FFFFFF + dourado #C5A059  (para fundos navy/escuros)
 *
 * A assinatura textual ("Bianca Martins" + subtítulo) segue em HTML para
 * permanecer nítida, acessível e independente da resolução da imagem.
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
  const isDark = variant === "dark";
  const mono = isDark ? "#0D1B2A" : "#FFFFFF";
  const gold = "#C5A059";
  const sub = isDark ? "#a9843f" : gold;
  const src = isDark
    ? "/images/brand/logo-monograma-dark.png"
    : "/images/brand/logo-monograma-light.png";

  return (
    <Link
      href="/"
      aria-label="Bianca Martins — Início"
      className={`group inline-flex items-center gap-3 text-left ${className}`.trim()}
    >
      {/* Símbolo: monograma BM (imagem) + órbita + esfera dourada */}
      <Image
        src={src}
        alt="Monograma Bianca Martins"
        width={height}
        height={height}
        priority
        unoptimized
        style={{ width: height, height }}
        className="block shrink-0 transition-transform duration-300 group-hover:scale-[1.04]"
      />

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
