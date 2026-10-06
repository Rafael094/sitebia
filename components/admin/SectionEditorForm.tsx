"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ExternalLink, Save } from "lucide-react";

import RichTextField from "@/components/admin/RichTextField";
import SeoFields from "@/components/admin/SeoFields";
import { SECTION_META } from "@/lib/page-content";
import { saveSectionContentAction } from "@/server/site-sections-admin";
import { normalizeSeoMetadata } from "@/lib/seo-types";
import type { PageContent, PageSectionKey } from "@/lib/types";

/** URL pública onde cada seção aparece (usada no preview de SEO). */
const SECTION_PUBLIC_URL: Record<string, string> = {
  home_hero: "/",
  home_services_header: "/",
  home_journey_header: "/",
  home_about: "/",
  home_cta: "/",
  page_services_header: "/atuacao",
  page_articles_header: "/conteudos",
  page_contact_header: "/contato"
};

/**
 * Formulário de edição de uma seção institucional (page_contents).
 * Campos estruturais (badge/título/botões/selo) são textos simples;
 * descrição/citação abrem editor de texto rico (HTML) para manter o visual.
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
  // Pré-visualização da imagem do Hero antes do envio (input#IMAGE_FILE -> img#imagePreview).
  const [previewSrc, setPreviewSrc] = useState<string>(content.image_url ?? "");

  // Após o servidor revalidar (router.refresh), o prop content é atualizado com a
  // URL pública definitiva — sincroniza o preview com o valor realmente persistido.
  useEffect(() => {
    setPreviewSrc(content.image_url ?? "");
  }, [content.image_url]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") setPreviewSrc(result);
    };
    reader.readAsDataURL(file);
  }

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
          Conteúdo salvo. As páginas públicas já exibem o novo texto.
        </p>
      )}

      <div className="rounded-sm border border-navy-800/10 bg-ivory-50 px-4 py-3 text-xs text-navy-500">
        <span className="font-semibold uppercase tracking-wide text-navy-600">
          {meta.group} · {meta.label}
        </span>
        <span className="mt-0.5 block text-navy-600">{meta.hint}</span>
        <code className="mt-1 inline-block rounded-sm bg-white px-1.5 py-0.5 text-[11px] text-navy-500">
          section_key: {sectionKey}
        </code>
      </div>

      {content.badge_text !== undefined && (
        <div>
          <label className="label-field">Badge / eyebrow</label>
          <input name="badge_text" defaultValue={content.badge_text} className="input-field" placeholder="ex.: O QUE EU FAÇO" />
        </div>
      )}

      {content.title && (
        <div>
          <label className="label-field">Título</label>
          <textarea name="title" defaultValue={content.title} className="input-field" placeholder="Título da seção" />
        </div>
      )}

      {content.subtitle && (
        <div>
          <label className="label-field">Subtítulo</label>
          <textarea name="subtitle" defaultValue={content.subtitle} className="input-field" placeholder="Frase de apoio" />
        </div>
      )}

      {content.description !== undefined && (
        <RichTextField
          name="description"
          label="Descrição / texto de apoio"
          value={content.description}
          hint="Editor de texto rico: negrito, listas, citações e parágrafos são preservados."
        />
      )}

      {content.quote_text && (
        <RichTextField
          name="quote_text"
          label="Citação"
          value={content.quote_text}
          hint="Destaque em forma de citação dentro da seção."
        />
      )}
      {content.academic_title !== undefined && (
        <div>
          <label className="label-field">Formação — título do bloco</label>
          <input
            name="academic_title"
            defaultValue={content.academic_title ?? ""}
            className="input-field"
            placeholder="ex.: Formação acadêmica"
          />
        </div>
      )}

      {content.academic_items !== undefined && (
        <RichTextField
          name="academic_items"
          label="Formação — itens (texto rico)"
          value={content.academic_items}
          hint="Cada formação em um parágrafo; use negrito para o nome da instituição e <br> para a linha de detalhe."
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
          <label className="label-field" htmlFor="IMAGE_FILE">
            Imagem (enviar arquivo)
          </label>
          <input
            type="file"
            accept="image/*"
            name="IMAGE_FILE"
            id="IMAGE_FILE"
            onChange={handleImageChange}
            className="input-field file:mr-3 file:rounded-sm file:border-0 file:bg-navy-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
          <p className="mt-1 text-[11px] text-navy-400">
            {content.image_url
              ? "Imagem atual será mantida se nenhum arquivo for escolhido."
              : "Nenhuma imagem definida ainda."}
          </p>

          <div id="preview" style={{ marginTop: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              id="imagePreview"
              src={previewSrc}
              alt="Preview"
              style={{
                maxWidth: 200,
                display: previewSrc ? "block" : "none"
              }}
            />
          </div>
        </div>
      )}

      <SeoFields
        initial={normalizeSeoMetadata(content.seo_metadata)}
        title={String(content.title ?? "").split("\n")[0]}
        body={[content.subtitle, content.description, content.quote_text]
          .map((v) => String(v ?? ""))
          .filter(Boolean)
          .join("\n\n")}
        kind={`Secao do site (${sectionKey})`}
        context={SECTION_PUBLIC_URL[sectionKey] ?? "/"}
        idPrefix={`section-${sectionKey}`}
      />

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
