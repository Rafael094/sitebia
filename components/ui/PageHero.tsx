import { LucideIcon } from "lucide-react";

/** Faixa de cabeçalho das páginas internas (abaixo do header fixo). */
export default function PageHero({
  eyebrow,
  title,
  description,
  icon: Icon
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-900 pb-16 pt-32 text-ivory-100 sm:pt-36">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-navy-700 blur-2xl" />

      <div className="container-site relative max-w-3xl">
        {Icon && (
          <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-white/10 text-gold-400">
            <Icon className="h-6 w-6" />
          </span>
        )}
        {eyebrow && (
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-gold-400">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-base leading-relaxed text-ivory-200/70">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
