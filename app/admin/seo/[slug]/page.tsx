import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import PageSeoForm from "@/components/admin/PageSeoForm";
import { getPageSeo } from "@/server/page-seo-admin";
import { asPageSeoSlug, PAGE_SEO_REGISTRY, PAGE_SEO_KEYS } from "@/lib/page-seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Editar SEO da página",
  robots: { index: false }
};

interface Props {
  params: Promise<{ slug: string }>;
}

/** Pré-renderiza as rotas do painel para os slugs conhecidos. */
export function generateStaticParams() {
  return PAGE_SEO_KEYS.map((k) => ({ slug: PAGE_SEO_REGISTRY[k].slug }));
}

export default async function EditarPageSeoPage({ params }: Props) {
  const { slug } = await params;
  const key = asPageSeoSlug(slug);
  if (!key) notFound();

  const meta = PAGE_SEO_REGISTRY[key];
  const seo = await getPageSeo(key);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/seo"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" /> SEO das páginas
      </Link>

      <div>
        <p className="section-eyebrow text-gold-600">{meta.group}</p>
        <h1 className="font-display text-2xl font-semibold text-navy-900">
          SEO — {meta.label}
        </h1>
        <p className="mt-1 text-sm text-navy-500">{meta.hint}</p>
      </div>

      <div className="card space-y-6 p-6">
        <PageSeoForm
          pageKey={key}
          path={meta.path}
          fallbackTitle={meta.defaultTitle}
          fallbackDescription={meta.defaultDescription}
          initial={seo}
        />
      </div>
    </div>
  );
}
