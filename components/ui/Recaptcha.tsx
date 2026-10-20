"use client";

import { useEffect, useRef } from "react";

import { IS_RECAPTCHA_ENABLED, RECAPTCHA_SITE_KEY } from "@/lib/recaptcha-client";

type Grecaptcha = {
  render: (
    container: HTMLElement,
    options: Record<string, unknown>
  ) => number;
  reset: (widgetId?: number) => void;
  getResponse: (widgetId?: number) => string;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
    __onRecaptchaLoad?: () => void;
  }
}

const SCRIPT_ID = "google-recaptcha-v2";
const CALLBACK_NAME = "__onRecaptchaLoad";

interface RecaptchaProps {
  /** Recebe o token quando o usuário conclui o desafio; null ao expirar/errar. */
  onToken: (token: string | null) => void;
  /** Idioma do widget (padrão pt-BR). */
  language?: string;
  /** Incremente para limpar o widget (após enviar ou ao ocorrer um erro). */
  resetSignal?: number;
  className?: string;
}

/** Injeta o script do Google uma única vez. */
function loadScript(language: string): void {
  if (typeof window === "undefined") return;
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src =
    `https://www.google.com/recaptcha/api.js?onload=${CALLBACK_NAME}` +
    `&render=explicit&hl=${encodeURIComponent(language)}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

/**
 * Widget do reCAPTCHA v2 (checkbox). Não renderiza nada quando
 * `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` não está configurada.
 */
export default function Recaptcha({
  onToken,
  language = "pt-BR",
  resetSignal = 0,
  className
}: RecaptchaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onTokenRef = useRef(onToken);

  // Mantém sempre o callback mais recente sem re-renderizar o widget.
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!IS_RECAPTCHA_ENABLED) return;
    let cancelled = false;

    const render = () => {
      if (cancelled) return;
      if (widgetIdRef.current !== null) return;
      if (!containerRef.current || !window.grecaptcha?.render) return;

      try {
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          theme: "light",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null)
        });
      } catch (err) {
        console.warn("Não foi possível renderizar o reCAPTCHA:", err);
      }
    };

    window.__onRecaptchaLoad = render;
    loadScript(language);
    if (window.grecaptcha?.render) render();

    // Fallback: se o script já estava carregado mas o widget ainda não montou.
    const timer = window.setInterval(() => {
      if (window.grecaptcha?.render) {
        window.clearInterval(timer);
        render();
      }
    }, 200);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (window.__onRecaptchaLoad === render) {
        delete window.__onRecaptchaLoad;
      }
    };
  }, [language]);

  useEffect(() => {
    if (!IS_RECAPTCHA_ENABLED || resetSignal === 0) return;
    if (widgetIdRef.current !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetIdRef.current);
      onTokenRef.current(null);
    }
  }, [resetSignal]);

  if (!IS_RECAPTCHA_ENABLED) return null;

  return (
    <div
      ref={containerRef}
      className={className ?? "min-h-[78px]"}
      aria-label="reCAPTCHA"
    />
  );
}
