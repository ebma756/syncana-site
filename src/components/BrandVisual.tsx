type VisualVariant =
  | "hero"
  | "about"
  | "contact"
  | "managed-it"
  | "cybersecurity"
  | "cloud-m365"
  | "backup-recovery"
  | "core"
  | "shield"
  | "cloud"
  | "backup"
  | "growth"
  | "resilience";

type VisualPanelProps = {
  variant: VisualVariant;
  eyebrow?: string;
  title: string;
  description: string;
  chips: string[];
  compact?: boolean;
  className?: string;
};

export function BrandVisual({
  variant,
  eyebrow,
  title,
  description,
  chips,
  compact = false,
  className,
}: VisualPanelProps) {
  return (
    <div
      className={[
        "brand-visual",
        `brand-visual--${variant}`,
        compact ? "brand-visual--compact" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="brand-visual__mesh" />
      <div className="brand-visual__glow" />
      <div className="brand-visual__frame">
        <div className="brand-visual__header">
          <span className="brand-visual__dot" />
          <span className="brand-visual__dot" />
          <span className="brand-visual__dot" />
        </div>
        <div className="brand-visual__body">
          {eyebrow ? <span className="eyebrow eyebrow--visual">{eyebrow}</span> : null}
          <h3>{title}</h3>
          <p>{description}</p>
          <div className="brand-visual__chips">
            {chips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="brand-visual__orbit brand-visual__orbit--one" />
      <div className="brand-visual__orbit brand-visual__orbit--two" />
    </div>
  );
}

type ArticleArtProps = {
  variant: VisualVariant;
  label: string;
};

export function ArticleArt({ variant, label }: ArticleArtProps) {
  return (
    <div className={`article-art article-art--${variant}`}>
      <div className="article-art__grid" />
      <div className="article-art__signal" />
      <div className="article-art__card">
        <span>{label}</span>
      </div>
      <div className="article-art__chip article-art__chip--left" />
      <div className="article-art__chip article-art__chip--right" />
    </div>
  );
}
