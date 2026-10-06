"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, Search, Sparkles, Undo2, X } from "lucide-react";

import { generateSeoAction, uploadOgImage } from "@/server/seo-admin";
import { SEO_LIMITS, type SeoMetadata } from "@/lib/seo-types";

/**
 * Seção "SEO & Metadados" reutilizável nos formulários do painel.
 * ---------------------------------------------------------------
 * - Exibe/edita meta_title, meta_description, meta_keywords e Open Graph;
 * - Botão "Gerar com IA" (DeepSeek) que preenche os campos na hora;
 * - Imagem Open Graph: enviada por botão de upload (sem digitar URL);
 * - Contadores de caracteres + pré-visualização do resultado no Google;
 * - Grava tudo em inputs `hidden` no formato esperado pelo servidor:
 *     seo_meta_title, seo_meta_description, seo_meta_keywords,
 *     seo_og_title, seo_og_description, seo_og_image
 */
export default function SeoFields({
  initial,
  title,
  body,
  kind,
  context,
  idPrefix = "seo"
}: {
  initial?: SeoMetadata;
  title: string;
  body: string;
  kind?: string;
  context?: string;
  idPrefix?: string;
}) {
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? "");
  const [metaKeywords, setMetaKeywords] = useState(initial?.meta_keywords ?? "");
  const [ogTitle, setOgTitle] = useState(initial?.og_title ?? "");
  const [ogDescription, setOgDescription] = useState(initial?.og_description ?? "");
  const [ogImage, setOgImage] = useState(initial?.og_image ?? "");
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(initial?.og_title || initial?.og_description || initial?.og_image)
  );
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: "ok" | "warn" | "err"; text: string } | null>(
    initial?.source ? { kind: "ok", text: sourceLabel(initial.source) } : null
  );
  // Estado do upload da imagem Open Graph (botão de arquivo, sem digitar URL).
  const [uploading, setUploading] = useState(false);
  const [ogError, setOgError] = useState("");
  const ogFileRef = useRef<HTMLInputElement>(null);

  const id = (s: string) => `${idPrefix}-${s}`;

  const onPickOgImage = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setOgError("");
    setUploading(true);
    try {
      const r = await uploadOgImage(file);
      if (!r.ok) {
        setOgError(r.error);
        return;
      }
      setOgImage(r.url);
    } catch (e) {
      setOgError(e instanceof Error ? e.message : "Falha ao enviar a imagem.");
    } finally {
      setUploading(false);
    }
  }, []);

  const generate = useCallback(async () => {
    setBusy(true);
    setNote(null);
    try {
      const r = await generateSeoAction({ title, body, kind, context });
      if (!r.ok) {
        setNote({ kind: "err", text: r.error });
        return;
      }
      setMetaTitle(r.seo.meta_title ?? "");
      setMetaDescription(r.seo.meta_description ?? "");
      setMetaKeywords(r.seo.meta_keywords ?? "");
      setOgTitle(r.seo.og_title ?? "");
      setOgDescription(r.seo.og_description ?? "");
      setNote({
        kind: r.fromAi ? "ok" : "warn",
        text: r.fromAi
          ? "SEO gerado pelo DeepSeek. Revise e ajuste se precisar."
          : r.warning ?? "Metadados gerados localmente (IA indisponível)."
      });
    } catch (e) {
      setNote({ kind: "err", text: e instanceof Error ? e.message : "Falha ao gerar SEO." });
    } finally {
      setBusy(false);
    }
  }, [title, body, kind, context]);

  const clearAll = () => {
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setOgTitle("");
    setOgDescription("");
    setOgImage("");
    setOgError("");
    if (ogFileRef.current) ogFileRef.current.value = "";
    setNote({ kind: "ok", text: "Campos limpos — o site usará o texto padrão como SEO." });
  };

  const serpTitle = metaTitle || title || "Título da página";
  const serpDescription =
    metaDescription || "A descrição aparecerá aqui nos resultados de busca.";
  const url = context?.startsWith("/")
    ? `biancamartins.com.br${context}`
    : "biancamartins.com.br";

  return (
    <section className="space-y-4 rounded-sm border border-navy-800/10 bg-ivory-50 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-navy-800">
            <Search className="h-4 w-4 text-gold-600" /> SEO &amp; Metadados
          </h3>
          <p className="mt-0.5 text-[11px] text-navy-500">
            Otimizado para mecanismos de busca. O que ficar vazio usa o título/descrição do
            conteúdo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={generate}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-sm bg-navy-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-gold-400" />
            )}
            {busy ? "Gerando…" : "Gerar com IA"}
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={busy}
            title="Limpar SEO (usar padrão do conteúdo)"
            className="inline-flex items-center gap-1.5 rounded-sm border border-navy-800/15 px-2.5 py-1.5 text-xs font-semibold text-navy-600 hover:bg-white disabled:opacity-60"
          >
            <Undo2 className="h-3.5 w-3.5" /> Limpar
          </button>
        </div>
      </header>

      {note && (
        <p
          role={note.kind === "err" ? "alert" : "status"}
          className={
            note.kind === "err"
              ? "rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              : note.kind === "warn"
                ? "rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
                : "rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700"
          }
        >
          {note.text}
        </p>
      )}
      <Counter
        label="Meta Title"
        value={metaTitle}
        max={SEO_LIMITS.title}
        htmlFor={id("meta_title")}
      >
        <input
          id={id("meta_title")}
          className="input-field"
          maxLength={70}
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          placeholder="Ex.: Transferência de Tecnologia e PI | Bianca Martins"
        />
      </Counter>

      <Counter
        label="Meta Description"
        value={metaDescription}
        max={SEO_LIMITS.description}
        htmlFor={id("meta_description")}
      >
        <textarea
          id={id("meta_description")}
          className="input-field"
          rows={3}
          maxLength={180}
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="Descrição persuasiva com a proposta de valor em até 160 caracteres."
        />
      </Counter>

      <div>
        <label htmlFor={id("meta_keywords")} className="label-field">
          Palavras-chave (separadas por vírgula)
        </label>
        <input
          id={id("meta_keywords")}
          className="input-field"
          value={metaKeywords}
          onChange={(e) => setMetaKeywords(e.target.value)}
          placeholder="transferência de tecnologia, propriedade intelectual, patentes"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="text-xs font-semibold text-navy-600 underline decoration-gold-500 underline-offset-2 hover:text-navy-900"
      >
        {showAdvanced ? "Ocultar" : "Editar"} Open Graph (compartilhamento em redes sociais)
      </button>

      {showAdvanced && (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor={id("og_title")} className="label-field">
              OG Title
            </label>
            <input
              id={id("og_title")}
              className="input-field"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              placeholder="Título para redes sociais"
            />
          </div>
          <div>
            <span className="label-field">OG Image</span>
            <div className="flex items-center gap-3">
              {/* Miniatura da imagem já enviada (ou placeholder). */}
              <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-sm border border-navy-800/15 bg-white">
                {ogImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ogImage} alt="Prévia da imagem Open Graph" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-navy-400">
                    Sem imagem
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                {/* Botão de upload: abre o seletor de arquivo e envia ao Storage. */}
                <label
                  htmlFor={id("og_image_file")}
                  className="btn-ghost inline-flex cursor-pointer items-center text-sm"
                  aria-disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="mr-1.5 h-4 w-4" />
                  )}
                  {uploading ? "Enviando…" : ogImage ? "Trocar imagem" : "Enviar imagem"}
                </label>
                <input
                  ref={ogFileRef}
                  id={id("og_image_file")}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  disabled={uploading}
                  onChange={async (e) => {
                    await onPickOgImage(e.target.files?.[0]);
                    // Permite reenviar o mesmo arquivo, se necessário.
                    e.target.value = "";
                  }}
                />

                {ogImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setOgImage("");
                      setOgError("");
                      if (ogFileRef.current) ogFileRef.current.value = "";
                    }}
                    className="ml-3 inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Remover
                  </button>
                )}

                <p className="mt-1 text-[11px] text-navy-400">
                  PNG/JPG/WEBP, até 5 MB. Recomendado 1200×630 px.
                </p>
                {ogError && <p className="mt-1 text-[11px] text-red-600">{ogError}</p>}
              </div>
            </div>

            {/* URL final enviada ao servidor (somente leitura). */}
            <input type="hidden" name="seo_og_image" value={ogImage} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor={id("og_description")} className="label-field">
              OG Description
            </label>
            <textarea
              id={id("og_description")}
              className="input-field"
              rows={2}
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              placeholder="Descrição para redes sociais"
            />
          </div>
        </div>
      )}

      {/* Pré-visualização do resultado no Google */}
      <div className="rounded-md border border-navy-800/10 bg-white p-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-navy-400">
          Pré-visualização no Google
        </p>
        <p className="truncate text-xs text-emerald-700">{url}</p>
        <p className="mt-0.5 truncate text-base text-[#1a0dab]">{serpTitle}</p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-navy-600">
          {serpDescription}
        </p>
      </div>

      {/* Campos enviados ao servidor (hidden, nomes canônicos) */}
      <input type="hidden" name="seo_meta_title" value={metaTitle} />
      <input type="hidden" name="seo_meta_description" value={metaDescription} />
      <input type="hidden" name="seo_meta_keywords" value={metaKeywords} />
      <input type="hidden" name="seo_og_title" value={ogTitle} />
      <input type="hidden" name="seo_og_description" value={ogDescription} />
      {/* seo_og_image é emitido junto do bloco de upload acima. */}
    </section>
  );
}

/** Rótulo do campo com contador de caracteres colorido pelo limite. */
function Counter({
  label,
  value,
  max,
  htmlFor,
  children
}: {
  label: string;
  value: string;
  max: number;
  htmlFor: string;
  children: React.ReactNode;
}) {
  const len = value.length;
  const tone = useMemo(() => {
    if (len === 0) return "text-navy-400";
    if (len > max) return "text-red-600 font-semibold";
    if (len > max * 0.9) return "text-amber-600 font-semibold";
    return "text-emerald-600 font-semibold";
  }, [len, max]);

  return (
    <div>
      <div className="flex items-end justify-between">
        <label htmlFor={htmlFor} className="label-field">
          {label}
        </label>
        <span className={`mb-1 text-[11px] ${tone}`}>
          {len}/{max}
        </span>
      </div>
      {children}
    </div>
  );
}

function sourceLabel(source: NonNullable<SeoMetadata["source"]>): string {
  if (source === "ai") return "Último preenchimento: gerado pelo DeepSeek.";
  if (source === "manual") return "Último preenchimento: edição manual.";
  return "Último preenchimento: automático.";
}
