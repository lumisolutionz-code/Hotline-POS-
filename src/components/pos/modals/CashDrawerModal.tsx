import { useState, useEffect } from "react";
import {
  Banknote,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  X,
  User,
  CreditCard,
  Receipt,
  Database,
  Loader2,
} from "lucide-react";
import { api, downloadBackupArchive } from "../../../lib/api";

export interface CashSessionData {
  _id: string;
  branch: string;
  cashier: string;
  cashierName: string;
  openingAmount: number;
  expectedOpeningAmount: number;
  openingDifference: number;
  openingNotes?: string;
  openedAt: string;
  closingAmount?: number;
  expectedClosingAmount?: number;
  closingDifference?: number;
  closingNotes?: string;
  closedAt?: string;
  durationSeconds?: number;
  status: "OPEN" | "CLOSED";
  totalCashSales: number;
  totalCardSales: number;
  totalOtherSales: number;
  totalSalesAmount: number;
  totalTransactions: number;
}

interface CashDrawerModalProps {
  mode: "OPEN" | "VIEW" | "CLOSE";
  activeSession: CashSessionData | null;
  expectedOpeningAmount?: number;
  currentCashierName?: string;
  onClose: () => void;
  onSessionStarted: (session: CashSessionData) => void;
  onSessionClosed: (session: CashSessionData) => void;
  onSwitchMode?: (mode: "OPEN" | "VIEW" | "CLOSE") => void;
}

