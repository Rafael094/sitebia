// ============================================================================
// Utilitários de conteúdo rico (HTML) para os textos editáveis do painel.
// Permite gravar formatação (negrito, itálico, listas, títulos, citações…)
// sem perder o estilo. Sanitização tem allowlist rigorosa (sem scripts).
// ============================================================================

const SAFE_ATTR = /^(href|title|target|rel|alt)$/i;
const DANGER = /^on|javascript:|data:/i;

/* Tags do editor mapeadas para o subconjunto que exibimos no site. */
const MAP_TAGS: Record<string, string> = { H1: "h2", DIV: "p" };
const ALLOWED = /^(p|br|b|strong|i|em|u|span|ul|ol|li|blockquote|h2|h3|h4|a|code|pre)$/i;

/** Copia apenas tags/atributos seguros de um nó para dentro de `out`. */
function cleanNode(node: Node, out: HTMLElement) {
  const doc = out.ownerDocument;
  node.childNodes.forEach((child: Node) => {
    if (child.nodeType === 3) {
      out.appendChild(doc.createTextNode(child.nodeValue ?? ""));
      return;
    }
    if (child.nodeType !== 1) return; // ignora comentários etc.

    const el = child as Element;
    const tag = MAP_TAGS[el.tagName.toUpperCase()] ?? el.tagName.toLowerCase();
    if (!ALLOWED.test(tag)) {
      // Tag desconhecida: mantém apenas o conteúdo (recursivo).
      cleanNode(child as HTMLElement, out);
      return;
    }

    const keep = doc.createElement(tag);
    Array.from(el.attributes).forEach((attr) => {
      if (!SAFE_ATTR.test(attr.name) || DANGER.test(attr.value ?? "")) return;
      const lower = attr.name.toLowerCase();
      if (lower === "href") {
        const val = attr.value.trim();
        if (/^(javascript:|data:)/i.test(val)) return;
        keep.setAttribute("href", /^(https?:|\/|mailto:|tel:|#|www\.)/i.test(val) ? val : "https://" + val);
        if (val.startsWith("www.")) keep.setAttribute("href", "https://" + val);
        keep.setAttribute("rel", "noopener noreferrer");
        keep.setAttribute("target", "_blank");
        return;
      }
      keep.setAttribute(lower, attr.value);
    });

    if (tag === "a" && !keep.hasAttribute("href")) {
      // Link sem href vira somente o texto contido.
      cleanNode(child as HTMLElement, out);
      return;
    }
    cleanNode(child as HTMLElement, keep);
    out.appendChild(keep);
  });
}

/**
 * Sanitiza um HTML produzido pelo editor (allowlist rigorosa). No browser usa
 * DOMParser; no servidor remove apenas blocos/atributos flagrantemente perigosos.
 */
export function sanitizeRichHtml(input: string): string {
  const src = String(input ?? "");
  if (!src.trim()) return "";
  if (typeof DOMParser === "undefined") {
    return sanitizeServerFallback(src);
  }
  const parsed = new DOMParser().parseFromString(src, "text/html");
  const container = document.createElement("div");
  cleanNode(parsed.body, container);
  return container.innerHTML.trim();
}

/** Fallback em ambiente sem DOM (server/render). */
function sanitizeServerFallback(src: string): string {
  return src
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("([^"]*)"|'([^']*)'|[^\s>]+)/gi, "")
    .trim();
}

/** Converte texto puro multilinha em parágrafos <p>, caso ainda não haja HTML. */
export function paragraphsToHtml(input: string): string {
  const src = String(input ?? "").trim();
  if (!src) return "";
  if (/<(p|ul|ol|blockquote|h2|h3|li)[>\s]/i.test(src)) return src;
  return src
    .split(/\r?\n{2,}/)
    .map((blk) => blk.trim())
    .filter(Boolean)
    .map((blk) => `<p>${escapeHtml(blk).replace(/\r?\n/g, "<br/>")}</p>`)
    .join("\n");
}

/** HTML puro -> texto simples (para meta description/auto-preenchimento). */
export function htmlToPlainText(html: string): string {
  return String(html ?? "")
    .replace(/<[^>]*>|\u00a0/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Escapa HTML básico (evita injeção em textos puros). */
export function escapeHtml(input: string): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
