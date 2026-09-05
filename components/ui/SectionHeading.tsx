import { cn } from "@/lib/utils";

/** Rótulo de seção (eyebrow dourado) + título display. */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "section-eyebrow",
            align === "center" && "justify-center"
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="section-title">{title}</h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-navy-600">
          {description}
        </p>
      )}
    </div>
  );
}
