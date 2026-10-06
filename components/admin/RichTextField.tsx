"use client";

import dynamic from "next/dynamic";

// CKEditor 5 não roda no SSR (depende do DOM). Carregamos somente no cliente.
const CkEditorField = dynamic(() => import("@/components/admin/CkEditor.client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-32 rounded-sm border border-navy-800/15 bg-ivory-50 px-4 py-3 text-sm text-navy-400">
      Carregando editor…
    </div>
  )
});

/**
 * Campo de texto rico (HTML) do painel. Delega para o CKEditor 5
 * (`CkEditorField`), preservando a API usada pelas seções institucionais:
 * grava o HTML sanitizado num input oculto (name) para o formulário.
 */
export default function RichTextField({
  name,
  id,
  label,
  value = "",
  hint,
  placeholder,
  onChange
}: {
  name: string;
  id?: string;
  label?: string;
  value?: string;
  hint?: string;
  placeholder?: string;
  /** Notifica o HTML sanitizado atual (usado p.ex. para alimentar o SEO). */
  onChange?: (html: string) => void;
}) {
  return (
    <CkEditorField
      name={name}
      id={id}
      label={label}
      value={value}
      hint={hint}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
}
