import { useEffect, useState } from "react";
import api from "@/lib/api";
import { CATEGORY_COLORS, fmtMoney } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs">
      {label && <div className="font-semibold mb-1">{label}</div>}
      {payload.map((p) => (
        <div key={p.dataKey || p.name} className="flex items-center gap-2 font-mono tabular">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.color }} />
          <span className="text-muted-foreground capitalize">{p.name || p.dataKey}</span>
          <span className="ml-auto">{fmtMoney(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get("/dashboard/summary").then(({ data }) => setData(data)); }, []);
  if (!data) return <div className="text-muted-foreground">Loading analytics…</div>;

  const breakdown = Object.entries(data.expenseByCategory || {}).map(([name, value]) => ({
    name, value, color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
  }));
  
  const trend = data.monthlyTrend || [];
  const netTrend = trend.map((t) => ({ month: t.month, net: t.income - t.expense }));

  return (
    <div className="space-y-8" data-testid="analytics-page">
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Insights</div>
        <h1 className="text-4xl font-bold mt-1">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Deep-dive into where your money goes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-6 fade-up" data-testid="chart-income-vs-expense">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Comparison</div>
          <h3 className="text-lg font-semibold mt-1 mb-4">Income vs Expense by Month</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={trend} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income" fill="hsl(142 76% 50%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="hsl(4 100% 65%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 fade-up fade-up-1" data-testid="chart-category-pie">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Where it goes</div>
          <h3 className="text-lg font-semibold mt-1 mb-4">Spending by Category</h3>
          {breakdown.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">No expense data yet</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={breakdown} dataKey="value" nameKey="name" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {breakdown.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6 lg:col-span-2 fade-up fade-up-2" data-testid="chart-net-trend">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Trend</div>
          <h3 className="text-lg font-semibold mt-1 mb-4">Net Savings Over Time</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={netTrend} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="net" stroke="hsl(212 100% 60%)" strokeWidth={3} dot={{ fill: "hsl(212 100% 60%)", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="glass rounded-2xl p-6 fade-up fade-up-3" data-testid="category-breakdown-table">
        <h3 className="text-lg font-semibold mb-4">Category breakdown</h3>
        {breakdown.length === 0 ? (
          <div className="text-sm text-muted-foreground">No data.</div>
        ) : (
          <div className="space-y-3">
            {breakdown.sort((a, b) => b.value - a.value).map((b) => {
              const total = breakdown.reduce((s, x) => s + x.value, 0);
              const pct = (b.value / total) * 100;
              return (
                <div key={b.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: b.color }} />
                      <span className="font-medium">{b.name}</span>
                    </div>
                    <div className="font-mono tabular">{fmtMoney(b.value)} <span className="text-muted-foreground ml-2">{pct.toFixed(1)}%</span></div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: b.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
