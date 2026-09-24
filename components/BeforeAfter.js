import ProjectMedia from "@/components/ProjectMedia";

const SLOTS = [
  { key: "avant", label: "Avant" },
  { key: "apres", label: "Après" },
];

export default function BeforeAfter({ avant, apres, alt = "" }) {
  const slots = SLOTS.map((slot) => ({
    ...slot,
    src: slot.key === "avant" ? avant : apres,
  })).filter((slot) => slot.src);

  if (slots.length === 0) return null;

  return (
    <div className="before_after">
      {slots.map((slot) => (
        <figure key={slot.key}>
          <figcaption>{slot.label}</figcaption>
          <div className="project_media">
            <ProjectMedia src={slot.src} alt={alt ? `${alt}, ${slot.label}` : slot.label} />
          </div>
        </figure>
      ))}
    </div>
  );
}
