import { Sun, Moon, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useNavigate, NavLink } from "react-router-dom";
import { useState } from "react";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const onLogout = () => {
    logout();
    nav("/login");
  };

  const initials = (user?.fullName || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="h-16 sticky top-0 z-20 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="h-full flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-accent"
            onClick={() => setMobileOpen((o) => !o)}
            data-testid="mobile-menu-toggle"
          >
            <Menu size={18} />
          </button>
          <div className="hidden sm:block">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Welcome back</div>
            <div className="text-sm font-semibold">{user?.fullName}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            data-testid="theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center hover:opacity-90 transition"
                data-testid="user-menu-trigger"
              >
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="font-semibold">{user?.fullName}</div>
                <div className="text-xs text-muted-foreground font-normal">{user?.email}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-primary mt-1">{user?.role}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => nav("/profile")} data-testid="user-menu-profile">Profile settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} data-testid="user-menu-logout" className="text-destructive focus:text-destructive">
                <LogOut size={14} className="mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden absolute top-16 inset-x-0 bg-card border-b border-border p-4 grid grid-cols-2 gap-2" data-testid="mobile-nav">
          {[
            ["/dashboard", "Dashboard"],
            ["/transactions", "Transactions"],
            ["/transactions/new", "Add Entry"],
            ["/analytics", "Analytics"],
            ["/budgets", "Budgets"],
            ["/profile", "Profile"],
          ].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg bg-accent text-sm font-medium"
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
