"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { createService, updateServiceAction } from "@/server/admin";
import type { Service } from "@/lib/types";

/**
 * Formulário único de criação/edição de serviços, usado nas rotas
 * /admin/servicos/novo e /admin/servicos/[id]/editar.
 * Em caso de sucesso a própria Server Action faz redirect /revalidate.
 */
export default function ServiceForm({
  service,
  isEditing = false
}: {
  service?: Service;
  isEditing?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    try {
      if (isEditing && service) {
        const r = await updateServiceAction(service.id, fd);
        if (r && !r.ok) setError(r.error);
        else router.refresh();
      } else {
        const r = await createService(fd);
        if (r && !r.ok) setError(r.error);
        else router.refresh();
      }
    } catch (err) {
      setError("Falha ao salvar. Verifique os dados e tente novamente.");
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="title" className="label-field">Título do serviço *</label>
          <input id="title" name="title" required className="input-field" placeholder="Ex.: Assessoria em patentes"
            defaultValue={service?.title ?? ""} />
        </div>
        <div>
          <label htmlFor="slug" className="label-field">Slug (URL)</label>
          <input id="slug" name="slug" className="input-field" placeholder="Deixe vazio para gerar automaticamente"
            defaultValue={service?.slug ?? ""} />
        </div>
        <div>
          <label htmlFor="icon" className="label-field">Ícone Lucide</label>
          <input id="icon" name="icon" className="input-field" placeholder="briefcase | search-check | layers | …"
            defaultValue={service?.icon ?? "briefcase"} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="summary" className="label-field">Resumo (card e listagens)</label>
          <textarea id="summary" name="summary" rows={3} className="input-field" placeholder="Resumo curto e comercial…"
            defaultValue={service?.summary ?? ""} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="description" className="label-field">Descrição detalhada (aceita Markdown)</label>
          <textarea id="description" name="description" rows={8} className="input-field font-mono text-sm"
            placeholder="# Visão geral&#10;&#10;Texto de apoio…"
            defaultValue={service?.description ?? ""} />
        </div>
      </div>

      <div>
        <label className="label-field">Público-alvo (uma linha por item)</label>
        <textarea name="audience" rows={3} className="input-field" placeholder="Startups de deep tech&#10;Universidades e ICTs"
          defaultValue={service?.audience ?? ""} />
      </div>
      <div>
        <label className="label-field">Problemas que resolve (uma linha por item)</label>
        <textarea name="problems" rows={3} className="input-field" placeholder="Falta de estratégia de apropriação…"
          defaultValue={service?.problems ?? ""} />
      </div>
      <div>
        <label className="label-field">Escopo / etapas (uma linha por item)</label>
        <textarea name="scope" rows={3} className="input-field" placeholder="Diagnóstico inicial&#10;Plano de transferência"
          defaultValue={service?.scope ?? ""} />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div>
          <label htmlFor="order_index" className="label-field">Ordem de exibição</label>
          <input id="order_index" name="order_index" type="number" className="input-field max-w-[8rem]"
            defaultValue={service?.order_index ?? 0} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input id="is_active" name="is_active" type="checkbox" className="h-4 w-4 accent-navy-800"
            defaultChecked={service ? service.is_active : true} />
          <label htmlFor="is_active" className="cursor-pointer text-sm text-navy-700">Serviço ativo (exibir no site)</label>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="h-4 w-4" /> {saving ? "Salvando…" : isEditing ? "Salvar alterações" : "Criar serviço"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">Cancelar</button>
      </div>
    </form>
  );
}
