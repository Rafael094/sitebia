"use client";

// Carrega o CKEditor 5 somente no cliente: ele depende do DOM global
// (domDocument) e não pode ser avaliado durante a renderização no servidor.
export { default } from "@/components/admin/CkEditorField";
