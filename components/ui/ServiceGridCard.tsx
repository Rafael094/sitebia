import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ServiceIcon from "@/components/icons/ServiceIcon";
import type { Service } from "@/lib/types";

/**
 * Cartão de serviço em grade (página /atuacao) — tema escuro.
 * Formato horizontal: ícone dourado à esquerda, conteúdo à direita.
 */
export default function ServiceGridCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/atuacao/${service.slug}`}
      className="group flex h-full flex-col rounded-xl border border-amber-500/20 bg-navy-800/40 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/60 hover:shadow-[0_10px_30px_rgba(217,119,6,0.1)] lg:p-8"
    >
      <div className="flex items-start gap-5">
        {/* Ícone metálico/dourado com destaque */}
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-400 transition-colors duration-300 group-hover:from-amber-500/30 group-hover:text-amber-300">
          <ServiceIcon name={service.icon} className="h-7 w-7" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="mb-2 font-display text-base font-semibold uppercase tracking-wide text-white lg:text-lg">
            {service.title}
          </h2>

          <p className="mb-4 text-sm leading-relaxed text-slate-300">
            {service.summary}
          </p>

          <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-amber-400 transition-colors group-hover:text-amber-300">
            Ver detalhes
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
