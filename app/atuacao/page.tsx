import type { Metadata } from "next";
import { Briefcase } from "lucide-react";

import PageHero from "@/components/ui/PageHero";
import ServiceListItem from "@/components/ui/ServiceListItem";
import CtaBanner from "@/components/ui/CtaBanner";
import { SITE } from "@/lib/constants";
import { getActiveServices } from "@/lib/queries";

export const metadata: Metadata = {
  title: SITE.title("Áreas de Atuação"),
  description:
    "Conheça todas as áreas de atuação: diagnóstico de PI, estruturação de portfólio, conexão pesquisa-mercado e contratos de transferência de tecnologia."
};

export const dynamic = "force-dynamic";

export default async function AtuacaoPage() {
  const services = await getActiveServices().catch(() => []);

  return (
    <>
      <PageHero
        eyebrow="Atuação"
        title="Estratégia completa para proteger e transferir tecnologia"
        description="Cada projeto é endereçado por um especialista que une técnica jurídica e visão de negócio. Escolha a área que mais se aproxima do seu momento."
        icon={Briefcase}
      />

      <section className="bg-ivory-100 py-16">
        <div className="container-site space-y-6">
          {services.length === 0 && (
            <p className="rounded-md border border-navy-800/10 bg-white p-6 text-sm text-navy-600">
              Nenhum serviço ativo no momento. Volte em breve.
            </p>
          )}
          {services.map((service) => (
            <ServiceListItem key={service.id} service={service} />
          ))}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
