"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Save, Trash } from "lucide-react";

import { createArticle, updateArticleAction, uploadCover } from "@/server/admin";
import { ARTICLE_CATEGORY_LIST, COVER_BUCKET } from "@/lib/constants";
import type { Article } from "@/lib/types";

export default function ArticleForm({
  article,
  isEditing = false
}: {
  article?: Article;
  isEditing?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string>(article?.cover_image_url ?? "");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadCover(file);
      if (url) setCoverUrl(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Falha no upload da imagem.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    setSaving(true);
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    fd.set("cover_image_url", coverUrl);
    try {
      const r =
        isEditing && article
          ? await updateArticleAction(article.id, fd)
          : await createArticle(fd);
      if (r && !r.ok) setError(r.error);
      else router.refresh();
    } catch {
      setError("Falha ao salvar o conteúdo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
      {error && (
        <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Capa (upload via Server Action) */}
      <section className="rounded-md border border-navy-800/10 p-4">
        <p className="label-field">Capa do artigo (imagem)</p>
        <div className="flex flex-wrap items-start gap-4">
          <input type="hidden" name="cover_image_url" value={coverUrl} />
          <div className="relative h-32 w-52 shrink-0 overflow-hidden rounded-md border border-navy-800/10 bg-navy-800/5">
            {coverUrl ? (
              <Image src={coverUrl} alt="Capa" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full items-center justify-center text-navy-300">Sem imagem</div>
            )}
          </div>
          <div>
            <label htmlFor="cover_file" className="btn-ghost inline-flex cursor-pointer items-center gap-2 !py-2 text-sm">
              {uploading ? (<Loader2 className="h-4 w-4 animate-spin" />) : (<ImagePlus className="h-4 w-4" />)}
              {uploading ? "Enviando…" : coverUrl ? "Trocar imagem" : "Enviar imagem"}
            </label>
            <input id="cover_file" type="file" accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange} className="hidden" />
            {coverUrl && (
              <button type="button" className="mt-2 flex items-center gap-1 text-xs text-red-600 hover:underline"
                onClick={() => setCoverUrl("")}>
                <Trash className="h-3.5 w-3.5" /> remover capa
              </button>
            )}
            <p className="mt-2 max-w-xs text-[11px] text-navy-400">
              PNG, JPG ou WEBP até 5 MB. Bucket: {COVER_BUCKET}.
            </p>
          </div>
        </div>
      </section>

      {/* Título / slug / categoria */}
      <div className="md:col-span-2">
        <label htmlFor="title" className="label-field">Título *</label>
        <input id="title" name="title" required className="input-field"
          defaultValue={article?.title ?? ""} placeholder="Título do conteúdo" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="slug" className="label-field">Slug (URL)</label>
          <input id="slug" name="slug" className="input-field"
            defaultValue={article?.slug ?? ""} placeholder="Vazio gera automaticamente" />
        </div>
        <div>
          <label htmlFor="category" className="label-field">Categoria</label>
          <select id="category" name="category" className="input-field"
            defaultValue={article?.category ?? "transferencia-de-tecnologia"}>
            {ARTICLE_CATEGORY_LIST.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="author" className="label-field">Autor</label>
          <input id="author" name="author" className="input-field"
            defaultValue={article?.author ?? "Bianca Martins"} />
        </div>
        <div>
          <label htmlFor="is_published_label" className="label-field">Status</label>
          <div className="flex h-[46px] items-center gap-2">
            <input id="is_published" name="is_published" type="checkbox" className="h-4 w-4 accent-navy-800"
              defaultChecked={article ? article.is_published : true} />
            <label htmlFor="is_published" className="cursor-pointer text-sm text-navy-700">
              Publicado (visível no site)
            </label>
          </div>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="summary" className="label-field">Resumo (descrição)</label>
          <textarea id="summary" name="summary" rows={3} className="input-field"
            defaultValue={article?.summary ?? ""} placeholder="Breve resumo exibido nos cards" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="content" className="label-field">Corpo do conteúdo (Markdown)</label>
          <textarea id="content" name="content" rows={14} className="input-field font-mono text-sm"
            defaultValue={article?.content ?? ""} placeholder={markdownHint} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving || uploading} className="btn-primary">
          <Save className="h-4 w-4" /> {saving ? "Salvando…" : isEditing ? "Salvar alterações" : "Publicar conteúdo"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">Cancelar</button>
      </div>
    </form>
  );
}

const markdownHint =
  "# Título\n" +
  "\n" +
  "Parágrafo de introdução…\n" +
  "\n" +
  "Lista de tópicos:\n" +
  "\n" +
  "- Primeiro item\n" +
  "- Segundo item\n" +
  "\n" +
  "> Citação destacada\n";

