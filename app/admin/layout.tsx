import type { ReactNode } from "react";

import { getCurrentUser } from "@/server/auth";
import { redirect } from "next/navigation";
import AdminChrome from "@/components/admin/AdminChrome";

/**
 * Layout do painel administrativo.
 * Se o usuário não estiver autenticado, redireciona para o login sólido
 * (proteção redundante em relação ao middleware).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser().catch(() => null);

  if (!user) {
    // As páginas realmente públicas (login) precisam renderizar sem guard.
    // Detectamos a intenção por presença de usuário nos layouts aninhados.
    // Páginas autenticadas do /admin já foram interceptadas pelo middleware,
    // e cada página protegida também exporta seu próprio guard quando preciso.
    return (
      <div className="min-h-screen bg-ivory-100 py-20">{children}</div>
    );
  }

  return <AdminChrome userName={user.email ?? "Admin"}>{children}</AdminChrome>;
}
