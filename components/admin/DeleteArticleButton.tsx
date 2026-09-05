"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteArticle } from "@/server/admin";

/** Botão de exclusão de conteúdo com confirmação. */
export default function DeleteArticleButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Remover este conteúdo? A ação não pode ser desfeita.")) return;
    setBusy(true);
    try {
      await deleteArticle(id);
      router.refresh();
    } catch {
      alert("Não foi possível remover o conteúdo.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      title="Excluir"
      aria-label="Excluir"
      className="rounded-sm border border-red-200 p-2 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
