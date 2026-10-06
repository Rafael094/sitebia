// ============================================================================
// Utilitários de conteúdo rico (HTML) para os textos editáveis do painel.
// Permite gravar formatação (negrito, itálico, listas, títulos, citações…)
// sem perder o estilo. Sanitização tem allowlist rigorosa (sem scripts).
// ============================================================================

const SAFE_ATTR =
  /^(href|title|target|rel|alt|src|width|height|colspan|rowspan|scope|style|class|loading)$/i;
const DANGER = /^on|javascript:/i;

/* Tags do editor mapeadas para o subconjunto que exibimos no site. */
const MAP_TAGS: Record<string, string> = { H1: "h2", DIV: "p" };
const ALLOWED =
  /^(p|br|b|strong|i|em|u|s|del|span|ul|ol|li|blockquote|h2|h3|h4|h5|h6|a|code|pre|hr|figure|figcaption|img|table|thead|tbody|tfoot|tr|th|td|caption)$/i;

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

/** Detecta se o texto já contém blocos HTML do editor (p/ não reconverter). */
export function looksLikeHtml(input: string): boolean {
  return /<(p|div|h[1-6]|ul|ol|li|blockquote|figure|table|img|hr)\b/i.test(String(input ?? ""));
}

/**
 * Converte Markdown simples em HTML equivalente ao do editor. Cobre o
 * subconjunto usado pelos rascunhos da IA e pelos conteúdos legados:
 * títulos, listas com marcadores ou numeradas, citações, negrito, itálico,
 * código inline, links, imagens, linha horizontal e parágrafos. Se o texto já
 * for HTML, devolve-o inalterado (evita dupla conversão).
 */
export function markdownToHtml(input: string): string {
  const src = String(input ?? "").replace(/\r\n?/g, "\n").trim();
  if (!src) return "";
  if (looksLikeHtml(src)) return src;

  const inline = (t: string): string => {
    let out = escapeHtml(t);
    // Código inline primeiro (protege o conteúdo interno).
    out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
    // Imagens antes de links (mesma sintaxe, com "!").
    out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" />');
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    out = out.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
    out = out.replace(/(^|[^_])_([^_]+)_/g, "$1<em>$2</em>");
    return out;
  };

  const lines = src.split("\n");
  const blocks: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const items = list.items.map((i) => `<li>${inline(i)}</li>`).join("");
      blocks.push(`<${list.type}>${items}</${list.type}>`);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
      flushPara();
      flushList();
      const level = Math.min(m[1].length + 1, 6); // # vira h2 (título já existe)
      blocks.push(`<h${level}>${inline(m[2])}</h${level}>`);
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      flushPara();
      flushList();
      blocks.push("<hr />");
      continue;
    }
    if ((m = line.match(/^>\s?(.*)$/))) {
      flushPara();
      flushList();
      blocks.push(`<blockquote><p>${inline(m[1])}</p></blockquote>`);
      continue;
    }
    if ((m = line.match(/^\s*[-*+]\s+(.*)$/))) {
      flushPara();
      if (list?.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(m[1]);
      continue;
    }
    if ((m = line.match(/^\s*\d+\.\s+(.*)$/))) {
      flushPara();
      if (list?.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(m[1]);
      continue;
    }
    flushList();
    para.push(line.trim());
  }
  flushPara();
  flushList();

  return blocks.join("\n");
}
