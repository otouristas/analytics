export function SocialProof() {
  const metrics = [
    { label: "Events analyzed", value: "250M+" },
    { label: "Connected pages", value: "40K+" },
    { label: "Tracking uptime", value: "99.99%" },
    { label: "Decision speed", value: "< 1.2s" },
  ];

  return (
    <section className="border-y border-border bg-surface/30 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-subtle mb-6">
          Trusted by modern growth & analytics leaders
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {metrics.map((m, i) => (
            <div key={i} className="flex flex-col items-center justify-center">
              <span className="stat-value text-2xl sm:text-3xl font-bold text-fg">{m.value}</span>
              <span className="caption mt-1">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
