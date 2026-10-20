import { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Trash2,
  X,
  ShoppingCart,
  Sparkles,
  Barcode,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Smartphone,
} from "lucide-react";
import {
  lookupPreSession,
  fetchPreSessionRecords,
  addPreSessionRecord,
  removePreSessionRecord,
  clearAllPreSessionRecords,
  PreSessionRecord,
  PreSessionLookupItem,
} from "../../../lib/preSession";

interface PreSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "LOGIN" | "POS";
  branchId?: string;
  onMoveToCart?: (record: PreSessionRecord) => void;
  onMoveAllToCart?: (records: PreSessionRecord[]) => void;
}

export function PreSessionModal({
  isOpen,
  onClose,
  mode = "LOGIN",
  branchId,
  onMoveToCart,
  onMoveAllToCart,
}: PreSessionModalProps): JSX.Element | null {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [lookupResult, setLookupResult] = useState<PreSessionLookupItem | null>(null);
  const [customSoldPrice, setCustomSoldPrice] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [records, setRecords] = useState<PreSessionRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState<boolean>(true);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const soldPriceInputRef = useRef<HTMLInputElement | null>(null);

  // Load records whenever modal opens
  useEffect(() => {
    if (isOpen) {
      loadRecords();
      setSearchQuery("");
      setLookupResult(null);
      setError("");
      setSuccessMsg("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, branchId]);

  const loadRecords = async () => {
    setLoadingRecords(true);
    try {
      const data = await fetchPreSessionRecords(branchId);
      setRecords(data);
    } catch (err) {
      console.error("Failed to load pre-session records", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Barcode scanner listener on window
  useEffect(() => {
    if (!isOpen) return;

    let buffer = "";
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();

      // Handle Enter (scanner finishes with Enter)
      if (e.key === "Enter") {
        if (buffer.length >= 3 && now - lastKeyTime < 100) {
          e.preventDefault();
          e.stopPropagation();
          const scannedCode = buffer.trim();
          buffer = "";
          setSearchQuery(scannedCode);
          executeSearch(scannedCode);
          return;
        }
        buffer = "";
        return;
      }

      // Capture rapid printable characters
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (now - lastKeyTime > 75) {
          buffer = e.key;
        } else {
          buffer += e.key;
        }
        lastKeyTime = now;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, branchId]);

  const executeSearch = async (queryToSearch: string) => {
    const q = (queryToSearch || "").trim();
    if (!q) return;

    setSearching(true);
    setError("");
    setSuccessMsg("");
    setLookupResult(null);

    try {
      const item = await lookupPreSession(q, branchId);
      setLookupResult(item);
      setCustomSoldPrice(String(item.standardPrice || ""));
      setTimeout(() => {
        soldPriceInputRef.current?.focus();
        soldPriceInputRef.current?.select();
      }, 100);
    } catch (err: any) {
      setError(err?.message || `No stock item or product found matching "${q}"`);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await executeSearch(searchQuery);
  };

  const handleAddRecord = async () => {
    if (!lookupResult) return;

    const soldPriceNum = parseFloat(customSoldPrice);
    if (isNaN(soldPriceNum) || soldPriceNum < 0) {
      setError("Please enter a valid sold price");
      return;
    }

    try {
      const newRecord = await addPreSessionRecord({
        branch: branchId || lookupResult.branch || null,
        product: lookupResult.productId,
        variant: lookupResult.variantId || null,
        stockItem: lookupResult.stockItemId || null,
        name: lookupResult.name,
        itemCode: lookupResult.itemCode || "",
        barcode: lookupResult.barcode || "",
        imei: lookupResult.imei || "",
        serialNumber: lookupResult.serialNumber || lookupResult.imei || "",
        standardPrice: lookupResult.standardPrice,
        soldPrice: soldPriceNum,
        quantity: 1,
        trackingType: lookupResult.trackingType || "QUANTITY",
      });

      setRecords((prev) => [newRecord, ...prev]);
      setSuccessMsg(`Recorded "${lookupResult.name}" at Rs. ${soldPriceNum.toLocaleString()}`);
      setLookupResult(null);
      setSearchQuery("");
      setCustomSoldPrice("");
      searchInputRef.current?.focus();
    } catch (err: any) {
      setError(err?.message || "Failed to record pre-session item");
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await removePreSessionRecord(id);
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Failed to delete pre-session record", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all pre-session early sales records?")) {
      return;
    }
    try {
      await clearAllPreSessionRecords(branchId);
      setRecords([]);
      setSuccessMsg("All pre-session records have been cleared.");
    } catch (err) {
      console.error("Failed to clear pre-session records", err);
    }
  };

  const handleMoveSingle = (record: PreSessionRecord) => {
    if (onMoveToCart) {
      onMoveToCart(record);
      handleDeleteRecord(record._id);
    }
  };

  const handleMoveAll = () => {
    if (records.length === 0) return;
    if (onMoveAllToCart) {
      onMoveAllToCart(records);
      clearAllPreSessionRecords(branchId);
      setRecords([]);
      onClose();
    }
  };

  const totalPreSessionAmount = records.reduce((sum, r) => sum + (Number(r.soldPrice) || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-sm shrink-0">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Pre-Session Sales Buffer
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  {mode === "LOGIN" ? "Pre-Login Record" : "POS Shift Import"}
                </span>
              </div>
              <p className="text-xs text-sky-200/80 mt-0.5">
                Record early sales made before shift opening, then transfer them to cart after login.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Notifications */}
          {error && (
            <div className="p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
              {searchQuery.trim() && (
                <div className="pt-1.5 border-t border-rose-200/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-rose-600">New item or not entered in inventory yet?</span>
                  <button
                    type="button"
                    onClick={() => {
                      const q = searchQuery.trim();
                      const isDigits = /^\d{10,16}$/.test(q);
                      setLookupResult({
                        productId: `manual-${Date.now()}`,
                        name: `Pre-Session Device (${q})`,
                        imei: isDigits ? q : "",
                        serialNumber: q,
                        standardPrice: 0,
                        soldPrice: 0,
                        trackingType: isDigits ? "IMEI" : "QUANTITY",
                      });
                      setCustomSoldPrice("");
                      setError("");
                      setTimeout(() => {
                        soldPriceInputRef.current?.focus();
                      }, 100);
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    Record As Early Sale Anyway
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Search Box Section */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Scan or Search Item by IMEI / Serial / Barcode / Name</span>
            </label>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter or scan IMEI, Serial number, Barcode, or Product Name..."
                  className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900/50 rounded-xl text-slate-900 dark:text-white font-medium text-sm outline-none transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setLookupResult(null);
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Find Item</span>
              </button>
            </form>

            {/* Found Item Card to specify Sold Price */}
            {lookupResult && (
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-sky-500/60 shadow-sm space-y-3 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      <span>{lookupResult.name}</span>
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {lookupResult.imei && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          IMEI: {lookupResult.imei}
                        </span>
                      )}
                      {lookupResult.serialNumber && lookupResult.serialNumber !== lookupResult.imei && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          SN: {lookupResult.serialNumber}
                        </span>
                      )}
                      {lookupResult.itemCode && (
                        <span className="text-[11px] text-slate-400">
                          Code: {lookupResult.itemCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Standard Price</span>
                    <span className="text-sm font-mono font-bold text-slate-600 dark:text-slate-300">
                      Rs. {lookupResult.standardPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Option to change / select physical IMEI from available stock */}
                {lookupResult.availableImeis && lookupResult.availableImeis.length > 0 && (
                  <div className="p-3 bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Select IMEI / Unit from Stock ({lookupResult.availableImeis.length} in stock):</span>
                      </span>
                      {lookupResult.imei && (
                        <span className="font-mono text-[10px] text-purple-700 dark:text-purple-300 font-bold">
                          Selected: {lookupResult.imei}
                        </span>
                      )}
                    </div>
                    <select
                      value={lookupResult.stockItemId || lookupResult.imei}
                      onChange={(e) => {
                        const selectedVal = e.target.value;
                        const matched = lookupResult.availableImeis?.find(
                          (a) => a.stockItemId === selectedVal || a.imei === selectedVal
                        );
                        if (matched) {
                          setLookupResult((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  stockItemId: matched.stockItemId,
                                  imei: matched.imei || "",
                                  serialNumber: matched.serialNumber || matched.imei || "",
                                  standardPrice: matched.sellingPrice || prev.standardPrice,
                                }
                              : null
                          );
                          if (matched.sellingPrice) {
                            setCustomSoldPrice(String(matched.sellingPrice));
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 rounded-lg text-xs font-mono font-bold text-purple-950 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                    >
                      {lookupResult.availableImeis.map((item, idx) => (
                        <option key={item.stockItemId || idx} value={item.stockItemId || item.imei}>
                          {item.imei ? `IMEI: ${item.imei}` : ""} {item.serialNumber && item.serialNumber !== item.imei ? `(SN: ${item.serialNumber})` : ""} {item.branchName ? `[${item.branchName}]` : ""} {item.sellingPrice ? `- Rs. ${item.sellingPrice.toLocaleString()}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Actual Sold Price (LKR) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-xs pointer-events-none">
                        LKR
                      </span>
                      <input
                        ref={soldPriceInputRef}
                        type="number"
                        step="any"
                        value={customSoldPrice}
                        onChange={(e) => setCustomSoldPrice(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddRecord();
                          }
                        }}
                        placeholder="0.00"
                        className="w-full pl-12 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-slate-900 dark:text-white font-bold text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddRecord}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Pre-Session</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Records Table / List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Recorded Pre-Session Items ({records.length})
                </h3>
              </div>

              {records.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Total Value:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono text-sm">
                    Rs. {totalPreSessionAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {loadingRecords ? (
              <div className="py-8 flex items-center justify-center text-slate-400 gap-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading pending records...</span>
              </div>
            ) : records.length === 0 ? (
              <div className="py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                <Package className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Pre-Session Items Recorded</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm">
                  Search by IMEI, Serial number, or barcode above to record customer sales made before opening the shift.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {records.map((r, idx) => (
                    <div
                      key={r._id || idx}
                      className="p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {r.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {r.imei && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                IMEI: {r.imei}
                              </span>
                            )}
                            {r.serialNumber && r.serialNumber !== r.imei && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                SN: {r.serialNumber}
                              </span>
                            )}
                            {r.standardPrice !== r.soldPrice && (
                              <span className="text-[10px] text-slate-400 line-through">
                                Std: Rs. {Number(r.standardPrice).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase">Sold Price</span>
                          <span className="text-xs font-extrabold text-emerald-600 font-mono">
                            Rs. {Number(r.soldPrice).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {mode === "POS" && onMoveToCart && (
                            <button
                              type="button"
                              onClick={() => handleMoveSingle(r)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="Add to Current Cart"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              <span>To Cart</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(r._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            {records.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {mode === "POS" && records.length > 0 && onMoveAllToCart && (
              <button
                type="button"
                onClick={handleMoveAll}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Move All ({records.length}) to Cart</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              {mode === "LOGIN" ? "Close / Done" : "Close"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
