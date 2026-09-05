import type { Metadata } from "next";

import ServiceForm from "@/components/admin/ServiceForm";

export const metadata: Metadata = { title: "Novo Serviço", robots: { index: false } };

export default function NovoServicePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Novo serviço</h1>
        <p className="mt-1 text-sm text-navy-500">Preencha os dados do serviço que aparecerá no site.</p>
      </div>
      <div className="card p-6">
        <ServiceForm />
      </div>
    </div>
  );
}
