import type { ReactNode } from "react";

export function PageShell({
  kicker,
  title,
  dek,
  actions,
  children,
}: {
  kicker: string;
  title: string;
  dek?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
      <header className="page-head">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="kicker">{kicker}</p>
            <h2 className="page-title">{title}</h2>
            {dek && <p className="page-dek">{dek}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </header>
      {children}
    </div>
  );
}
