"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Plus, Save, Tags, Trash2, X } from "lucide-react";

import {
  createArticleCategory,
  deleteArticleCategoryAction,
  toggleArticleCategoryActiveAction,
  updateArticleCategoryAction
} from "@/server/article-categories";
import { cn } from "@/lib/utils";
import type { ArticleCategoryRecord } from "@/lib/types";

type Props = {
  categories: ArticleCategoryRecord[];
  /** Quantidade de artigos por slug de categoria. */
  counts: Record<string, number>;
  /** `false` enquanto a migração v10 não foi executada no Supabase. */
  available: boolean;
  loadError?: string;
};

type Feedback = { kind: "ok" | "error"; text: string } | null;

export default function ArticleCategoriesManager({
  categories,
  counts,
  available,
  loadError
}: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const nextOrder =
    categories.reduce((max, category) => Math.max(max, category.order_index ?? 0), 0) + 10;

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setBusy("create");
    setFeedback(null);
    const result = await createArticleCategory(formData);
    setBusy(null);

    if (!result.ok) {
      setFeedback({ kind: "error", text: result.error });
      return;
    }

    form.reset();
    setShowCreate(false);
    setFeedback({ kind: "ok", text: "Categoria criada com sucesso." });
    router.refresh();
  }

  async function handleUpdate(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setBusy(`edit-${id}`);
    setFeedback(null);
    const result = await updateArticleCategoryAction(id, formData);
    setBusy(null);

    if (!result.ok) {
      setFeedback({ kind: "error", text: result.error });
      return;
    }

    setEditingId(null);
    setFeedback({ kind: "ok", text: "Categoria atualizada." });
    router.refresh();
  }

  async function handleToggle(category: ArticleCategoryRecord) {
    setBusy(`toggle-${category.id}`);
    setFeedback(null);
    const result = await toggleArticleCategoryActiveAction(
      category.id,
      !category.is_active
    );
    setBusy(null);

    if (!result.ok) {
      setFeedback({ kind: "error", text: result.error });
      return;
    }

    setFeedback({
      kind: "ok",
      text: category.is_active
        ? `“${category.label}” foi desativada no site.`
        : `“${category.label}” foi ativada no site.`
    });
    router.refresh();
  }

  async function handleDelete(category: ArticleCategoryRecord) {
    if (
      !confirm(
        `Excluir a categoria “${category.label}”? Os artigos vinculados precisam ser movidos antes.`
      )
    ) {
      return;
    }

    setBusy(`delete-${category.id}`);
    setFeedback(null);
    const result = await deleteArticleCategoryAction(category.id);
    setBusy(null);

    if (!result.ok) {
      setFeedback({ kind: "error", text: result.error });
      return;
    }

    setFeedback({ kind: "ok", text: "Categoria excluída." });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {!available && (
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">A tabela de categorias ainda não existe no Supabase.</p>
          <p className="mt-1">
            Execute o arquivo{" "}
            <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-[12px]">
              supabase/migrations_v10_article_categories.sql
            </code>{" "}
            no SQL Editor do Supabase. Depois recarregue esta página para criar,
            renomear, reordenar, ativar/desativar e excluir categorias.
          </p>
          {loadError && (
            <p className="mt-1 text-xs text-amber-700/80">
              Detalhe técnico: {loadError}
            </p>
          )}
        </div>
      )}

      {feedback && (
        <p
          role={feedback.kind === "error" ? "alert" : "status"}
          className={cn(
            "rounded-sm border px-4 py-3 text-sm",
            feedback.kind === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          )}
        >
          {feedback.text}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy-900">
            <Tags className="h-5 w-5 text-gold-600" /> Categorias de conteúdo
          </h2>
          <p className="mt-1 text-sm text-navy-500">
            Estes nomes aparecem no filtro de /conteudos, nos cards e no formulário
            dos artigos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/conteudos" className="btn-ghost text-sm">
            Voltar para conteúdos
          </Link>
          <button
            type="button"
            onClick={() => {
              setShowCreate((value) => !value);
              setEditingId(null);
            }}
            disabled={!available}
            className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showCreate ? "Fechar" : "Nova categoria"}
          </button>
        </div>
      </div>

      {showCreate && available && (
        <form onSubmit={handleCreate} className="card space-y-4 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="label-field">Nome *</span>
              <input
                name="label"
                required
                className="input-field"
                placeholder="Ex.: Contratos e Parcerias"
              />
            </label>
            <label className="block">
              <span className="label-field">Identificador (slug)</span>
              <input
                name="slug"
                className="input-field"
                placeholder="gerado pelo nome se ficar vazio"
              />
              <span className="mt-1 block text-xs text-navy-400">
                Usado em /conteudos?categoria=… e gravado no artigo.
              </span>
            </label>
            <label className="block md:col-span-2">
              <span className="label-field">Descrição (opcional)</span>
              <textarea
                name="description"
                rows={2}
                className="input-field"
                placeholder="Resumo do que essa categoria reúne."
              />
            </label>
            <label className="block">
              <span className="label-field">Ordem de exibição</span>
              <input
                name="order_index"
                type="number"
                defaultValue={nextOrder}
                className="input-field"
              />
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm text-navy-700">
              <input
                name="is_active"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-navy-800"
              />
              Ativa no site
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={busy === "create"}
              className="btn-primary text-sm"
            >
              <Save className="h-4 w-4" />
              {busy === "create" ? "Criando…" : "Criar categoria"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="btn-ghost text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-md border border-navy-800/10 bg-white">
        {categories.length === 0 ? (
          <p className="p-8 text-center text-sm text-navy-500">
            Nenhuma categoria cadastrada. Crie a primeira para organizar os conteúdos.
          </p>
        ) : (
          <ul className="divide-y divide-navy-800/10">
            {categories.map((category) => {
              const count = counts[category.slug] ?? 0;
              const isEditing = editingId === category.id;
              const rowBusy =
                busy === category.id ||
                busy === `edit-${category.id}` ||
                busy === `toggle-${category.id}` ||
                busy === `delete-${category.id}`;

              return (
                <li key={category.id} className="p-4">
                  {isEditing ? (
                    <form
                      onSubmit={(event) => handleUpdate(category.id, event)}
                      className="space-y-4"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="label-field">Nome *</span>
                          <input
                            name="label"
                            required
                            defaultValue={category.label}
                            className="input-field"
                          />
                        </label>
                        <label className="block">
                          <span className="label-field">Identificador (slug)</span>
                          <input
                            name="slug"
                            defaultValue={category.slug}
                            className="input-field"
                          />
                          <span className="mt-1 block text-xs text-navy-400">
                            Alterar o slug atualiza também os artigos vinculados.
                          </span>
                        </label>
                        <label className="block md:col-span-2">
                          <span className="label-field">Descrição (opcional)</span>
                          <textarea
                            name="description"
                            rows={2}
                            defaultValue={category.description}
                            className="input-field"
                          />
                        </label>
                        <label className="block">
                          <span className="label-field">Ordem de exibição</span>
                          <input
                            name="order_index"
                            type="number"
                            defaultValue={category.order_index}
                            className="input-field"
                          />
                        </label>
                        <label className="flex items-end gap-2 pb-2 text-sm text-navy-700">
                          <input
                            name="is_active"
                            type="checkbox"
                            defaultChecked={category.is_active}
                            className="h-4 w-4 accent-navy-800"
                          />
                          Ativa no site
                        </label>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="submit"
                          disabled={rowBusy}
                          className="btn-primary text-sm"
                        >
                          <Save className="h-4 w-4" />
                          {rowBusy ? "Salvando…" : "Salvar alterações"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="btn-ghost text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-navy-900">{category.label}</span>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                              category.is_active
                                ? "bg-navy-800/10 text-navy-700"
                                : "bg-navy-800/5 text-navy-400"
                            )}
                          >
                            {category.is_active ? "Ativa" : "Inativa"}
                          </span>
                          <span className="rounded-sm bg-navy-800/5 px-2 py-0.5 font-mono text-[11px] text-navy-500">
                            {category.slug}
                          </span>
                        </div>
                        {category.description && (
                          <p className="mt-1 text-sm text-navy-500">{category.description}</p>
                        )}
                        <p className="mt-1 text-xs text-navy-400">
                          {count} conteúdo(s) · ordem {category.order_index}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggle(category)}
                          disabled={!available || rowBusy}
                          title={category.is_active ? "Desativar no site" : "Ativar no site"}
                          aria-label={category.is_active ? "Desativar no site" : "Ativar no site"}
                          className="rounded-sm border border-navy-800/15 p-2 text-navy-700 hover:bg-navy-800 hover:text-white disabled:opacity-50"
                        >
                          {category.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(category.id);
                            setShowCreate(false);
                          }}
                          disabled={!available || rowBusy}
                          title="Editar"
                          aria-label="Editar"
                          className="rounded-sm border border-navy-800/15 p-2 text-navy-700 hover:bg-navy-800 hover:text-white disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          disabled={!available || rowBusy}
                          title="Excluir"
                          aria-label="Excluir"
                          className="rounded-sm border border-red-200 p-2 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
