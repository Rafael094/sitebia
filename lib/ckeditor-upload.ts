// ============================================================================
// Adaptador de upload de imagens do CKEditor 5 para o Storage público.
// Envia o arquivo para o bucket "uploads" (pasta "editor") e devolve a URL
// pública gravada no HTML. Usado por imageUpload / insertImage.
// ============================================================================

import type { Editor } from "ckeditor5";
import type { UploadAdapter, FileLoader } from "@ckeditor/ckeditor5-upload";

import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { UPLOADS_BUCKET } from "@/lib/constants";
import { randomId } from "@/lib/utils";

/** Envia uma imagem para o Storage e retorna a URL pública. */
export async function uploadEditorImage(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("Arquivo de imagem vazio.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("A imagem deve ter no máximo 5 MB.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Envie um arquivo de imagem válido.");
  }

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const folder = "editor";
  const fileName = `${Date.now()}-${randomId(8)}.${ext}`;

  const supabase = getAdminSupabaseClient();
  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(UPLOADS_BUCKET)
    .upload(`${folder}/${fileName}`, bytes, {
      contentType: file.type,
      upsert: false
    });

  if (error) throw new Error(error.message);

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${UPLOADS_BUCKET}/${folder}/${fileName}`;
}

/**
 * Registra na instância do editor um `createUploadAdapter` que usa o Storage
 * do Supabase. Deve ser chamado em `onReady`.
 */
export function attachSupabaseUploadAdapter(editor: Editor): void {
  const repository = editor.plugins.get("FileRepository") as {
    createUploadAdapter?: (loader: FileLoader) => UploadAdapter;
  };

  repository.createUploadAdapter = (loader: FileLoader): UploadAdapter => ({
    async upload() {
      const file = (await loader.file) as File | null;
      if (!file) throw new Error("Nenhum arquivo selecionado.");
      const url = await uploadEditorImage(file);
      // O CKEditor espera { default: <url> } por padrão.
      return { default: url };
    },
    abort() {
      // O upload via Supabase Storage não expõe cancelamento; no-op.
    }
  });
}
