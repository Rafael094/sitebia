"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bold, ImagePlus, Italic, List, Quote, Save } from "lucide-react";
import RichText from "@/components/ui/RichText";
import { createArticle, updateArticleAction, uploadCover } from "@/server/admin";
import { ARTICLE_CATEGORY_LIST } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import type { Article } from "@/lib/types";

export default function ArticleForm({ article, isEditing = false }: { article?: Article; isEditing?: boolean }) {
  const router = useRouter();
  const f = useRef<HTMLFormElement>(null);
  const titleR = useRef<HTMLInputElement>(null);
  const slugR = useRef<HTMLInputElement>(null);
  const sumR = useRef<HTMLTextAreaElement>(null);
  const bodyR = useRef<HTMLTextAreaElement>(null);
  const [coverUrl, setCoverUrl] = useState(article?.cover_image_url ?? "");
  const [slugLock, setSlugLock] = useState(!!article?.slug);
  const [body, setBody] = useState(article?.content ?? "");
  const [view, setView] = useState<"edit" | "pre">("edit");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onTitle = () => {
    if (!slugLock && slugR.current && titleR.current) slugR.current.value = slugify(titleR.current.value);
  };
  const md = (before?: string, after?: string) => {
    const t = bodyR.current; if (!t) return;
    const { selectionStart: s, selectionEnd: e, value } = t;
    const sel = value.slice(s, e) || "texto";
    setBody(value.slice(0, s) + (before || "") + sel + (after === undefined ? before || "" : after) + value.slice(e));
  };
  const mdLine = (p: string) => {
    const t = bodyR.current; if (!t) return;
    const { selectionStart: s, value } = t;
    setBody(value.slice(0, Math.max(s, 0)) + "\n" + p + value.slice(s));
  };
  const metaOut = () =>
    (sumR.current?.value || "").trim().slice(0, 158) ||
    (titleR.current?.value || "").slice(0, 158);

  async function submit() {
    const fd = new FormData(f.current!);
    fd.set("content", body);
    fd.set("slug", fd.get("slug")?.toString().trim() || slugify(titleR.current?.value || ""));
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
      <section className="flex flex-wrap items-center gap-5 rounded-md border border-navy-800/10 p-4">
        <div className="relative h-32 w-52 overflow-hidden rounded-md border border-navy-800/10 bg-navy-800/10">
          {coverUrl ? <Image src={coverUrl} alt="Capa" fill className="object-cover" unoptimized /> : <span className="flex h-full items-center justify-center text-sm text-navy-400">Sem capa</span>}
        </div>
        <div>
          <label className="btn-ghost inline-flex cursor-pointer text-sm"><ImagePlus className="mr-1.5 h-4 w-4" />{coverUrl ? "Trocar" : "Adicionar"} capa</label>
          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { const u = await uploadCover(file); if (u) setCoverUrl(u); } catch (x) { setErr(x instanceof Error ? x.message : "Erro na imagem."); } }} />
          {coverUrl && <button type="button" onClick={() => setCoverUrl("")} className="mt-1 block text-xs text-red-600">remover</button>}
        </div>
      </section>
      <p><L t="Título *" /><input name="title" required className="input-field" ref={titleR} onChange={onTitle} defaultValue={article?.title} placeholder="Título do conteúdo" /></p>
      <p><L t="Slug (URL)" /><input name="slug" className="input-field" ref={slugR} onChange={() => setSlugLock(true)} defaultValue={article?.slug} /></p>
      <p><L t="Categoria" /><select name="category" className="input-field" defaultValue={article?.category ?? "transferencia-de-tecnologia"}>{ARTICLE_CATEGORY_LIST.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></p>
      <p><L t="Autor" /><input name="author" className="input-field" defaultValue={article?.author ?? "Bianca Martins"} /></p>
      <p className="flex items-center gap-2"><input name="is_published" type="checkbox" className="h-4 w-4 accent-navy-800" defaultChecked={article ? article.is_published : true} /><label className="text-sm text-navy-700">Publicado</label></p>
      <p><L t="Resumo (descrição curta)" /><textarea name="summary" rows={2} className="input-field" ref={sumR} defaultValue={article?.summary} /></p>
      <p><L t="Meta description (SEO)" /><textarea name="meta_description" rows={1} maxLength={160} className="input-field" defaultValue={article?.meta_description} /></p>
      <div>
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-navy-600">Corpo (Markdown)</span>
        <div className="mb-1 flex flex-wrap items-center gap-0.5 rounded-sm border border-navy-800/10 bg-ivory-50 px-1 py-1">
          <button type="button" onClick={() => md("**")} title="Negrito" className="rounded px-2 py-1 text-navy-700 hover:bg-gold-500/20"><Bold className="h-4 w-4" /></button>
          <button type="button" onClick={() => md("_")} title="Itálico" className="rounded px-2 py-1 text-navy-700 hover:bg-gold-500/20"><Italic className="h-4 w-4" /></button>
          <button type="button" onClick={() => mdLine("- ")} title="Lista" className="rounded px-2 py-1 text-navy-700 hover:bg-gold-500/20"><List className="h-4 w-4" /></button>
          <button type="button" onClick={() => mdLine("> ")} title="Citação" className="rounded px-2 py-1 text-navy-700 hover:bg-gold-500/20"><Quote className="h-4 w-4" /></button>
          <button type="button" onClick={() => setView(view === "edit" ? "pre" : "edit")} className="ml-auto rounded-sm border border-navy-800/15 px-2 py-1 text-[10px] font-semibold text-navy-600 hover:bg-navy-800 hover:text-white">{view === "edit" ? "Pré-visualizar" : "Editar"}</button>
        </div>
        {view === "edit"
          ? <textarea name="content" rows={13} className="input-field font-mono text-sm" ref={bodyR} value={body} onChange={(e) => setBody(e.target.value)} placeholder="# Título&#10;parágrafo&#10;- item" />
          : <div className="rounded-sm border border-navy-800/10 bg-white p-5"><RichText content={body} /></div>}
        <p className="mt-1 text-[11px] text-navy-400">Quebras reais viram parágrafos no site.</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="btn-primary"><Save className="h-4 w-4" />{busy ? "Salvando…" : isEditing ? "Salvar alterações" : "Publicar"}</button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>Voltar</button>
      </div>
    </form>
  );
}
