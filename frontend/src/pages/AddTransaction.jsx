import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowUpRight, ArrowDownRight, Save } from "lucide-react";

export default function AddTransaction() {
  const nav = useNavigate();
  const [type, setType] = useState("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/transactions", {
        type, amount: parseFloat(amount), category, description: description || null, occurredOn: date,
      });
      toast.success(`${type === "INCOME" ? "Income" : "Expense"} added`);
      nav("/transactions");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to add transaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl" data-testid="add-transaction-page">
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">New entry</div>
        <h1 className="text-4xl font-bold mt-1">Add transaction</h1>
        <p className="text-sm text-muted-foreground mt-1">Record income or expense and keep the books clean.</p>
      </div>

      <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-6" data-testid="add-transaction-form">
        {/* Type toggle */}
        <div>
          <Label className="text-xs uppercase tracking-[0.15em]">Type</Label>
          <div className="mt-2 grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
            {[
              { v: "EXPENSE", label: "Expense", icon: ArrowDownRight, tone: "text-destructive" },
              { v: "INCOME", label: "Income", icon: ArrowUpRight, tone: "text-[hsl(var(--success))]" },
            ].map(({ v, label, icon: Icon, tone }) => (
              <button
                key={v}
                type="button"
                onClick={() => setType(v)}
                data-testid={`type-${v.toLowerCase()}-btn`}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  type === v ? "bg-card border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={16} className={type === v ? tone : ""} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <Label htmlFor="amount" className="text-xs uppercase tracking-[0.15em]">Amount</Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 pl-7 text-lg font-mono tabular neon-focus"
              placeholder="0.00"
              data-testid="amount-input"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <Label className="text-xs uppercase tracking-[0.15em]">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-2 h-11 neon-focus" data-testid="category-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} data-testid={`category-option-${c}`}>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLORS[c] }} />
                    {c}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div>
          <Label htmlFor="date" className="text-xs uppercase tracking-[0.15em]">Date</Label>
          <Input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 h-11 neon-focus" data-testid="date-input" />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="desc" className="text-xs uppercase tracking-[0.15em]">Description (optional)</Label>
          <Textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 neon-focus" placeholder="Grocery run, monthly salary, Netflix…" data-testid="description-input" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving} className="h-11 px-6" data-testid="add-transaction-submit-btn">
            <Save size={16} className="mr-2" /> {saving ? "Saving…" : "Save transaction"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => nav(-1)} data-testid="cancel-btn">Cancel</Button>
        </div>
      </form>
    </div>
  );
}
