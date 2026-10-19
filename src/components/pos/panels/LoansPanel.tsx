import { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  X,
  Search,
  PlusCircle,
  Loader2,
  Clock,
  CheckCircle2,
  History,
  ChevronDown,
  ChevronUp,
  Banknote,
} from "lucide-react";
import { apiGet, apiPost } from "../../../lib/api";

export interface LoanProfile {
  _id: string;
  loanNo: string;
  title: string;
  description?: string;
  amount: number;
  dailyPayingAmount: number;
  paidAmount: number;
  dueAmount: number;
  dateLoanTaken: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  branch?: { _id: string; name: string };
  createdBy?: { _id: string; username: string };
  createdAt: string;
  updatedAt: string;
}

export interface LoanPaymentRecord {
  _id: string;
  paymentNo: string;
  loan: string | { _id: string; title: string; loanNo: string };
  amount: number;
  dailyPayingAmount: number;
  paymentDate: string;
  paymentMethod: string;
  notes?: string;
  createdBy?: { _id: string; username: string };
  createdAt: string;
}

export interface LoansSummaryData {
  totalLoaned: number;
  totalPaid: number;
  totalDue: number;
  activeCount: number;
  completedCount: number;
  totalProfiles: number;
}

interface LoansViewProps {
  hideOverview?: boolean;
  onSummaryChange?: (summary: LoansSummaryData) => void;
}

interface LoansPanelProps {
  onClose: () => void;
}

