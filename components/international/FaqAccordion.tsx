"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type FaqItem = {
  question: string;
  answer: string;
};

/**
 * Acordeão acessível de perguntas frequentes (FAQ) da landing internacional.
 * - Um item aberto por vez;
 * - Botão real com aria-expanded/aria-controls;
 * - Navegável por teclado (Enter/Espaço nativos do <button>).
 */
export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-navy-800/10 overflow-hidden rounded-md border border-navy-800/10 bg-white shadow-card">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const panelId = `faq-panel-${i}`;
        const buttonId = `faq-button-${i}`;
        return (
          <div key={item.question}>
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-ivory-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500 sm:px-7"
              >
                <span className="font-display text-base font-semibold text-navy-900 sm:text-lg">
                  {item.question}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "h-5 w-5 shrink-0 text-gold-600 transition-transform duration-300",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="px-5 pb-6 text-sm leading-relaxed text-navy-600 sm:px-7 sm:text-base"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
