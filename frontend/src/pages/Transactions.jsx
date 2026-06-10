import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, CATEGORY_COLORS, fmtMoney, fmtDate } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Search, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("occurredOn");
  const [sortDir, setSortDir] = useState("desc");
  const [loading, setLoading] = useState(true);

  const fetchTxns = async () => {
    setLoading(true);
    const params = { page, size, sort_by: sortBy, sort_dir: sortDir };
    if (search) params.search = search;
    if (type !== "ALL") params.type = type;
    if (category !== "ALL") params.category = category;
    try {
      const { data } = await api.get("/transactions", { params });
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTxns(); /* eslint-disable-next-line */ }, [page, type, category, sortBy, sortDir]);
  useEffect(() => { const t = setTimeout(() => { setPage(0); fetchTxns(); }, 350); return () => clearTimeout(t); /* eslint-disable-next-line */ }, [search]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Transaction deleted");
      fetchTxns();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6" data-testid="transactions-page">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Ledger</div>
          <h1 className="text-4xl font-bold mt-1">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} total entries</p>
        </div>
        <Link to="/transactions/new">
          <Button data-testid="add-new-transaction-btn"><Plus size={16} className="mr-2" /> New transaction</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search description…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 neon-focus" data-testid="search-input" />
        </div>
        <Select value={type} onValueChange={(v) => { setType(v); setPage(0); }}>
          <SelectTrigger className="h-10" data-testid="filter-type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(0); }}>
          <SelectTrigger className="h-10" data-testid="filter-category"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={`${sortBy}:${sortDir}`} onValueChange={(v) => { const [b, d] = v.split(":"); setSortBy(b); setSortDir(d); }}>
          <SelectTrigger className="h-10" data-testid="filter-sort"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="occurredOn:desc">Date · Newest</SelectItem>
            <SelectItem value="occurredOn:asc">Date · Oldest</SelectItem>
            <SelectItem value="amount:desc">Amount · High to low</SelectItem>
            <SelectItem value="amount:asc">Amount · Low to high</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden" data-testid="transactions-table">
        <div className="grid grid-cols-12 px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-muted-foreground border-b border-border bg-muted/30">
          <div className="col-span-5 sm:col-span-4">Description</div>
          <div className="col-span-3 sm:col-span-2">Category</div>
          <div className="hidden sm:block sm:col-span-2">Date</div>
          <div className="col-span-3 sm:col-span-2 text-right">Amount</div>
          <div className="col-span-1 sm:col-span-2 text-right">Action</div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-sm text-muted-foreground">No transactions match your filters.</div>
            <Link to="/transactions/new" className="text-sm text-primary font-semibold mt-2 inline-block">Add your first transaction →</Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((t) => (
              <div key={t.id} className="grid grid-cols-12 px-5 py-4 items-center hover:bg-muted/30 transition" data-testid={`txn-row-${t.id}`}>
                <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${CATEGORY_COLORS[t.category]}22`, color: CATEGORY_COLORS[t.category] }}>
                    {t.type === "INCOME" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{t.description || "—"}</div>
                    <div className="text-xs text-muted-foreground sm:hidden">{fmtDate(t.occurredOn)}</div>
                  </div>
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <Badge variant="secondary" className="font-normal">{t.category}</Badge>
                </div>
                <div className="hidden sm:block sm:col-span-2 text-sm text-muted-foreground">{fmtDate(t.occurredOn)}</div>
                <div className={`col-span-3 sm:col-span-2 text-right font-mono tabular text-sm ${t.type === "INCOME" ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                  {t.type === "INCOME" ? "+" : "−"}{fmtMoney(t.amount)}
                </div>
                <div className="col-span-1 sm:col-span-2 text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`delete-txn-${t.id}`}><Trash2 size={15} className="text-muted-foreground hover:text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
                        <AlertDialogDescription>This action can't be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid={`confirm-delete-${t.id}`}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20" data-testid="pagination">
          <div className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} data-testid="pagination-prev"><ChevronLeft size={14} /> Prev</Button>
            <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} data-testid="pagination-next">Next <ChevronRight size={14} /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
