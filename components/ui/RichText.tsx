"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renderizador de conteúdo Markdown (artigos) com estilos próprios (.prose-article).
 * Componente cliente por usar suporte a links/GFM.
 */
export default function RichText({ content }: { content: string }) {
  return (
    <div className="prose-article">
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
        {content}
      </ReactMarkdown>
    </div>
  );
}
