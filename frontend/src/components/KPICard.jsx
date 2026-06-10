import { cn, fmtMoney } from "@/lib/utils";

export default function KPICard({ label, value, accent = "primary", icon: Icon, hint, money = true, testid }) {
  const accents = {
    primary: "text-primary",
    success: "text-[hsl(var(--success))]",
    danger: "text-destructive",
    warning: "text-[hsl(var(--warning))]",
  };
  const dot = {
    primary: "bg-primary shadow-[0_0_18px_hsl(var(--primary)/0.6)]",
    success: "bg-[hsl(var(--success))] shadow-[0_0_18px_hsl(var(--success)/0.5)]",
    danger: "bg-destructive shadow-[0_0_18px_hsl(var(--destructive)/0.5)]",
    warning: "bg-[hsl(var(--warning))] shadow-[0_0_18px_hsl(var(--warning)/0.5)]",
  };
  return (
    <div className="glass rounded-2xl p-6 fade-up" data-testid={testid}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", dot[accent])} />
          {Icon && <Icon size={16} className={accents[accent]} />}
        </div>
      </div>
      <div className={cn("mt-4 font-mono text-3xl sm:text-4xl tracking-tighter tabular", accents[accent])} data-testid={testid ? `${testid}-value` : undefined}>
        {money ? fmtMoney(value) : value}
      </div>
      {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
