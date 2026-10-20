import { useState, useEffect, useMemo } from "react";
import {
  ArrowRightLeft,
  ArrowRight,
  X,
  Search,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  AlertCircle,
  Building2,
  Package,
  Eye,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../contexts/AuthContext";

interface StockTransferPanelProps {
  onClose: () => void;
  onTransferSuccess?: () => void;
}

interface TransferItem {
  product: string;
  productName: string;
  variant?: string | null;
  variantDisplay?: string;
  stockId: string;
  quantity: number;
  trackingType: "QUANTITY" | "IMEI" | "SERIAL";
  stockItems?: string[];
  serialNumbers?: string[];
}

export function StockTransferPanel({ onClose, onTransferSuccess }: StockTransferPanelProps): JSX.Element {
  const { user, branchId: authBranchId, branchName: authBranchName } = useAuth();

  // Active user branch ID (fallback to session branch if needed)
  const currentBranchId = useMemo(() => {
    return authBranchId || user?.currentSession?.branch?._id || "";
  }, [authBranchId, user]);

  const currentBranchName = useMemo(() => {
    return authBranchName || user?.currentSession?.branch?.name || "Current Store";
  }, [authBranchName, user]);

  // Tab State: 'history' or 'new'
  const [activeTab, setActiveTab] = useState<"history" | "new">("history");

  // Branches
  const [branches, setBranches] = useState<any[]>([]);

  // Transfer History State
  const [transfers, setTransfers] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | "outgoing" | "incoming">("all");
  const [historySearch, setHistorySearch] = useState("");
  const [selectedTransferForDetails, setSelectedTransferForDetails] = useState<any | null>(null);

  // New Transfer State
  const [destinationBranchId, setDestinationBranchId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Stock Search / Selection State
  const [productSearch, setProductSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [availableStocks, setAvailableStocks] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Item Picker Modal/Dropdown State (for choosing quantity or selecting specific IMEIs)
  const [activeStockPicker, setActiveStockPicker] = useState<any | null>(null);
  const [pickerQuantity, setPickerQuantity] = useState<number>(1);
  const [selectedImeis, setSelectedImeis] = useState<string[]>([]); // stockItem _ids

  // Toast / Status Notification
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 1. Fetch Branches
  const fetchBranches = async () => {
    try {
      const res = await api<any>("/branches");
      if (res.status === "success" && res.data?.branches) {
        setBranches(res.data.branches);
      }
    } catch (err) {
      console.error("Failed to load branches:", err);
    }
  };

  // 2. Fetch Transfer History
  const fetchTransfers = async () => {
    setHistoryLoading(true);
    try {
      const queryType = historyFilter === "all" ? "" : `?type=${historyFilter}`;
      const res = await api<any>(`/stock-transfers${queryType}`);
      if (res.status === "success" && res.data?.transfers) {
        setTransfers(res.data.transfers);
      }
    } catch (err: any) {
      console.error("Failed to fetch transfers:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      fetchTransfers();
    }
  }, [activeTab, historyFilter]);

  // Search available stocks at current branch
  useEffect(() => {
    if (!productSearch.trim()) {
      setAvailableStocks([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const queryParams = new URLSearchParams({
          branchId: currentBranchId,
          search: productSearch.trim(),
          limit: "30",
        });
        const res = await api<any>(`/stock-transfers/available-stock?${queryParams.toString()}`);
        if (res.status === "success" && res.data?.stocks) {
          setAvailableStocks(res.data.stocks);
          setHasSearched(true);
        }
      } catch (err) {
        console.error("Failed to search available stock:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [productSearch, currentBranchId]);

  // Open item picker for a product/variant
  const handleOpenPicker = (stockRow: any) => {
    setActiveStockPicker(stockRow);
    setPickerQuantity(1);
    setSelectedImeis([]);
  };

  // Add selected item to transfer manifest
  const handleConfirmAddItem = () => {
    if (!activeStockPicker) return;

    const isImei =
      activeStockPicker.trackingType === "IMEI" || activeStockPicker.trackingType === "SERIAL";

    if (isImei) {
      if (selectedImeis.length === 0) {
        showNotification("Please select at least one IMEI/Serial number", "error");
        return;
      }

      // Collect serial number labels for display
      const selectedLabels = (activeStockPicker.items || [])
        .filter((i: any) => selectedImeis.includes(i._id))
        .map((i: any) => i.imei1 || i.serialNumber || i.imei2)
        .filter(Boolean);

      const newItem: TransferItem = {
        product: activeStockPicker.product._id,
        productName: activeStockPicker.product.name,
        variant: activeStockPicker.variant?._id || null,
        variantDisplay: activeStockPicker.variantDisplay || "Default",
        stockId: activeStockPicker.stockId,
        quantity: selectedImeis.length,
        trackingType: activeStockPicker.trackingType,
        stockItems: selectedImeis,
        serialNumbers: selectedLabels,
      };

      setTransferItems((prev) => [...prev, newItem]);
    } else {
      if (pickerQuantity <= 0 || pickerQuantity > activeStockPicker.availableQty) {
        showNotification(`Quantity must be between 1 and ${activeStockPicker.availableQty}`, "error");
        return;
      }

      const newItem: TransferItem = {
        product: activeStockPicker.product._id,
        productName: activeStockPicker.product.name,
        variant: activeStockPicker.variant?._id || null,
        variantDisplay: activeStockPicker.variantDisplay || "Default",
        stockId: activeStockPicker.stockId,
        quantity: pickerQuantity,
        trackingType: "QUANTITY",
        stockItems: [],
        serialNumbers: [],
      };

      setTransferItems((prev) => [...prev, newItem]);
    }

    setActiveStockPicker(null);
    setProductSearch("");
    setAvailableStocks([]);
    showNotification(`Added "${activeStockPicker.product.name}" to transfer manifest`);
  };

  const handleRemoveTransferItem = (index: number) => {
    setTransferItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Stock Transfer
  const handleSubmitTransfer = async () => {
    if (!destinationBranchId) {
      showNotification("Please select a destination branch", "error");
      return;
    }
    if (destinationBranchId === currentBranchId) {
      showNotification("Source and Destination branches cannot be the same", "error");
      return;
    }
    if (transferItems.length === 0) {
      showNotification("Please add at least one item to transfer", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        sourceBranch: currentBranchId,
        destinationBranch: destinationBranchId,
        notes: notes.trim() || undefined,
        items: transferItems.map((item) => ({
          product: item.product,
          variant: item.variant || undefined,
          variantDisplay: item.variantDisplay,
          stockId: item.stockId,
          quantity: item.quantity,
          trackingType: item.trackingType,
          stockItems: item.stockItems && item.stockItems.length > 0 ? item.stockItems : undefined,
          serialNumbers: item.serialNumbers && item.serialNumbers.length > 0 ? item.serialNumbers : undefined,
        })),
      };

      const res = await api<any>("/stock-transfers", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.status === "success") {
        showNotification("Stock transfer completed successfully!", "success");
        setTransferItems([]);
        setNotes("");
        setDestinationBranchId("");
        setActiveTab("history");
        fetchTransfers();
        onTransferSuccess?.();
      } else {
        showNotification(res.message || "Failed to complete stock transfer", "error");
      }
    } catch (err: any) {
      showNotification(err.message || "Network error while completing transfer", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered transfers for search
  const filteredTransfers = useMemo(() => {
    if (!historySearch.trim()) return transfers;
    const q = historySearch.toLowerCase().trim();
    return transfers.filter((t) => {
      const num = (t.transferNumber || "").toLowerCase();
      const src = (t.sourceBranch?.name || "").toLowerCase();
      const dest = (t.destinationBranch?.name || "").toLowerCase();
      const itemsMatch = (t.items || []).some((item: any) =>
        (item.productName || item.product?.name || "").toLowerCase().includes(q)
      );
      return num.includes(q) || src.includes(q) || dest.includes(q) || itemsMatch;
    });
  }, [transfers, historySearch]);

  const totalTransferUnits = useMemo(() => {
    return transferItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [transferItems]);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 xl:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-5xl border border-slate-800/80 shadow-2xl overflow-hidden h-[90vh] flex flex-col text-slate-800">
        {/* Header: Dark Slate (#0f172a) */}
        <div className="px-6 py-4 bg-[#0f172a] text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center text-lg font-extrabold shadow-md shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  Stock Transfers
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#1e293b] text-teal-400 border border-teal-900/60">
                  INTER-BRANCH
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Current Terminal Branch: <span className="text-teal-300 font-semibold">{currentBranchName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher Pills */}
            <div className="bg-slate-800/90 p-1 rounded-xl flex items-center gap-1 border border-slate-700/60">
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "history"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Transfer History
              </button>
              <button
                onClick={() => setActiveTab("new")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "new"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                New Transfer
                {transferItems.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-teal-700 text-[10px] font-bold flex items-center justify-center">
                    {transferItems.length}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer ml-2"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Floating Notification */}
        {notification && (
          <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold text-white animate-in slide-in-from-top-2 ${
              notification.type === "error" ? "bg-rose-600" : "bg-teal-600"
            }`}
          >
            {notification.type === "error" ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Body Container */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
          {/* TAB 1: Transfer History */}
          {activeTab === "history" && (
            <div className="flex-1 overflow-hidden flex flex-col p-5">
              {/* History Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 shrink-0">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center gap-1 shadow-2xs">
                    <button
                      onClick={() => setHistoryFilter("all")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        historyFilter === "all"
                          ? "bg-teal-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      All Transfers
                    </button>
                    <button
                      onClick={() => setHistoryFilter("outgoing")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        historyFilter === "outgoing"
                          ? "bg-teal-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Outgoing (From here)
                    </button>
                    <button
                      onClick={() => setHistoryFilter("incoming")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        historyFilter === "incoming"
                          ? "bg-teal-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      Incoming (To here)
                    </button>
                  </div>

                  <button
                    onClick={fetchTransfers}
                    disabled={historyLoading}
                    className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    title="Refresh transfers"
                  >
                    <RefreshCw className={`w-4 h-4 ${historyLoading ? "animate-spin text-teal-600" : ""}`} />
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search by transfer # or product..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Transfers Table / List */}
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1">
                  {historyLoading ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-2" />
                      <p className="text-xs font-medium">Loading stock transfers...</p>
                    </div>
                  ) : filteredTransfers.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                        <ArrowRightLeft className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">No stock transfers found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Click "New Transfer" to move stock between Homagama and Padukka.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0 z-10 font-medium">
                        <tr>
                          <th className="px-4 py-3">Transfer #</th>
                          <th className="px-4 py-3">Route (From &rarr; To)</th>
                          <th className="px-4 py-3">Items Summary</th>
                          <th className="px-4 py-3 text-center">Units</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredTransfers.map((t) => {
                          const isOutgoing = String(t.sourceBranch?._id || t.sourceBranch) === String(currentBranchId);
                          const totalUnits = (t.items || []).reduce(
                            (sum: number, it: any) => sum + (it.quantity || 1),
                            0
                          );

                          return (
                            <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                {t.transferNumber}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                  <span className={isOutgoing ? "text-teal-700 font-bold" : "text-slate-600"}>
                                    {t.sourceBranch?.name || "Source"}
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className={!isOutgoing ? "text-teal-700 font-bold" : "text-slate-600"}>
                                    {t.destinationBranch?.name || "Destination"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="max-w-[240px] truncate text-slate-600 font-medium">
                                  {(t.items || [])
                                    .map(
                                      (it: any) =>
                                        `${it.productName || it.product?.name || "Item"} (${it.quantity})`
                                    )
                                    .join(", ")}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-slate-900">
                                {totalUnits}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  {t.status || "COMPLETED"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                                {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => setSelectedTransferForDetails(t)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: New Stock Transfer Form */}
          {activeTab === "new" && (
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column (8 cols): Destination Branch + Product Search & Picker */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                  {/* Step 1: Branches Route Card */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-600" />
                      1. Transfer Route
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Source Branch (Fixed to current) */}
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Source Store (Sending)
                        </span>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          {currentBranchName}
                        </div>
                      </div>

                      {/* Destination Branch Selector */}
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Destination Store (Receiving) *
                        </label>
                        <select
                          value={destinationBranchId}
                          onChange={(e) => setDestinationBranchId(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-xs font-semibold text-slate-800 outline-none shadow-2xs"
                        >
                          <option value="">-- Choose Destination Branch --</option>
                          {branches
                            .filter((b) => String(b._id) !== String(currentBranchId) && b.isActive !== false)
                            .map((b) => (
                              <option key={b._id} value={b._id}>
                                {b.name} ({b.code})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    {/* Notes Input */}
                    <div className="mt-3">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Transfer Notes / Remarks (Optional)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Urgent stock request for customer order"
                        className="w-full px-3 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Step 2: Product Search & Item Picker */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-teal-600" />
                      2. Add Products from Source Inventory
                    </h4>

                    {/* Search Input */}
                    <div className="relative mb-3">
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search source stock by name, code, barcode, or IMEI..."
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-teal-500 shadow-2xs"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      {searchLoading && (
                        <Loader2 className="w-4 h-4 animate-spin text-teal-600 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>

                    {/* Search Results List */}
                    <div className="max-h-[300px] overflow-y-auto space-y-2 scrollbar-thin">
                      {productSearch && !searchLoading && availableStocks.length === 0 && hasSearched && (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          No available stock found for "{productSearch}" at {currentBranchName}.
                        </div>
                      )}

                      {!productSearch && (
                        <div className="text-center py-8 text-slate-400 text-xs font-medium">
                          Type a product name, SKU, or IMEI above to search available stock at {currentBranchName}.
                        </div>
                      )}

                      {availableStocks.map((stock) => {
                        const isImei = stock.trackingType === "IMEI" || stock.trackingType === "SERIAL";
                        return (
                          <div
                            key={`${stock.product._id}_${stock.variant?._id || "none"}`}
                            className="p-3 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200 rounded-xl flex items-center justify-between gap-3 transition-colors"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-xs truncate">
                                {stock.product.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {stock.variantDisplay && stock.variantDisplay !== "Default" && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                    {stock.variantDisplay}
                                  </span>
                                )}
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    isImei
                                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                                      : "bg-amber-100 text-amber-700 border border-amber-200"
                                  }`}
                                >
                                  {stock.trackingType}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-600 font-mono">
                                  Available: <strong className="text-emerald-700 font-bold">{stock.availableQty}</strong>
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleOpenPicker(stock)}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Select
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column (4 cols): Transfer Manifest / Cart */}
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          Transfer Manifest
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Items to be dispatched immediately
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        {totalTransferUnits} Units
                      </span>
                    </div>

                    {/* Manifest Item List */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[220px] max-h-[380px] pr-1">
                      {transferItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                          <Package className="w-8 h-8 text-slate-300 mb-2" />
                          <p className="text-xs font-bold text-slate-600">No items added yet</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Search and select products from the left to include in this transfer.
                          </p>
                        </div>
                      ) : (
                        transferItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl relative group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {item.productName}
                                </div>
                                {item.variantDisplay && item.variantDisplay !== "Default" && (
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    {item.variantDisplay}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveTransferItem(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-xs">
                              <span className="font-mono text-slate-500 text-[11px]">
                                Tracking: {item.trackingType}
                              </span>
                              <span className="font-bold text-teal-700 font-mono">
                                Qty: {item.quantity}
                              </span>
                            </div>

                            {/* Show selected IMEIs preview */}
                            {item.serialNumbers && item.serialNumbers.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                                {item.serialNumbers.map((s, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white border border-slate-200 text-slate-700"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Bottom Submit Action */}
                    <div className="pt-3 border-t border-slate-100 shrink-0 mt-3">
                      <button
                        onClick={handleSubmitTransfer}
                        disabled={submitting || transferItems.length === 0 || !destinationBranchId}
                        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Dispatching Stock...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Confirm & Transfer Stock ({totalTransferUnits})
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Picker Modal (Quantity / IMEI Selection) */}
      {activeStockPicker && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 bg-[#0f172a] text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">{activeStockPicker.product.name}</h4>
                <div className="text-[11px] text-teal-400 font-mono mt-0.5">
                  Available at {currentBranchName}: {activeStockPicker.availableQty} units
                </div>
              </div>
              <button
                onClick={() => setActiveStockPicker(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              {/* If Quantity Tracking: Number Stepper */}
              {activeStockPicker.trackingType === "QUANTITY" ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Specify the number of units to transfer to the destination branch:
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPickerQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={activeStockPicker.availableQty}
                      value={pickerQuantity}
                      onChange={(e) =>
                        setPickerQuantity(
                          Math.max(1, Math.min(activeStockPicker.availableQty, parseInt(e.target.value) || 1))
                        )
                      }
                      className="flex-1 py-2 text-center text-lg font-bold border border-slate-200 rounded-xl focus:border-teal-500 outline-none"
                    />
                    <button
                      onClick={() =>
                        setPickerQuantity((q) => Math.min(activeStockPicker.availableQty, q + 1))
                      }
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                /* If IMEI / Serial Tracking: List Checkboxes */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Select Devices by IMEI / Serial:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setSelectedImeis(
                            (activeStockPicker.items || []).map((i: any) => i._id)
                          )
                        }
                        className="text-teal-600 hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setSelectedImeis([])}
                        className="text-slate-400 hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50">
                    {(activeStockPicker.items || []).map((si: any) => {
                      const isChecked = selectedImeis.includes(si._id);
                      return (
                        <label
                          key={si._id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-teal-50 border border-teal-200 text-teal-900"
                              : "hover:bg-slate-100 text-slate-800"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedImeis((prev) => [...prev, si._id]);
                              } else {
                                setSelectedImeis((prev) => prev.filter((id) => id !== si._id));
                              }
                            }}
                            className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                          <div className="font-mono text-xs">
                            {si.imei1 && <div>IMEI 1: {si.imei1}</div>}
                            {si.imei2 && <div className="text-[10px] text-slate-400">IMEI 2: {si.imei2}</div>}
                            {si.serialNumber && !si.imei1 && <div>Serial: {si.serialNumber}</div>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setActiveStockPicker(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddItem}
                className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Confirm Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Details Modal */}
      {selectedTransferForDetails && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-[#0f172a] text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Transfer #{selectedTransferForDetails.transferNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {selectedTransferForDetails.status}
                  </span>
                </h4>
                <div className="text-xs text-slate-400 mt-0.5">
                  {new Date(selectedTransferForDetails.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedTransferForDetails(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Route */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">From (Source)</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedTransferForDetails.sourceBranch?.name || "Source"}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400" />
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">To (Destination)</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedTransferForDetails.destinationBranch?.name || "Destination"}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h5 className="font-bold text-slate-700 mb-2 uppercase text-[10px] tracking-wider">
                  Transferred Items
                </h5>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {(selectedTransferForDetails.items || []).map((it: any, i: number) => (
                    <div key={i} className="p-3 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {it.productName || it.product?.name}
                        </span>
                        <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          Qty: {it.quantity}
                        </span>
                      </div>
                      {it.variantDisplay && (
                        <div className="text-slate-500 text-[11px] mt-0.5">{it.variantDisplay}</div>
                      )}
                      {it.serialNumbers && it.serialNumbers.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {it.serialNumbers.map((sn: string, sIdx: number) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {sn}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedTransferForDetails.notes && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block mb-0.5">Notes:</span>
                  {selectedTransferForDetails.notes}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedTransferForDetails(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
