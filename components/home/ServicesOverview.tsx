"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ServiceCard from "@/components/ui/ServiceCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { useSectionContent } from "@/components/site/SectionsProvider";
import type { Service } from "@/lib/types";

/** Seção "O que eu faço" — grid dos pilares. Cabeçalho via page_contents. */
export default function ServicesOverview({ services }: { services: Service[] }) {
  const c = useSectionContent("home_services_header");

  return (
    <section
      id="areas"
      data-header-theme="light"
      className="scroll-mt-20 bg-ivory-100 py-20"
    >
      <div className="container-site">
        <SectionHeading
          eyebrow={c.badge_text || "O QUE EU FAÇO"}
          title={c.title || "Atuação sob medida para o ciclo de vida da inovação"}
          description={
            c.description ||
            "Da primeira avaliação de patenteabilidade até o contrato que licencia a tecnologia, conduzo cada etapa com rigor técnico e visão de negócio."
          }
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              href={`/atuacao/${service.slug}`}
            />
          ))}
        </div>

        {services.length > 4 && (
          <div className="mt-10 text-center">
            <Link href="/atuacao" className="btn-ghost">
              Ver todos os serviços <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
