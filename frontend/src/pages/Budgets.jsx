import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES, CATEGORY_COLORS, fmtMoney } from "@/lib/utils";
import { toast } from "sonner";
import { Wallet, Trash2, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState("Food");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/budgets");
      setBudgets(data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/budgets", { category, monthlyLimit: parseFloat(limit) });
      toast.success("Budget saved");
      setLimit("");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to save budget");
    } finally {
      setSaving(false);
    }
  };

  const removeBudget = async (id) => {
    try { await api.delete(`/budgets/${id}`); toast.success("Budget removed"); load(); }
    catch { toast.error("Failed to remove"); }
  };

  const statusTone = (status) => {
    if (status === "EXCEEDED") return { color: "text-destructive", bar: "bg-destructive", icon: AlertTriangle };
    if (status === "WARNING") return { color: "text-[hsl(var(--warning))]", bar: "bg-[hsl(var(--warning))]", icon: AlertTriangle };
    return { color: "text-[hsl(var(--success))]", bar: "bg-[hsl(var(--success))]", icon: CheckCircle2 };
  };

  return (
    <div className="space-y-8" data-testid="budgets-page">
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Spending control</div>
        <h1 className="text-4xl font-bold mt-1">Budget limits</h1>
        <p className="text-sm text-muted-foreground mt-1">Set monthly caps. Get warnings before you overspend.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form */}
        <form onSubmit={submit} className="glass rounded-2xl p-6 lg:col-span-1 space-y-5 h-fit" data-testid="budget-form">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-primary" />
            <h3 className="font-semibold">New budget</h3>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.15em]">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2 h-11" data-testid="budget-category-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter((c) => c !== "Salary").map((c) => (
                  <SelectItem key={c} value={c}>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[c] }} />
                      {c}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-[0.15em]">Monthly limit</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R</span>
              <Input type="number" min="0.01" step="0.01" required value={limit} onChange={(e) => setLimit(e.target.value)} className="h-11 pl-7 font-mono tabular neon-focus" placeholder="1000.00" data-testid="budget-limit-input" />
            </div>
          </div>
          <Button type="submit" disabled={saving} className="w-full h-11" data-testid="budget-submit-btn">
            <Plus size={16} className="mr-2" /> {saving ? "Saving…" : "Save budget"}
          </Button>
          <p className="text-xs text-muted-foreground">Saving a category that already has a budget will update it.</p>
        </form>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="glass rounded-2xl p-12 text-center text-sm text-muted-foreground">Loading budgets…</div>
          ) : budgets.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center" data-testid="budgets-empty">
              <Wallet size={32} className="mx-auto text-muted-foreground" />
              <div className="mt-3 font-semibold">No budgets yet</div>
              <p className="text-sm text-muted-foreground mt-1">Add a monthly limit on the left to start tracking.</p>
            </div>
          ) : (
            budgets.map((b) => {
              const tone = statusTone(b.status);
              const pct = Math.min(b.utilization * 100, 100);
              const Icon = tone.icon;
              return (
                <div key={b.id} className="glass rounded-2xl p-6 fade-up" data-testid={`budget-card-${b.category}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${CATEGORY_COLORS[b.category]}22`, color: CATEGORY_COLORS[b.category] }}>
                        <Wallet size={18} />
                      </div>
                      <div>
                        <div className="font-semibold">{b.category}</div>
                        <div className="text-xs text-muted-foreground">Monthly cap · {fmtMoney(b.monthlyLimit)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${tone.color}`}>
                        <Icon size={14} /> {b.status}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeBudget(b.id)} data-testid={`delete-budget-${b.category}`}>
                        <Trash2 size={15} className="text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-mono tabular">{fmtMoney(b.spent)} <span className="text-muted-foreground">spent</span></span>
                      <span className="font-mono tabular text-muted-foreground">{fmtMoney(b.remaining)} left</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${tone.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">{(b.utilization * 100).toFixed(1)}% used this month</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
