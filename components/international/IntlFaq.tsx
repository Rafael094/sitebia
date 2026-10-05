"use client";

import FaqAccordion, { type FaqItem } from "@/components/international/FaqAccordion";
import SectionHeading from "@/components/ui/SectionHeading";
import { useSectionContent } from "@/components/site/SectionsProvider";

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Can a foreign company register a trademark in Brazil?",
    answer:
      "Yes. Foreign companies can seek trademark protection in Brazil, subject to the applicable Brazilian rules and representation requirements. We can assist with the Brazilian filing and prosecution process."
  },
  {
    question: "Can you help with patent protection in Brazil?",
    answer:
      "Yes. We provide strategic and procedural support for Brazilian patent matters and coordinate with specialized technical professionals when required."
  },
  {
    question: "Do I need a Brazilian representative?",
    answer:
      "Foreign applicants may be subject to Brazilian representation requirements before the INPI. We can assess your situation and coordinate the appropriate local representation and procedural support."
  },
  {
    question: "Can you help a foreign company enter the Brazilian market?",
    answer:
      "Yes. We can support intellectual property strategy, contracts, innovation partnerships and coordination with specialized regulatory professionals when required."
  },
  {
    question: "Can you help us find a Brazilian university or research partner?",
    answer:
      "Yes. Depending on the project, we can support the identification and structuring of relationships with Brazilian universities, ICTs, research institutions and other innovation ecosystem participants."
  },
  {
    question: "Do you work with international law firms?",
    answer:
      "Yes. We can act as Brazilian counsel and support international firms and their clients with Brazilian IP and technology-related matters."
  },
  {
    question: "Do you provide regulatory advice?",
    answer:
      "We provide strategic legal coordination and can work with specialized professionals depending on the product, sector and regulatory authority involved."
  }
];

/** Seção FAQ. Cabeçalho editável em intl_faq; perguntas/respostas são estruturais. */
export default function IntlFaq() {
  const c = useSectionContent("intl_faq");

  return (
    <section
      id="faq"
      data-header-theme="light"
      className="scroll-mt-24 bg-ivory-100 py-20"
    >
      <div className="container-site">
        <SectionHeading
          eyebrow={c.badge_text || "FAQ"}
          title={c.title || "Questions from international clients"}
          description={
            c.description ||
            "Common questions about protecting and commercializing intellectual property and building innovation partnerships in Brazil."
          }
          align="center"
        />

        <div className="mx-auto mt-12 max-w-3xl">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}
