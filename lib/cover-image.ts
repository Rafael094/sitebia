// ============================================================================
// Geração AUTOMÁTICA da imagem de capa dos artigos.
// ----------------------------------------------------------------------------
// Estratégia (auto-suficiente, sem custo e sem chave extra):
//   1) Se IMAGE_GEN_API_URL estiver definido, tenta primeiro a API externa de
//      geração de imagens (retorna binário/URL) — "plugável" para o futuro;
//   2) Caso contrário (ou se falhar), renderiza uma capa profissional e 100%
//      adaptada ao tema usando a identidade da marca (navy + dourado) via
//      `next/og` (ImageResponse) e envia para o Supabase Storage.
//
// O resultado é sempre uma URL pública do bucket de capas (ou `null` em erro),
// no mesmo formato usado pelo upload manual de capa (server/admin.ts).
// ============================================================================

import { ImageResponse } from "next/og";
import React from "react";

import { COVER_BUCKET, ARTICLE_CATEGORIES } from "@/lib/constants";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { randomId } from "@/lib/utils";
import type { ArticleCategory } from "@/lib/types";

const NAVY_800 = "#0D1B2A";
const NAVY_900 = "#0a1520";
const GOLD_500 = "#C5A059";
const GOLD_300 = "#ddbd7a";
const IVORY_100 = "#FAF8F5";

export interface CoverGenInput {
  /** Título do artigo (aparece na capa e define o tema). */
  title: string;
  /** Categoria — define o eyebrow exibido na capa. */
  category: ArticleCategory;
  /** Descrição (pt-BR) do tema sugerida pela IA (usada pela API externa). */
  imagePrompt?: string;
}

export interface CoverGenResult {
  /** URL pública da imagem (ou `null` se não foi possível gerar). */
  url: string | null;
  /** Origem da imagem efetivamente usada. */
  fromExternal: boolean;
  warning?: string;
}

/** Sanitiza o texto exibido na capa (pt-BR, sem Markdown/aspas/rótulos de idioma). */
function sanitizeCoverText(value: string): string {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ") // remove HTML
    .replace(/[*_`#>~]/g, " ") // remove Markdown
    .replace(/^\s*(title|summary|description|introduction|conclusion)\s*:\s*/i, "")
    .replace(/["“”'’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Corta o título em até `max` caracteres respeitando palavras (texto já limpo). */
function truncateTitle(title: string, max = 92): string {
  const t = sanitizeCoverText(title);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trim()}…`;
}

/** Envia um buffer PNG para o bucket de capas e devolve a URL pública. */
async function uploadCoverBuffer(bytes: Buffer): Promise<string> {
  const folder = `ai-${new Date().toISOString().slice(0, 7)}`;
  const fileName = `${Date.now()}-${randomId(8)}.png`;
  const admin = getAdminSupabaseClient();
  const { error } = await admin.storage
    .from(COVER_BUCKET)
    .upload(`${folder}/${fileName}`, bytes, { contentType: "image/png", upsert: false });
  if (error) throw new Error(error.message);
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${COVER_BUCKET}/${folder}/${fileName}`;
}

/**
 * Desenha a capa de marca com `next/og`. 1200×630 (proporção Open Graph,
 * adequada ao `aspect-[16/7]` da página do artigo).
 */
function renderBrandedCover(input: CoverGenInput): ImageResponse {
  const categoryLabel = ARTICLE_CATEGORIES[input.category]?.label ?? "Conteúdos";
  const title = truncateTitle(input.title);

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          padding: "68px 72px",
          backgroundColor: NAVY_800,
          backgroundImage: `linear-gradient(135deg, ${NAVY_900} 0%, ${NAVY_800} 55%, #14283d 100%)`,
          fontFamily: "sans-serif",
          color: IVORY_100
        }
      },
      // Moldura dourada interna
      React.createElement("div", {
        style: {
          position: "absolute",
          top: 26,
          left: 26,
          right: 26,
          bottom: 26,
          border: `1px solid ${GOLD_500}`,
          opacity: 0.35,
          display: "flex"
        }
      }),
      // Círculos decorativos (motivo de rede/tecnologia)
      React.createElement("div", {
        style: {
          position: "absolute",
          top: -120,
          right: -100,
          width: 380,
          height: 380,
          borderRadius: 380,
          border: `2px solid ${GOLD_500}`,
          opacity: 0.25,
          display: "flex"
        }
      }),
      React.createElement("div", {
        style: {
          position: "absolute",
          top: 40,
          right: 40,
          width: 190,
          height: 190,
          borderRadius: 190,
          border: `2px solid ${GOLD_300}`,
          opacity: 0.18,
          display: "flex"
        }
      }),
      // Topo: eyebrow + marca
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2 } },
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: GOLD_300
            }
          },
          React.createElement("div", { style: { width: 40, height: 2, backgroundColor: GOLD_500, display: "flex" } }),
          categoryLabel
        ),
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "baseline", gap: 12, fontSize: 30, fontWeight: 700, letterSpacing: 3, color: IVORY_100 } },
          "BIANCA",
          React.createElement("span", { style: { color: GOLD_500 } }, "MARTINS")
        )
      ),
      // Título
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            zIndex: 2,
            fontSize: title.length > 62 ? 64 : 76,
            fontWeight: 700,
            lineHeight: 1.12,
            maxWidth: 960,
            color: IVORY_100
          }
        },
        title
      ),
      // Rodapé
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 2,
            fontSize: 22,
            color: "rgba(250,248,245,0.72)"
          }
        },
        React.createElement("span", null, "Transferência de Tecnologia & Propriedade Intelectual"),
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, color: GOLD_300 } },
          React.createElement("div", { style: { width: 26, height: 2, backgroundColor: GOLD_500, display: "flex" } }),
          "/conteudos"
        )
      )
    ),
    { width: 1200, height: 630 }
  );
}

