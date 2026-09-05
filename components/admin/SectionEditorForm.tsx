"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ExternalLink, Save } from "lucide-react";

import RichTextField from "@/components/admin/RichTextField";
import { SECTION_META } from "@/lib/page-content";
import { saveSectionContentAction } from "@/server/site-sections-admin";
import type { PageContent, PageSectionKey } from "@/lib/types";

/**
 * FormulÃ¡rio de ediÃ§Ã£o de uma seÃ§Ã£o institucional (page_contents).
 * Campos estruturais (badge/tÃ­tulo/botÃµes/selo) sÃ£o textos simples;
 * descriÃ§Ã£o/citaÃ§Ã£o abrem editor de texto rico (HTML) para manter o visual.
 */
export default function SectionEditorForm({
  sectionKey,
  content
}: {
  sectionKey: PageSectionKey;
  content: PageContent;
}) {
  const router = useRouter();
  const meta = SECTION_META[sectionKey];
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "saving" }
    | { kind: "error"; message: string }
    | { kind: "success" }
  >({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ kind: "saving" });
    const fd = new FormData(e.currentTarget);
    fd.set("section_key", sectionKey);
    const result = await saveSectionContentAction(fd);
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setStatus({ kind: "success" });
    router.refresh();
  }

  const twoButtons =
    !!content.button_primary_label ||
    !!content.button_secondary_label ||
    content.button_primary_url !== undefined ||
    content.button_secondary_url !== undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status.kind === "error" && (
        <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {status.message}
        </p>
      )}
      {status.kind === "success" && (
        <p role="status" className="rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          ConteÃºdo salvo. As pÃ¡ginas pÃºblicas jÃ¡ exibem o novo texto.
        </p>
      )}

      <div className="rounded-sm border border-navy-800/10 bg-ivory-50 px-4 py-3 text-xs text-navy-500">
        <span className="font-semibold uppercase tracking-wide text-navy-600">
          {meta.group} Â· {meta.label}
        </span>
        <span className="mt-0.5 block text-navy-600">{meta.hint}</span>
        <code className="mt-1 inline-block rounded-sm bg-white px-1.5 py-0.5 text-[11px] text-navy-500">
          section_key: {sectionKey}
        </code>
      </div>

      {content.badge_text !== undefined && (
        <div>
          <label className="label-field">Badge / eyebrow</label>
          <input name="badge_text" defaultValue={content.badge_text} className="input-field" placeholder="ex.: O QUE EU FAÃ‡O" />
        </div>
      )}

      {content.title && (
        <div>
          <label className="label-field">TÃ­tulo</label>
          <textarea name="title" defaultValue={content.title} className="input-field" placeholder="TÃ­tulo da seÃ§Ã£o" />
        </div>
      )}

      {content.subtitle && (
        <div>
          <label className="label-field">SubtÃ­tulo</label>
          <textarea name="subtitle" defaultValue={content.subtitle} className="input-field" placeholder="Frase de apoio" />
        </div>
      )}

      {content.description !== undefined && (
        <RichTextField
          name="description"
          label="DescriÃ§Ã£o / texto de apoio"
          value={content.description}
          hint="Editor de texto rico: negrito, listas, citaÃ§Ãµes e parÃ¡grafos sÃ£o preservados."
        />
      )}

      {content.quote_text && (
        <RichTextField
          name="quote_text"
          label="CitaÃ§Ã£o"
          value={content.quote_text}
          hint="Destaque em forma de citaÃ§Ã£o dentro da seÃ§Ã£o."
        />
      )}
      {twoButtons && (
        <details className="rounded-sm border border-navy-800/10 px-3 py-2 md:col-span-2">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-navy-600">
            Botões / chamadas
          </summary>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label className="label-field">Botão principal — texto</label>
              <input name="button_primary_label" defaultValue={content.button_primary_label ?? ""} className="input-field" />
            </div>
            <div>
              <label className="label-field">Botão principal — URL</label>
              <input name="button_primary_url" defaultValue={content.button_primary_url ?? ""} className="input-field" placeholder="/contato ou https://…" />
            </div>
            <div>
              <label className="label-field">Botão secundário — texto</label>
              <input name="button_secondary_label" defaultValue={content.button_secondary_label ?? ""} className="input-field" />
            </div>
            <div>
              <label className="label-field">Botão secundário — URL</label>
              <input name="button_secondary_url" defaultValue={content.button_secondary_url ?? ""} className="input-field" placeholder="/atuacao ou https://…" />
            </div>
          </div>
        </details>
      )}
      {(content.badge_extra_title || content.badge_extra_sub !== undefined) && (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="label-field">Selo — número (ex.: +10 ANOS)</label>
            <input name="badge_extra_title" defaultValue={content.badge_extra_title ?? ""} className="input-field" />
          </div>
          <div>
            <label className="label-field">Selo — legenda</label>
            <input name="badge_extra_sub" defaultValue={content.badge_extra_sub ?? ""} className="input-field" />
          </div>
        </div>
      )}

      {content.image_url !== undefined && (
        <div>
          <label className="label-field">Imagem (URL)</label>
          <input name="image_url" defaultValue={content.image_url ?? ""} className="input-field" placeholder="/images/… ou https://…" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button type="submit" disabled={status.kind === "saving"} className="btn-primary">
          <Save className="h-4 w-4" />
          {status.kind === "saving" ? "Salvando…" : "Salvar seção"}
        </button>
        <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-navy-600 hover:text-navy-900">
          Ver página <ExternalLink className="h-4 w-4" />
        </a>
        <a href="/admin/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-navy-500 hover:text-navy-800">
          <ArrowUpRight className="h-4 w-4" /> Voltar ao painel
        </a>
      </div>
    </form>
  );
}
