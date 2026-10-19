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
  Smartphone,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { api, downloadBackupArchive } from "../../../lib/api";

export interface SimTopUpRecord {
  _id?: string;
  amount: number;
  notes?: string;
  addedAt: string;
  addedByName?: string;
}

export interface SimBalanceData {
  openingBalance: number;
  expectedOpeningBalance?: number;
  topUps?: SimTopUpRecord[];
  totalTopUp: number;
  totalAvailable: number;
  closingBalance?: number | null;
  soldAmount?: number;
}

export interface ReloadMachineSessionData {
  _id: string;
  branch: string;
  cashier: string;
  cashierName: string;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt?: string;
  durationSeconds?: number;
  openingNotes?: string;
  closingNotes?: string;
  sims: {
    dialog: SimBalanceData;
    mobitel: SimBalanceData;
    airtel: SimBalanceData;
    hutch: SimBalanceData;
  };
  totalOpeningBalance: number;
  totalTopUp: number;
  totalAvailable: number;
  totalClosingBalance?: number | null;
  totalSoldAmount: number;
}

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
  reloadSession?: ReloadMachineSessionData | null;
}

interface ExpectedReloadBalances {
  dialog: number;
  mobitel: number;
  airtel: number;
  hutch: number;
}

interface CashDrawerModalProps {
  mode: "OPEN" | "VIEW" | "CLOSE";
  activeSession: CashSessionData | null;
  expectedOpeningAmount?: number;
  expectedReloadBalances?: ExpectedReloadBalances;
  currentCashierName?: string;
  onClose: () => void;
  onSessionStarted: (session: CashSessionData) => void;
  onSessionClosed: (session: CashSessionData) => void;
  onSwitchMode?: (mode: "OPEN" | "VIEW" | "CLOSE") => void;
}

const PROVIDERS = [
  { key: "dialog", name: "Dialog", color: "from-red-500 to-amber-500", border: "border-red-200", bg: "bg-red-50", badge: "bg-red-600 text-white" },
  { key: "mobitel", name: "Mobitel", color: "from-blue-600 to-cyan-500", border: "border-blue-200", bg: "bg-blue-50", badge: "bg-blue-600 text-white" },
  { key: "airtel", name: "Airtel", color: "from-rose-600 to-red-500", border: "border-rose-200", bg: "bg-rose-50", badge: "bg-rose-600 text-white" },
  { key: "hutch", name: "Hutch", color: "from-orange-500 to-amber-500", border: "border-orange-200", bg: "bg-orange-50", badge: "bg-orange-600 text-white" },
] as const;

