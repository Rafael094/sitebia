import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware global:
 *  1) Mantém a sessão do Supabase Auth sempre fresca.
 *  2) Protege as rotas sob /admin — só usuários autenticados entram.
 *     O acesso negado vai para /admin/login (rotas de login/erro ficam abertas).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabaseResponse, user } = await updateSession(request);

  // Rotas administrativas que exigem autenticação.
  const isAdminRequest = pathname.startsWith("/admin");
  const isLoginPage = pathname.startsWith("/admin/login");
  const isAuthCallbacks = pathname.startsWith("/auth");

  if (isAdminRequest && !isLoginPage && !isAuthCallbacks && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Se já está logado e visita o login, envia direto ao dashboard.
  if (isLoginPage && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"]
};
