"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { sanitizeRichHtml } from "@/lib/rich-html";

type Command = { name: string; value?: string; label: string; title: string };

const COMMANDS: Command[] = [
  { name: "formatBlock", value: "p", label: "¶", title: "Parágrafo" },
  { name: "formatBlock", value: "h2", label: "H2", title: "Subtítulo" },
  { name: "formatBlock", value: "h3", label: "H3", title: "Título pequeno" },
  { name: "bold", label: "B", title: "Negrito" },
  { name: "italic", label: "I", title: "Itálico" },
  { name: "underline", label: "U", title: "Sublinhado" },
  {
    name: "insertUnorderedList",
    label: "•Lista",
    title: "Lista com marcadores"
  },
  {
    name: "insertOrderedList",
    label: "1.Lista",
    title: "Lista numerada"
  },
  { name: "formatBlock", value: "blockquote", label: "“”", title: "Citação" },
  { name: "createLink", label: "Link", title: "Inserir link" },
  { name: "removeFormat", label: "✕", title: "Remover formatação" }
];

/**
 * Editor de texto rico (HTML). Ferramentas: parágrafo, títulos, negrito,
 * itálico, listas, citação e link. Grava HTML sanitizado num input oculto
 * (name) para o formulário do painel.
 */
export default function RichTextField({
  name,
  id,
  label,
  value = "",
  hint
}: {
  name: string;
  id?: string;
  label?: string;
  value?: string;
  hint?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const richRef = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState<string>(value || "");
  const [isRich, setIsRich] = useState<boolean>(true);

  // Coloca o HTML inicial no editor somente no primeiro carregamento do painel.
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = html;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = useCallback((raw: string) => {
    const clean = sanitizeRichHtml(raw);
    setHtml(clean);
    if (inputRef.current) inputRef.current.value = clean;
  }, []);

  const onInput = () => {
    if (editorRef.current) sync(editorRef.current.innerHTML);
  };

  const run = useCallback(
    (cmd: Command) => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      if (cmd.name === "removeFormat") {
        document.execCommand("removeFormat");
        document.execCommand("unlink");
      } else if (cmd.name === "createLink") {
        const url = window.prompt("Cole o endereço do link (https://…)");
        if (url && url.trim()) {
          document.execCommand("createLink", false, url.trim());
        }
      } else if (cmd.name === "formatBlock") {
        document.execCommand("formatBlock", false, cmd.value ?? "p");
      } else {
        document.execCommand(cmd.name, false, undefined);
      }
      if (editorRef.current) sync(editorRef.current.innerHTML);
    },
    [sync]
  );

  const switchMode = () => {
    const next = !isRich;
    setIsRich(next);
    // Alterna entre visual e código HTML simples (textarea).
    setHtml(sanitizeRichHtml(editorRef.current?.innerHTML ?? html));
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-600">
          {label}
        </span>
      )}

      {/* Valor final vai neste input oculto: é o que o servidor recebe. */}
      <input ref={inputRef} type="hidden" name={name} value={html} readOnly />

      <div className="overflow-hidden rounded-sm border border-navy-800/15 bg-white focus-within:ring-1 focus-within:ring-navy-800">
        {/* Barra de ferramentas */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-navy-800/10 bg-ivory-50 px-1.5 py-1.5">
          {COMMANDS.map((c) => (
            <button
              key={c.title}
              type="button"
              title={c.title}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run(c)}
              className="rounded-sm px-2 py-1 text-xs font-semibold text-navy-700 hover:bg-gold-500/20 hover:text-navy-900"
            >
              {c.label}
            </button>
          ))}
          <button
            type="button"
            onClick={switchMode}
            title="Ver código HTML"
            className="ml-auto rounded-sm border border-navy-800/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-navy-500 hover:bg-navy-800 hover:text-white"
          >
            {isRich ? "HTML" : "Visual"}
          </button>
        </div>

        {/* Área editável / código */}
        {isRich ? (
          <div
            ref={editorRef}
            id={id}
            contentEditable
            suppressContentEditableWarning
            onInput={onInput}
            onBlur={onInput}
            className="prose-article max-h-72 min-h-28 overflow-y-auto px-4 py-3 outline-none"
          />
        ) : (
          <textarea
            value={html}
            onChange={(e) => {
              const v = e.target.value;
              setHtml(v);
              if (inputRef.current) inputRef.current.value = v;
            }}
            className="block max-h-72 min-h-28 w-full px-4 py-3 font-mono text-xs text-navy-700 outline-none"
          />
        )}
      </div>

      {hint && <p className="text-[11px] text-navy-400">{hint}</p>}
    </div>
  );
}
