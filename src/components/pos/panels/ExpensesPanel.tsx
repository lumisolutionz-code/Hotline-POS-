import { useState, useEffect } from "react";
import { Plus, X, Receipt, Search, Trash2, Loader2 } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "../../../lib/api";
import { PermissionOverrideModal } from "../modals/PermissionOverrideModal";

interface Expense {
  _id: string;
  expenseNo: string;
  description: string;
  amount: number;
  toWhom: string;
  status: string;
  createdAt: string;
  createdBy: {
    _id: string;
    username: string;
  };
}

interface ExpensesPanelProps {
  onClose: () => void;
}

export function ExpensesPanel({ onClose }: ExpensesPanelProps): JSX.Element {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add Expense State
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [toWhom, setToWhom] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Expense State
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await apiGet<{ status: string; data?: { expenses: Expense[] }; message?: string }>("/expenses");
      if (res.status === "success" && res.data) {
        setExpenses(res.data.expenses);
      } else {
        alert(res.message || "Failed to fetch expenses");
      }
    } catch (error: any) {
      alert(error.message || "Network error fetching expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !toWhom) return;

    try {
      setIsSubmitting(true);
      const res = await apiPost<{ status: string; message?: string }>("/expenses", {
        description,
        amount: Number(amount),
        toWhom
      });
      
      if (res.status === "success") {
        alert("Expense added successfully");
        setShowAddModal(false);
        setDescription("");
        setAmount("");
        setToWhom("");
        fetchExpenses();
      } else {
        alert(res.message || "Failed to add expense");
      }
    } catch (error: any) {
      alert(error.message || "Network error adding expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (expense: Expense) => {
    setExpenseToDelete(expense);
    setShowPermissionModal(true);
  };

  const handlePermissionSuccess = async () => {
    if (!expenseToDelete) return;

    try {
      setIsDeleting(true);
      setShowPermissionModal(false);
      // Wait for modal transition
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const res = await apiDelete<{ status: string; message?: string }>(`/expenses/${expenseToDelete._id}`);
      if (res.status === "success") {
        alert("Expense deleted successfully");
        fetchExpenses();
      } else {
        alert(res.message || "Failed to delete expense");
      }
      setExpenseToDelete(null);
    } catch (error: any) {
      alert(error.message || "Network error deleting expense");
      setExpenseToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredExpenses = expenses.filter(
    (exp) =>
      exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.toWhom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-50 dark:bg-slate-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 border-l border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white tracking-wide">
              Daily Expenses
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#1e293b] text-blue-400 border border-blue-900/60">
              EXPENSE LOG
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Track and manage store expenditures
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/50 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses by description or payee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold text-xs shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500">
            <Receipt className="w-12 h-12 mb-3 opacity-20" />
            <p>No expenses found</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div
              key={expense._id}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                    {expense.expenseNo}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white">
                  {expense.description}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    To: {expense.toWhom}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(expense.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white">
                  Rs. {expense.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDeleteRequest(expense)}
                  disabled={isDeleting && expenseToDelete?._id === expense._id}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                >
                  {isDeleting && expenseToDelete?._id === expense._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-800/80">
            <div className="bg-[#0f172a] text-white px-5 py-3.5 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Add Expense</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-[#1e293b] text-blue-400 border border-blue-900/60">
                  NEW
                </span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white transition-all"
                  placeholder="e.g. Lunch for staff"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  To Whom *
                </label>
                <input
                  type="text"
                  required
                  value={toWhom}
                  onChange={(e) => setToWhom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white transition-all"
                  placeholder="e.g. John Doe / Restaurant"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Amount (Rs.) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white font-mono font-bold transition-all"
                  placeholder="0.00"
                />
              </div>
              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Override for Delete */}
      {showPermissionModal && (
        <PermissionOverrideModal
          permission="DELETE_EXPENSE"
          onSuccess={handlePermissionSuccess}
          onClose={() => {
            setShowPermissionModal(false);
            setExpenseToDelete(null);
          }}
        />
      )}
    </div>
  );
}