export function CashDrawerModal({
  mode: initialMode,
  activeSession,
  expectedOpeningAmount = 0,
  expectedReloadBalances = { dialog: 0, mobitel: 0, airtel: 0, hutch: 0 },
  currentCashierName = "Cashier",
  onClose,
  onSessionStarted,
  onSessionClosed,
}: CashDrawerModalProps) {
  const [currentMode, setCurrentMode] = useState<"OPEN" | "VIEW" | "CLOSE">(initialMode);

  // Cash Drawer opening / closing state
  const [openingInput, setOpeningInput] = useState<string>(
    expectedOpeningAmount > 0 ? String(expectedOpeningAmount) : ""
  );
  const [openingNotes, setOpeningNotes] = useState<string>("");
  const [closingInput, setClosingInput] = useState<string>("");
  const [closingNotes, setClosingNotes] = useState<string>("");

  // Reload Machine SIM Opening State
  const [simOpening, setSimOpening] = useState<{ [key: string]: string }>({
    dialog: expectedReloadBalances.dialog > 0 ? String(expectedReloadBalances.dialog) : "",
    mobitel: expectedReloadBalances.mobitel > 0 ? String(expectedReloadBalances.mobitel) : "",
    airtel: expectedReloadBalances.airtel > 0 ? String(expectedReloadBalances.airtel) : "",
    hutch: expectedReloadBalances.hutch > 0 ? String(expectedReloadBalances.hutch) : "",
  });

  // Reload Machine SIM Closing State
  const [simClosing, setSimClosing] = useState<{ [key: string]: string }>({
    dialog: "",
    mobitel: "",
    airtel: "",
    hutch: "",
  });

  // Local live reload session state (for ongoing updates)
  const [liveReloadSession, setLiveReloadSession] = useState<ReloadMachineSessionData | null>(
    activeSession?.reloadSession || null
  );

  // Top-Up Form Modal State
  const [showTopUpForm, setShowTopUpForm] = useState<boolean>(false);
  const [topUpProvider, setTopUpProvider] = useState<"dialog" | "mobitel" | "airtel" | "hutch">("dialog");
  const [topUpAmount, setTopUpAmount] = useState<string>("");
  const [topUpNotes, setTopUpNotes] = useState<string>("");
  const [topUpSubmitting, setTopUpSubmitting] = useState<boolean>(false);
  const [topUpSuccessMsg, setTopUpSuccessMsg] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Live timer for active session
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    setCurrentMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (activeSession?.reloadSession) {
      setLiveReloadSession(activeSession.reloadSession);
    }
  }, [activeSession?.reloadSession]);

  // Fetch latest reload session if missing or to ensure sync
  useEffect(() => {
    if (currentMode === "VIEW" || currentMode === "CLOSE") {
      api<any>("/reload-sessions/current")
        .then((res) => {
          if (res.status === "success" && res.data?.session) {
            setLiveReloadSession(res.data.session);
          }
        })
        .catch(() => {});
    }
  }, [currentMode]);

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

  const totalSimOpening = Object.values(simOpening).reduce(
    (sum, val) => sum + (val === "" ? 0 : Number(val) || 0),
    0
  );

  // Calculations for Closing mode
  const currentExpectedClosing =
    activeSession?.expectedClosingAmount ??
    (activeSession?.openingAmount || 0) + (activeSession?.totalCashSales || 0);
  const parsedClosing = closingInput === "" ? 0 : Number(closingInput) || 0;
  const closingDiff = parsedClosing - currentExpectedClosing;

  // Session End & Backup Progress State
  const [isFinishingSession, setIsFinishingSession] = useState<boolean>(false);
  const [finishStepText, setFinishStepText] = useState<string>("");
  const [finishProgress, setFinishProgress] = useState<number>(0);

  // START SESSION
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
          openingNotes,
          reloadOpening: {
            dialog: Number(simOpening.dialog) || 0,
            mobitel: Number(simOpening.mobitel) || 0,
            airtel: Number(simOpening.airtel) || 0,
            hutch: Number(simOpening.hutch) || 0,
          },
        }),
      });

      if (res.status === "success" && res.data?.session) {
        onSessionStarted(res.data.session);
        onClose();
      } else {
        setError(res.message || "Failed to start cash drawer & reload session.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to communicate with server.");
    } finally {
      setSubmitting(false);
    }
  };

  // ADD SIM TOP-UP DURING SESSION
  const handleAddTopUp = async () => {
    const amt = Number(topUpAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      setError("Please enter a valid positive top-up amount.");
      return;
    }
    setError("");
    setTopUpSubmitting(true);
    try {
      const res = await api<any>("/reload-sessions/topup", {
        method: "POST",
        body: JSON.stringify({
          provider: topUpProvider,
          amount: amt,
          notes: topUpNotes,
        }),
      });

      if (res.status === "success" && res.data?.session) {
        setLiveReloadSession(res.data.session);
        setTopUpSuccessMsg(`Added LKR ${amt.toLocaleString()} to ${topUpProvider.toUpperCase()} successfully!`);
        setTopUpAmount("");
        setTopUpNotes("");
        setShowTopUpForm(false);
        setTimeout(() => setTopUpSuccessMsg(""), 4000);
      } else {
        setError(res.message || "Failed to add SIM top-up.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to communicate with server.");
    } finally {
      setTopUpSubmitting(false);
    }
  };

  // CLOSE SESSION
  const handleCloseSession = async () => {
    if (closingInput === "" || isNaN(Number(closingInput))) {
      setError("Please enter the counted cash amount in the drawer.");
      return;
    }
    setError("");
    setSubmitting(true);
    setIsFinishingSession(true);
    setFinishStepText("Finalizing drawer & reload records in database...");
    setFinishProgress(25);

    try {
      const res = await api<any>("/cash-sessions/close", {
        method: "POST",
        body: JSON.stringify({
          closingAmount: Number(closingInput),
          closingNotes,
          reloadClosing: {
            dialog: simClosing.dialog !== "" ? Number(simClosing.dialog) : 0,
            mobitel: simClosing.mobitel !== "" ? Number(simClosing.mobitel) : 0,
            airtel: simClosing.airtel !== "" ? Number(simClosing.airtel) : 0,
            hutch: simClosing.hutch !== "" ? Number(simClosing.hutch) : 0,
          },
        }),
      });

      if (!res || res.status !== "success" || !res.data?.session) {
        setIsFinishingSession(false);
        setError(res?.message || "Failed to close cash drawer session.");
        setSubmitting(false);
        return;
      }

      const closedSessionData = res.data.session;

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
        console.warn("[Session Close Backup] Skipped backup:", backupErr);
      }

      setFinishStepText("Shift session complete. Redirecting to login...");
      setFinishProgress(100);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] text-slate-800">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${
                isFinishingSession
                  ? "bg-indigo-600"
                  : currentMode === "OPEN"
                  ? "bg-emerald-600"
                  : currentMode === "CLOSE"
                  ? "bg-rose-600"
                  : "bg-blue-600"
              }`}
            >
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
                    ? "Day Opening - Cash Drawer & Reload SIM Float"
                    : currentMode === "CLOSE"
                    ? "Close Register - Cash & Reload Machines"
                    : "Cash Drawer & Reload Float Session"}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                    isFinishingSession
                      ? "bg-indigo-950 text-indigo-400 border-indigo-800"
                      : currentMode === "OPEN"
                      ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                      : currentMode === "CLOSE"
                      ? "bg-rose-950 text-rose-400 border-rose-800"
                      : "bg-blue-950 text-blue-400 border-blue-800"
                  }`}
                >
                  {isFinishingSession ? "BACKUP" : currentMode === "OPEN" ? "START FLOAT" : currentMode === "CLOSE" ? "DAY CLOSE" : "ACTIVE"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFinishingSession
                  ? "Archiving collections to backup folder before logging out"
                  : currentMode === "OPEN"
                  ? "Enter starting cash in drawer and SIM balances on reload machines"
                  : currentMode === "CLOSE"
                  ? "Count drawer cash and closing balances on reload machines"
                  : "Live register balance, cashier shift stats & reload machine float"}
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
          {/* BACKUP & CLOSING PROGRESS OVERLAY */}
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

              {topUpSuccessMsg && (
                <div className="p-3 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{topUpSuccessMsg}</span>
                </div>
              )}

              {/* ================= MODE: OPEN (Day Start) ================= */}
              {currentMode === "OPEN" && (
                <div className="space-y-5">
                  {/* Cash in Drawer Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Banknote className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        1. Physical Cash In Drawer
                      </h3>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                          Expected Cash Float
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          (From previous day closing balance)
                        </p>
                      </div>
                      <span className="text-base font-bold text-slate-900 font-mono">
                        {formatCurrency(expectedOpeningAmount)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
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
                          className="w-full pl-13 pr-4 py-2 bg-white border-2 border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl text-slate-900 font-bold text-base outline-none transition-all"
                        />
                      </div>
                    </div>

                    {openingInput !== "" && (
                      <div
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
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
                  </div>

                  {/* Reload Machine Starting Float Section */}
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Smartphone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            2. Reload Machine Starting Float (SIM Balances)
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Input the current balance on each SIM inside the reload machine/phone
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Machine Float</span>
                        <span className="text-xs font-extrabold text-blue-700 font-mono">
                          {formatCurrency(totalSimOpening)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PROVIDERS.map((prov) => {
                        const expVal = expectedReloadBalances[prov.key] || 0;
                        const currentVal = simOpening[prov.key] || "";
                        return (
                          <div
                            key={prov.key}
                            className={`p-3 rounded-xl border ${prov.border} ${prov.bg} relative transition-all hover:shadow-xs`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase ${prov.badge}`}>
                                {prov.name}
                              </span>
                              {expVal > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSimOpening((prev) => ({
                                      ...prev,
                                      [prov.key]: String(expVal),
                                    }))
                                  }
                                  className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                                  title="Copy previous closing balance"
                                >
                                  Last: Rs. {expVal.toLocaleString()}
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-bold text-xs pointer-events-none">
                                LKR
                              </span>
                              <input
                                type="number"
                                step="any"
                                value={currentVal}
                                onChange={(e) =>
                                  setSimOpening((prev) => ({
                                    ...prev,
                                    [prov.key]: e.target.value,
                                  }))
                                }
                                placeholder="0.00"
                                className="w-full pl-11 pr-3 py-1.5 bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 rounded-lg text-slate-900 font-bold text-sm outline-none transition-all"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Opening Note / Remarks (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={openingNotes}
                      onChange={(e) => setOpeningNotes(e.target.value)}
                      placeholder="e.g. Reason for opening float difference or reload machine balance notes..."
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
                      <span>{submitting ? "Starting Session..." : "Open Shift & Start Day"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ================= MODE: VIEW (Live Shift Session & Machine Float) ================= */}
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

                  {/* Cash Drawer Statistics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        <Unlock className="w-3 h-3 text-emerald-600" />
                        <span>Cash Float</span>
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono mt-1">
                        {formatCurrency(activeSession.openingAmount)}
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                        <Banknote className="w-3 h-3 text-emerald-600" />
                        <span>Cash Sales</span>
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-emerald-900 font-mono mt-1">
                        {formatCurrency(activeSession.totalCashSales)}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        <CreditCard className="w-3 h-3 text-blue-600" />
                        <span>Card/Other</span>
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 font-mono mt-1">
                        {formatCurrency((activeSession.totalCardSales || 0) + (activeSession.totalOtherSales || 0))}
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-700 uppercase tracking-wide">
                        <Receipt className="w-3 h-3 text-indigo-600" />
                        <span>Total Sales</span>
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-indigo-900 font-mono mt-1">
                        {formatCurrency(activeSession.totalSalesAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Expected Drawer Cash Banner */}
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">
                        Expected Cash In Drawer
                      </span>
                      <p className="text-[10px] text-blue-600 mt-0.5">
                        (Starting Float + Cash Sales collected)
                      </p>
                    </div>
                    <span className="text-sm sm:text-base font-extrabold text-blue-900 font-mono">
                      {formatCurrency(currentExpectedClosing)}
                    </span>
                  </div>

                  {/* ================= RELOAD MACHINE SIM BALANCES & TOP-UP ================= */}
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                          <Smartphone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Reload Machine SIM Float
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Live tracking of electronic reload float per provider
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowTopUpForm(!showTopUpForm);
                          setError("");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Top-Up / Increase Balance</span>
                      </button>
                    </div>

                    {/* TOP-UP EXPANDABLE FORM */}
                    {showTopUpForm && (
                      <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Top-Up Reload Machine SIM (Bought from Company)</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowTopUpForm(false)}
                            className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              SIM Provider
                            </label>
                            <select
                              value={topUpProvider}
                              onChange={(e) => setTopUpProvider(e.target.value as any)}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300"
                            >
                              <option value="dialog">Dialog</option>
                              <option value="mobitel">Mobitel</option>
                              <option value="airtel">Airtel</option>
                              <option value="hutch">Hutch</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Top-Up Amount (LKR)
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={topUpAmount}
                              onChange={(e) => setTopUpAmount(e.target.value)}
                              placeholder="e.g. 5000"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Notes / Dealer Receipt (Optional)
                            </label>
                            <input
                              type="text"
                              value={topUpNotes}
                              onChange={(e) => setTopUpNotes(e.target.value)}
                              placeholder="e.g. Paid cash to distributor"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                          </div>
                        </div>

                        {/* Quick amount chips */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-400 font-semibold">Quick Amounts:</span>
                          {[1000, 2000, 5000, 10000, 20000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setTopUpAmount(String(amt))}
                              className="px-2 py-0.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-[10px] font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                            >
                              +Rs. {amt.toLocaleString()}
                            </button>
                          ))}
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            disabled={topUpSubmitting}
                            onClick={handleAddTopUp}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                          >
                            {topUpSubmitting ? "Adding Top-Up..." : "Confirm & Increase Balance"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 4 PROVIDER CARDS */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {PROVIDERS.map((prov) => {
                        const simData = liveReloadSession?.sims?.[prov.key];
                        const opening = simData?.openingBalance || 0;
                        const topUp = simData?.totalTopUp || 0;
                        const totalAvail = simData?.totalAvailable || opening + topUp;
                        return (
                          <div
                            key={prov.key}
                            className={`p-3 rounded-xl border ${prov.border} ${prov.bg} relative transition-all`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${prov.badge}`}>
                                {prov.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setTopUpProvider(prov.key as any);
                                  setShowTopUpForm(true);
                                }}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                title="Add balance to this SIM"
                              >
                                +Top-Up
                              </button>
                            </div>

                            <div className="space-y-0.5 text-xs">
                              <div className="flex justify-between text-[11px] text-slate-500">
                                <span>Start:</span>
                                <span className="font-mono font-semibold">Rs. {opening.toLocaleString()}</span>
                              </div>
                              {topUp > 0 && (
                                <div className="flex justify-between text-[11px] text-indigo-600 font-semibold">
                                  <span>Added:</span>
                                  <span className="font-mono">+{topUp.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between pt-1 border-t border-slate-200/60 font-bold text-slate-900 text-xs">
                                <span>Float:</span>
                                <span className="font-mono text-slate-900">Rs. {totalAvail.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
                  {/* 1. Cash In Drawer Count */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                        <Banknote className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        1. Count Drawer Cash
                      </h3>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                          Expected Drawer Total
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Float ({formatCurrency(activeSession?.openingAmount)}) + Cash Sales ({formatCurrency(activeSession?.totalCashSales)})
                        </p>
                      </div>
                      <span className="text-base font-bold text-slate-900 font-mono">
                        {formatCurrency(currentExpectedClosing)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
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
                          className="w-full pl-13 pr-4 py-2 bg-white border-2 border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 rounded-xl text-slate-900 font-bold text-base outline-none transition-all"
                        />
                      </div>
                    </div>

                    {closingInput !== "" && (
                      <div
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
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
                  </div>

                  {/* 2. Reload Machine Closing Count */}
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Smartphone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            2. Count Closing Balances on Reload Machine SIMs
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Enter the remaining balance shown on the reload machine screen at close
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PROVIDERS.map((prov) => {
                        const simData = liveReloadSession?.sims?.[prov.key];
                        const totalAvailable = simData?.totalAvailable || 0;
                        const closingVal = simClosing[prov.key] !== "" ? Number(simClosing[prov.key]) : null;
                        const sold = closingVal !== null ? Math.max(0, totalAvailable - closingVal) : 0;

                        return (
                          <div
                            key={prov.key}
                            className={`p-3 rounded-xl border ${prov.border} ${prov.bg} relative transition-all`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${prov.badge}`}>
                                {prov.name}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                Total Float: <strong className="font-mono text-slate-800">Rs. {totalAvailable.toLocaleString()}</strong>
                              </span>
                            </div>

                            <div className="mt-1.5">
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                Machine Remaining Balance (LKR)
                              </label>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 font-bold text-xs pointer-events-none">
                                  LKR
                                </span>
                                <input
                                  type="number"
                                  step="any"
                                  value={simClosing[prov.key]}
                                  onChange={(e) =>
                                    setSimClosing((prev) => ({
                                      ...prev,
                                      [prov.key]: e.target.value,
                                    }))
                                  }
                                  placeholder="0.00"
                                  className="w-full pl-11 pr-3 py-1.5 bg-white border border-slate-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-300 rounded-lg text-slate-900 font-bold text-sm outline-none transition-all"
                                />
                              </div>
                            </div>

                            {closingVal !== null && (
                              <div className="mt-2 pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                                <span className="text-slate-600 font-semibold text-[11px]">
                                  Reload Sold Today:
                                </span>
                                <span className="font-mono font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                                  Rs. {sold.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Closing Remarks / Discrepancy Note (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={closingNotes}
                      onChange={(e) => setClosingNotes(e.target.value)}
                      placeholder="e.g. Shift handover notes or explanation for discrepancies..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-slate-400 outline-none transition-all"
                    />
                  </div>

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
