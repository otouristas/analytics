import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { PillarHeader, type PillarKpi } from "@/components/ui/pillar-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAnalytics } from "@/lib/analytics/store";
import { PROJECT_BY_ID } from "@/lib/analytics/projects";

export interface PropertyHeaderProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  badges?: ReactNode;
  actions?: ReactNode;
  kpis?: PillarKpi[];
  /** Hue 150–290 for this page's bloom. Defaults to the brand blue. */
  signatureHue?: number;
  className?: string;
}

const DEFAULT_KPIS: PillarKpi[] = [
  { label: "Sessions", value: "128,429", delta: "+14.3%", positive: true },
  { label: "Qualified Sessions", value: "32,841", delta: "+21.8%", positive: true },
  { label: "Conversions", value: "2,184", delta: "+8.2%", positive: true },
  { label: "Revenue", value: "€84,920", delta: "+11.3%", positive: true },
];

/**
 * The property pillar header that opens every core product page.
 *
 * A thin wrapper over <PillarHeader> in its `product` variant: it supplies the
 * active property's identity, the standard connection badges and the default
 * KPI strip. Pages pass their own title/kpis/actions and get the rest for free.
 */
export function PropertyHeader({
  title,
  subtitle,
  eyebrow,
  badges,
  actions,
  kpis,
  signatureHue,
  className,
}: PropertyHeaderProps) {
  const projectId = useAnalytics((s) => s.projectId);
  const project = PROJECT_BY_ID[projectId];

  return (
    <PillarHeader
      variant="product"
      eyebrow={eyebrow}
      title={title ?? project.name}
      ident={
        <a
          href={`https://${project.host}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 hover:underline"
        >
          <span>{project.host}</span>
          <ExternalLink className="size-3" />
        </a>
      }
      dek={subtitle}
      // A page that shows the property name as its own title would otherwise
      // render "Discover Cyclades › Discover Cyclades".
      crumbs={
        title && title !== project.name
          ? [{ label: project.name }, { label: title }]
          : [{ label: project.name }, { label: "Overview" }]
      }
      badges={
        <>
          <StatusBadge status="live" label="Live Tracking" size="sm" />
          <StatusBadge status="connected" label="Search Console Connected" size="sm" />
          <StatusBadge status="healthy" label="Analytics Healthy" size="sm" />
          {badges}
        </>
      }
      actions={actions}
      kpis={kpis ?? DEFAULT_KPIS}
      signatureHue={signatureHue}
      className={className}
    />
  );
}
