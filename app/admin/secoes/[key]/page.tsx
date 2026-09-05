import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import SectionEditorForm from "@/components/admin/SectionEditorForm";
import { SECTION_META } from "@/lib/page-content";
import { listAdminSections } from "@/server/site-sections-admin";
import type { PageSectionKey } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Editar Seção",
  robots: { index: false }
};

interface Props {
  params: Promise<{ key: string }>;
}

/** Links públicos onde o conteúdo editado aparece (para preview). */
function previewLinks(key: PageSectionKey) {
  switch (key) {
    case "home_hero":
    case "home_services_header":
    case "home_journey_header":
    case "home_about":
    case "home_cta":
      return [{ href: "/", label: "Home" }];
    case "page_services_header":
      return [{ href: "/atuacao", label: "/atuacao" }];
    case "page_articles_header":
      return [{ href: "/conteudos", label: "/conteudos" }];
    case "page_contact_header":
      return [{ href: "/contato", label: "/contato" }];
    default:
      return [];
  }
}

export default async function EditarSecaoPage({ params }: Props) {
  const { key } = await params;
  const sections = await listAdminSections().catch(() => []);
  const keyTyped = key as PageSectionKey;
  const target = sections.find((s) => s.key === keyTyped);
  const meta = SECTION_META[keyTyped];

  if (!target || !meta) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/secoes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" /> Seções do site
      </Link>

      <div>
        <p className="section-eyebrow text-gold-600">{meta.group}</p>
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          Editar — {meta.label}
        </h1>
        <p className="mt-1 text-sm text-navy-500">{meta.hint}</p>
        <p className="mt-3 flex flex-wrap items-center gap-3 text-xs text-navy-500">
          <span className="font-semibold text-navy-700">Preview:</span>
          {previewLinks(keyTyped).map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
              className="underline decoration-gold-500 underline-offset-2 hover:text-navy-900">
              {l.label}
            </a>
          ))}
        </p>
      </div>

      <div className="card space-y-6 p-6">
        <p className="rounded-sm border border-gold-500/30 bg-gold-500/10 px-3 py-2 text-[11px] text-navy-700">
          A descrição e a citação aceitam o editor de texto rico — o visual do
          site é preservado ao publicar.
        </p>
        <SectionEditorForm sectionKey={target.key} content={target.content} />
      </div>
    </div>
  );
}
