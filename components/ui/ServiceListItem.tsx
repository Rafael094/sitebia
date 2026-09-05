import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ServiceIcon from "@/components/icons/ServiceIcon";
import type { Service } from "@/lib/types";

/** Linha listando um serviço de forma mais completa (página /atuacao). */
export default function ServiceListItem({ service }: { service: Service }) {
  return (
    <Link
      href={`/atuacao/${service.slug}`}
      className="card group grid gap-5 p-6 transition-shadow hover:shadow-lg sm:grid-cols-[auto_1fr_auto] sm:items-center"
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-sm bg-navy-800 text-gold-400 transition-colors group-hover:bg-navy-700">
        <ServiceIcon name={service.icon} />
      </span>

      <div>
        <h2 className="font-display text-xl font-semibold text-navy-900 group-hover:text-navy-700">
          {service.title}
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-navy-600">
          {service.summary}
        </p>
      </div>

      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600">
        Ver detalhes <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
