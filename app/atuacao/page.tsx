import type { Metadata } from "next";

import ServiceGridCard from "@/components/ui/ServiceGridCard";
import ServicesHeader from "@/components/ui/ServicesHeader";
import TechNetworkBg from "@/components/ui/TechNetworkBg";
import AtuacaoCta from "@/components/ui/AtuacaoCta";
import { getActiveServices } from "@/lib/queries";

export const metadata: Metadata = {
  // A marca é acrescentada pelo template do layout raiz — não repetir aqui.
  title: "Áreas de Atuação",
  description:
    "Conheça todas as áreas de atuação: diagnóstico de PI, estruturação de portfólio, conexão pesquisa-mercado e contratos de transferência de tecnologia."
};

export const dynamic = "force-dynamic";

export default async function AtuacaoPage() {
  const services = await getActiveServices().catch(() => []);

  return (
    <section className="relative overflow-hidden bg-navy-900 pb-20 pt-32 sm:pt-36">
      {/* Textura sutil de rede de conexões */}
      <TechNetworkBg className="pointer-events-none absolute inset-0 opacity-[0.07]" />

      <div className="container-site relative">
        <ServicesHeader />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {services.length === 0 && (
            <p className="rounded-xl border border-amber-500/20 bg-navy-800/40 p-6 text-sm text-slate-300 backdrop-blur-md">
              Nenhum serviço ativo no momento. Volte em breve.
            </p>
          )}
          {services.map((service) => (
            <ServiceGridCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      <AtuacaoCta />
    </section>
  );
}

