import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina classes do Tailwind de forma limpa (sem conflitos). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Converte um texto em slug seguro para URLs (ex.: "Olá Mundo!" -> "ola-mundo"). */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove caracteres especiais
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Gera uma string aleatória (para nomes de arquivos únicos). */
export function randomId(length = 12): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  const values = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    out += charset[values[i] % charset.length];
  }
  return out;
}

/** Formata datas ISO para o padrão pt-BR (ex.: "5 de setembro de 2026"). */
export function formatDate(input: string | Date, withTime = false): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {})
  }).format(date);
}

/** Converte listas de texto (uma linha por item) em bullets. */
export function splitLines(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Mapa entre nomes de ícones (armazenados em `services.icon`) e marcações
 * utilizadas em componentes. Os nomes são guardados como strings para serem
 * gravados no banco com facilidade.
 */
export type ServiceIconKey =
  | "search-check"
  | "layers"
  | "network"
  | "file-signature"
  | "briefcase"
  | "graduation-cap"
  | "scale"
  | "lightbulb"
  | "globe"
  | "route";

export const SERVICE_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "search-check", label: "Buscar / Diagnóstico" },
  { value: "layers", label: "Camadas / Portfolio" },
  { value: "network", label: "Rede / Conexão" },
  { value: "file-signature", label: "Assinatura / Contrato" },
  { value: "briefcase", label: "Maleta / Negócio" },
  { value: "graduation-cap", label: "Academia / Pesquisa" },
  { value: "scale", label: "Balança / Jurídico" },
  { value: "lightbulb", label: "Ideia / Inovação" },
  { value: "globe", label: "Mundo / Internacional" },
  { value: "route", label: "Rota / Jornada" }
];
