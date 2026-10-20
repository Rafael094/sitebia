"use server";

import { revalidatePath } from "next/cache";

import { slugify } from "@/lib/utils";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/server/auth";

export type CategoryActionResult =
  | { ok: true }
  | { ok: false; error: string };

interface CategoryInput {
  label: string;
  slug: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

function readInput(formData: FormData): CategoryInput | { error: string } {
  const label = String(formData.get("label") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const order = Number(formData.get("order_index") ?? 0);
  const is_active = formData.get("is_active") === "on";

  if (!label) return { error: "Informe o nome da categoria." };

  const slug = slugify(rawSlug || label);
  if (!slug) return { error: "Informe um identificador válido para a categoria." };

  return {
    label,
    slug,
    description,
    order_index: Number.isFinite(order) ? Math.trunc(order) : 0,
    is_active
  };
}

function revalidateCategories() {
  // O layout cobre o site inteiro; os caminhos explícitos ajudam o painel.
  revalidatePath("/", "layout");
  revalidatePath("/conteudos");
  revalidatePath("/admin/conteudos");
  revalidatePath("/admin/conteudos/categorias");
}

async function requireSession(): Promise<CategoryActionResult | null> {
  const user = await getCurrentUser().catch(() => null);
  if (!user) {
    return { ok: false, error: "Sessão expirada. Entre novamente no painel." };
  }
  return null;
}

/** Cria uma nova categoria de conteúdo. */
export async function createArticleCategory(
  formData: FormData
): Promise<CategoryActionResult> {
  const denied = await requireSession();
  if (denied) return denied;

  const input = readInput(formData);
  if ("error" in input) return { ok: false, error: input.error };

  try {
    const admin = getAdminSupabaseClient();

    const duplicate = await admin
      .from("article_categories")
      .select("id")
      .eq("slug", input.slug)
      .maybeSingle();
    if (duplicate.error) throw new Error(duplicate.error.message);
    if (duplicate.data) {
      return {
        ok: false,
        error: "Já existe uma categoria com este identificador. Escolha outro slug."
      };
    }

    const { error } = await admin
      .from("article_categories")
      .insert(input as never);
    if (error) return { ok: false, error: error.message };

    revalidateCategories();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Não foi possível criar a categoria."
    };
  }
}

/** Atualiza uma categoria existente (inclusive o slug, com cascata nos artigos). */
export async function updateArticleCategoryAction(
  id: string,
  formData: FormData
): Promise<CategoryActionResult> {
  const denied = await requireSession();
  if (denied) return denied;

  const input = readInput(formData);
  if ("error" in input) return { ok: false, error: input.error };

  try {
    const admin = getAdminSupabaseClient();

    const current = await admin
      .from("article_categories")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle();
    if (current.error) throw new Error(current.error.message);
    if (!current.data) {
      return { ok: false, error: "Categoria não encontrada. Atualize a página." };
    }

    const duplicate = await admin
      .from("article_categories")
      .select("id")
      .eq("slug", input.slug)
      .neq("id", id)
      .maybeSingle();
    if (duplicate.error) throw new Error(duplicate.error.message);
    if (duplicate.data) {
      return {
        ok: false,
        error: "Já existe outra categoria com este identificador. Escolha outro slug."
      };
    }

    const { error } = await admin
      .from("article_categories")
      .update(input as never)
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    // Se a FK com ON UPDATE CASCADE ainda não existir, mantém os artigos
    // sincronizados manualmente com o novo slug.
    const oldSlug = String((current.data as { slug?: string }).slug ?? "");
    if (oldSlug && oldSlug !== input.slug) {
      await admin
        .from("articles")
        .update({ category: input.slug } as never)
        .eq("category", oldSlug);
    }

    revalidateCategories();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Não foi possível atualizar a categoria."
    };
  }
}

/** Ativa/desativa uma categoria (não apaga artigos). */
export async function toggleArticleCategoryActiveAction(
  id: string,
  isActive: boolean
): Promise<CategoryActionResult> {
  const denied = await requireSession();
  if (denied) return denied;

  try {
    const admin = getAdminSupabaseClient();
    const { error } = await admin
      .from("article_categories")
      .update({ is_active: Boolean(isActive) } as never)
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidateCategories();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Não foi possível alterar a categoria."
    };
  }
}

/** Remove uma categoria sem artigos vinculados. */
export async function deleteArticleCategoryAction(
  id: string
): Promise<CategoryActionResult> {
  const denied = await requireSession();
  if (denied) return denied;

  try {
    const admin = getAdminSupabaseClient();

    const current = await admin
      .from("article_categories")
      .select("id, slug, label")
      .eq("id", id)
      .maybeSingle();
    if (current.error) throw new Error(current.error.message);
    if (!current.data) {
      return { ok: false, error: "Categoria não encontrada. Atualize a página." };
    }

    const slug = String((current.data as { slug?: string }).slug ?? "");
    const linked = await admin
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("category", slug);
    if (linked.error) throw new Error(linked.error.message);
    if ((linked.count ?? 0) > 0) {
      return {
        ok: false,
        error:
          "Esta categoria ainda possui conteúdos. Mova-os para outra categoria antes de excluir."
      };
    }

    const total = await admin
      .from("article_categories")
      .select("id", { count: "exact", head: true });
    if (total.error) throw new Error(total.error.message);
    if ((total.count ?? 0) <= 1) {
      return {
        ok: false,
        error: "Mantenha ao menos uma categoria cadastrada para os conteúdos."
      };
    }

    const { error } = await admin.from("article_categories").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidateCategories();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Não foi possível excluir a categoria."
    };
  }
}
