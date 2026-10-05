"use client";

import { cn } from "@/lib/utils";

/**
 * Botão de CTA da landing internacional.
 * - Âncoras internas (#contact, #services) usam rolagem suave nativa (html scroll-behavior);
 * - Links externos/http abrem em nova aba;
 * - `data-analytics` permite rastrear cliques caso o projeto já tenha analytics.
 */
export default function IntlCtaLink({
  href,
  children,
  variant = "gold",
  dataAnalytics,
  className
}: {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "ghost" | "primary";
  dataAnalytics?: string;
  className?: string;
}) {
  const isExternal = /^(https?:|mailto:|tel:)/.test(href);
  const classes = cn(
    variant === "gold" && "btn-gold",
    variant === "primary" && "btn-primary",
    variant === "ghost" &&
      "btn-ghost !border-ivory-100/40 !text-white hover:!bg-white hover:!text-navy-900",
    className
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-analytics={dataAnalytics}
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <a href={href} data-analytics={dataAnalytics} className={classes}>
      {children}
    </a>
  );
}
