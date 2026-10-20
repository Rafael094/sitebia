"use server";

// ============================================================================
// Server Actions: Geração de conteúdo + SEO + capa com IA (DeepSeek).
// ----------------------------------------------------------------------------
// Usadas pelo painel (aba "IA & Conteúdos"). Nenhuma destas ações persiste o
// artigo: devolvem um "draft" pronto para o admin revisar/editar e só então
// salvar pelo fluxo normal (createArticle / updateArticleAction).
// ============================================================================

import { generateArticleWithAi, type ArticleDraft } from "@/lib/deepseek-article";
import { generateCoverImage } from "@/lib/cover-image";
import { keywordsPtBrToArray, normalizeSpaces } from "@/lib/ptbr";
import { slugify } from "@/lib/utils";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { categoryLabelFor } from "@/lib/article-categories";
import { getAdminActiveCategoriesSafe } from "@/lib/article-categories-data";
import { DEFAULT_ARTICLE_CATEGORIES } from "@/lib/constants";
import type { ArticleCategory, ArticleCategoryRecord } from "@/lib/types";

/** Campos aceitos no pedido de geração. */
export interface GenerateArticlePayload {
  /** Tema/ideia opcional; vazio ⇒ a IA escolhe uma tendência do nicho. */
  topic?: string;
  /** Categoria opcional (validada contra o enum). */
  category?: string;
  /** Público-alvo/tom opcional. */
  audience?: string;
  /** Quando `true`, também gera a imagem de capa (padrão: true). */
  generateCover?: boolean;
}

export type GenerateArticleResult =
  | {
      ok: true;
      draft: ArticleDraft;
      fromAi: boolean;
      warning?: string;
      /** URL da capa gerada (ou "" quando não solicitada/falhou). */
      coverUrl: string;
      coverFromExternal: boolean;
      coverWarning?: string;
      /**
       * `true` quando o título gerado colidiu com um artigo existente e foi
       * ajustado automaticamente para não duplicar o tema.
       */
      deduplicated?: boolean;
      /** Título do artigo existente que originou o ajuste (quando aplicável). */
      duplicateOf?: string;
    }
  | { ok: false; error: string };

/** Valida a categoria vinda do painel contra as categorias cadastradas. */
function coerceCategory(
  value: string | undefined,
  categories: ArticleCategoryRecord[]
): ArticleCategory | undefined {
  const raw = String(value ?? "").trim();
  if (!raw) return undefined;
  return categories.some((category) => category.slug === raw) ? raw : undefined;
}

/**
 * Carrega os títulos (e slugs) dos artigos já cadastrados — publicados ou em
 * rascunho — para servir de referência anti-duplicidade na geração.
 * Nunca lança: se o banco falhar, devolve lista vazia e a geração segue.
 */
async function loadExistingArticleTitles(): Promise<string[]> {
  try {
    const admin = getAdminSupabaseClient();
    const { data } = await admin
      .from("articles")
      .select("title, slug")
      .order("created_at", { ascending: false })
      .limit(200);
    return (data ?? [])
      .map((a) => String((a as { title?: string }).title ?? "").trim())
      .filter(Boolean);
  } catch {
    // Sem banco/chave, seguimos sem referências (a validação de duplicidade
    // ainda protege contra colisões dentro do próprio lote gerado).
    return [];
  }
}

/**
 * Gera um rascunho COMPLETO de artigo: texto (H2/H3) + SEO (meta título/
 * descrição/keywords) + capa profissional adaptada ao tema.
 * Não persiste — devolve tudo pronto para o formulário do painel.
 */
export async function generateArticleDraftAction(
  payload: GenerateArticlePayload
): Promise<GenerateArticleResult> {
  try {
    // Referência anti-duplicidade: títulos já cadastrados (publicados/rascunhos).
    const [existingTitles, categories] = await Promise.all([
      loadExistingArticleTitles(),
      getAdminActiveCategoriesSafe()
    ]);

    const { draft, fromAi, warning, duplicate } = await generateArticleWithAi({
      topic: payload?.topic,
      category: coerceCategory(payload?.category, categories),
      categories,
      audience: payload?.audience,
      existingTitles
    });

    // Garante slug e tags mesmo no caminho heurístico (tudo em pt-BR).
    const normalizedDraft: ArticleDraft = {
      ...draft,
      title: normalizeSpaces(draft.title),
      summary: normalizeSpaces(draft.summary),
      slug: draft.slug || slugify(draft.title),
      tags:
        draft.tags?.length > 0
          ? keywordsPtBrToArray(draft.tags.join(", "), 10)
          : keywordsPtBrToArray(draft.seo.meta_keywords ?? "", 10)
    };

    // Capa: gerada em paralelo ao retorno do texto (padrão: sim).
    const wantsCover = payload?.generateCover !== false;
    let coverUrl = "";
    let coverFromExternal = false;
    let coverWarning: string | undefined;

    if (wantsCover) {
      const cover = await generateCoverImage({
        title: normalizedDraft.title,
        category: normalizedDraft.category,
        imagePrompt: normalizedDraft.image_prompt
      });
      coverUrl = cover.url ?? "";
      coverFromExternal = cover.fromExternal;
      coverWarning = cover.warning;
    }

    return {
      ok: true,
      draft: normalizedDraft,
      fromAi,
      warning,
      coverUrl,
      coverFromExternal,
      coverWarning,
      deduplicated: Boolean(duplicate),
      duplicateOf: duplicate?.matchedTitle
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Falha ao gerar o conteúdo."
    };
  }
}

/**
 * Gera apenas a capa para um título/categoria já existentes (usado pelo botão
 * "Gerar capa com IA" dentro do formulário do artigo).
 */
export type GenerateCoverResult =
  | { ok: true; url: string; fromExternal: boolean }
  | { ok: false; error: string };

export async function generateCoverAction(payload: {
  title?: string;
  category?: string;
  imagePrompt?: string;
}): Promise<GenerateCoverResult> {
  const title = String(payload?.title ?? "").trim();
  if (!title) {
    return { ok: false, error: "Informe um título antes de gerar a capa." };
  }

  const categories = await getAdminActiveCategoriesSafe();
  const category =
    coerceCategory(payload?.category, categories) ??
    categories[0]?.slug ??
    DEFAULT_ARTICLE_CATEGORIES[0].slug;

  const cover = await generateCoverImage({
    title,
    category,
    categoryLabel: categoryLabelFor(category, categories),
    imagePrompt: payload?.imagePrompt
  });

  if (!cover.url) {
    return { ok: false, error: cover.warning || "Não foi possível gerar a capa." };
  }
  return { ok: true, url: cover.url, fromExternal: cover.fromExternal };
}