export function CashDrawerModal({
  mode: initialMode,
  activeSession,
  expectedOpeningAmount = 0,
  currentCashierName = "Cashier",
  onClose,
  onSessionStarted,
  onSessionClosed,
}: CashDrawerModalProps) {
  const [currentMode, setCurrentMode] = useState<"OPEN" | "VIEW" | "CLOSE">(initialMode);
  const [openingInput, setOpeningInput] = useState<string>(
    expectedOpeningAmount > 0 ? String(expectedOpeningAmount) : ""
  );
  const [openingNotes, setOpeningNotes] = useState<string>("");
  const [closingInput, setClosingInput] = useState<string>("");
  const [closingNotes, setClosingNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Live timer for active session
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    setCurrentMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!activeSession?.openedAt) {
      setElapsedSeconds(0);
      return;
    }

    const calcElapsed = () => {
      const startMs = new Date(activeSession.openedAt).getTime();
      const nowMs = Date.now();
      const diff = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setElapsedSeconds(diff);
    };

    calcElapsed();
    const timerId = setInterval(calcElapsed, 1000);
    return () => clearInterval(timerId);
  }, [activeSession?.openedAt]);

  // Format seconds to HH:MM:SS or string
  const formatDuration = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCurrency = (val: number | undefined | null) => {
    const num = Number(val) || 0;
    return `LKR ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculations for Opening mode
  const parsedOpening = openingInput === "" ? 0 : Number(openingInput) || 0;
  const openingDiff = parsedOpening - expectedOpeningAmount;

  // Calculations for Closing mode
  const currentExpectedClosing = activeSession?.expectedClosingAmount ?? 
    ((activeSession?.openingAmount || 0) + (activeSession?.totalCashSales || 0));
  const parsedClosing = closingInput === "" ? 0 : Number(closingInput) || 0;
  const closingDiff = parsedClosing - currentExpectedClosing;

  // Session End & Backup Progress State
  const [isFinishingSession, setIsFinishingSession] = useState<boolean>(false);
  const [finishStepText, setFinishStepText] = useState<string>("");
  const [finishProgress, setFinishProgress] = useState<number>(0);

  const handleStartSession = async () => {
    if (openingInput === "" || isNaN(Number(openingInput))) {
      setError("Please enter a valid drawer starting amount.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await api<any>("/cash-sessions/start", {
        method: "POST",
        body: JSON.stringify({
          openingAmount: Number(openingInput),
          notes: openingNotes,
        }),
      });

      if (res.status === "success" && res.data?.session) {
        onSessionStarted(res.data.session);
        onClose();
      } else {
        setError(res.message || "Failed to start cash drawer session.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to communicate with server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSession = async () => {
    if (closingInput === "" || isNaN(Number(closingInput))) {
      setError("Please enter the counted cash amount in the drawer.");
      return;
    }
    setError("");
    setSubmitting(true);
    setIsFinishingSession(true);
    setFinishStepText("Finalizing drawer records in database...");
    setFinishProgress(25);

    try {
      const res = await api<any>("/cash-sessions/close", {
        method: "POST",
        body: JSON.stringify({
          closingAmount: Number(closingInput),
          notes: closingNotes,
        }),
      });

      if (!res || res.status !== "success" || !res.data?.session) {
        setIsFinishingSession(false);
        setError(res?.message || "Failed to close cash drawer session.");
        setSubmitting(false);
        return;
      }

      const closedSessionData = res.data.session;

      // Trigger Database Backup with safe timeout
      setFinishStepText("Exporting MongoDB collections & compressing archive...");
      setFinishProgress(55);

      try {
        const backupData = await downloadBackupArchive("SESSION_CLOSE", 12000);
        if (backupData) {
          setFinishStepText("Writing backup archive to storage destination...");
          setFinishProgress(85);

          if (window.ipcRenderer) {
            await window.ipcRenderer.invoke("save_backup_archive", {
              buffer: backupData.buffer,
              filename: backupData.filename,
            });
          }
        }
      } catch (backupErr) {
        // Silently skip if offline or timeout without showing blocking errors
        console.warn("[Session Close Backup] Skipped backup:", backupErr);
      }

      setFinishStepText("Shift session complete. Redirecting to login...");
      setFinishProgress(100);

      // Smooth brief pause so cashier sees completion
      setTimeout(() => {
        onSessionClosed(closedSessionData);
        onClose();
      }, 700);
    } catch (err: any) {
      setIsFinishingSession(false);
      setError(err?.message || "Failed to communicate with server.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-slate-800">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${
              isFinishingSession ? "bg-indigo-600" : currentMode === "OPEN" ? "bg-emerald-600" : currentMode === "CLOSE" ? "bg-rose-600" : "bg-blue-600"
            }`}>
              {isFinishingSession ? (
                <Database className="w-5 h-5 animate-pulse" />
              ) : currentMode === "OPEN" ? (
                <Unlock className="w-5 h-5" />
              ) : currentMode === "CLOSE" ? (
                <Lock className="w-5 h-5" />
              ) : (
                <Banknote className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {isFinishingSession
                    ? "Backing Up & Closing Session"
                    : currentMode === "OPEN"
                    ? "Day Opening - Cash Drawer"
                    : currentMode === "CLOSE"
                    ? "Close Register - End Session"
                    : "Cash Drawer Session"}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                  isFinishingSession
                    ? "bg-indigo-950 text-indigo-400 border-indigo-800"
                    : currentMode === "OPEN"
                    ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                    : currentMode === "CLOSE"
                    ? "bg-rose-950 text-rose-400 border-rose-800"
                    : "bg-blue-950 text-blue-400 border-blue-800"
                }`}>
                  {isFinishingSession ? "BACKUP" : currentMode === "OPEN" ? "START FLOAT" : currentMode === "CLOSE" ? "DAY CLOSE" : "ACTIVE"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFinishingSession
                  ? "Archiving collections to backup folder before logging out"
                  : currentMode === "OPEN"
                  ? "Record drawer starting cash to open shift"
                  : currentMode === "CLOSE"
                  ? "Count drawer cash and finalize session records"
                  : "Live register balance and cashier shift statistics"}
              </p>
            </div>
          </div>
          {!isFinishingSession && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              title="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* ================= BACKUP & CLOSING PROGRESS OVERLAY ================= */}
          {isFinishingSession ? (
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in duration-200">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-md border border-blue-200">
                  <Database className="w-8 h-8 animate-pulse text-blue-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">
                  Finalizing Session & Backing Up Database
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {finishStepText}
                </p>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full max-w-sm">
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${finishProgress}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Archiving database</span>
                  <span className="font-bold">{finishProgress}%</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Please wait a moment while your shift records and database backup are completed smoothly.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

          {/* ================= MODE: OPEN (Day Start) ================= */}
          {currentMode === "OPEN" && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Expected Starting Float
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    (From previous day closing balance)
                  </p>
                </div>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {formatCurrency(expectedOpeningAmount)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Actual Cash In Drawer (LKR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                    LKR
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={openingInput}
                    onChange={(e) => setOpeningInput(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className="w-full pl-13 pr-4 py-2.5 bg-white border-2 border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl text-slate-900 font-bold text-base outline-none transition-all"
                  />
                </div>
              </div>

              {/* Dynamic Mismatch / Difference Banner (Non-blocking) */}
              {openingInput !== "" && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    Math.abs(openingDiff) < 0.01
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-800"
                      : openingDiff > 0
                      ? "bg-amber-50/80 border-amber-200 text-amber-800"
                      : "bg-orange-50/80 border-orange-200 text-orange-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {Math.abs(openingDiff) < 0.01 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    )}
                    <span className="text-xs font-semibold">
                      {Math.abs(openingDiff) < 0.01
                        ? "Balanced: Matches expected float perfectly."
                        : openingDiff > 0
                        ? "Surplus Detected (More cash than previous close)"
                        : "Shortage Detected (Less cash than previous close)"}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-white/80 shadow-2xs">
                    {openingDiff > 0 ? `+${formatCurrency(openingDiff)}` : openingDiff < 0 ? `-${formatCurrency(Math.abs(openingDiff))}` : "0.00"}
                  </span>
                </div>
              )}

              <p className="text-[11px] text-slate-500 italic">
                * If there is a difference, the system will record it accurately without showing any blocking error.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Opening Note / Remarks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={openingNotes}
                  onChange={(e) => setOpeningNotes(e.target.value)}
                  placeholder="e.g. Reason for opening float difference or petty cash note..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-slate-400 outline-none transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Skip for Now
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleStartSession}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{submitting ? "Starting Session..." : "Open Drawer & Start Day"}</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE: VIEW (Active Session Read-Only for Cashier) ================= */}
          {currentMode === "VIEW" && activeSession && (
            <div className="space-y-4">
              {/* Live Shift Timer Banner */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/5 rounded-full pointer-events-none"></div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-blue-200">
                    <Clock className="w-3.5 h-3.5 text-blue-300" />
                    <span className="font-semibold tracking-wide uppercase">Active Shift Duration</span>
                  </div>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    RUNNING
                  </span>
                </div>
                <div className="text-3xl font-extrabold font-mono tracking-wider text-white">
                  {formatDuration(elapsedSeconds)}
                </div>
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{activeSession.cashierName || currentCashierName}</span>
                  </div>
                  <span>
                    Started: {new Date(activeSession.openedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {/* Statistics Grid (Read-only as required: "cashier can only see that in that modal") */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Starting Float</span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono mt-1">
                    {formatCurrency(activeSession.openingAmount)}
                  </div>
                  {activeSession.openingDifference !== 0 && (
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5 font-mono">
                      Diff: {activeSession.openingDifference > 0 ? `+${formatCurrency(activeSession.openingDifference)}` : formatCurrency(activeSession.openingDifference)}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cash Sales</span>
                  </div>
                  <div className="text-sm font-extrabold text-emerald-900 font-mono mt-1">
                    {formatCurrency(activeSession.totalCashSales)}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                    Added to drawer
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>Card / Other Sales</span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono mt-1">
                    {formatCurrency((activeSession.totalCardSales || 0) + (activeSession.totalOtherSales || 0))}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Electronic / Bank
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                    <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Total Sales</span>
                  </div>
                  <div className="text-sm font-extrabold text-indigo-900 font-mono mt-1">
                    {formatCurrency(activeSession.totalSalesAmount)}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-medium mt-0.5">
                    {activeSession.totalTransactions || 0} Transactions
                  </div>
                </div>
              </div>

              {/* Expected Total Drawer Cash */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">
                    Expected Cash In Drawer
                  </span>
                  <p className="text-[11px] text-blue-600 mt-0.5">
                    (Float + Cash Sales collected)
                  </p>
                </div>
                <span className="text-base font-extrabold text-blue-900 font-mono">
                  {formatCurrency(currentExpectedClosing)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Keep Open
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setCurrentMode("CLOSE");
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Session End / Close Shop</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE: CLOSE (Session End / Settlement) ================= */}
          {currentMode === "CLOSE" && (
            <div className="space-y-4">
              {/* Expected Cash Reminder */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Expected Drawer Total
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Opening ({formatCurrency(activeSession?.openingAmount)}) + Cash Sales ({formatCurrency(activeSession?.totalCashSales)})
                  </p>
                </div>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {formatCurrency(currentExpectedClosing)}
                </span>
              </div>

              {/* Counted Cash Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Actual Counted Cash In Drawer (LKR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                    LKR
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={closingInput}
                    onChange={(e) => setClosingInput(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className="w-full pl-13 pr-4 py-2.5 bg-white border-2 border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 rounded-xl text-slate-900 font-bold text-base outline-none transition-all"
                  />
                </div>
              </div>

              {/* Dynamic Mismatch / Difference Banner (Non-blocking) */}
              {closingInput !== "" && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    Math.abs(closingDiff) < 0.01
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-800"
                      : closingDiff > 0
                      ? "bg-amber-50/80 border-amber-200 text-amber-800"
                      : "bg-rose-50/80 border-rose-200 text-rose-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {Math.abs(closingDiff) < 0.01 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    )}
                    <span className="text-xs font-semibold">
                      {Math.abs(closingDiff) < 0.01
                        ? "Register Balanced: Cash matches expected total perfectly."
                        : closingDiff > 0
                        ? "Cash Surplus (Over expected drawer amount)"
                        : "Cash Shortage (Less than expected drawer amount)"}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-white/80 shadow-2xs">
                    {closingDiff > 0 ? `+${formatCurrency(closingDiff)}` : closingDiff < 0 ? `-${formatCurrency(Math.abs(closingDiff))}` : "0.00"}
                  </span>
                </div>
              )}

              <p className="text-[11px] text-slate-500 italic">
                * Any variance between actual and expected cash will be recorded cleanly into the system and visible in the Admin Panel without blocking you.
              </p>

              {/* Closing Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Closing Remarks / Reason for Difference (Optional)
                </label>
                <textarea
                  rows={2}
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="e.g. Shift handover notes or explanation for drawer discrepancy..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-slate-400 outline-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setCurrentMode("VIEW");
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Back to View
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCloseSession}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{submitting ? "Closing Session..." : "Confirm & End Session"}</span>
                </button>
              </div>
            </div>
          )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
