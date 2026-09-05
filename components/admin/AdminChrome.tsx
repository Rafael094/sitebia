"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Briefcase,
  Settings,
  SquareStack,
  X
} from "lucide-react";

import { ADMIN_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { signOut } from "@/server/auth";
import Logo from "@/components/brand/Logo";

const NAV_ICONS: Record<string, typeof LayoutDashboard> = {
  "/admin/dashboard": LayoutDashboard,
  "/admin/servicos": Briefcase,
  "/admin/conteudos": FileText,
  "/admin/mensagens": Inbox,
  "/admin/secoes": SquareStack,
  "/admin/configuracoes": Settings
};

/** Casca visual do painel com navegaÃ§Ã£o lateral responsiva. */
export default function AdminChrome({
  children,
  userName
}: {
  children: ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut(); // redireciona para o login
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-ivory-100 lg:flex">
      {/* Backdrop mobile */}
      {open && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-navy-900/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-navy-900 text-ivory-100 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-5 py-5">
          <div className="w-fit">
            <Logo variant="light" />
          </div>
          <button
            className="rounded-sm p-1 text-ivory-200 hover:text-white lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ivory-200/40">
            Painel
          </p>
          {ADMIN_LINKS.map((l) => {
            const Icon = NAV_ICONS[l.href] ?? LayoutDashboard;
            const active =
              pathname === l.href || pathname?.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-ivory-200/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-ivory-200/70 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" /> Ver o site
          </a>
          <div className="mt-2 flex items-center justify-between rounded-sm bg-white/5 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">{userName}</p>
              <p className="text-[10px] text-ivory-200/50">Administradora</p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sair"
              aria-label="Sair"
              className="rounded-sm p-1.5 text-ivory-200/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ConteÃºdo */}
      <div className="min-w-0 flex-1">
        {/* Barra superior mobile */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-navy-800/10 bg-ivory-100/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="rounded-sm p-1.5 text-navy-800"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-display text-sm font-semibold text-navy-900">
            Painel Administrativo
          </span>
        </header>

        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}


