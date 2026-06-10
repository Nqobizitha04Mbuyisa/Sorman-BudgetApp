import { NavLink } from "react-router-dom";
import { LayoutDashboard, Receipt, BarChart3, Wallet, UserCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
  { to: "/transactions", label: "Transactions", icon: Receipt, testid: "nav-transactions" },
  { to: "/transactions/new", label: "Add Entry", icon: PlusCircle, testid: "nav-add-transaction" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, testid: "nav-analytics" },
  { to: "/budgets", label: "Budgets", icon: Wallet, testid: "nav-budgets" },
  { to: "/profile", label: "Profile", icon: UserCircle, testid: "nav-profile" },
];

export default function Sidebar() {
  return (
    <aside
      className="hidden lg:flex fixed inset-y-0 left-0 w-64 z-30 flex-col border-r border-border bg-card/40 backdrop-blur-xl"
      data-testid="sidebar"
    >
      <div className="h-16 px-6 flex items-center gap-3 border-b border-border">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_24px_rgba(0,122,255,0.45)]">
          <span className="font-bold text-primary-foreground">S</span>
        </div>
        <div>
          <div className="font-bold tracking-tight">Sorman</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Finance OS</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map(({ to, label, icon: Icon, testid }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/transactions"}
            data-testid={testid}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                "hover:bg-accent hover:text-foreground text-muted-foreground",
                isActive && "bg-primary/10 text-foreground border border-primary/30 shadow-[0_0_18px_rgba(0,122,255,0.22)]"
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Build</div>
        <div className="text-xs mt-1">v1.0.0 · Java + React</div>
      </div>
    </aside>
  );
}
