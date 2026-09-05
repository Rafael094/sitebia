import type { Metadata } from "next";
import Link from "next/link";

import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Login do Painel",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <LoginForm />
      <p className="mt-6 text-center text-xs text-navy-500">
        <Link href="/" className="underline underline-offset-2 hover:text-navy-800">
          ← Voltar para o site institucional
        </Link>
      </p>
    </div>
  );
}
