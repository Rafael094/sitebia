import {
  SearchCheck,
  Layers,
  Network,
  FileSignature,
  Briefcase,
  GraduationCap,
  Scale,
  Lightbulb,
  Globe,
  Route,
  type LucideIcon
} from "lucide-react";

import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  "search-check": SearchCheck,
  layers: Layers,
  network: Network,
  "file-signature": FileSignature,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  scale: Scale,
  lightbulb: Lightbulb,
  globe: Globe,
  route: Route
};

/**
 * Renderiza o ícone Lucide associado à string gravada no banco (services.icon).
 * Caso o nome não exista, cai no feixe "briefcase".
 */
export default function ServiceIcon({
  name,
  className
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = (name && ICON_MAP[name]) || Briefcase;
  return <Icon className={cn("h-6 w-6", className)} aria-hidden="true" />;
}
