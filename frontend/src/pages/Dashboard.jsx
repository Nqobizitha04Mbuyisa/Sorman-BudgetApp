import { useEffect, useState } from "react";
import api from "@/lib/api";
import KPICard from "@/components/KPICard";
import { fmtMoney, fmtDate, CATEGORY_COLORS } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend
} from "recharts";

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 font-mono tabular">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}</span>
          <span className="ml-auto">{fmtMoney(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/summary")
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-muted-foreground">Loading dashboard…</div>;
  if (!data) return null;

  const breakdown = Object.entries(data.expenseByCategory || {}).map(([name, value]) => ({
    name, value, color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
  }));

  const trend = data.monthlyTrend || [];

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Overview</div>
          <h1 className="text-4xl font-bold mt-1">Financial Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time insight into your income, spending, and savings.</p>
        </div>
        <Link to="/transactions/new">
          <Button size="lg" className="shadow-[0_0_24px_rgba(0,122,255,0.35)]" data-testid="dashboard-add-transaction-btn">
            <Plus size={16} className="mr-2" /> Add transaction
          </Button>
        </Link>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard testid="kpi-income" label="Total Income" value={data.totalIncome} accent="success" icon={TrendingUp} hint={`This month · ${fmtMoney(data.monthlyIncome)}`} />
        <KPICard testid="kpi-expenses" label="Total Expenses" value={data.totalExpenses} accent="danger" icon={TrendingDown} hint={`This month · ${fmtMoney(data.monthlyExpenses)}`} />
        <KPICard testid="kpi-balance" label="Remaining Balance" value={data.remainingBalance} accent="primary" icon={Wallet} hint={`${data.transactionCount} total entries`} />
        <KPICard testid="kpi-savings-rate" label="Savings Rate" value={`${(data.savingsRate * 100).toFixed(1)}%`} accent="warning" icon={PiggyBank} money={false} hint="Income vs expenses" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="glass rounded-2xl p-6 lg:col-span-2 fade-up" data-testid="chart-monthly-trend">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Last 6 months</div>
              <h3 className="text-lg font-semibold mt-1">Income vs Expense Flow</h3>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142 76% 50%)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(142 76% 50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(4 100% 65%)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(4 100% 65%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="income" stroke="hsl(142 76% 50%)" strokeWidth={2} fill="url(#gIncome)" />
                <Area type="monotone" dataKey="expense" stroke="hsl(4 100% 65%)" strokeWidth={2} fill="url(#gExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 fade-up fade-up-1" data-testid="chart-expense-breakdown">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">By category</div>
          <h3 className="text-lg font-semibold mt-1 mb-4">Expense Breakdown</h3>
          {breakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">No expenses yet</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {breakdown.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
            {breakdown.slice(0, 6).map((b) => (
              <div key={b.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: b.color }} />
                <span className="text-muted-foreground">{b.name}</span>
                <span className="ml-auto font-mono">{fmtMoney(b.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="glass rounded-2xl p-6 fade-up fade-up-2" data-testid="recent-transactions">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Activity</div>
            <h3 className="text-lg font-semibold mt-1">Recent transactions</h3>
          </div>
          <Link to="/transactions" className="text-sm text-primary font-semibold hover:underline">View all</Link>
        </div>
        {(data.recentTransactions || []).length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No transactions yet. <Link to="/transactions/new" className="text-primary hover:underline">Add your first one →</Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(data.recentTransactions || []).map((t) => (
              <div key={t.id} className="py-3 flex items-center gap-4">
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${CATEGORY_COLORS[t.category]}22`, color: CATEGORY_COLORS[t.category] }}
                >
                  {t.type === "INCOME" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{t.description || t.category}</div>
                  <div className="text-xs text-muted-foreground">{t.category} · {fmtDate(t.occurredOn)}</div>
                </div>
                <div className={`font-mono tabular text-sm ${t.type === "INCOME" ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                  {t.type === "INCOME" ? "+" : "−"}{fmtMoney(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
