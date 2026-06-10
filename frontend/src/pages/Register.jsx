import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, ArrowRight, Sparkles } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(fullName, email, password);
      toast.success("Account created — welcome aboard");
      nav("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 dark" data-testid="register-page">
      <div className="relative hidden lg:flex items-center justify-center auth-bg overflow-hidden">
        <div className="relative z-10 max-w-md px-12 fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur text-xs text-white/80">
            <Sparkles size={12} /> Recruiter-ready portfolio project
          </div>
          <h1 className="mt-6 text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.05]">
            Open an account.<br />
            <span className="text-[hsl(142_76%_50%)]">Own your numbers.</span>
          </h1>
          <p className="mt-5 text-white/70 text-sm leading-relaxed">
            Track income, categorize expenses, set monthly budgets, and visualize the trends — all secured by a Spring Boot REST API.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <form onSubmit={onSubmit} className="w-full max-w-md" data-testid="register-form">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_24px_rgba(0,122,255,0.45)]">
              <span className="font-bold text-primary-foreground">F</span>
            </div>
            <div>
              <div className="font-bold text-lg">Sorman</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Create account</div>
            </div>
          </div>

          <h2 className="text-3xl font-bold">Create your account</h2>
          <p className="text-sm text-muted-foreground mt-1">Start tracking in under a minute.</p>

          <div className="mt-8 space-y-4">
            <div>
              <Label htmlFor="name" className="text-xs uppercase tracking-[0.15em]">Full name</Label>
              <Input id="name" required minLength={2} value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2 h-11 neon-focus" data-testid="register-name-input" placeholder="Jane Doe" />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs uppercase tracking-[0.15em]">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-11 neon-focus" data-testid="register-email-input" placeholder="you@Sorman.io" />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs uppercase tracking-[0.15em]">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-11 neon-focus" data-testid="register-password-input" placeholder="At least 6 characters" />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="mt-8 w-full h-11 text-sm font-semibold" data-testid="register-submit-button">
            {loading ? "Creating account…" : (<><UserPlus size={16} className="mr-2" /> Create account <ArrowRight size={14} className="ml-1" /></>)}
          </Button>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline" data-testid="goto-login-link">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
