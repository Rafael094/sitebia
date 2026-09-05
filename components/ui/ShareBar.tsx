"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, LinkIcon, Check, Twitter } from "lucide-react";

const waIcon = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.83 14.14c-.25.7-1.45 1.33-2.02 1.38-.52.05-1.18.07-1.9-.12-.44-.12-1-.28-1.72-.55-3.02-1.3-4.99-4.33-5.14-4.53-.15-.2-1.23-1.63-1.23-3.11s.78-2.2 1.06-2.5c.28-.3.6-.37.8-.37h.58c.18 0 .43-.07.67.5.25.58.84 2 .92 2.15.07.15.12.32.02.52-.1.2-.14.32-.29.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.6.17.3.76 1.26 1.64 2.04 1.13 1 2.08 1.32 2.38 1.46.3.15.47.13.65-.08.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.28.1 1.77.83 2.07.98.3.15.5.23.58.35.07.13.07.72-.17 1.43Z" />
  </svg>
);

interface ShareProps {
  title: string;
  url: string;
}

/** Barra de compartilhamento de um artigo (LinkedIn, WhatsApp, X, Facebook e copy). */
export default function ShareBar({ title, url }: ShareProps) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent(url);
  const encTitle = encodeURIComponent(title);

  const links = [
    {
      key: "linkedin",
      icon: <Linkedin className="h-4 w-4" />,
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`,
      style: "hover:bg-[#0A66C2]"
    },
    {
      key: "whatsapp",
      icon: waIcon,
      label: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encTitle}%20${url}`,
      style: "hover:bg-[#25D366]"
    },
    {
      key: "x",
      icon: <Twitter className="h-4 w-4" />,
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encTitle}&url=${url}`,
      style: "hover:bg-black"
    },
    {
      key: "facebook",
      icon: <Facebook className="h-4 w-4" />,
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
      style: "hover:bg-[#1877F2]"
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-navy-400">Compartilhar</span>
      {links.map((l) => (
        <a
          key={l.key}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          title={l.label}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border border-navy-800/15 text-navy-600 transition-colors ${l.style} hover:text-white`}
        >
          {l.icon}
        </a>
      ))}
      {/* Instagram trabalha via "copiar link" (usado em stories) */}
      <button
        type="button"
        onClick={async () => {
          try { await navigator.clipboard.writeText(url); } catch { /* fallback */ }
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
        title="Copiar link (para Instagram)"
        aria-label="Copiar link para Instagram"
        className={`inline-flex h-9 w-9 items-center justify-center gap-1 rounded-sm border border-navy-800/15 text-navy-600 hover:bg-navy-800 hover:text-white ${copied ? "!text-gold-600" : ""}`}
      >
        {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
      </button>
      <span className="sr-only">
        <Instagram className="h-4 w-4" /> {/* acessível p/ público */}
      </span>
    </div>
  );
}
