"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { COVER_BUCKET } from "@/lib/constants";
import { randomId, slugify } from "@/lib/utils";
import { resolveArticleSeo } from "@/lib/seo-article";
import type { ArticleCategory } from "@/lib/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** Monta a URL publica de um objeto do Storage. */
export async function getPublicStorageUrl(folder: string, fileName: string): Promise<string> {
  return `${url}/storage/v1/object/public/${COVER_BUCKET}/${folder}/${fileName}`;
}

// ===========================================================================
// SERVICES (CRUD)
// ===========================================================================
async function upsertService(formData: FormData, id?: string) {
  const title = String(formData.get("title") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const summary = String(formData.get("summary") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const audience = String(formData.get("audience") ?? "").trim();
  const problems = String(formData.get("problems") ?? "").trim();
  const scope = String(formData.get("scope") ?? "").trim();
  const icon = String(formData.get("icon") ?? "briefcase").trim();
  const orderIndex = Number(formData.get("order_index") ?? 0) || 0;
  const isActive = formData.get("is_active") === "on";

  if (!title) return { ok: false, error: "Informe o título do serviço." };

  const admin = getAdminSupabaseClient();
  const payload = {
    title,
    slug,
    summary,
    description,
    audience,
    problems,
    scope,
    icon,
    order_index: orderIndex,
    is_active: isActive
  };

  const { error } = id
    ? await admin
        .from("services")
        .update(payload as never as never)
        .eq("id", id)
    : await admin.from("services").insert(payload as never as never[]);

  if (!error) {
    revalidatePath("/", "layout");
    redirect("/admin/servicos");
  }
  return { ok: false, error: error.message };
}

export async function createService(formData: FormData) {
  return upsertService(formData);
}

export async function updateServiceAction(id: string, formData: FormData) {
  return upsertService(formData, id);
}

export async function deleteService(id: string) {
  const admin = getAdminSupabaseClient();
  const { error } = await admin.from("services").delete().eq("id", id);
  if (!error) {
    revalidatePath("/", "layout");
    redirect("/admin/servicos");
  }
  throw new Error(error?.message || "Erro ao remover serviço");
}

// ===========================================================================
// ARTICLES (CRUD)
// ===========================================================================
async function upsertArticle(formData: FormData, id?: string) {
  const title = String(formData.get("title") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const category = String(formData.get("category") ?? "") as ArticleCategory;
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const author = String(formData.get("author") ?? "Bianca Martins").trim();
  const isPublished = formData.get("is_published") === "on";
  // Imagem no próprio dado (form hidden atualizado via upload assíncrono).
  const coverImageUrl = String(formData.get("cover_image_url") ?? "").trim();
  // Correção: evita dupla proteção de quebras (\\n virando texto literal).
  const contentClean = String(content).replace(/\\\\r?\\\\n/g, "\n");
  const seo = resolveArticleSeo({
    title,
    summary,
    content: contentClean,
    category,
    metaDescription: String(formData.get("meta_description") ?? "").trim(),
    tags: String(formData.get("tags") ?? "").trim()
  });

  const admin = getAdminSupabaseClient();
  const payload = {
    title,
    slug,
    category,
    summary,
    content: contentClean,
    meta_description: seo.metaDescription,
    tags: seo.tags,
    cover_image_url: coverImageUrl,
    is_published: isPublished,
    author
  };

  const { error } = id
    ? await admin
        .from("articles")
        .update(payload as never as never)
        .eq("id", id)
    : await admin.from("articles").insert(payload as never as never[]);

  if (!error) {
    revalidatePath("/", "layout");
    redirect("/admin/conteudos");
  }
  return { ok: false, error: error.message };
}

export async function createArticle(formData: FormData) {
  return upsertArticle(formData);
}

export async function updateArticleAction(id: string, formData: FormData) {
  return upsertArticle(formData, id);
}

export async function deleteArticle(id: string) {
  const admin = getAdminSupabaseClient();
  const { error } = await admin.from("articles").delete().eq("id", id);
  if (!error) {
    revalidatePath("/", "layout");
    redirect("/admin/conteudos");
  }
  throw new Error(error?.message || "Erro ao remover artigo");
}

// ===========================================================================
// STORAGE (upload da capa)
// ===========================================================================
export async function uploadCover(rawFile: File) {
  if (!rawFile || rawFile.size === 0) {
    return null;
  }
  if (rawFile.size > 5 * 1024 * 1024) {
    throw new Error("A imagem deve ter no máximo 5 MB.");
  }

  const bytes = Buffer.from(await rawFile.arrayBuffer());
  const ext = (rawFile.name.split(".").pop() || "png").toLowerCase();
  const folder = `covers-${new Date().toISOString().slice(0, 7)}`;
  const fileName = `${Date.now()}-${randomId(8)}.${ext}`;

  const admin = getAdminSupabaseClient();
  const { error } = await admin.storage
    .from(COVER_BUCKET)
    .upload(`${folder}/${fileName}`, bytes, { contentType: rawFile.type });

  if (error) throw new Error(error.message);
  return getPublicStorageUrl(folder, fileName);
}




