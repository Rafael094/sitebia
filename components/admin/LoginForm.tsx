"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import { signInWithEmail } from "@/server/auth";

/** Formulário de login do painel (autenticação nativa Supabase Auth). */
export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithEmail(new FormData(e.currentTarget as HTMLFormElement));
      // Em sucesso o server action redireciona; aqui tratamos apenas o erro retornado.
      if (result && !result.ok) setError(result.error);
      else router.refresh();
    } catch {
      setError("Não foi possível efetuar o login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card p-8">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm bg-gold-500/15 text-gold-600">
          <LockKeyhole className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-center font-display text-2xl font-semibold text-navy-900">
          Acessar o painel
        </h1>
        <p className="mt-1 text-center text-sm text-navy-500">
          Área restrita — autenticação via Supabase Auth.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="label-field">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input-field"
              placeholder="voce@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="label-field">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !bg-gold-500 !text-navy-900 hover:!bg-gold-400">
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-navy-400">
          Esqueceu a senha? Fale com o administrador da plataforma.
        </p>
      </div>
    </div>
  );
}
