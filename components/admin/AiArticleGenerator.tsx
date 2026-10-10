"use client";

import { useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

import ArticleForm from "@/components/admin/ArticleForm";
import { generateArticleDraftAction } from "@/server/ai-content-admin";
import { ARTICLE_CATEGORY_LIST } from "@/lib/constants";
import type { ArticleDraft } from "@/lib/deepseek-article";

/**
 * Gerador de conteúdo com IA (DeepSeek).
 * ---------------------------------------------------------------------------
 * Fluxo:
 *   1) O usuário informa um tema (opcional) e/ou categoria;
 *   2) "Gerar artigo com IA" chama a Server Action, que:
 *        - pesquisa/define um tema recente do nicho (PI, inovação, patentes,
 *          transferência de tecnologia);
 *        - redige o artigo (H2/H3, intro, desenvolvimento, conclusão);
 *        - gera o SEO interno (meta título/descrição/keywords);
 *        - gera a imagem de capa adaptada ao tema;
 *   3) O resultado pré-preenche o ArticleForm — TUDO editável — e o admin
 *      revisa e publica pelo fluxo normal.
 */
export default function AiArticleGenerator() {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [audience, setAudience] = useState("");
  const [withCover, setWithCover] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [draft, setDraft] = useState<ArticleDraft | null>(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [note, setNote] = useState<{ kind: "ok" | "warn"; text: string } | null>(null);

  async function generate() {
    setErr("");
    setNote(null);
    setBusy(true);
    try {
      const r = await generateArticleDraftAction({
        topic,
        category: category || undefined,
        audience,
        generateCover: withCover
      });
      if (!r.ok) {
        setErr(r.error);
        return;
      }
      // Injeta a capa no seo.og_image do rascunho para o form partir com ela.
      const withCoverDraft: ArticleDraft = {
        ...r.draft,
        seo: { ...r.draft.seo, og_image: r.coverUrl || r.draft.seo.og_image }
      };
      setDraft(withCoverDraft);
      setCoverUrl(r.coverUrl);
      if (r.deduplicated) {
        setNote({
          kind: "warn",
          text: `O tema gerado já existia em "${r.duplicateOf ?? "outro artigo"}". O título foi ajustado automaticamente para "${r.draft.title}" — revise antes de publicar.`
        });
      } else {
        setNote({
          kind: r.fromAi ? "ok" : "warn",
          text: r.fromAi
            ? "Conteúdo, SEO e capa gerados pela IA. Revise e ajuste antes de publicar."
            : r.warning ?? "Conteúdo gerado localmente (IA indisponível)."
        });
      }
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Falha ao gerar o conteúdo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Painel de geração */}
      <section className="card space-y-4 p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-gold-500/15 text-gold-700">
            <Wand2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-navy-900">
              Gerar conteúdo com IA
            </h2>
            <p className="text-xs text-navy-500">
              A IA busca tendências recentes de PI, patentes e transferência de tecnologia e
              redige o artigo completo (com SEO e capa) em <strong>português do Brasil</strong>.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="label-field">Tema / ideia (opcional)</span>
            <input
              className="input-field"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Deixe vazio para a IA escolher uma tendência atual (ex.: patenteabilidade de IA, licenciamento, NDA em P&D)"
            />
          </label>
          <label className="block">
            <span className="label-field">Categoria</span>
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">A IA decide</option>
              {ARTICLE_CATEGORY_LIST.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label-field">Público-alvo / tom (opcional)</span>
            <input
              className="input-field"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="ex.: gestores de inovação, pesquisadores, startups"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-navy-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-navy-800"
            checked={withCover}
            onChange={(e) => setWithCover(e.target.checked)}
          />
          Gerar também a imagem de capa
        </label>

        {err && (
          <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </p>
        )}
        {note && (
          <p
            className={`rounded-sm border p-3 text-sm ${
              note.kind === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {note.text}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={generate} disabled={busy} className="btn-primary">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "Gerando conteúdo…" : "Gerar artigo com IA"}
          </button>
          {draft && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setDraft(null);
                setCoverUrl("");
                setNote(null);
              }}
            >
              Limpar
            </button>
          )}
        </div>
      </section>

      {/* Rascunho editável (reutiliza o formulário completo de artigo) */}
      {draft && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-navy-900">
              Rascunho gerado (revise e publique)
            </h2>
            {coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt="Capa gerada pela IA"
                className="hidden h-14 w-24 rounded-sm border border-navy-800/10 object-cover sm:block"
              />
            )}
          </div>
          <div className="card p-6">
            <ArticleForm initial={draft} />
          </div>
        </section>
      )}
    </div>
  );
}
