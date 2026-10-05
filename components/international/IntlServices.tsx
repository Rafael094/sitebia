"use client";

import {
  Award,
  Check,
  Handshake,
  Lightbulb,
  Scale,
  type LucideIcon
} from "lucide-react";

import SectionHeading from "@/components/ui/SectionHeading";
import { useSectionContent } from "@/components/site/SectionsProvider";

type ServiceCardData = {
  icon: LucideIcon;
  title: string;
  text: string;
  items: string[];
  cta: { label: string; href: string; analytics: string };
};

const CARDS: ServiceCardData[] = [
  {
    icon: Award,
    title: "IP Protection in Brazil",
    text: "Protect, manage and enforce your intellectual property in the Brazilian market.",
    items: [
      "Trademarks",
      "Patents",
      "Software",
      "Industrial designs",
      "IP portfolio management",
      "IP monitoring"
    ],
    cta: {
      label: "Explore IP services",
      href: "#ip-protection",
      analytics: "intl_services_ip"
    }
  },
  {
    icon: Scale,
    title: "Brazil Market Entry",
    text: "Strategic legal support for companies bringing products, technologies and businesses to Brazil.",
    items: [
      "IP strategy",
      "Contractual structure",
      "Regulatory coordination",
      "Local legal support",
      "Commercial relationships"
    ],
    cta: {
      label: "Explore market entry",
      href: "#market-entry",
      analytics: "intl_services_market_entry"
    }
  },
  {
    icon: Lightbulb,
    title: "Innovation & Technology Transfer",
    text: "Build strategic relationships with Brazilian companies, universities, ICTs and research institutions.",
    items: [
      "R&D partnerships",
      "Technology transfer",
      "Licensing",
      "Innovation projects",
      "University–industry partnerships"
    ],
    cta: {
      label: "Explore innovation",
      href: "#innovation",
      analytics: "intl_services_innovation"
    }
  },
  {
    icon: Handshake,
    title: "For International Law Firms",
    text: "Reliable Brazilian support for international firms and their clients.",
    items: [
      "Brazilian IP matters",
      "Trademark prosecution",
      "Patent matters",
      "IP portfolio management",
      "Technology agreements",
      "Local coordination"
    ],
    cta: {
      label: "Partner with Bianca",
      href: "#contact",
      analytics: "intl_services_law_firms"
    }
  }
];

/** Services overview — grade de 4 cards. Cabeçalho editável em intl_services. */
export default function IntlServices() {
  const c = useSectionContent("intl_services");

  return (
    <section
      id="services"
      data-header-theme="light"
      className="scroll-mt-24 bg-ivory-100 py-20"
    >
      <div className="container-site">
        <SectionHeading
          eyebrow={c.badge_text || "SERVICES"}
          title={c.title || "How we can support your business in Brazil"}
          description={
            c.description ||
            "Entering a new market requires more than local knowledge. It requires a strategic understanding of how intellectual property, contracts, regulation and innovation interact."
          }
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="card group flex h-full flex-col p-6 transition-transform duration-200 hover:-translate-y-1"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-navy-800 text-gold-400">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">
                  {card.text}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-navy-700">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-gold-600"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={card.cta.href}
                  data-analytics={card.cta.analytics}
                  className="mt-auto pt-6 text-sm font-semibold text-navy-800 underline decoration-gold-500 underline-offset-4 transition-colors hover:text-gold-700"
                >
                  {card.cta.label}
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