// ============================================================================
// Provedor externo OPCIONAL (plugável). Ative definindo IMAGE_GEN_API_URL.
// Contrato esperado: recebe { prompt, size } e devolve binário de imagem OU
// JSON com { url } / { data:[{url}] } / { b64_json }.
// ============================================================================
interface ExternalImageResponse {
  url?: string;
  data?: { url?: string }[];
  b64_json?: string;
  image?: string;
}

async function tryExternalImage(input: CoverGenInput): Promise<string | null> {
  const endpoint = process.env.IMAGE_GEN_API_URL?.trim();
  if (!endpoint) return null;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.IMAGE_GEN_API_KEY
          ? { Authorization: `Bearer ${process.env.IMAGE_GEN_API_KEY}` }
          : {})
      },
      body: JSON.stringify({
        prompt: input.imagePrompt || input.title,
        size: "1200x630"
      }),
      cache: "no-store"
    });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    // Caso 1: a API devolve a imagem em binário direto.
    if (contentType.startsWith("image/")) {
      const buffer = Buffer.from(await res.arrayBuffer());
      return await uploadCoverBuffer(buffer);
    }
    // Caso 2: a API devolve JSON com URL/base64.
    const json = (await res.json()) as ExternalImageResponse;
    const url = json.url || json.data?.[0]?.url || json.image;
    if (url) return url;
    const b64 = json.b64_json;
    if (b64) return await uploadCoverBuffer(Buffer.from(b64, "base64"));
    return null;
  } catch {
    return null;
  }
}

/**
 * Gera a capa do artigo (externa, se configurada; senão, capa de marca).
 * Nunca lança: em falha devolve `{ url: null }` com aviso.
 */
export async function generateCoverImage(input: CoverGenInput): Promise<CoverGenResult> {
  // 1) Provedor externo (se configurado).
  const external = await tryExternalImage(input);
  if (external) {
    return { url: external, fromExternal: true };
  }

  // 2) Capa de marca renderizada no servidor (sempre disponível).
  try {
    const response = renderBrandedCover(input);
    const buffer = Buffer.from(await response.arrayBuffer());
    const url = await uploadCoverBuffer(buffer);
    return { url, fromExternal: false };
  } catch (error) {
    return {
      url: null,
      fromExternal: false,
      warning: error instanceof Error ? error.message : "Falha ao gerar a capa."
    };
  }
}


