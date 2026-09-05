import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ServiceIcon from "@/components/icons/ServiceIcon";
import type { Service } from "@/lib/types";

type Props = {
  service: Service;
  /** Liga o card inteiro a uma URL (ex.: página interna). */
  href?: string;
  headingLevel?: "h2" | "h3";
};

/** Card de apresentação de uma área de atuação/serviço. */
export default function ServiceCard({ service, href, headingLevel = "h3" }: Props) {
  const TitleTag = headingLevel;
  const inner = (
    <>
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-navy-800 text-gold-400">
        <ServiceIcon name={service.icon} />
      </span>
      <TitleTag className="mt-4 font-display text-lg font-semibold text-navy-900">
        {service.title}
      </TitleTag>
      <p className="mt-2 text-sm leading-relaxed text-navy-600">{service.summary}</p>
      {href && (
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 transition-colors group-hover:text-gold-600">
          Ver detalhes <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </>
  );

  const classes =
    "card group flex h-full flex-col p-6 transition-transform duration-200 hover:-translate-y-1";

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }
  return <div className={classes}>{inner}</div>;
}
