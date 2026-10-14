import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  ShopSettings,
  KeyboardShortcuts,
  ScannerDevice,
  getShopSettings,
  saveShopSettings,
  getKeyboardShortcuts,
  saveKeyboardShortcuts,
  getSavedScannerDevices,
  saveScannerDevices,
  DEFAULT_SHOP_SETTINGS,
  DEFAULT_KEYBOARD_SHORTCUTS,
  SHORTCUT_LABELS,
} from "../lib/settings";

export default function Settings(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"shop" | "shortcuts" | "appearance" | "hardware">("shop");
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

  // Scanner Hardware State
  const [scannerDevices, setScannerDevices] = useState<ScannerDevice[]>([]);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scanTestTime, setScanTestTime] = useState<string | null>(null);
  const [detecting, setDetecting] = useState<boolean>(false);

  // WebHID State
  const [hidDevice, setHidDevice] = useState<any>(null);
  const [hidSupported, setHidSupported] = useState<boolean>(true);

  // Load settings, shortcuts, and scanner devices on mount
  useEffect(() => {
    setShopSettings(getShopSettings());
    setShortcuts(getKeyboardShortcuts());
    const savedScanners = getSavedScannerDevices();
    setScannerDevices(savedScanners);

    // Initialize WebHID
    if (!("hid" in navigator)) {
      setHidSupported(false);
      return;
    }

    const checkDevices = async () => {
      try {
        const devices = await (navigator as any).hid.getDevices();
        if (devices.length > 0) {
          setHidDevice(devices[0]);
          setScannerDevices((prev) => {
            const merged = [...prev];
            devices.forEach((d: any, idx: number) => {
              const name = d.productName || `USB HID Barcode Device (Vendor: 0x${d.vendorId?.toString(16) || 'HID'})`;
              if (!merged.some((m) => m.name === name)) {
                merged.push({
                  id: `hid-${d.vendorId}-${d.productId}-${idx}`,
                  name,
                  type: "USB HID",
                  vendorId: d.vendorId,
                  productId: d.productId,
                  status: "active",
                  lastSeen: new Date().toLocaleTimeString(),
                });
              }
            });
            saveScannerDevices(merged);
            return merged;
          });
        }
      } catch (err) {
        console.error("WebHID Error:", err);
      }
    };

    checkDevices();

    const handleConnect = (e: any) => {
      setHidDevice(e.device);
      const name = e.device.productName || `USB Barcode Device (Vendor: 0x${e.device.vendorId?.toString(16) || 'HID'})`;
      setScannerDevices((prev) => {
        if (prev.some((m) => m.name === name)) return prev;
        const updated: ScannerDevice[] = [
          ...prev,
          {
            id: `hid-${e.device.vendorId}-${e.device.productId}-${Date.now()}`,
            name,
            type: "USB HID",
            vendorId: e.device.vendorId,
            productId: e.device.productId,
            status: "active",
            lastSeen: new Date().toLocaleTimeString(),
          },
        ];
        saveScannerDevices(updated);
        return updated;
      });
    };

    const handleDisconnect = (e: any) => {
      if (hidDevice && e.device === hidDevice) {
        setHidDevice(null);
      }
    };

    (navigator as any).hid.addEventListener("connect", handleConnect);
    (navigator as any).hid.addEventListener("disconnect", handleDisconnect);

    return () => {
      (navigator as any).hid.removeEventListener("connect", handleConnect);
      (navigator as any).hid.removeEventListener("disconnect", handleDisconnect);
    };
  }, []);

  const requestHidDevice = async () => {
    setDetecting(true);
    try {
      if ("hid" in navigator) {
        const devices = await (navigator as any).hid.requestDevice({ filters: [] });
        if (devices && devices.length > 0) {
          const newDevices: ScannerDevice[] = devices.map((d: any, idx: number) => ({
            id: `hid-${d.vendorId || ''}-${d.productId || ''}-${idx}-${Date.now()}`,
            name: d.productName || `USB Barcode Scanner (Vendor: 0x${d.vendorId?.toString(16) || 'HID'})`,
            type: "USB HID",
            vendorId: d.vendorId,
            productId: d.productId,
            status: "active",
            lastSeen: new Date().toLocaleTimeString(),
          }));

          setScannerDevices((prev) => {
            const merged = [...prev];
            newDevices.forEach((nd) => {
              const existingIdx = merged.findIndex((m) => m.name === nd.name);
              if (existingIdx >= 0) {
                merged[existingIdx] = { ...merged[existingIdx], status: "active", lastSeen: new Date().toLocaleTimeString() };
              } else {
                merged.push(nd);
              }
            });
            saveScannerDevices(merged);
            return merged;
          });
          setHidDevice(devices[0]);
        }
      } else {
        // Fallback for standard environments
        const keyboardScanner: ScannerDevice = {
          id: `kb-scanner-${Date.now()}`,
          name: "Standard USB / Bluetooth Scanner (Keyboard Wedge)",
          type: "Keyboard Wedge (Auto-Detected)",
          status: "active",
          lastSeen: new Date().toLocaleTimeString(),
        };
        setScannerDevices((prev) => {
          if (prev.some((p) => p.type === "Keyboard Wedge (Auto-Detected)")) return prev;
          const updated = [...prev, keyboardScanner];
          saveScannerDevices(updated);
          return updated;
        });
      }
    } catch (err) {
      console.log("Device detection prompt closed or unsupported:", err);
    } finally {
      setDetecting(false);
    }
  };

  const toggleDeviceStatus = (deviceId: string) => {
    setScannerDevices((prev) => {
      const updated = prev.map((dev) => {
        if (dev.id === deviceId) {
          const nextStatus: "active" | "paused" = dev.status === "active" ? "paused" : "active";
          return { ...dev, status: nextStatus, lastSeen: new Date().toLocaleTimeString() };
        }
        return dev;
      });
      saveScannerDevices(updated);

      const hasActive = updated.some((d) => d.status === "active");
      setShopSettings((curr) => {
        const next = { ...curr, barcodeEnabled: hasActive };
        saveShopSettings(next);
        return next;
      });

      return updated;
    });
  };

  const removeDevice = (deviceId: string) => {
    setScannerDevices((prev) => {
      const updated = prev.filter((d) => d.id !== deviceId);
      saveScannerDevices(updated);
      return updated;
    });
  };

  // Live scanner keydown listener on hardware tab for interactive testing
  useEffect(() => {
    if (activeTab !== "hardware") return;

    let scanBuffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const now = Date.now();
      const interval = now - lastKeyTime;
      lastKeyTime = now;

      if (e.key === "Enter") {
        if (scanBuffer.length >= 3) {
          setLastScannedCode(scanBuffer);
          setScanTestTime(new Date().toLocaleTimeString());
          scanBuffer = "";
        }
      } else if (e.key.length === 1) {
        if (interval > 120) {
          scanBuffer = e.key;
        } else {
          scanBuffer += e.key;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-sky-200/50 dark:border-slate-700 px-6 py-4 flex items-center justify-between shadow-lg shadow-sky-100/20 dark:shadow-none">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/pos")}
            className="p-2 bg-sky-100 hover:bg-sky-200 rounded-lg text-sky-700 hover:text-sky-800 transition-all"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <span className="text-white text-lg">⚙️</span>
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
          <p className="text-slate-800 dark:text-white">{user?.username || "User"}</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hidden">
          <button
            onClick={() => setActiveTab("shop")}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === "shop"
                ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/25"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700"
            }`}
          >
            🏪 Shop Details
          </button>
          <button
            onClick={() => setActiveTab("shortcuts")}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === "shortcuts"
                ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/25"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700"
            }`}
          >
            ⌨️ Keyboard Shortcuts
          </button>
          <button
            onClick={() => setActiveTab("appearance")}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === "appearance"
                ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/25"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700"
            }`}
          >
            🎨 Appearance
          </button>
          <button
            onClick={() => setActiveTab("hardware")}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === "hardware"
                ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/25"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700"
            }`}
          >
            🔌 Hardware
          </button>
        </div>

        {/* Success Toast */}
        {saved && (
          <div className="fixed top-4 right-4 bg-sky-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-pulse z-50">
            ✅ Settings saved!
          </div>
        )}

        {/* Shop Details Tab */}
        {activeTab === "shop" && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              🏪 Shop Information
              <span className="text-sm font-normal text-slate-400">
                (Appears on receipts)
              </span>
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
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
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Enter shop name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
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
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="e.g. PV 00301591"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Enter shop address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
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
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
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
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="Thank you message"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/50 border border-slate-600 rounded-xl">
                <div>
                  <div className="font-medium text-white text-sm">Pre-printed Invoice Stationery (A4)</div>
                  <div className="text-xs text-slate-400 mt-0.5">
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
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                    (shopSettings.usePreprintedPaper ?? true) ? "bg-cyan-500" : "bg-slate-600"
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
              <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                  Receipt Preview
                </p>
                <pre className="text-slate-300 font-mono text-sm whitespace-pre-wrap">
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
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all mt-4"
              >
                💾 Save Shop Settings
              </button>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Tab */}
        {activeTab === "shortcuts" && (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                ⌨️ Keyboard Shortcuts
              </h2>
              <button
                onClick={handleResetShortcuts}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all"
              >
                Reset to Defaults
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              Click on a key box and press any key to set a new shortcut.
              Function keys (F1-F12) are recommended.
            </p>

            <div className="space-y-3">
              {(Object.keys(shortcuts) as Array<keyof KeyboardShortcuts>).map(
                (key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-all"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {SHORTCUT_LABELS[key]}
                      </p>
                      <p className="text-slate-500 text-sm">{key}</p>
                    </div>
                    <button
                      onClick={() => setRecordingKey(key)}
                      className={`min-w-[80px] px-4 py-2 rounded-lg font-mono text-lg transition-all ${
                        recordingKey === key
                          ? "bg-cyan-500 text-white animate-pulse"
                          : "bg-slate-600 text-white hover:bg-slate-500"
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
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all mt-6"
            >
              💾 Save Keyboard Shortcuts
            </button>

            {/* Tips */}
            <div className="mt-6 p-4 bg-slate-900/50 dark:bg-slate-950/50 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-sm">
                <strong className="text-slate-300">💡 Tips:</strong>
                <br />• Use F1-F12 keys for shortcuts as they don't conflict
                with typing
                <br />• Shortcuts work when focus is not on an input field
                <br />• Press ESC to cancel recording a new key
              </p>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === "appearance" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-sky-100 dark:border-slate-700 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              🎨 Theme Preferences
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                  Select Theme
                </label>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all ${
                      theme === 'light' 
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <span className="text-4xl">☀️</span>
                    <span className="font-medium text-slate-800 dark:text-white">Light Mode</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all ${
                      theme === 'dark' 
                        ? 'border-sky-500 bg-slate-900/50 dark:bg-slate-950/50' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-800 text-white'
                    }`}
                  >
                    <span className="text-4xl">🌙</span>
                    <span className="font-medium text-slate-800 dark:text-white">Dark Mode</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Hardware Tab */}
        {activeTab === "hardware" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-sky-200 dark:border-slate-700 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  🔌 External Hardware & Barcode Scanners
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage connected barcode scanners, configure their status, and pause or resume scanning.
                </p>
              </div>
              <button
                onClick={handleSaveShop}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-sky-500/30 transition-all active:scale-95 cursor-pointer"
              >
                Save Changes
              </button>
            </div>

            {/* Master Scanner Switch Banner */}
            <div className="p-5 border border-sky-200 dark:border-slate-700 rounded-2xl bg-gradient-to-r from-sky-50/80 to-blue-50/50 dark:from-slate-900/80 dark:to-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner ${
                    shopSettings.barcodeEnabled 
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700" 
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                  }`}>
                    {shopSettings.barcodeEnabled ? "🟢" : "⏸️"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800 dark:text-white text-base">
                        Global Barcode Scanner Listener
                      </h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                        shopSettings.barcodeEnabled
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700"
                          : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700"
                      }`}>
                        {shopSettings.barcodeEnabled ? "Active & Listening" : "Paused"}
                      </span>
                      {hidSupported ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          WebHID & Keyboard Ready
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                          Keyboard Wedge Emulation
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      When enabled, barcodes scanned anywhere in POS will automatically lookup items and add them to cart.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const next = !shopSettings.barcodeEnabled;
                    setShopSettings(prev => ({ ...prev, barcodeEnabled: next }));
                    // Also update scanner devices active status
                    setScannerDevices(prev => {
                      const updated = prev.map(d => ({ ...d, status: (next ? "active" : "paused") as "active" | "paused" }));
                      saveScannerDevices(updated);
                      return updated;
                    });
                  }}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    shopSettings.barcodeEnabled ? "bg-sky-500 shadow-md shadow-sky-500/30" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                  title={shopSettings.barcodeEnabled ? "Click to Pause all scanners" : "Click to Enable all scanners"}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                      shopSettings.barcodeEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Available Barcode Devices Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-white text-base">
                    Available Barcode Devices
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    {scannerDevices.length} {scannerDevices.length === 1 ? "device" : "devices"}
                  </span>
                </div>

                <button
                  onClick={requestHidDevice}
                  disabled={detecting}
                  className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-sky-50 dark:hover:bg-slate-600 border border-sky-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-sky-600 dark:text-sky-300 transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {detecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Detecting...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Detect Scanner</span>
                    </>
                  )}
                </button>
              </div>

              {/* Device Cards List */}
              {scannerDevices.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center">
                  <div className="text-4xl mb-2">📟</div>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">No Barcode Scanner Devices Detected</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                    Connect your USB or Bluetooth barcode reader and click "Detect Scanner" to pair it.
                  </p>
                  <button
                    onClick={requestHidDevice}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20"
                  >
                    🔍 Detect Scanner Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {scannerDevices.map((device) => {
                    const isDeviceActive = device.status === "active" && shopSettings.barcodeEnabled;

                    return (
                      <div
                        key={device.id}
                        className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                          isDeviceActive
                            ? "bg-white dark:bg-slate-900 border-sky-300 dark:border-sky-700/80 shadow-md shadow-sky-500/5"
                            : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-85"
                        }`}
                      >
                        {/* Device Info */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border ${
                            isDeviceActive
                              ? "bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800 text-sky-600"
                              : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                          }`}>
                            📟
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">
                                {device.name}
                              </h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                                isDeviceActive
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                  : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                              }`}>
                                {isDeviceActive ? "In Use" : "Paused"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 truncate font-mono">
                              <span>{device.type}</span>
                              {device.vendorId ? <span>• Vendor: 0x{device.vendorId.toString(16)}</span> : null}
                              {device.lastSeen ? <span>• Last Active: {device.lastSeen}</span> : null}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons: Use or Pause + Remove */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isDeviceActive ? (
                            <button
                              onClick={() => toggleDeviceStatus(device.id)}
                              className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                              title="Pause this scanner device"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Pause
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleDeviceStatus(device.id)}
                              className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20 cursor-pointer active:scale-95"
                              title="Set this scanner device to In Use"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Use Scanner
                            </button>
                          )}

                          <button
                            onClick={() => removeDevice(device.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Remove device"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Interactive Live Scan Test Box */}
            <div className="p-4 rounded-2xl border border-sky-200/80 dark:border-slate-700 bg-sky-50/40 dark:bg-slate-900/60">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Live Scanner Hardware Test
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Scan any barcode with your hardware reader now to test
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-sky-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${lastScannedCode ? "bg-emerald-500 animate-ping" : "bg-sky-400 animate-pulse"}`}></div>
                  <div>
                    {lastScannedCode ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {lastScannedCode}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
                          Decoded Successfully
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                        Waiting for scanner input...
                      </span>
                    )}
                  </div>
                </div>

                {scanTestTime && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    Time: {scanTestTime}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
