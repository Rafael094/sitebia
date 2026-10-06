"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { sanitizeRichHtml, looksLikeHtml } from "@/lib/rich-html";

/**
 * Renderizador de conteúdo do site tolerante a dois formatos:
 *  - HTML rico produzido pelo CKEditor 5 (novos conteúdos) → sanitizado e
 *    injetado com estilos de prosa (.prose-article);
 *  - Markdown legado (artigos/serviços antigos e rascunhos da IA) → convertido
 *    pelo react-markdown, preservando a aparência anterior.
 *
 * A detecção é feita por presença de blocos HTML típicos do editor. Assim os
 * dados já gravados continuam válidos e os novos ganham a formatação do editor.
 */
export default function HtmlContent({
  content,
  className = "prose-article"
}: {
  content: string;
  className?: string;
}) {
  const src = String(content ?? "");
  if (!src.trim()) return null;

  // Blocos que só aparecem quando o conteúdo já veio como HTML do editor.
  const isHtml = looksLikeHtml(src);

  if (isHtml) {
    const html = sanitizeRichHtml(src);
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Abre links externos em nova aba com segurança.
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...props} alt={props.alt || ""} className="my-6 h-auto w-full rounded-md" />
          )
        }}
      >
        {src}
      </ReactMarkdown>
    </div>
  );
}
