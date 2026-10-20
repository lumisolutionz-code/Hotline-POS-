import { useState, useEffect, useMemo } from "react";
import { Plus, X, Search, Trash2, Loader2, ArrowUpRight, ArrowDownRight, BookOpen, CreditCard } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "../../../lib/api";
import { PermissionOverrideModal } from "../modals/PermissionOverrideModal";
import { LoansView, type LoansSummaryData } from "./LoansPanel";

export interface LedgerNote {
  _id: string;
  noteNo: string;
  description: string;
  amount: number;
  toWhom: string;
  type: "+" | "-";
  status: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: {
    _id: string;
    username: string;
    name?: string;
  };
  updatedBy?: {
    _id: string;
    username: string;
    name?: string;
  };
}

interface ExtrasPanelProps {
  onClose: () => void;
  initialTab?: "all" | "in" | "out" | "loans";
}

type LedgerTimeFilter = "today" | "yesterday" | "thisMonth" | "all";

export function ExtrasPanel({ onClose, initialTab = "all" }: ExtrasPanelProps): JSX.Element {
  const [filterType, setFilterType] = useState<"all" | "in" | "out" | "loans">(initialTab);
  const [timeFilter, setTimeFilter] = useState<LedgerTimeFilter>("today");
  const [activeLoansCount, setActiveLoansCount] = useState<number>(0);
  const [loansSummary, setLoansSummary] = useState<LoansSummaryData>({
    totalLoaned: 0,
    totalPaid: 0,
    totalDue: 0,
    activeCount: 0,
    completedCount: 0,
    totalProfiles: 0,
  });

  // --- Notes (Ledger) State ---
  const [notes, setNotes] = useState<LedgerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [entryType, setEntryType] = useState<"+" | "-">("-"); // Default to Cash Out (Expense)
  const [entryDesc, setEntryDesc] = useState("");
  const [entryAmount, setEntryAmount] = useState("");
  const [entryToWhom, setEntryToWhom] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deletion State
  const [noteToDelete, setNoteToDelete] = useState<LedgerNote | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getDateRangeForFilter = (filter: LedgerTimeFilter) => {
    const formatYMD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const today = new Date();
    if (filter === "today") {
      const todayStr = formatYMD(today);
      return { startDate: todayStr, endDate: todayStr };
    } else if (filter === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = formatYMD(y);
      return { startDate: yStr, endDate: yStr };
    } else if (filter === "thisMonth") {
      const firstDay = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
      const todayStr = formatYMD(today);
      return { startDate: firstDay, endDate: todayStr };
    }
    return null; // "all"
  };

  // Fetch Notes (Cash In & Cash Out) with date filtering
  const fetchNotes = async (activeFilter: LedgerTimeFilter = timeFilter) => {
    try {
      setLoading(true);
      const range = getDateRangeForFilter(activeFilter);
      let url = "/notes";
      if (range) {
        url += `?startDate=${range.startDate}&endDate=${range.endDate}`;
      }
      const res = await apiGet<{ status: string; data?: { notes: LedgerNote[] }; message?: string }>(url);
      if (res.status === "success" && res.data?.notes) {
        setNotes(res.data.notes);
      }
    } catch (error: any) {
      console.error("Error fetching ledger notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(timeFilter);
  }, [timeFilter]);

  useEffect(() => {
    apiGet<{ status: string; data?: { loans: any[] } }>("/loans")
      .then((res) => {
        if (res.status === "success" && Array.isArray(res.data?.loans)) {
          const lList = res.data.loans;
          const active = lList.filter((l: any) => l.status === "ACTIVE").length;
          setActiveLoansCount(active);
          let totalLoaned = 0;
          let totalPaid = 0;
          let totalDue = 0;
          let activeCount = 0;
          let completedCount = 0;
          lList.forEach((l: any) => {
            if (l.status !== "CANCELLED") {
              totalLoaned += Number(l.amount || 0);
              totalPaid += Number(l.paidAmount || 0);
              totalDue += Number(l.dueAmount || 0);
              if (l.status === "ACTIVE") activeCount++;
              if (l.status === "COMPLETED") completedCount++;
            }
          });
          setLoansSummary({
            totalLoaned,
            totalPaid,
            totalDue,
            activeCount,
            completedCount,
            totalProfiles: lList.length,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Submit Note (Cash In or Cash Out)
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryDesc.trim() || !entryAmount || Number(entryAmount) <= 0) return;

    try {
      setIsSubmitting(true);
      const res = await apiPost<{ status: string; message?: string }>("/notes", {
        description: entryDesc.trim(),
        amount: Number(entryAmount),
        toWhom: entryToWhom.trim(),
        type: entryType,
      });

      if (res.status === "success") {
        setShowAddModal(false);
        setEntryDesc("");
        setEntryAmount("");
        setEntryToWhom("");
        setEntryType("-");
        fetchNotes();
      } else {
        alert(res.message || "Failed to record transaction");
      }
    } catch (error: any) {
      alert(error.message || "Network error recording transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Request Handlers
  const handleDeleteNoteClick = (nt: LedgerNote) => {
    setNoteToDelete(nt);
    setShowPermissionModal(true);
  };

  const handlePermissionSuccess = async (_overrideId?: string) => {
    if (!noteToDelete) return;
    try {
      setIsDeleting(true);
      setShowPermissionModal(false);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const res = await apiDelete<{ status: string; message?: string }>(`/notes/${noteToDelete._id}`);
      if (res.status === "success") {
        fetchNotes();
      } else {
        alert(res.message || "Failed to delete record");
      }
      setNoteToDelete(null);
    } catch (error: any) {
      alert(error.message || "Error deleting record");
    } finally {
      setIsDeleting(false);
    }
  };

  // Financial Metrics Calculation
  const metrics = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    let inCount = 0;
    let outCount = 0;

    notes.forEach((n) => {
      if (n.status === "CANCELLED") return;
      const amt = Number(n.amount || 0);
      if (n.type === "+") {
        totalIn += amt;
        inCount++;
      } else {
        totalOut += amt;
        outCount++;
      }
    });

    return {
      totalIn,
      totalOut,
      net: totalIn - totalOut,
      inCount,
      outCount,
      totalCount: notes.length,
    };
  }, [notes]);

  // Filtered List
  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes.filter((n) => {
      if (filterType === "in" && n.type !== "+") return false;
      if (filterType === "out" && n.type !== "-") return false;

      if (q) {
        const matchesDesc = (n.description || "").toLowerCase().includes(q);
        const matchesPayee = (n.toWhom || "").toLowerCase().includes(q);
        const matchesNo = (n.noteNo || "").toLowerCase().includes(q);
        return matchesDesc || matchesPayee || matchesNo;
      }
      return true;
    });
  }, [notes, filterType, search]);

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[700px] xl:w-[740px] bg-slate-50 dark:bg-slate-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 border-l border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="bg-[#0f172a] text-white px-6 pt-4 pb-3 flex flex-col gap-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Store Ledger</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-950 text-teal-400 border border-teal-800">
                  Cash In & Out
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-teal-300 border border-slate-700">
                  {timeFilter === "today" ? "Today" : timeFilter === "yesterday" ? "Yesterday" : timeFilter === "thisMonth" ? "This Month" : "All Time"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Unified record of cash inflows and store expenses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metric Mini Cards */}
        {filterType === "loans" ? (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Total Borrowed</span>
              <div className="text-sm font-extrabold text-white font-mono mt-0.5">
                Rs. {loansSummary.totalLoaned.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 block">{loansSummary.totalProfiles} profiles</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Total Repaid</span>
              <div className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5">
                Rs. {loansSummary.totalPaid.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-400/80 block">
                {loansSummary.totalLoaned > 0 ? ((loansSummary.totalPaid / loansSummary.totalLoaned) * 100).toFixed(1) : 0}% cleared
              </span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Remaining Balance</span>
              <div className="text-sm font-extrabold text-rose-400 font-mono mt-0.5">
                Rs. {loansSummary.totalDue.toLocaleString()}
              </div>
              <span className="text-[10px] text-rose-400/80 block">{loansSummary.activeCount} active dues</span>
            </div>
          </div>
        ) : loansSummary.totalPaid > 0 ? (
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Cash In (+)</span>
              <div className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5">
                +Rs. {metrics.totalIn.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 block">{metrics.inCount} entries</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Cash Out (-)</span>
              <div className="text-sm font-extrabold text-rose-400 font-mono mt-0.5">
                -Rs. {metrics.totalOut.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 block">{metrics.outCount} expenses</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Loans Paid (-)</span>
              <div className="text-sm font-extrabold text-purple-400 font-mono mt-0.5">
                -Rs. {loansSummary.totalPaid.toLocaleString()}
              </div>
              <span className="text-[10px] text-purple-400/80 block">{loansSummary.activeCount} active loans</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Net Balance</span>
              <div
                className={`text-sm font-extrabold font-mono mt-0.5 ${
                  (metrics.net - loansSummary.totalPaid) >= 0 ? "text-blue-400" : "text-amber-400"
                }`}
              >
                {(metrics.net - loansSummary.totalPaid) >= 0 ? "+Rs. " : "-Rs. "}
                {Math.abs(metrics.net - loansSummary.totalPaid).toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 block">{notes.length} total records</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Cash In (+)</span>
              <div className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5">
                +Rs. {metrics.totalIn.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 block">{metrics.inCount} entries</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Cash Out (-)</span>
              <div className="text-sm font-extrabold text-rose-400 font-mono mt-0.5">
                -Rs. {metrics.totalOut.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 block">{metrics.outCount} expenses</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Net Balance</span>
              <div
                className={`text-sm font-extrabold font-mono mt-0.5 ${
                  metrics.net >= 0 ? "text-blue-400" : "text-amber-400"
                }`}
              >
                {metrics.net >= 0 ? "+Rs. " : "-Rs. "}
                {Math.abs(metrics.net).toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 block">{notes.length} total records</span>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-800 pt-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 shrink-0 ${
              filterType === "all"
                ? "border-teal-500 text-teal-400 bg-slate-800/80"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <span>All Transactions</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-slate-800 text-slate-300">
              {notes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("out")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 shrink-0 ${
              filterType === "out"
                ? "border-rose-500 text-rose-400 bg-slate-800/80"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Cash Out (Expenses)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-800">
              {metrics.outCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("in")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 shrink-0 ${
              filterType === "in"
                ? "border-emerald-500 text-emerald-400 bg-slate-800/80"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cash In</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800">
              {metrics.inCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType("loans")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 shrink-0 ${
              filterType === "loans"
                ? "border-purple-500 text-purple-400 bg-slate-800/80"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-purple-400" />
            <span>Loans</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-purple-950 text-purple-300 border border-purple-800">
              {activeLoansCount}
            </span>
          </button>
        </div>
      </div>

      {filterType === "loans" ? (
        <LoansView
          hideOverview={true}
          onSummaryChange={(s) => {
            setLoansSummary(s);
            setActiveLoansCount(s.activeCount);
          }}
        />
      ) : (
        <>
          {/* Toolbar */}
          <div className="p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/50 flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="relative flex-1 min-w-[170px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search description, payee, NT#..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder-slate-400 font-medium"
              />
            </div>

            {/* Quick Period Filters */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setTimeFilter("today")}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeFilter === "today"
                    ? "bg-teal-600 text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("yesterday")}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeFilter === "yesterday"
                    ? "bg-teal-600 text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("thisMonth")}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeFilter === "thisMonth"
                    ? "bg-teal-600 text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("all")}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeFilter === "all"
                    ? "bg-teal-600 text-white shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All Time
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all font-bold text-xs shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Record Entry
            </button>
          </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-7 h-7 text-teal-500 animate-spin" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <BookOpen className="w-12 h-12 mb-2 opacity-25" />
            <p className="text-xs font-semibold">No ledger transactions found</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isCashIn = note.type === "+";
            return (
              <div
                key={note._id}
                className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-xs flex items-center justify-between group hover:border-teal-300 transition-all"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isCashIn
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                          : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800"
                      }`}
                    >
                      {isCashIn ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {isCashIn ? "+ CASH IN" : "- CASH OUT"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {note.noteNo}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-white text-xs leading-snug truncate" title={note.description}>
                    {note.description}
                  </h3>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    {note.toWhom && (
                      <span className="bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-[10px]">
                        Payee: <strong>{note.toWhom}</strong>
                      </span>
                    )}
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{note.createdBy?.username || "Cashier"}</span>
                    {note.updatedBy?.username && note.updatedAt && note.updatedAt !== note.createdAt && (
                      <>
                        <span>•</span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400">
                          (Edited by {note.updatedBy.username})
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm font-extrabold font-mono block ${
                        isCashIn ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isCashIn ? "+" : "-"}Rs. {Number(note.amount || 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 block">
                      {note.status || "APPROVED"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteNoteClick(note)}
                    disabled={isDeleting && noteToDelete?._id === note._id}
                    className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete record"
                  >
                    {isDeleting && noteToDelete?._id === note._id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  )}

      {/* ADD ENTRY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-[#0f172a] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm text-white">Record Cash Transaction</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="p-5 space-y-4 text-xs">
              {/* Type Switcher */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntryType("-")}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      entryType === "-"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Cash Out (Expense)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEntryType("+")}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      entryType === "+"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Cash In (Deposit)</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Amount (Rs.) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  placeholder="0.00"
                  value={entryAmount}
                  onChange={(e) => setEntryAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason / Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    entryType === "-"
                      ? "e.g. Restock items, Lunch, Shop supplies, Loan..."
                      : "e.g. Owner cash deposit, Tempered addition..."
                  }
                  value={entryDesc}
                  onChange={(e) => setEntryDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* To Whom / From Whom */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {entryType === "-" ? "Given To / Payee" : "Received From (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Supplier name, Employee name..."
                  value={entryToWhom}
                  onChange={(e) => setEntryToWhom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                    entryType === "-" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Override Modal */}
      {showPermissionModal && (
        <PermissionOverrideModal
          permission="DELETE_RECORD"
          onClose={() => {
            setShowPermissionModal(false);
            setNoteToDelete(null);
          }}
          onSuccess={handlePermissionSuccess}
        />
      )}
    </div>
  );
}

// Re-export for compatibility
export const LedgerPanel = ExtrasPanel;
export const ExpensesPanel = ExtrasPanel;
