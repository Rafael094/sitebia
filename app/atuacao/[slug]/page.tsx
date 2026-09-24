import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Target, Users } from "lucide-react";

import RichText from "@/components/ui/RichText";
import CtaBanner from "@/components/ui/CtaBanner";
import ServiceListItem from "@/components/ui/ServiceListItem";
import ServiceIcon from "@/components/icons/ServiceIcon";
import { SITE } from "@/lib/constants";
import { getActiveServices, getServiceBySlug } from "@/lib/queries";
import { splitLines } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug).catch(() => null);
  return {
    // A marca é acrescentada pelo template do layout raiz — não repetir aqui.
    title: service ? service.title : "Serviço não encontrado",
    description: service?.summary ?? SITE.description
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug).catch(() => null);
  if (!service) notFound();

  const audience = splitLines(service.audience);
  const problems = splitLines(service.problems);
  const scope = splitLines(service.scope);
  const others = (await getActiveServices().catch(() => [])).filter(
    (s) => s.slug !== service.slug
  );

  return (
    <>
      {/* Cabeçalho escuro com breadcrumb */}
      <section data-header-theme="dark" className="bg-navy-900 pb-14 pt-32 text-ivory-100">
        <div className="container-site">
          <p className="mb-4 inline-flex flex-wrap items-center gap-1.5 text-xs text-ivory-200/60">
            <Link href="/" className="hover:text-white">Início</Link>
            <span>/</span>
            <Link href="/atuacao" className="hover:text-white">Atuação</Link>
            <span>/</span>
            <span className="text-gold-400">{service.title}</span>
          </p>
          <div className="flex items-start gap-4">
            <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-white/10 text-gold-400 sm:inline-flex">
              <ServiceIcon name={service.icon} className="h-7 w-7" />
            </span>
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                {service.title}
              </h1>
              <p className="mt-3 text-lg text-ivory-200/80">{service.summary}</p>
            </div>
          </div>
        </div>
      </section>

      <section data-header-theme="light" className="bg-ivory-100 py-16">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_360px]">
          <article>
            <RichText content={service.description} />
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/contato" className="btn-gold">
                Agendar diagnóstico
              </Link>
              <Link href="/conteudos" className="btn-ghost">
                Explorar os conteúdos
              </Link>
            </div>
          </article>

          <aside className="space-y-5">
            <FeatureCard
              icon={Users}
              title="Público-alvo"
              items={audience}
              fallback="Qualquer organização que cria ou usa tecnologia."
            />
            <FeatureCard
              icon={Target}
              title="Problemas que resolvo aqui"
              items={problems}
              fallback="Os desafios típicos desta etapa."
            />
            <FeatureCard
              icon={CheckCircle2}
              title="Escopo / entregas"
              items={scope}
              fallback="Entregas desenhadas sob medida no diagnóstico."
            />
            <div className="flex items-center gap-3 rounded-md border border-gold-500/40 bg-gold-500/10 p-4 text-sm text-navy-800">
              <Clock className="h-5 w-5 shrink-0 text-gold-600" />
              <span>Primeira conversa é um diagnóstico inicial — sem custo e sem vínculo.</span>
            </div>
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section data-header-theme="light" className="bg-ivory-100 pb-4">
          <div className="container-site">
            <h2 className="mb-6 font-display text-2xl font-semibold text-navy-900">
              Outras áreas de atuação
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              {others.map((s) => (
                <ServiceListItem key={s.id} service={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner />
    </>
  );
}


/** Card lateral informativo (público-alvo / problemas / escopo). */
function FeatureCard({
  icon: Icon,
  title,
  items,
  fallback
}: {
  icon: typeof Users;
  title: string;
  items: string[];
  fallback: string;
}) {
  return (
    <div className="rounded-md bg-white p-5 shadow-card ring-1 ring-navy-800/5">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-navy-800">
        <Icon className="h-4 w-4 text-gold-600" /> {title}
      </h2>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-navy-600">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-navy-500">{fallback}</p>
      )}
    </div>
  );
}

