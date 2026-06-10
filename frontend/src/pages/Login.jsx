import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@finova.io");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back to Sorman");
      nav("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 dark" data-testid="login-page">
      {/* Visual side */}
      <div className="relative hidden lg:flex items-center justify-center auth-bg overflow-hidden">
        <div className="relative z-10 max-w-md px-12 fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur text-xs text-white/80">
            <Sparkles size={12} /> Built with Java 17 + Spring Boot
          </div>
          <h1 className="mt-6 text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.05]">
            Money clarity,<br />
            <span className="text-[hsl(212_100%_60%)]">engineered like enterprise software.</span>
          </h1>
          <p className="mt-5 text-white/70 text-sm leading-relaxed">
            Sorman brings recruiter-grade architecture to personal finance — JWT-secured APIs, layered services, PostgreSQL persistence, and a cinematic UI built for showing work.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { k: "Auth", v: "JWT" },
              { k: "ORM", v: "JPA" },
              { k: "DB", v: "Neon" },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">{s.k}</div>
                <div className="font-mono text-sm text-white mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <form onSubmit={onSubmit} className="w-full max-w-md" data-testid="login-form">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_24px_rgba(0,122,255,0.45)]">
              <span className="font-bold text-primary-foreground">S</span>
            </div>
            <div>
              <div className="font-bold text-lg">Sorman</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Personal Finance OS</div>
            </div>
          </div>

          <h2 className="text-3xl font-bold">Sign in</h2>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Enter your credentials below.</p>

          <div className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs uppercase tracking-[0.15em]">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-11 neon-focus"
                data-testid="login-email-input"
                placeholder="you@finova.io"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs uppercase tracking-[0.15em]">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 h-11 neon-focus"
                data-testid="login-password-input"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="mt-8 w-full h-11 text-sm font-semibold" data-testid="login-submit-button">
            {loading ? "Signing in…" : (<><LogIn size={16} className="mr-2" /> Sign in <ArrowRight size={14} className="ml-1" /></>)}
          </Button>

          <div className="mt-6 p-4 rounded-xl border border-dashed border-border bg-muted/40 text-xs text-muted-foreground" data-testid="demo-credentials">
            <div className="flex items-center gap-2 font-semibold text-foreground"><ShieldCheck size={14} className="text-[hsl(var(--success))]" /> Demo admin</div>
            <div className="mt-1 font-mono">admin@finova.io / Admin@12345</div>
          </div>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline" data-testid="goto-register-link">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
