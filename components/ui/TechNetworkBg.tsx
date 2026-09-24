/**
 * Textura decorativa de "rede de conexões" para fundos escuros.
 *
 * Desenhada em SVG inline (nós + linhas) para não depender de nenhum asset
 * binário. Use sempre dentro de um container `relative overflow-hidden`.
 */
export default function TechNetworkBg({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={className ?? "pointer-events-none absolute inset-0"}
    >
    
    </div>
  );
}