export function LoansView({ hideOverview = false, onSummaryChange }: LoansViewProps = {}): JSX.Element {
  const [loans, setLoans] = useState<LoanProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [filterTab, setFilterTab] = useState<"active" | "all" | "completed">("active");

  // Payment Modal State
  const [selectedLoanForPay, setSelectedLoanForPay] = useState<LoanProfile | null>(null);
  const [payAmount, setPayAmount] = useState<string>("");
  const [payNotes, setPayNotes] = useState<string>("");
  const [isSubmittingPay, setIsSubmittingPay] = useState<boolean>(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState<string>("");

  // History expansion state: loanId -> boolean
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [loanPaymentsMap, setLoanPaymentsMap] = useState<Record<string, LoanPaymentRecord[]>>({});

  // Fetch all loans
  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await apiGet<{ status: string; data?: { loans: LoanProfile[] }; message?: string }>("/loans");
      if (res.status === "success" && Array.isArray(res.data?.loans)) {
        setLoans(res.data.loans);
      }
    } catch (err: any) {
      console.error("Error fetching loans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // Fetch loan payment history when expanded
  const toggleHistory = async (loanId: string) => {
    if (expandedLoanId === loanId) {
      setExpandedLoanId(null);
      return;
    }

    setExpandedLoanId(loanId);
    if (!loanPaymentsMap[loanId]) {
      try {
        setHistoryLoading(true);
        const res = await apiGet<{ status: string; data?: { payments: LoanPaymentRecord[] } }>(
          `/loan-payments?loanId=${loanId}`
        );
        if (res.status === "success" && Array.isArray(res.data?.payments)) {
          setLoanPaymentsMap((prev) => ({ ...prev, [loanId]: res.data!.payments }));
        }
      } catch (err) {
        console.error("Error fetching loan payments history:", err);
      } finally {
        setHistoryLoading(false);
      }
    }
  };

  // Open Payment Modal
  const handleOpenPayModal = (loan: LoanProfile) => {
    setSelectedLoanForPay(loan);
    const due = Number(loan.dueAmount || 0);
    const daily = Number(loan.dailyPayingAmount || 0);
    // Prefill with daily paying amount or remaining due if due < daily
    const defaultAmount = daily > 0 && daily <= due ? daily : (due > 0 ? due : daily);
    setPayAmount(defaultAmount.toString());
    setPayNotes("");
    setPaySuccessMsg("");
  };

  // Submit Payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForPay) return;
    const numAmount = parseFloat(payAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid positive payment amount.");
      return;
    }

    try {
      setIsSubmittingPay(true);
      const res = await apiPost<{ status: string; message?: string }>("/loan-payments", {
        loanId: selectedLoanForPay._id,
        amount: numAmount,
        paymentMethod: "CASH",
        notes: payNotes.trim(),
      });

      if (res.status === "success") {
        setPaySuccessMsg(`Payment of Rs. ${numAmount.toLocaleString()} recorded successfully!`);
        setTimeout(() => {
          setSelectedLoanForPay(null);
          setPaySuccessMsg("");
        }, 1200);

        // Refresh loans & cached payments
        fetchLoans();
        if (expandedLoanId === selectedLoanForPay._id) {
          const updatedHistory = await apiGet<{ status: string; data?: { payments: LoanPaymentRecord[] } }>(
            `/loan-payments?loanId=${selectedLoanForPay._id}`
          );
          if (updatedHistory.status === "success" && updatedHistory.data?.payments) {
            setLoanPaymentsMap((prev) => ({ ...prev, [selectedLoanForPay._id]: updatedHistory.data!.payments }));
          }
        }
      } else {
        alert(res.message || "Failed to record loan payment");
      }
    } catch (err: any) {
      alert(err.message || "Network error recording payment");
    } finally {
      setIsSubmittingPay(false);
    }
  };

  // Financial summary
  const summary = useMemo(() => {
    let totalLoaned = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let activeCount = 0;
    let completedCount = 0;

    loans.forEach((l) => {
      if (l.status !== "CANCELLED") {
        totalLoaned += Number(l.amount || 0);
        totalPaid += Number(l.paidAmount || 0);
        totalDue += Number(l.dueAmount || 0);
        if (l.status === "ACTIVE") activeCount++;
        if (l.status === "COMPLETED") completedCount++;
      }
    });

    return { totalLoaned, totalPaid, totalDue, activeCount, completedCount };
  }, [loans]);

  useEffect(() => {
    if (onSummaryChange) {
      onSummaryChange({
        ...summary,
        totalProfiles: loans.length,
      });
    }
  }, [summary, loans.length, onSummaryChange]);

  // Filtered loans list
  const filteredLoans = useMemo(() => {
    const q = search.trim().toLowerCase();
    return loans.filter((l) => {
      if (filterTab === "active" && l.status !== "ACTIVE") return false;
      if (filterTab === "completed" && l.status !== "COMPLETED") return false;

      if (q) {
        const title = (l.title || "").toLowerCase();
        const no = (l.loanNo || "").toLowerCase();
        const desc = (l.description || "").toLowerCase();
        return title.includes(q) || no.includes(q) || desc.includes(q);
      }
      return true;
    });
  }, [loans, filterTab, search]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Overview KPI Cards */}
      {!hideOverview && (
        <div className="p-4 bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Borrowed</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
              Rs. {summary.totalLoaned.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{loans.length} profiles</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Total Repaid</span>
            <span className="text-sm font-extrabold text-emerald-600 font-mono mt-0.5 block">
              Rs. {summary.totalPaid.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
              {summary.totalLoaned > 0 ? ((summary.totalPaid / summary.totalLoaned) * 100).toFixed(1) : 0}% cleared
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-2xs">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Remaining Balance</span>
            <span className="text-sm font-extrabold text-rose-600 font-mono mt-0.5 block">
              Rs. {summary.totalDue.toLocaleString()}
            </span>
            <span className="text-[10px] text-rose-400 font-medium block mt-0.5">{summary.activeCount} active dues</span>
          </div>
        </div>
      )}

        {/* Tab & Search Toolbar */}
        <div className="p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              onClick={() => setFilterTab("active")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterTab === "active"
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Active ({summary.activeCount})
            </button>
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterTab === "all"
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              All ({loans.length})
            </button>
            <button
              onClick={() => setFilterTab("completed")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterTab === "completed"
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Completed ({summary.completedCount})
            </button>
          </div>

          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search loan profile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Loans List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-7 h-7 text-purple-600 animate-spin" />
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <CreditCard className="w-10 h-10 mb-2 opacity-30 text-purple-400" />
              <p className="text-xs font-bold">No loans found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Loan profiles created in Admin Panel will appear here.</p>
            </div>
          ) : (
            filteredLoans.map((loan) => {
              const amt = Number(loan.amount || 0);
              const paid = Number(loan.paidAmount || 0);
              const due = Number(loan.dueAmount || 0);
              const daily = Number(loan.dailyPayingAmount || 0);
              const pct = amt > 0 ? Math.min(100, Math.round((paid / amt) * 100)) : 0;
              const isCompleted = loan.status === "COMPLETED" || due <= 0;
              const estDays = daily > 0 && due > 0 ? Math.ceil(due / daily) : 0;
              const isExpanded = expandedLoanId === loan._id;
              const historyList = loanPaymentsMap[loan._id] || [];

              return (
                <div
                  key={loan._id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-2xs overflow-hidden transition-all hover:border-purple-300"
                >
                  <div className="p-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {loan.loanNo}
                          </span>
                          {isCompleted ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Cleared
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                              Active
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                          {loan.title}
                        </h3>
                        {loan.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{loan.description}</p>
                        )}
                      </div>

                      {/* Pay Button */}
                      {!isCompleted && (
                        <button
                          onClick={() => handleOpenPayModal(loan)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Pay Today</span>
                        </button>
                      )}
                    </div>

                    {/* Progress Bar & Amount Row */}
                    <div className="mt-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500 text-[11px]">
                          Paid: <strong className="text-emerald-600 font-mono">Rs. {paid.toLocaleString()}</strong>
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Due: <strong className="text-rose-600 font-mono">Rs. {due.toLocaleString()}</strong>
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Total: <strong className="text-slate-800 dark:text-white font-mono">Rs. {amt.toLocaleString()}</strong>
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                        <span>{pct}% paid off</span>
                        <span>Loan taken: {new Date(loan.dateLoanTaken).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Daily Rate & Duration Info */}
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-200/60 dark:border-purple-800">
                        <Banknote className="w-3.5 h-3.5" />
                        <span className="font-bold">Daily Rate: Rs. {daily.toLocaleString()} / day</span>
                      </div>

                      {!isCompleted && daily > 0 && (
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>~{estDays} days remaining</span>
                        </div>
                      )}
                    </div>

                    {/* Toggle Payment History Accordion */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => toggleHistory(loan._id)}
                        className="text-xs font-semibold text-slate-500 hover:text-purple-600 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        <span>Payment History</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Accordion History Content */}
                    {isExpanded && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                        {historyLoading && !loanPaymentsMap[loan._id] ? (
                          <div className="flex items-center justify-center py-4 text-slate-400">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading records...
                          </div>
                        ) : historyList.length === 0 ? (
                          <div className="text-center py-3 text-xs text-slate-400">
                            No repayments logged yet for this loan.
                          </div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                            {historyList.map((rec) => (
                              <div
                                key={rec._id}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs border border-slate-200/60 dark:border-slate-800"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] font-bold text-slate-500">
                                      {rec.paymentNo}
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                      {new Date(rec.paymentDate).toLocaleDateString()}
                                    </span>
                                    {rec.notes && (
                                      <span className="text-[10px] text-slate-400 italic max-w-xs truncate">
                                        • {rec.notes}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    Recorded by: {rec.createdBy?.username || "Cashier"} (Daily Rate: Rs. {rec.dailyPayingAmount})
                                  </div>
                                </div>
                                <span className="font-extrabold font-mono text-emerald-600 text-xs">
                                  +Rs. {Number(rec.amount || 0).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Record Payment Modal */}
        {selectedLoanForPay && (
          <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
                    <Banknote className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Daily Repayment</h3>
                    <p className="text-xs text-slate-400">{selectedLoanForPay.loanNo} — {selectedLoanForPay.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLoanForPay(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {paySuccessMsg ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 animate-bounce" />
                  <p className="text-sm font-bold text-emerald-600">{paySuccessMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitPayment} className="mt-4 space-y-3.5">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Due Balance:</span>
                      <strong className="text-rose-600 block text-xs font-mono font-bold">
                        Rs. {Number(selectedLoanForPay.dueAmount || 0).toLocaleString()}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[11px]">Scheduled Daily:</span>
                      <strong className="text-purple-600 block text-xs font-mono font-bold">
                        Rs. {Number(selectedLoanForPay.dailyPayingAmount || 0).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {/* Payment Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Payment Amount (Rs.) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-black text-emerald-600 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                      Memo / Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Daily cash payment, manager handed over..."
                      value={payNotes}
                      onChange={(e) => setPayNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  {/* Estimated due after payment */}
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 dark:text-emerald-300 font-bold">Due After Payment:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-extrabold text-sm">
                      Rs. {Math.max(0, Number(selectedLoanForPay.dueAmount || 0) - (parseFloat(payAmount) || 0)).toLocaleString()}
                    </strong>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLoanForPay(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingPay}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmittingPay && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Confirm Repayment</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
    </div>
  );
}

export function LoansPanel({ onClose }: LoansPanelProps): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-50 dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-slide-left">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Loans Management
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                  Daily Repayments
                </span>
              </h2>
              <p className="text-xs text-slate-400">Track loan balances, daily paying rates & record installments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded Loans View */}
        <LoansView />
      </div>
    </div>
  );
}
