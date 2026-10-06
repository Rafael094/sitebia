"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Save } from "lucide-react";

import SeoFields from "@/components/admin/SeoFields";
import { normalizeSeoMetadata } from "@/lib/seo-types";
import { savePageSeoAction } from "@/server/page-seo-admin";
import type { PageSeoKey } from "@/lib/page-seo";

/**
 * Edita o SEO (head) de uma página estática. Reaproveita o componente SeoFields
 * — que traz o botão "Gerar com IA" (DeepSeek) e o upload da imagem Open Graph
 * sem que o editor precise digitar URLs.
 */
export default function PageSeoForm({
  pageKey,
  path,
  fallbackTitle,
  fallbackDescription,
  initial
}: {
  pageKey: PageSeoKey;
  path: string;
  fallbackTitle: string;
  fallbackDescription: string;
  initial: ReturnType<typeof normalizeSeoMetadata>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "saving" }
    | { kind: "error"; message: string }
    | { kind: "success" }
  >({ kind: "idle" });

  // Semente para a geração por IA quando a página ainda não tem SEO salvo.
  const seedTitle = initial.meta_title || fallbackTitle;
  const seedBody = initial.meta_description || fallbackDescription;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ kind: "saving" });
    const fd = new FormData(e.currentTarget);
    fd.set("page_key", pageKey);
    const result = await savePageSeoAction(fd);
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setStatus({ kind: "success" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status.kind === "error" && (
        <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {status.message}
        </p>
      )}
      {status.kind === "success" && (
        <p role="status" className="rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          SEO salvo. O novo <code>&lt;head&gt;</code> já é servido para <strong>{path}</strong>.
        </p>
      )}

      <div className="rounded-sm border border-navy-800/10 bg-ivory-50 px-4 py-3 text-xs text-navy-500">
        <span className="font-semibold uppercase tracking-wide text-navy-600">
          Página: {path}
        </span>
        <span className="mt-0.5 block text-navy-600">
          Título, descrição, palavras-chave e Open Graph do <code>&lt;head&gt;</code> desta página.
        </span>
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-gold-700 underline underline-offset-2"
        >
          <ExternalLink className="h-3 w-3" /> Ver a página
        </a>
      </div>

      <SeoFields
        initial={initial}
        title={seedTitle}
        body={seedBody}
        kind={`Página do site (${pageKey})`}
        context={pageKey}
        idPrefix="seo-page"
      />

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={status.kind === "saving"}>
          <Save className="h-4 w-4" />
          {status.kind === "saving" ? "Salvando…" : "Salvar SEO"}
        </button>
      </div>
    </form>
  );
}
