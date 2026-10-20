import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import {
  ShopSettings,
  KeyboardShortcuts,
  getShopSettings,
  saveShopSettings,
  getKeyboardShortcuts,
  saveKeyboardShortcuts,
  DEFAULT_SHOP_SETTINGS,
  DEFAULT_KEYBOARD_SHORTCUTS,
  SHORTCUT_LABELS,
} from "../lib/settings";
import {
  Settings as SettingsIcon,
  Store,
  Keyboard,
  Palette,
  Rocket,
  Save,
  CheckCircle,
  AlertTriangle,
  KeyRound,
  RefreshCw,
  Sun,
  Lightbulb,
  ArrowLeft,
  Loader2,
  Lock,
  ShieldAlert,
  Eye,
  EyeOff,
  Database,
  Folder,
  FolderOpen,
  DownloadCloud,
  FileArchive,
} from "lucide-react";
import { downloadBackupArchive } from "../lib/api";


export default function Settings(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"shop" | "shortcuts" | "appearance" | "updates" | "backups">("shop");
  const [shopSettings, setShopSettings] = useState<ShopSettings>(
    DEFAULT_SHOP_SETTINGS,
  );
  const [shortcuts, setShortcuts] = useState<KeyboardShortcuts>(
    DEFAULT_KEYBOARD_SHORTCUTS,
  );
  const [saved, setSaved] = useState(false);
  const [recordingKey, setRecordingKey] = useState<
    keyof KeyboardShortcuts | null
  >(null);

  // Super Admin Authorization for Software Updates
  const [isUpdatesUnlocked, setIsUpdatesUnlocked] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [unlocking, setUnlocking] = useState<boolean>(false);
  const [unlockError, setUnlockError] = useState<string>("");

  // Super Admin Authorization for Backups
  const [isBackupsUnlocked, setIsBackupsUnlocked] = useState<boolean>(false);
  const [backupAdminPassword, setBackupAdminPassword] = useState<string>("");
  const [showBackupPassword, setShowBackupPassword] = useState<boolean>(false);
  const [unlockingBackup, setUnlockingBackup] = useState<boolean>(false);
  const [backupUnlockError, setBackupUnlockError] = useState<string>("");

  // Backups State
  const [backupPath, setBackupPath] = useState<string>("");
  const [backupPathSaved, setBackupPathSaved] = useState<boolean>(false);
  const [backupFiles, setBackupFiles] = useState<any[]>([]);
  const [loadingBackupFiles, setLoadingBackupFiles] = useState<boolean>(false);
  const [manualBackingUp, setManualBackingUp] = useState<boolean>(false);
  const [manualBackupSuccess, setManualBackupSuccess] = useState<string>("");
  const [manualBackupError, setManualBackupError] = useState<string>("");
  const [dbStats, setDbStats] = useState<{ databaseName?: string; collectionsCount?: number; totalDocuments?: number } | null>(null);

  // Auto-Updater State
  const [appVersion, setAppVersion] = useState<string>("1.3.1");
  const [checkingUpdate, setCheckingUpdate] = useState<boolean>(false);
  const [githubToken, setGithubToken] = useState<string>("");
  const [tokenSaved, setTokenSaved] = useState<boolean>(false);
  const [updateStatus, setUpdateStatus] = useState<{
    type: "idle" | "checking" | "available" | "latest" | "error";
    message: string;
    detail?: string;
  }>({ type: "idle", message: "" });

  // Load settings and shortcuts on mount
  useEffect(() => {
    setShopSettings(getShopSettings());
    setShortcuts(getKeyboardShortcuts());

    // Load app version and updater token from Electron main process
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke("get_app_version").then((ver: string) => {
        if (ver) setAppVersion(ver);
      }).catch(() => {});

      window.ipcRenderer.invoke("get_update_token").then((token: string) => {
        if (token) setGithubToken(token);
      }).catch(() => {});
    }
  }, []);

  // Handle key recording
  useEffect(() => {
    if (!recordingKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const key = e.key.toUpperCase();
      setShortcuts((prev) => ({ ...prev, [recordingKey]: key }));
      setRecordingKey(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [recordingKey]);

  const handleSaveShop = () => {
    saveShopSettings(shopSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveShortcuts = () => {
    saveKeyboardShortcuts(shortcuts);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetShortcuts = () => {
    setShortcuts(DEFAULT_KEYBOARD_SHORTCUTS);
  };

  const handleSaveGithubToken = async () => {
    localStorage.setItem("pos_github_update_token", githubToken.trim());
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke("save_update_token", githubToken.trim());
      setTokenSaved(true);
      setTimeout(() => setTokenSaved(false), 2500);
    } else {
      setTokenSaved(true);
      setTimeout(() => setTokenSaved(false), 2500);
    }
  };

  const handleUnlockUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setUnlockError("Please enter the Super Admin password.");
      return;
    }
    setUnlocking(true);
    setUnlockError("");

    try {
      const res = await api<{ status: string; message?: string; data?: { verified: boolean } }>(
        "/auth/verify-superadmin",
        {
          method: "POST",
          body: JSON.stringify({ password: adminPassword.trim() }),
        }
      );
      if (res?.status === "success" || res?.data?.verified) {
        setIsUpdatesUnlocked(true);
        setAdminPassword("");
        setUnlockError("");
      } else {
        setUnlockError(res?.message || "Invalid Super Admin password.");
      }
    } catch (err: any) {
      console.error("Super Admin verification error:", err);
      setUnlockError(err?.message || "Failed to verify Super Admin password. Please check credentials.");
    } finally {
      setUnlocking(false);
    }
  };

  const loadBackupConfig = async () => {
    try {
      if (window.ipcRenderer) {
        const conf = await window.ipcRenderer.invoke("get_backup_config");
        if (conf?.destinationPath) {
          setBackupPath(conf.destinationPath);
        }
      } else {
        const saved = localStorage.getItem("pos_backup_path") || "C:\\Hotline_POS_Backups";
        setBackupPath(saved);
      }
    } catch (e) {
      console.warn("Could not load backup config:", e);
    }
  };

  const loadBackupFiles = async (customPath?: string) => {
    setLoadingBackupFiles(true);
    try {
      if (window.ipcRenderer) {
        const res = await window.ipcRenderer.invoke("list_backup_files", customPath || backupPath);
        if (res?.success) {
          setBackupFiles(res.files || []);
        }
      }
      // Fetch DB stats from backend
      const statsRes = await api<any>("/backups/stats").catch(() => null);
      if (statsRes?.status === "success" && statsRes.data) {
        setDbStats(statsRes.data);
      }
    } catch (e) {
      console.warn("Error loading backup files:", e);
    } finally {
      setLoadingBackupFiles(false);
    }
  };

  const handleUnlockBackups = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupAdminPassword.trim()) {
      setBackupUnlockError("Please enter the Super Admin password.");
      return;
    }
    setUnlockingBackup(true);
    setBackupUnlockError("");

    try {
      const res = await api<{ status: string; message?: string; data?: { verified: boolean } }>(
        "/auth/verify-superadmin",
        {
          method: "POST",
          body: JSON.stringify({ password: backupAdminPassword.trim() }),
        }
      );
      if (res?.status === "success" || res?.data?.verified) {
        setIsBackupsUnlocked(true);
        setBackupAdminPassword("");
        setBackupUnlockError("");
        await loadBackupConfig();
        await loadBackupFiles();
      } else {
        setBackupUnlockError(res?.message || "Invalid Super Admin password.");
      }
    } catch (err: any) {
      console.error("Super Admin verification error for Backups:", err);
      setBackupUnlockError(err?.message || "Failed to verify Super Admin password. Please check credentials.");
    } finally {
      setUnlockingBackup(false);
    }
  };

  const handleSelectBackupDirectory = async () => {
    if (!window.ipcRenderer) return;
    try {
      const selected = await window.ipcRenderer.invoke("select_backup_directory");
      if (selected) {
        setBackupPath(selected);
        await window.ipcRenderer.invoke("save_backup_config", { destinationPath: selected });
        localStorage.setItem("pos_backup_path", selected);
        setBackupPathSaved(true);
        setTimeout(() => setBackupPathSaved(false), 2500);
        loadBackupFiles(selected);
      }
    } catch (err) {
      console.error("Directory selection error:", err);
    }
  };

  const handleSaveBackupPath = async () => {
    if (!backupPath.trim()) return;
    try {
      if (window.ipcRenderer) {
        await window.ipcRenderer.invoke("save_backup_config", { destinationPath: backupPath.trim() });
      }
      localStorage.setItem("pos_backup_path", backupPath.trim());
      setBackupPathSaved(true);
      setTimeout(() => setBackupPathSaved(false), 2500);
      loadBackupFiles(backupPath.trim());
    } catch (err) {
      console.error("Save backup path error:", err);
    }
  };

  const handleOpenBackupDirectory = async () => {
    if (window.ipcRenderer) {
      await window.ipcRenderer.invoke("open_backup_directory", backupPath);
    }
  };

  const handleManualBackup = async () => {
    setManualBackingUp(true);
    setManualBackupSuccess("");
    setManualBackupError("");
    try {
      const backupData = await downloadBackupArchive("MANUAL_SETTINGS", 30000);
      if (!backupData) {
        setManualBackupError("Failed to generate database backup. Check server connection.");
        return;
      }

      if (window.ipcRenderer) {
        const saveRes = await window.ipcRenderer.invoke("save_backup_archive", {
          buffer: backupData.buffer,
          filename: backupData.filename,
          targetPath: backupPath,
        });

        if (saveRes?.success) {
          const sizeKb = (saveRes.size / 1024).toFixed(1);
          setManualBackupSuccess(`Backup saved: ${saveRes.filename} (${sizeKb} KB)`);
          await loadBackupFiles();
        } else {
          setManualBackupError(saveRes?.error || "Failed to write backup to local disk.");
        }
      } else {
        // Browser fallback: trigger file download
        const blob = new Blob([backupData.buffer], { type: "application/zip" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = backupData.filename;
        a.click();
        URL.revokeObjectURL(url);
        setManualBackupSuccess(`Backup downloaded: ${backupData.filename}`);
      }
    } catch (err: any) {
      setManualBackupError(err?.message || "An unexpected error occurred during backup.");
    } finally {
      setManualBackingUp(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="h-screen w-screen overflow-y-auto overflow-x-hidden flex flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 scrollbar-thin">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-sky-200/50 dark:border-slate-700 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/pos")}
            className="flex items-center gap-1.5 p-2 bg-sky-100 hover:bg-sky-200 rounded-lg text-sky-700 hover:text-sky-800 transition-all text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">POS Settings</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Configure your POS preferences
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">Logged in as</p>
          <p className="text-slate-800 dark:text-white font-medium">{user?.username || "User"}</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl w-full mx-auto p-6 pb-24 flex-1">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <button
            onClick={() => setActiveTab("shop")}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "shop"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-blue-700 border border-slate-200/60 dark:border-slate-700"
            }`}
          >
            <Store className="w-4 h-4" /> Shop Details
          </button>
          <button
            onClick={() => setActiveTab("shortcuts")}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "shortcuts"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-blue-700 border border-slate-200/60 dark:border-slate-700"
            }`}
          >
            <Keyboard className="w-4 h-4" /> Shortcuts
          </button>
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "appearance"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-blue-700 border border-slate-200/60 dark:border-slate-700"
            }`}
          >
            <Palette className="w-4 h-4" /> Appearance
          </button>
          <button
            onClick={() => setActiveTab("updates")}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "updates"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-blue-700 border border-slate-200/60 dark:border-slate-700"
            }`}
          >
            <Rocket className="w-4 h-4" /> Software Updates
            {!isUpdatesUnlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
          </button>
          <button
            onClick={() => setActiveTab("backups")}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "backups"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-blue-700 border border-slate-200/60 dark:border-slate-700"
            }`}
          >
            <Database className="w-4 h-4" /> Backups
            {!isBackupsUnlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>

        {/* Success Toast */}
        {saved && (
          <div className="fixed top-4 right-4 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 font-semibold text-sm">
            <CheckCircle className="w-4 h-4" /> Settings saved!
          </div>
        )}

        {/* Shop Details Tab */}
        {activeTab === "shop" && (
          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-600" /> Shop Information
              <span className="text-sm font-normal text-slate-500">
                (Appears on receipts & thermal bills)
              </span>
            </h2>

            {/* Active Branch Session Info */}
            {user?.currentSession?.branch && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {user.currentSession.branch.code || "POS"}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                      Active POS Branch
                      {user.currentSession.branch.isMainBranch && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold">
                          Main Branch
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {user.currentSession.branch.name || "Default Branch"}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-blue-700 bg-white/90 px-3 py-1.5 rounded-xl border border-blue-100 font-medium">
                  Receipts & thermal bills automatically use this branch's address
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Shop / Business Name *
                  </label>
                  <input
                    type="text"
                    value={shopSettings.shopName}
                    onChange={(e) =>
                      setShopSettings({
                        ...shopSettings,
                        shopName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all outline-none"
                    placeholder="Enter shop name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Company Registration No (PV / Business Reg)
                  </label>
                  <input
                    type="text"
                    value={shopSettings.regNo || ""}
                    onChange={(e) =>
                      setShopSettings({
                        ...shopSettings,
                        regNo: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all outline-none"
                    placeholder="e.g. PV 00301591"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Address
                </label>
                <textarea
                  value={shopSettings.address}
                  onChange={(e) =>
                    setShopSettings({
                      ...shopSettings,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all outline-none"
                  placeholder="Enter shop address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={shopSettings.phone}
                    onChange={(e) =>
                      setShopSettings({
                        ...shopSettings,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all outline-none"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={shopSettings.email}
                    onChange={(e) =>
                      setShopSettings({
                        ...shopSettings,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all outline-none"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Receipt Footer Message
                </label>
                <input
                  type="text"
                  value={shopSettings.footerMessage}
                  onChange={(e) =>
                    setShopSettings({
                      ...shopSettings,
                      footerMessage: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all outline-none"
                  placeholder="Thank you message"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="pr-4">
                  <div className="font-bold text-slate-800 text-sm">Pre-printed Invoice Stationery (A4)</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    When enabled, invoices print only dynamic content (Bill To, Invoice Details, Items Table, and Totals) with 55mm top & 45mm bottom margins for pre-printed letterhead paper.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setShopSettings({
                      ...shopSettings,
                      usePreprintedPaper: !(shopSettings.usePreprintedPaper ?? true),
                    })
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${
                    (shopSettings.usePreprintedPaper ?? true) ? "bg-blue-600 shadow-xs shadow-blue-500/25" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      (shopSettings.usePreprintedPaper ?? true) ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2.5">
                  Receipt Preview
                </p>
                <pre className="text-slate-800 font-mono text-xs whitespace-pre-wrap bg-white p-4 rounded-xl border border-slate-200 shadow-2xs leading-relaxed">
                  {shopSettings.shopName || "[Shop Name]"}
                  {shopSettings.regNo && `\nReg No: ${shopSettings.regNo}`}
                  {shopSettings.address && `\n${shopSettings.address}`}
                  {shopSettings.phone && `\nPhone: ${shopSettings.phone}`}
                  {shopSettings.email && `\nEmail: ${shopSettings.email}`}
                  {"\n─────────────────────────"}
                  {"\n[Receipt content here...]"}
                  {"\n─────────────────────────"}
                  {`\n${shopSettings.footerMessage || "Thank you!"}`}
                </pre>
              </div>

              <button
                onClick={handleSaveShop}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all mt-4 cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Shop Settings
              </button>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Tab */}
        {activeTab === "shortcuts" && (
          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-blue-600" /> Keyboard Shortcuts
              </h2>
              <button
                onClick={handleResetShortcuts}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 rounded-xl text-xs transition-all cursor-pointer"
              >
                Reset to Defaults
              </button>
            </div>

            <p className="text-slate-500 text-xs mb-6">
              Click on a key box and press any key to set a new shortcut.
              Function keys (F1-F12) are recommended.
            </p>

            <div className="space-y-3">
              {(Object.keys(shortcuts) as Array<keyof KeyboardShortcuts>).map(
                (key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl transition-all"
                  >
                    <div>
                      <p className="text-slate-800 font-bold text-sm">
                        {SHORTCUT_LABELS[key]}
                      </p>
                      <p className="text-slate-400 font-mono text-xs mt-0.5">{key}</p>
                    </div>
                    <button
                      onClick={() => setRecordingKey(key)}
                      className={`min-w-[70px] px-3.5 py-1.5 rounded-lg font-mono font-bold text-base transition-all cursor-pointer ${
                        recordingKey === key
                          ? "bg-blue-600 text-white animate-pulse shadow-md border-2 border-blue-500"
                          : "bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 shadow-xs"
                      }`}
                    >
                      {recordingKey === key ? "Press..." : shortcuts[key]}
                    </button>
                  </div>
                ),
              )}
            </div>

            <button
              onClick={handleSaveShortcuts}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all mt-6 cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Keyboard Shortcuts
            </button>

            {/* Tips */}
            <div className="mt-6 p-4 bg-sky-50/70 rounded-xl border border-sky-200/80">
              <p className="text-slate-700 text-xs leading-relaxed flex flex-col gap-1">
                <strong className="text-sky-900 font-bold flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5" /> Tips:</strong>
                <span>• Use F1-F12 keys for shortcuts as they don't conflict with typing</span>
                <span>• Shortcuts work when focus is not on an input field</span>
                <span>• Press ESC to cancel recording a new key</span>
              </p>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === "appearance" && (
          <div className="bg-white rounded-2xl p-6 border border-sky-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-600" /> Theme Preferences
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                  Active Theme
                </label>
                <div className="max-w-md">
                  <div
                    className="flex items-center gap-4 p-5 rounded-2xl border-2 border-sky-500 bg-sky-50/60 shadow-xs"
                  >
                    <div className="w-14 h-14 rounded-xl bg-white border border-sky-200 flex items-center justify-center shadow-xs shrink-0">
                      <Sun className="w-7 h-7 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">Light Mode</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active Default
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        High-contrast light theme active for optimal retail clarity and cashier workflow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Software Updates Tab - Permission Required Lock Screen */}
        {activeTab === "updates" && !isUpdatesUnlocked && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-700 shadow-sm max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Permission Required</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Software updates and GitHub PAT tokens require Super Admin authorization. Please enter the Super Admin account password to unlock.
              </p>
            </div>

            <form onSubmit={handleUnlockUpdates} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Super Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter super admin password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setUnlockError("");
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {unlockError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{unlockError}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("shop")}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unlocking || !adminPassword.trim()}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {unlocking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Unlock Updates
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Software Updates Tab - Unlocked View (Light Theme) */}
        {activeTab === "updates" && isUpdatesUnlocked && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 space-y-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-blue-600" /> System Updates
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage POS client application version and automatic updates
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-500/30 rounded-xl font-mono text-xs font-bold">
                  Installed: v{appVersion}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdatesUnlocked(false);
                    setAdminPassword("");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  title="Lock Updates tab"
                >
                  <Lock className="w-3.5 h-3.5" /> Lock
                </button>
              </div>
            </div>

            {/* Release Channel Info Card */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Release Repository</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                  github.com/lumisolutionz-code/Hotline-POS-
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Target Channel</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Stable Production</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Auto-Update Mode</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">Automatic Silent Download</span>
              </div>
            </div>

            {/* Private Repo Warning Notice */}
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4" /> Why updates fail if your GitHub repository is Private:
              </div>
              <p>
                GitHub automatically blocks unauthenticated requests to <strong>Private</strong> repositories with a <code>404 Not Found</code> error. For cashiers and POS stations to detect and download updates seamlessly:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 pl-1">
                <li><strong>Recommended:</strong> Make your GitHub repository (<code>lumisolutionz-code/Hotline-POS-</code>) <strong>Public</strong> in GitHub repository Settings → Danger Zone → Change Visibility to Public.</li>
                <li><strong>Or:</strong> Provide a GitHub Personal Access Token (PAT) below with <code>repo</code> or <code>Contents: read-only</code> permissions.</li>
                <li>Ensure all 3 release files are attached to the release: <code>.exe</code>, <code>latest.yml</code>, and <code>.blockmap</code>.</li>
              </ul>
            </div>

            {/* GitHub Personal Access Token Configuration (For Private Repositories) */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-600" /> GitHub Personal Access Token (PAT)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Required only if your repository is Private. Leave blank if your repository is Public.
                  </p>
                </div>
                {tokenSaved && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium animate-in fade-in flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Token Saved
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (GitHub Read-Only Token)"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  onClick={handleSaveGithubToken}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Save Token
                </button>
                {githubToken && (
                  <button
                    onClick={async () => {
                      setGithubToken("");
                      localStorage.removeItem("pos_github_update_token");
                      if (window.ipcRenderer) {
                        await window.ipcRenderer.invoke("save_update_token", "");
                        setTokenSaved(true);
                        setTimeout(() => setTokenSaved(false), 2000);
                      }
                    }}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded-xl border border-red-200 transition-colors cursor-pointer"
                    title="Clear Token"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Check for Updates Action */}
            <div className="pt-2">
              <button
                onClick={async () => {
                  if (!window.ipcRenderer) {
                    setUpdateStatus({
                      type: "error",
                      message: "Desktop Update Service Unavailable",
                      detail: "Auto-updater is only supported inside the packaged Electron application.",
                    });
                    return;
                  }

                  setCheckingUpdate(true);
                  setUpdateStatus({ type: "checking", message: "Connecting to GitHub Releases..." });

                  try {
                    const res = await window.ipcRenderer.invoke("check_for_updates");
                    if (res?.success) {
                      if (res.hasUpdate) {
                        setUpdateStatus({
                          type: "available",
                          message: `New update found: v${res.updateVersion}!`,
                          detail: "The update is downloading in the background. You will be prompted to restart when ready.",
                        });
                      } else {
                        setUpdateStatus({
                          type: "latest",
                          message: "Your POS is up to date!",
                          detail: `You are running the latest version (v${res.currentVersion || appVersion}).`,
                        });
                      }
                    } else {
                      setUpdateStatus({
                        type: "error",
                        message: res?.is404
                          ? "GitHub Returned 404 (Private Repository)"
                          : "Update Check Failed",
                        detail: res?.is404
                          ? "GitHub returned 404 Not Found because the repository is set to Private. Set the repository visibility to Public on GitHub to allow client updates, or provide a GitHub PAT token above."
                          : res?.error || "Could not complete update check.",
                      });
                    }
                  } catch (err: any) {
                    setUpdateStatus({
                      type: "error",
                      message: "Connection Error",
                      detail: err?.message || String(err),
                    });
                  } finally {
                    setCheckingUpdate(false);
                  }
                }}
                disabled={checkingUpdate}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
              >
                {checkingUpdate ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Checking for Updates...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Check for Updates Now
                  </>
                )}
              </button>
            </div>

            {/* Status Feedback Result */}
            {updateStatus.type !== "idle" && (
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1 ${
                  updateStatus.type === "error"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : updateStatus.type === "latest"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : updateStatus.type === "available"
                    ? "bg-blue-50 border-blue-200 text-blue-800"
                    : "bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <div className="font-bold text-sm">{updateStatus.message}</div>
                {updateStatus.detail && (
                  <div className="mt-1">{updateStatus.detail}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Backups Tab - Permission Required View */}
        {activeTab === "backups" && !isBackupsUnlocked && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-700 shadow-sm max-w-md mx-auto my-12 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Permission Required</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Database backups and storage configuration require Super Admin authorization. Please enter the Super Admin account password to unlock.
            </p>

            <form onSubmit={handleUnlockBackups} className="mt-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Super Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showBackupPassword ? "text" : "password"}
                    placeholder="Enter super admin password"
                    value={backupAdminPassword}
                    onChange={(e) => {
                      setBackupAdminPassword(e.target.value);
                      if (backupUnlockError) setBackupUnlockError("");
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowBackupPassword(!showBackupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showBackupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {backupUnlockError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{backupUnlockError}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("shop")}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unlockingBackup || !backupAdminPassword.trim()}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {unlockingBackup ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Unlock Backups
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Backups Tab - Unlocked View */}
        {activeTab === "backups" && isBackupsUnlocked && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 space-y-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" /> Database Backups
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Configure backup storage location, run manual database exports, and inspect saved archives
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsBackupsUnlocked(false);
                    setBackupAdminPassword("");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  title="Lock Backups tab"
                >
                  <Lock className="w-3.5 h-3.5" /> Lock
                </button>
              </div>
            </div>

            {/* Storage Folder Configuration Card */}
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-5 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-600" /> Backup Storage Folder
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Location on this machine where automated session backups and manual exports are saved.
                  </p>
                </div>
                {backupPathSaved && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium animate-in fade-in flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Path Saved
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  value={backupPath}
                  onChange={(e) => setBackupPath(e.target.value)}
                  placeholder="e.g. C:\Hotline_POS_Backups"
                  className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono shadow-2xs"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectBackupDirectory}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-slate-600" /> Browse Folder
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBackupPath}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
                  >
                    Save Path
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenBackupDirectory}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
                    title="Open in Windows Explorer"
                  >
                    Open Folder
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                * When the cashier ends their session, the database collections are automatically compressed into a dated ZIP and saved directly here.
              </p>
            </div>

            {/* Manual Backup Action Card & DB Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl p-5 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <DownloadCloud className="w-4 h-4 text-blue-600" /> Instant Database Export
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Immediately fetch all collections from the active MongoDB database and generate a timestamped ZIP archive.
                  </p>
                </div>

                {manualBackupSuccess && (
                  <div className="my-3 p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{manualBackupSuccess}</span>
                  </div>
                )}

                {manualBackupError && (
                  <div className="my-3 p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{manualBackupError}</span>
                  </div>
                )}

                <div className="pt-3">
                  <button
                    type="button"
                    disabled={manualBackingUp}
                    onClick={handleManualBackup}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {manualBackingUp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Exporting Database & Archiving...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" /> Create Backup Now
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* DB Quick Stats */}
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-5 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Database Overview
                  </span>
                  <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Database:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {dbStats?.databaseName || "hotline_pos"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Collections:</span>
                      <span className="font-mono font-bold text-blue-600">
                        {dbStats?.collectionsCount ?? "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Records:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {dbStats?.totalDocuments?.toLocaleString() ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pt-3 text-[10px] text-slate-400">
                  Live connection to backend API
                </div>
              </div>
            </div>

            {/* Stored Backup Archives History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileArchive className="w-4 h-4 text-slate-600" /> Stored Backup Archives ({backupFiles.length})
                </h3>
                <button
                  type="button"
                  onClick={() => loadBackupFiles()}
                  disabled={loadingBackupFiles}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingBackupFiles ? "animate-spin" : ""}`} /> Refresh List
                </button>
              </div>

              {backupFiles.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs text-slate-500">
                  No backup archives found in <span className="font-mono font-semibold">{backupPath || "configured folder"}</span>.
                  Click "Create Backup Now" or close a drawer session to generate the first backup.
                </div>
              ) : (
                <div className="border border-slate-200/90 dark:border-slate-700 rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-4 py-2.5">Archive File</th>
                          <th className="px-4 py-2.5">Size</th>
                          <th className="px-4 py-2.5">Saved At</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {backupFiles.map((f, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                            <td className="px-4 py-2.5 font-mono text-slate-800 dark:text-slate-200 font-medium">
                              {f.filename}
                            </td>
                            <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400 font-mono">
                              {formatFileSize(f.size)}
                            </td>
                            <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                              {new Date(f.modifiedAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={handleOpenBackupDirectory}
                                className="px-2 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                Show in Folder
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
