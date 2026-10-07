"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Save, Sparkles } from "lucide-react";
import RichTextField from "@/components/admin/RichTextField";
import SeoFields from "@/components/admin/SeoFields";
import { createArticle, updateArticleAction, uploadCover } from "@/server/admin";
import { ARTICLE_CATEGORY_LIST } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { normalizeSeoMetadata } from "@/lib/seo-types";
import { markdownToHtml } from "@/lib/rich-html";
import type { Article } from "@/lib/types";
import type { ArticleDraft } from "@/lib/deepseek-article";
import { generateCoverAction } from "@/server/ai-content-admin";

export default function ArticleForm({
  article,
  isEditing = false,
  initial
}: {
  article?: Article;
  isEditing?: boolean;
  /** Rascunho pré-preenchido (ex.: gerado pela IA no painel). */
  initial?: ArticleDraft;
}) {
  const router = useRouter();
  const f = useRef<HTMLFormElement>(null);
  const titleR = useRef<HTMLInputElement>(null);
  const slugR = useRef<HTMLInputElement>(null);
  const sumR = useRef<HTMLTextAreaElement>(null);
  const [coverUrl, setCoverUrl] = useState(article?.cover_image_url ?? initial?.seo.og_image ?? "");
  const [slugLock, setSlugLock] = useState(!!article?.slug);
  const [body, setBody] = useState(() =>
    markdownToHtml(article?.content ?? initial?.content ?? "")
  );
  const [title, setTitle] = useState(article?.title ?? initial?.title ?? "");
  const [summary, setSummary] = useState(article?.summary ?? initial?.summary ?? "");
  const [slug, setSlug] = useState(article?.slug ?? initial?.slug ?? "");
  const [category, setCategory] = useState<string>(
    article?.category ?? initial?.category ?? "propriedade-intelectual"
  );
  const [busy, setBusy] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);
  const [err, setErr] = useState("");

  const onTitle = (v: string) => {
    setTitle(v);
    if (!slugLock) setSlug(slugify(v));
  };

  // Gera uma capa profissional adaptada ao título/categoria/tema atuais (IA + marca).
  async function genCover() {
    if (!title.trim()) {
      setErr("Informe um título antes de gerar a capa.");
      return;
    }
    setErr("");
    setCoverBusy(true);
    try {
      // Usa o título + resumo como tema (pt-BR) para orientar a geração da imagem.
      const imagePrompt = [title.trim(), String(summary ?? "").trim()]
        .filter(Boolean)
        .join(". ")
        .slice(0, 400);
      const r = await generateCoverAction({ title, category, imagePrompt });
      if (!r.ok) setErr(r.error);
      else setCoverUrl(r.url);
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Falha ao gerar a capa.");
    } finally {
      setCoverBusy(false);
    }
  }
  const metaOut = () =>
    (summary || "").trim().slice(0, 158) || (title || "").slice(0, 158);

  async function submit() {
    const fd = new FormData(f.current!);
    fd.set("content", body);
    fd.set("slug", fd.get("slug")?.toString().trim() || slugify(title));
    if (!fd.get("meta_description")?.toString().trim()) fd.set("meta_description", metaOut());
    const r = isEditing && article ? await updateArticleAction(article.id, fd) : await createArticle(fd);
    if (r && !r.ok) setErr(r.error);
    else router.refresh();
  }

  const L = ({ t }: { t: string }) => (
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-navy-600">{t}</span>
  );
  return (
    <form ref={f} onSubmit={(e) => { e.preventDefault(); setErr(""); setBusy(true); submit().then(() => setBusy(false)).catch(() => { setBusy(false); setErr("Falha ao salvar o conteúdo."); }); }} className="space-y-5">
      {err && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      <section className="rounded-md border border-navy-800/10 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="label-field mb-0">Imagem de capa</span>
            <p className="mt-1 text-xs text-navy-500">
              Envie uma imagem sua ou gere uma capa profissional com IA a partir do título e do tema.
            </p>
          </div>
          {/* Gera a capa com IA (mesma lógica do gerador automático), logo acima da imagem. */}
          <button
            type="button"
            onClick={genCover}
            disabled={coverBusy}
            className="btn-primary inline-flex items-center gap-1.5 text-sm"
            title="Cria uma capa profissional (1200×630) adaptada ao título e ao tema deste conteúdo"
          >
            <Sparkles className="h-4 w-4" />
            {coverBusy ? "Gerando capa…" : "Gerar capa por IA"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-5">
        <div className="relative aspect-cover w-52 overflow-hidden rounded-md border border-navy-800/10 bg-navy-800/10">
          {coverUrl ? <Image src={coverUrl} alt="Capa" fill className="object-cover" unoptimized /> : <span className="flex h-full items-center justify-center text-sm text-navy-400">Sem capa</span>}
        </div>
        <div>
          {/* O <label> aponta para o input (htmlFor/id) para abrir o seletor de arquivo. */}
          <label htmlFor="cover-upload" className="btn-ghost inline-flex cursor-pointer text-sm"><ImagePlus className="mr-1.5 h-4 w-4" />{coverUrl ? "Trocar" : "Adicionar"} capa</label>
          <input
            id="cover-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setErr("");
              try {
                const u = await uploadCover(file);
                if (u) setCoverUrl(u);
              } catch (x) {
                setErr(x instanceof Error ? x.message : "Erro na imagem.");
              } finally {
                // Permite reenviar o mesmo arquivo, se necessário.
                e.target.value = "";
              }
            }}
          />
          {/* Envia a URL da capa para o servidor (upsertArticle lê cover_image_url). */}
          <input type="hidden" name="cover_image_url" value={coverUrl} />
          <div className="mt-2 text-xs text-navy-500">
            {coverUrl ? "Prévia da capa atual acima." : "Nenhuma capa definida — use «Gerar capa por IA» ou envie um arquivo."}
          </div>
          {coverUrl && (
            <button type="button" onClick={() => setCoverUrl("")} className="mt-2 block text-xs text-red-600">
              Remover capa
            </button>
          )}
        </div>
        </div>
      </section>
      <p><L t="Título *" /><input name="title" required className="input-field" ref={titleR} value={title} onChange={(e) => onTitle(e.target.value)} placeholder="Título do conteúdo" /></p>
      <p><L t="Slug (URL)" /><input name="slug" className="input-field" ref={slugR} value={slug} onChange={(e) => { setSlugLock(true); setSlug(e.target.value); }} /></p>
      <p><L t="Categoria" /><select name="category" className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>{ARTICLE_CATEGORY_LIST.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></p>
      <p><L t="Autor" /><input name="author" className="input-field" defaultValue={article?.author ?? "Bianca Martins"} /></p>
      <p className="flex items-center gap-2"><input name="is_published" type="checkbox" className="h-4 w-4 accent-navy-800" defaultChecked={article ? article.is_published : true} /><label className="text-sm text-navy-700">Publicado</label></p>
      <p><L t="Resumo (descrição curta)" /><textarea name="summary" rows={2} className="input-field" ref={sumR} value={summary} onChange={(e) => setSummary(e.target.value)} /></p>
      <div>
        <RichTextField
          name="content"
          label="Corpo do conteúdo"
          value={body}
          onChange={setBody}
          hint="Editor de texto rico: títulos, negrito, listas, citações, imagens e tabelas são preservados."
          placeholder="Escreva o corpo do conteúdo…"
        />
      </div>
      <SeoFields
        initial={normalizeSeoMetadata(article?.seo_metadata)}
        title={title}
        body={[summary, body].filter(Boolean).join("\n\n")}
        kind="Artigo / Conteudo"
        context={`/conteudos/${slug || slugify(title)}`}
        idPrefix="article"
      />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="btn-primary"><Save className="h-4 w-4" />{busy ? "Salvando…" : isEditing ? "Salvar alterações" : "Publicar"}</button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>Voltar</button>
      </div>
    </form>
  );
}
