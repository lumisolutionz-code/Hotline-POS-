import { useState, useEffect } from "react";
import { Plus, X, Receipt, Search, Trash2, Loader2, FileText, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";
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

interface Note {
  _id: string;
  noteNo: string;
  description: string;
  amount: number;
  toWhom: string;
  type: "+" | "-";
  status: string;
  createdAt: string;
  createdBy: {
    _id: string;
    username: string;
  };
}

interface ExtrasPanelProps {
  onClose: () => void;
  initialTab?: "expenses" | "notes";
}

export function ExtrasPanel({ onClose, initialTab = "expenses" }: ExtrasPanelProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<"expenses" | "notes">(initialTab);

  // --- Expenses State ---
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [expenseSearch, setExpenseSearch] = useState("");
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseToWhom, setExpenseToWhom] = useState("");
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // --- Notes State ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [noteSearch, setNoteSearch] = useState("");
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [noteDesc, setNoteDesc] = useState("");
  const [noteAmount, setNoteAmount] = useState("");
  const [noteToWhom, setNoteToWhom] = useState("");
  const [noteType, setNoteType] = useState<"+" | "-">("+");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  // Permission Modal for Deletion
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Expenses
  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const res = await apiGet<{ status: string; data?: { expenses: Expense[] }; message?: string }>("/expenses");
      if (res.status === "success" && res.data) {
        setExpenses(res.data.expenses);
      }
    } catch (error: any) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoadingExpenses(false);
    }
  };

  // Fetch Notes
  const fetchNotes = async () => {
    try {
      setLoadingNotes(true);
      const res = await apiGet<{ status: string; data?: { notes: Note[] }; message?: string }>("/notes");
      if (res.status === "success" && res.data) {
        setNotes(res.data.notes);
      }
    } catch (error: any) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchNotes();
  }, []);

  // Submit Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmount || !expenseToWhom) return;

    try {
      setIsSubmittingExpense(true);
      const res = await apiPost<{ status: string; message?: string }>("/expenses", {
        description: expenseDesc,
        amount: Number(expenseAmount),
        toWhom: expenseToWhom,
      });

      if (res.status === "success") {
        setShowAddExpenseModal(false);
        setExpenseDesc("");
        setExpenseAmount("");
        setExpenseToWhom("");
        fetchExpenses();
      } else {
        alert(res.message || "Failed to add expense");
      }
    } catch (error: any) {
      alert(error.message || "Network error adding expense");
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  // Submit Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteDesc || !noteAmount) return;

    try {
      setIsSubmittingNote(true);
      const res = await apiPost<{ status: string; message?: string }>("/notes", {
        description: noteDesc,
        amount: Number(noteAmount),
        toWhom: noteToWhom,
        type: noteType,
      });

      if (res.status === "success") {
        setShowAddNoteModal(false);
        setNoteDesc("");
        setNoteAmount("");
        setNoteToWhom("");
        setNoteType("+");
        fetchNotes();
      } else {
        alert(res.message || "Failed to add note");
      }
    } catch (error: any) {
      alert(error.message || "Network error adding note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Delete Request Handlers
  const handleDeleteExpenseClick = (exp: Expense) => {
    setExpenseToDelete(exp);
    setNoteToDelete(null);
    setShowPermissionModal(true);
  };

  const handleDeleteNoteClick = (nt: Note) => {
    setNoteToDelete(nt);
    setExpenseToDelete(null);
    setShowPermissionModal(true);
  };

  const handlePermissionSuccess = async () => {
    try {
      setIsDeleting(true);
      setShowPermissionModal(false);
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (expenseToDelete) {
        const res = await apiDelete<{ status: string; message?: string }>(`/expenses/${expenseToDelete._id}`);
        if (res.status === "success") {
          fetchExpenses();
        } else {
          alert(res.message || "Failed to delete expense");
        }
        setExpenseToDelete(null);
      } else if (noteToDelete) {
        const res = await apiDelete<{ status: string; message?: string }>(`/notes/${noteToDelete._id}`);
        if (res.status === "success") {
          fetchNotes();
        } else {
          alert(res.message || "Failed to delete note");
        }
        setNoteToDelete(null);
      }
    } catch (error: any) {
      alert(error.message || "Error deleting item");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered lists
  const filteredExpenses = expenses.filter(
    (exp) =>
      exp.description.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      exp.toWhom.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      exp.expenseNo.toLowerCase().includes(expenseSearch.toLowerCase())
  );

  const filteredNotes = notes.filter(
    (nt) =>
      nt.description.toLowerCase().includes(noteSearch.toLowerCase()) ||
      nt.toWhom.toLowerCase().includes(noteSearch.toLowerCase()) ||
      nt.noteNo.toLowerCase().includes(noteSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[620px] bg-slate-50 dark:bg-slate-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 border-l border-slate-200 dark:border-slate-800">
      {/* Header with Title and Tabs */}
      <div className="bg-[#0f172a] text-white px-6 pt-4 pb-3 flex flex-col gap-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Extras
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  Store Log
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage daily store expenses and adjustment notes
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

        {/* Two Switcher Tabs: Expenses vs Notes */}
        <div className="flex items-center gap-2 border-b border-slate-800 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === "expenses"
                ? "border-amber-500 text-amber-400 bg-slate-800/80"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Expenses</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === "expenses"
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {expenses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === "notes"
                ? "border-blue-500 text-blue-400 bg-slate-800/80"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === "notes"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {notes.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: EXPENSES */}
      {activeTab === "expenses" && (
        <>
          {/* Toolbar */}
          <div className="p-3.5 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/50 flex gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search expenses by description or payee..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder-slate-400 font-medium"
              />
            </div>
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all font-bold text-xs shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {loadingExpenses ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Receipt className="w-12 h-12 mb-2 opacity-25" />
                <p className="text-xs font-semibold">No expenses recorded yet</p>
              </div>
            ) : (
              filteredExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-xs flex items-center justify-between group hover:border-amber-300 transition-all"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                        {expense.expenseNo}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-xs leading-snug truncate" title={expense.description}>
                      {expense.description}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>To: <strong className="text-slate-700 dark:text-slate-300">{expense.toWhom}</strong></span>
                      <span>&bull;</span>
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
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      Rs. {Number(expense.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => handleDeleteExpenseClick(expense)}
                      disabled={isDeleting && expenseToDelete?._id === expense._id}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* TAB 2: NOTES (+ / -) */}
      {activeTab === "notes" && (
        <>
          {/* Toolbar */}
          <div className="p-3.5 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/50 flex gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search notes by description or reference..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400 font-medium"
              />
            </div>
            <button
              onClick={() => setShowAddNoteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-bold text-xs shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Note
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {loadingNotes ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <FileText className="w-12 h-12 mb-2 opacity-25" />
                <p className="text-xs font-semibold">No notes recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Use notes for credit (+) or debit (-) cash memos</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note._id}
                  className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-xs flex items-center justify-between group hover:border-blue-300 transition-all"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                        {note.noteNo}
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          note.type === "+"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400"
                        }`}
                      >
                        {note.type === "+" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {note.type === "+" ? "+ CREDIT / IN" : "- DEBIT / OUT"}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-xs leading-snug truncate" title={note.description}>
                      {note.description}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      {note.toWhom ? (
                        <>
                          <span>Ref: <strong className="text-slate-700 dark:text-slate-300">{note.toWhom}</strong></span>
                          <span>&bull;</span>
                        </>
                      ) : null}
                      <span>
                        {new Date(note.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`font-black text-sm ${
                        note.type === "+" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {note.type === "+" ? "+" : "-"} Rs. {Number(note.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => handleDeleteNoteClick(note)}
                      disabled={isDeleting && noteToDelete?._id === note._id}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ADD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-60 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="bg-[#0f172a] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Add Expense</h3>
                <span className="px-1.5 py-0.5 rounded bg-blue-600 text-[10px] font-extrabold uppercase">
                  NEW
                </span>
              </div>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  DESCRIPTION *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lunch for staff"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  TO WHOM *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe / Restaurant"
                  value={expenseToWhom}
                  onChange={(e) => setExpenseToWhom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  AMOUNT (RS.) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSubmittingExpense && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NOTE MODAL (+ / -) */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-60 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="bg-[#0f172a] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Add Note</h3>
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase">
                  LEDGER
                </span>
              </div>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="p-5 space-y-4">
              {/* Type Selector: + (Credit / In) vs - (Debit / Out) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  NOTE TYPE (+ / -) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNoteType("+")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer border ${
                      noteType === "+"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>+ (Credit / In)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNoteType("-")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer border ${
                      noteType === "-"
                        ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>- (Debit / Out)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  DESCRIPTION *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Petty cash replenishment / owner draw"
                  value={noteDesc}
                  onChange={(e) => setNoteDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  TO WHOM / REFERENCE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manager / Supplier Name / Bank Ref"
                  value={noteToWhom}
                  onChange={(e) => setNoteToWhom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  AMOUNT (RS.) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  placeholder="0.00"
                  value={noteAmount}
                  onChange={(e) => setNoteAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNote}
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                    noteType === "+" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isSubmittingNote && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Override Modal for Deleting */}
      {showPermissionModal && (
        <PermissionOverrideModal
          permission="DELETE_EXPENSE"
          onClose={() => {
            setShowPermissionModal(false);
            setExpenseToDelete(null);
            setNoteToDelete(null);
          }}
          onSuccess={() => handlePermissionSuccess()}
        />
      )}
    </div>
  );
}

// Backwards-compatible export alias
export const ExpensesPanel = ExtrasPanel;
