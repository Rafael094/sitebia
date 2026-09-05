import type { Metadata } from "next";

import { getAdminService } from "@/server/admin-data";
import ServiceForm from "@/components/admin/ServiceForm";

export const metadata: Metadata = { title: "Editar Serviço", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EditarServicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getAdminService(id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Editar serviço</h1>
        <p className="mt-1 text-sm text-navy-500">Altere os dados e salve para atualizar o site.</p>
      </div>
      {service ? (
        <div className="card p-6">
          <ServiceForm service={service} isEditing />
        </div>
      ) : (
        <div className="card p-10 text-center text-sm text-navy-500">
          Serviço não encontrado. Verifique o link.
        </div>
      )}
    </div>
  );
}
