import { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Search,
  Trash2,
  Loader2,
  RefreshCw,
  Phone,
  Smartphone,
  Zap,
  Radio,
  CheckCircle2,
  History,
  Layers,
  ArrowRight,
} from "lucide-react";
import { apiGet, apiPost, apiDelete } from "../../../lib/api";
import type { CartItem } from "../../../types/pos";

interface SimCatalogueItem {
  _id: string;
  type: "SIM";
  name: string;
  provider: string;
  amount: number;
  costPrice?: number;
  stockQty?: number;
  product?: any;
  notes?: string;
}

interface SimReloadRecord {
  _id: string;
  type: "SIM" | "RELOAD";
  name: string;
  provider: string;
  phoneNumber?: string;
  amount: number;
  costPrice?: number;
  status: string;
  sale?: any;
  saleNumber?: string;
  createdAt: string;
  soldAt?: string;
  createdBy?: {
    username?: string;
    name?: string;
  };
  notes?: string;
}

interface SimReloadPanelProps {
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

const PROVIDERS = [
  { name: "Dialog", color: "from-red-600 to-rose-700", border: "border-red-500", text: "text-red-500", bg: "bg-red-500/10", prefixes: ["077", "076", "074"] },
  { name: "Mobitel", color: "from-blue-600 to-teal-700", border: "border-blue-500", text: "text-blue-500", bg: "bg-blue-500/10", prefixes: ["071", "070"] },
  { name: "Airtel", color: "from-red-500 to-red-600", border: "border-rose-400", text: "text-rose-500", bg: "bg-rose-500/10", prefixes: ["075"] },
  { name: "Hutch", color: "from-orange-500 to-amber-600", border: "border-orange-500", text: "text-orange-500", bg: "bg-orange-500/10", prefixes: ["078", "072"] },
  { name: "SLT", color: "from-cyan-600 to-blue-700", border: "border-cyan-500", text: "text-cyan-500", bg: "bg-cyan-500/10", prefixes: [] },
  { name: "Other", color: "from-slate-600 to-slate-700", border: "border-slate-500", text: "text-slate-400", bg: "bg-slate-500/10", prefixes: [] },
];

const QUICK_RELOAD_AMOUNTS = [50, 100, 200, 350, 500, 1000, 2000];

export function SimReloadPanel({ onClose, onAddToCart }: SimReloadPanelProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<"SIM" | "RELOAD" | "HISTORY">("SIM");

  // --- SIM Catalogue State ---
  const [sims, setSims] = useState<SimCatalogueItem[]>([]);
  const [simsLoading, setSimsLoading] = useState(false);
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>("ALL");
  const [simPhoneNumber, setSimPhoneNumber] = useState("");
  const [selectedSimForCart, setSelectedSimForCart] = useState<SimCatalogueItem | null>(null);

  // Add SIM Modal State
  const [showAddSimModal, setShowAddSimModal] = useState(false);
  const [newSimName, setNewSimName] = useState("");
  const [newSimProvider, setNewSimProvider] = useState("Dialog");
  const [newSimPrice, setNewSimPrice] = useState("");
  const [newSimCost, setNewSimCost] = useState("");
  const [isSubmittingSim, setIsSubmittingSim] = useState(false);

  // --- Reload State ---
  const [reloadProvider, setReloadProvider] = useState("Dialog");
  const [reloadPhone, setReloadPhone] = useState("");
  const [reloadAmount, setReloadAmount] = useState<string>("100");

  // --- History Table State ---
  const [historyRecords, setHistoryRecords] = useState<SimReloadRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilterType, setHistoryFilterType] = useState<"ALL" | "SIM" | "RELOAD">("ALL");
  const [historySearch, setHistorySearch] = useState("");
  const [historySummary, setHistorySummary] = useState({
    todaySimTotal: 0,
    todaySimCount: 0,
    todayReloadTotal: 0,
    todayReloadCount: 0,
    todayGrandTotal: 0,
  });

  // Success Feedback Toast
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Auto-detect provider from mobile phone prefix
  useEffect(() => {
    const clean = reloadPhone.trim().replace(/\D/g, "");
    if (clean.length >= 3) {
      const p3 = clean.slice(0, 3);
      const matched = PROVIDERS.find((p) => p.prefixes.includes(p3));
      if (matched && matched.name !== reloadProvider) {
        setReloadProvider(matched.name);
      }
    }
  }, [reloadPhone]);

  // Fetch SIM Catalogue
  const fetchSims = async () => {
    try {
      setSimsLoading(true);
      const res = await apiGet<{ status: string; data?: { sims: SimCatalogueItem[] } }>("/sim-reloads/sims");
      if (res.status === "success" && res.data?.sims) {
        setSims(res.data.sims);
      }
    } catch (err) {
      console.error("Error fetching SIMs:", err);
    } finally {
      setSimsLoading(false);
    }
  };

  // Fetch History Records
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      let queryUrl = `/sim-reloads?type=${historyFilterType}&search=${encodeURIComponent(historySearch)}`;
      const res = await apiGet<{
        status: string;
        data?: {
          records: SimReloadRecord[];
          summary?: any;
        };
      }>(queryUrl);

      if (res.status === "success" && res.data) {
        setHistoryRecords(res.data.records || []);
        if (res.data.summary) {
          setHistorySummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchSims();
  }, []);

  useEffect(() => {
    if (activeTab === "HISTORY") {
      fetchHistory();
    }
  }, [activeTab, historyFilterType, historySearch]);

  // Handle Add New SIM to catalogue
  const handleCreateSim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSimName.trim() || !newSimPrice) {
      alert("Please enter SIM Name and valid price.");
      return;
    }

    try {
      setIsSubmittingSim(true);
      const res = await apiPost<{ status: string; message?: string; data?: any }>("/sim-reloads/sims", {
        name: newSimName.trim(),
        provider: newSimProvider,
        amount: parseFloat(newSimPrice),
        costPrice: parseFloat(newSimCost || "0"),
      });

      if (res.status === "success") {
        showToast(`SIM "${newSimName}" registered successfully!`);
        setShowAddSimModal(false);
        setNewSimName("");
        setNewSimPrice("");
        setNewSimCost("");
        fetchSims();
      } else {
        alert(res.message || "Failed to register SIM");
      }
    } catch (err: any) {
      alert(err.message || "Failed to register SIM");
    } finally {
      setIsSubmittingSim(false);
    }
  };

  // Add SIM to Cart
  const handleAddSimToCart = (sim: SimCatalogueItem) => {
    const price = Number(sim.amount || 0);
    const cartProduct: CartItem = {
      _id: sim.product?._id || `sim-${sim._id}`,
      name: simPhoneNumber.trim() ? `${sim.name} (${simPhoneNumber.trim()})` : sim.name,
      sellingPrice: price,
      effectivePrice: price,
      originalPrice: price,
      costPrice: sim.costPrice || 0,
      quantity: 1,
      stock: 999,
      trackingType: "NON_STOCK",
      isSimReload: true,
      simReloadType: "SIM",
      simReloadId: sim._id,
      provider: sim.provider,
      phoneNumber: simPhoneNumber.trim() || undefined,
    };

    onAddToCart(cartProduct);
    showToast(`Added "${cartProduct.name}" to Cart!`);
    setSimPhoneNumber("");
    setSelectedSimForCart(null);
  };

  // Add Reload to Cart
  const handleAddReloadToCart = () => {
    const cleanPhone = reloadPhone.trim().replace(/\D/g, "");
    const amount = parseFloat(reloadAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid reload amount");
      return;
    }

    const reloadName = cleanPhone
      ? `Reload - ${reloadProvider} (${cleanPhone})`
      : `Reload - ${reloadProvider}`;

    const cartItem: CartItem = {
      _id: `reload-${Date.now()}`,
      name: reloadName,
      sellingPrice: amount,
      effectivePrice: amount,
      originalPrice: amount,
      costPrice: 0,
      quantity: 1,
      stock: 999,
      trackingType: "NON_STOCK",
      isSimReload: true,
      simReloadType: "RELOAD",
      provider: reloadProvider,
      phoneNumber: cleanPhone || undefined,
    };

    onAddToCart(cartItem);
    showToast(`Added ${reloadName} (Rs. ${amount.toLocaleString()}) to Cart!`);
    setReloadPhone("");
  };

  // Delete SIM or Transaction
  const handleDeleteItem = async (id: string, isCat: boolean) => {
    if (!confirm(isCat ? "Are you sure you want to remove this SIM card from the catalogue?" : "Delete this transaction record?")) {
      return;
    }
    try {
      await apiDelete(`/sim-reloads/${id}`);
      if (isCat) fetchSims();
      else fetchHistory();
    } catch (err: any) {
      alert(err.message || "Failed to delete item");
    }
  };

  // Filtered SIMs
  const filteredSims = useMemo(() => {
    if (selectedProviderFilter === "ALL") return sims;
    return sims.filter((s) => s.provider?.toLowerCase() === selectedProviderFilter.toLowerCase());
  }, [sims, selectedProviderFilter]);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  SIM Cards & Mobile Reload
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    POS Service
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select SIM cards, top up airtime & view full transaction log
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/60 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveTab("SIM")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "SIM"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/30"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>SIM Cards</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {sims.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("RELOAD")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "RELOAD"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-400/30"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Mobile Reload</span>
            </button>

            <button
              onClick={() => setActiveTab("HISTORY")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "HISTORY"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/30"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Records & History Table</span>
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedbackMsg && (
          <div className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 flex items-center justify-between shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{feedbackMsg}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="opacity-80 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50">
          {/* TAB 1: SIM CARDS */}
          {activeTab === "SIM" && (
            <div className="space-y-5">
              {/* Toolbar & Filter */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-400 mr-1">Network:</span>
                  {["ALL", "Dialog", "Mobitel", "Airtel", "Hutch", "SLT"].map((net) => (
                    <button
                      key={net}
                      onClick={() => setSelectedProviderFilter(net)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        selectedProviderFilter === net
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddSimModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New SIM</span>
                </button>
              </div>

              {/* SIM Grid */}
              {simsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              ) : filteredSims.length === 0 ? (
                <div className="text-center py-14 bg-white dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
                  <Smartphone className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-30" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No SIM Cards Found</h3>
                  <p className="text-xs text-slate-400 mt-1">Register your first SIM card using the button above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {filteredSims.map((sim) => {
                    const providerStyle = PROVIDERS.find((p) => p.name.toLowerCase() === sim.provider?.toLowerCase()) || PROVIDERS[5];
                    const isSelected = selectedSimForCart?._id === sim._id;

                    return (
                      <div
                        key={sim._id}
                        className={`group relative bg-white dark:bg-slate-800 rounded-2xl border p-4 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
                          isSelected
                            ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${providerStyle.bg} ${providerStyle.text} border ${providerStyle.border}`}
                            >
                              {sim.provider}
                            </span>
                            <button
                              onClick={() => handleDeleteItem(sim._id, true)}
                              className="text-slate-300 hover:text-red-500 transition-colors p-1"
                              title="Delete SIM from catalogue"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-snug">
                            {sim.name}
                          </h3>

                          <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-xs text-slate-400">Price:</span>
                            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                              Rs. {sim.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                          {isSelected ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Phone number (optional)"
                                value={simPhoneNumber}
                                onChange={(e) => setSimPhoneNumber(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 dark:text-white"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setSelectedSimForCart(null)}
                                  className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleAddSimToCart(sim)}
                                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <span>Confirm to Cart</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedSimForCart(sim)}
                              className="w-full py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:bg-slate-700/60 dark:hover:bg-indigo-600 dark:text-indigo-300 dark:hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Select & Add to Cart</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MOBILE RELOAD */}
          {activeTab === "RELOAD" && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-5">
                {/* Select Network */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                    1. Select Network / Provider
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PROVIDERS.map((prov) => {
                      const isSel = reloadProvider === prov.name;
                      return (
                        <button
                          key={prov.name}
                          type="button"
                          onClick={() => setReloadProvider(prov.name)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            isSel
                              ? `${prov.bg} ${prov.border} ${prov.text} ring-2 ring-indigo-500/30 font-bold shadow-sm`
                              : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Radio className="w-4 h-4" />
                          <span className="text-xs font-semibold">{prov.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Number Input (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>2. Customer Mobile Number <span className="text-[11px] font-normal text-slate-400">(Optional)</span></span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      placeholder="e.g. 0771234567 (Optional)"
                      value={reloadPhone}
                      onChange={(e) => setReloadPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-mono text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Amount Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                    3. Reload Amount (Rs.)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {QUICK_RELOAD_AMOUNTS.map((amt) => {
                      const isSel = reloadAmount === String(amt);
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setReloadAmount(String(amt))}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            isSel
                              ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-400/40"
                              : "bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                          }`}
                        >
                          Rs. {amt.toLocaleString()}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none font-bold text-slate-400 text-sm">
                      Rs.
                    </span>
                    <input
                      type="number"
                      placeholder="Custom amount"
                      value={reloadAmount}
                      onChange={(e) => setReloadAmount(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-bold text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Submit to Cart */}
                <button
                  type="button"
                  onClick={handleAddReloadToCart}
                  disabled={!reloadAmount || Number(reloadAmount) <= 0}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>
                    Add Reload to Cart • Rs. {Number(reloadAmount || 0).toLocaleString()}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: RECORDS & HISTORY TABLE */}
          {activeTab === "HISTORY" && (
            <div className="space-y-4">
              {/* Metric Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Today's SIMs</span>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                      Rs. {historySummary.todaySimTotal.toLocaleString()} ({historySummary.todaySimCount})
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Today's Reloads</span>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                      Rs. {historySummary.todayReloadTotal.toLocaleString()} ({historySummary.todayReloadCount})
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Today's Grand Total</span>
                    <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      Rs. {historySummary.todayGrandTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Table Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                {/* Filter by Type */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-400 mr-1">Filter:</span>
                  <button
                    onClick={() => setHistoryFilterType("ALL")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      historyFilterType === "ALL"
                        ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    All Records
                  </button>
                  <button
                    onClick={() => setHistoryFilterType("SIM")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      historyFilterType === "SIM"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    SIM Cards Only
                  </button>
                  <button
                    onClick={() => setHistoryFilterType("RELOAD")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      historyFilterType === "RELOAD"
                        ? "bg-amber-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Reloads Only
                  </button>
                </div>

                {/* Search & Refresh */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search phone, sale#..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={fetchHistory}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                    title="Refresh Records"
                  >
                    <RefreshCw className={`w-4 h-4 ${historyLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
                  </div>
                ) : historyRecords.length === 0 ? (
                  <div className="text-center py-14 p-6">
                    <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">No SIM or Reload transactions recorded yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700/80 text-slate-500 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-2.5 px-3.5">Date & Time</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Network</th>
                          <th className="py-2.5 px-3">Target Phone</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Sale Number</th>
                          <th className="py-2.5 px-3">Cashier</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {historyRecords.map((rec) => (
                          <tr key={rec._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="py-2.5 px-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                              {new Date(rec.createdAt).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  rec.type === "RELOAD"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                    : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                                }`}
                              >
                                {rec.type}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200">
                              {rec.provider || "Other"}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-100">
                              {rec.phoneNumber || "—"}
                            </td>
                            <td className="py-2.5 px-3 font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              Rs. {rec.amount.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                              {rec.saleNumber || rec.sale?.saleNumber || (
                                <span className="text-slate-400">Walk-in</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                              {rec.createdBy?.username || rec.createdBy?.name || "Staff"}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleDeleteItem(rec._id, false)}
                                className="text-slate-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                                title="Delete record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Register New SIM Sub-Modal */}
      {showAddSimModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-500" />
                Register New SIM Card
              </h3>
              <button
                onClick={() => setShowAddSimModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSim} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  SIM Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dialog 4G Pre-Paid SIM"
                  value={newSimName}
                  onChange={(e) => setNewSimName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Network / Provider *
                </label>
                <select
                  value={newSimProvider}
                  onChange={(e) => setNewSimProvider(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white"
                >
                  <option value="Dialog">Dialog</option>
                  <option value="Mobitel">Mobitel</option>
                  <option value="Airtel">Airtel</option>
                  <option value="Hutch">Hutch</option>
                  <option value="SLT">SLT</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Selling Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    placeholder="200"
                    value={newSimPrice}
                    onChange={(e) => setNewSimPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Cost Price (Rs.)
                  </label>
                  <input
                    type="number"
                    placeholder="150"
                    value={newSimCost}
                    onChange={(e) => setNewSimCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSimModal(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSim || !newSimName.trim() || !newSimPrice}
                  className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {isSubmittingSim && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Register</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
