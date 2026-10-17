import { useState, useEffect, useMemo } from "react";
import {
  X,
  Printer,
  FileText,
  RotateCcw,
  Search,
  ShoppingBag,
  Wrench,
  Clock,
  AlertCircle,
  Receipt,
  Download,
  Loader2,
} from "lucide-react";
import { api } from "../../../lib/api";
import { getShopSettings } from "../../../lib/settings";
import {
  generateBusinessReportHtml,
  generateDailySalesReportHtml,
  printDocument,
  downloadPdfDocument,
  BusinessReportData,
} from "../../../lib/invoiceGenerator";
import type { Category, Product, RepairJob } from "../../../types/pos";

export interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  products: Product[];
  currentUser?: any;
}

export function ReportsModal({
  isOpen,
  onClose,
  categories,
  products,
  currentUser,
}: ReportsModalProps): JSX.Element | null {
  if (!isOpen) return null;

  // Active Tab: "sales" | "repairs" | "summary"
  const [activeTab, setActiveTab] = useState<"sales" | "repairs" | "summary">("sales");

  // Raw data from server
  const [salesList, setSalesList] = useState<any[]>([]);
  const [repairsList, setRepairsList] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Filters State
  const [datePreset, setDatePreset] = useState<"today" | "yesterday" | "last7" | "thisMonth" | "all" | "custom">("today");
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Quick Date Preset Handler
  const handleDatePresetChange = (preset: "today" | "yesterday" | "last7" | "thisMonth" | "all" | "custom") => {
    setDatePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (preset === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split("T")[0];
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === "last7") {
      const w = new Date();
      w.setDate(w.getDate() - 6);
      setStartDate(w.toISOString().split("T")[0]);
      setEndDate(todayStr);
    } else if (preset === "thisMonth") {
      const m = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(m.toISOString().split("T")[0]);
      setEndDate(todayStr);
    } else if (preset === "all") {
      setStartDate("");
      setEndDate("");
    }
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // 1. Fetch Sales (supports wide limit)
      let salesQuery = "/sales?limit=3000";
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        salesQuery += `&startDate=${encodeURIComponent(s.toISOString())}`;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        salesQuery += `&endDate=${encodeURIComponent(e.toISOString())}`;
      }

      const [salesRes, repairsRes] = await Promise.all([
        api<any>(salesQuery),
        api<any>("/repairs?limit=1500"),
      ]);

      if (salesRes.status === "success" && Array.isArray(salesRes.data?.sales)) {
        setSalesList(salesRes.data.sales);
      } else {
        setSalesList([]);
      }

      if (repairsRes.status === "success" && Array.isArray(repairsRes.data?.repairs)) {
        setRepairsList(repairsRes.data.repairs);
      } else {
        setRepairsList([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch reports data:", err);
      setErrorMsg(err?.message || "Failed to load report data from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Product Category Lookup Map
  const productCategoryMap = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      const catId = p.category?._id || "";
      if (catId) map.set(p._id, catId);
    });
    return map;
  }, [products]);

  // Subcategory Map
  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => {
      map.set(c._id, c.name);
      if (c.subcategories) {
        c.subcategories.forEach((sub) => map.set(sub._id, `${c.name} > ${sub.name}`));
      }
    });
    return map;
  }, [categories]);

  // Reset Filters
  const handleResetFilters = () => {
    handleDatePresetChange("today");
    setSelectedCategoryId("all");
    setMinPrice("");
    setMaxPrice("");
    setSelectedPaymentMethod("all");
    setSelectedStatus("all");
    setSearchQuery("");
  };

  // Filtered Sales Calculation
  const filteredSales = useMemo(() => {
    return salesList.filter((sale) => {
      // 1. Status Filter
      if (selectedStatus !== "all") {
        if (sale.status !== selectedStatus) return false;
      }

      // 2. Payment Method
      if (selectedPaymentMethod !== "all") {
        const method = (sale.paymentMethod || (Array.isArray(sale.payments) && sale.payments[0]?.method) || "").toUpperCase();
        if (!method.includes(selectedPaymentMethod.toUpperCase())) {
          return false;
        }
      }

      // 3. Price Range
      const grandTotal = Number(sale.grandTotal !== undefined ? sale.grandTotal : (sale.total || 0));
      if (minPrice && !isNaN(Number(minPrice)) && grandTotal < Number(minPrice)) {
        return false;
      }
      if (maxPrice && !isNaN(Number(maxPrice)) && grandTotal > Number(maxPrice)) {
        return false;
      }

      // 4. Category Filter
      if (selectedCategoryId !== "all") {
        const items = Array.isArray(sale.items) ? sale.items : [];
        const hasMatchingCat = items.some((it: any) => {
          const pId = it.product?._id || it.product || it.productId;
          const catId = productCategoryMap.get(pId) || it.category || it.product?.category?._id;
          return catId === selectedCategoryId;
        });
        if (!hasMatchingCat) return false;
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const sNum = (sale.saleNumber || "").toLowerCase();
        const cName = (sale.customer?.name || sale.client?.name || "").toLowerCase();
        const cPhone = (sale.customer?.phone || sale.client?.phone || "").toLowerCase();
        const matchesItems = Array.isArray(sale.items) && sale.items.some((it: any) => {
          const pName = (it.productName || it.product?.name || "").toLowerCase();
          const sNo = (it.serialNumber || "").toLowerCase();
          const imei = (it.imei1 || it.imei || "").toLowerCase();
          return pName.includes(q) || sNo.includes(q) || imei.includes(q);
        });

        if (!sNum.includes(q) && !cName.includes(q) && !cPhone.includes(q) && !matchesItems) {
          return false;
        }
      }

      return true;
    });
  }, [salesList, selectedStatus, selectedPaymentMethod, minPrice, maxPrice, selectedCategoryId, searchQuery, productCategoryMap]);

  // Filtered Repairs Calculation
  const filteredRepairs = useMemo(() => {
    return repairsList.filter((repair) => {
      // 1. Date Range
      if (startDate || endDate) {
        const rDate = new Date(repair.createdAt);
        if (startDate) {
          const s = new Date(startDate);
          s.setHours(0, 0, 0, 0);
          if (rDate < s) return false;
        }
        if (endDate) {
          const e = new Date(endDate);
          e.setHours(23, 59, 59, 999);
          if (rDate > e) return false;
        }
      }

      // 2. Status
      if (selectedStatus !== "all") {
        if (repair.status !== selectedStatus) return false;
      }

      // 3. Price Range (Total Cost or Service Cost)
      const cost = Number(repair.totalCost || repair.serviceCost || repair.estimatedCost || 0);
      if (minPrice && !isNaN(Number(minPrice)) && cost < Number(minPrice)) {
        return false;
      }
      if (maxPrice && !isNaN(Number(maxPrice)) && cost > Number(maxPrice)) {
        return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const jNum = (repair.jobNumber || "").toLowerCase();
        const cName = (repair.customer?.name || "").toLowerCase();
        const cPhone = (repair.customer?.phone || "").toLowerCase();
        const dBrand = (repair.device?.brand || "").toLowerCase();
        const dModel = (repair.device?.model || "").toLowerCase();
        const tech = (repair.assignedTo?.username || "").toLowerCase();
        const issue = (repair.problemDescription || "").toLowerCase();

        if (
          !jNum.includes(q) &&
          !cName.includes(q) &&
          !cPhone.includes(q) &&
          !dBrand.includes(q) &&
          !dModel.includes(q) &&
          !tech.includes(q) &&
          !issue.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [repairsList, startDate, endDate, selectedStatus, minPrice, maxPrice, searchQuery]);

  // KPI Metrics Calculation for Sales
  const salesMetrics = useMemo(() => {
    let totalRevenue = 0;
    let totalItems = 0;
    let totalDiscount = 0;
    const paymentBreakdown: Record<string, number> = {};

    filteredSales.forEach((s) => {
      if (s.status !== "CANCELLED" && s.status !== "VOIDED") {
        const tot = Number(s.grandTotal !== undefined ? s.grandTotal : (s.total || 0));
        totalRevenue += tot;
        totalDiscount += Number(s.discountTotal || s.discount || 0);

        if (Array.isArray(s.items)) {
          s.items.forEach((it: any) => {
            totalItems += Number(it.quantity || 1);
          });
        }

        const method = (s.paymentMethod || (Array.isArray(s.payments) && s.payments[0]?.method) || "CASH").toUpperCase();
        paymentBreakdown[method] = (paymentBreakdown[method] || 0) + tot;
      }
    });

    return {
      totalRecords: filteredSales.length,
      totalAmount: totalRevenue,
      totalItems,
      totalDiscount,
      paymentBreakdown,
    };
  }, [filteredSales]);

  // KPI Metrics Calculation for Repairs
  const repairsMetrics = useMemo(() => {
    let totalCost = 0;
    let totalPaid = 0;
    let totalDue = 0;
    const statusBreakdown: Record<string, number> = {};

    filteredRepairs.forEach((r) => {
      const cost = Number(r.totalCost || r.serviceCost || r.estimatedCost || 0);
      const adv = Number(r.advancePayment || 0);
      const fin = Number(r.finalPayment || 0);
      const due = Number(r.balanceDue !== undefined ? r.balanceDue : Math.max(0, cost - (adv + fin)));

      totalCost += cost;
      totalPaid += adv + fin;
      totalDue += due;

      statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1;
    });

    return {
      totalRecords: filteredRepairs.length,
      totalAmount: totalCost,
      totalPaid,
      totalDue,
      statusBreakdown,
    };
  }, [filteredRepairs]);

  // Trigger Print A4 Business Report
  const handlePrintBusinessReport = async () => {
    if (isPrinting || isDownloading) return;
    setIsPrinting(true);
    try {
      await new Promise((r) => setTimeout(r, 80));
      const shopSettings = getShopSettings();
      const catName = selectedCategoryId === "all" ? "All Categories" : (categoryNameMap.get(selectedCategoryId) || selectedCategoryId);

      const reportData: BusinessReportData = {
        reportType: activeTab === "repairs" ? "repairs" : "sales",
        title: activeTab === "repairs" ? "OFFICIAL REPAIR JOBS REPORT" : "OFFICIAL SALES & REVENUE REPORT",
        filters: {
          reportType: activeTab === "repairs" ? "repairs" : "sales",
          datePreset: datePreset,
          startDate: startDate,
          endDate: endDate,
          categoryName: selectedCategoryId !== "all" ? catName : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          paymentMethod: selectedPaymentMethod !== "all" ? selectedPaymentMethod : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          searchQuery: searchQuery || undefined,
        },
        sales: filteredSales,
        repairs: filteredRepairs,
        summaryMetrics: activeTab === "repairs" ? repairsMetrics : salesMetrics,
        user: currentUser,
        shopSettings,
      };

      const html = generateBusinessReportHtml(reportData);
      printDocument(html, `Business-Report-${new Date().toISOString().slice(0, 10)}`, "invoice");
    } catch (err) {
      console.error("Print error:", err);
    } finally {
      setTimeout(() => setIsPrinting(false), 600);
    }
  };

  // Trigger A4 Business Report PDF Download
  const handleDownloadPdf = async () => {
    if (isDownloading || isPrinting) return;
    setIsDownloading(true);
    try {
      await new Promise((r) => setTimeout(r, 80));
      const shopSettings = getShopSettings();
      const catName = selectedCategoryId === "all" ? "All Categories" : (categoryNameMap.get(selectedCategoryId) || selectedCategoryId);

      const reportData: BusinessReportData = {
        reportType: activeTab === "repairs" ? "repairs" : "sales",
        title: activeTab === "repairs" ? "OFFICIAL REPAIR JOBS REPORT" : "OFFICIAL SALES & REVENUE REPORT",
        filters: {
          reportType: activeTab === "repairs" ? "repairs" : "sales",
          datePreset: datePreset,
          startDate: startDate,
          endDate: endDate,
          categoryName: selectedCategoryId !== "all" ? catName : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          paymentMethod: selectedPaymentMethod !== "all" ? selectedPaymentMethod : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          searchQuery: searchQuery || undefined,
        },
        sales: filteredSales,
        repairs: filteredRepairs,
        summaryMetrics: activeTab === "repairs" ? repairsMetrics : salesMetrics,
        user: currentUser,
        shopSettings,
      };

      const html = generateBusinessReportHtml(reportData);
      const dateTag = startDate && endDate ? `${startDate}_to_${endDate}` : (datePreset || "report");
      const defaultName = `${activeTab === "repairs" ? "Repairs" : "Sales"}-Report-${dateTag}.pdf`;
      await downloadPdfDocument(html, defaultName);
    } catch (err) {
      console.error("PDF Download error:", err);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  // Trigger Thermal 80mm Print
  const handlePrintThermalSlip = () => {
    if (activeTab === "repairs") {
      alert("Thermal receipt is primarily for daily sales register. Printing A4 report instead.");
      handlePrintBusinessReport();
      return;
    }
    const shopSettings = getShopSettings();
    const sDate = startDate ? new Date(startDate) : new Date();
    sDate.setHours(0, 0, 0, 0);
    const eDate = endDate ? new Date(endDate) : new Date();
    eDate.setHours(23, 59, 59, 999);

    const html = generateDailySalesReportHtml(filteredSales, sDate, eDate, shopSettings, currentUser);
    printDocument(html, `Daily-Sales-Thermal-${sDate.toISOString().slice(0, 10)}`, "bill");
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[94vh] border border-slate-700 shadow-2xl flex flex-col overflow-hidden text-slate-800">
        {/* 1. Modal Top Bar */}
        <div className="px-5 py-3.5 bg-[#0f172a] text-white border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                Reports & Business Analytics
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Live Filter & Print
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Generate official business reports with custom filters, category breakdown, and A4 print templates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintThermalSlip}
              disabled={loading || (activeTab === "sales" && filteredSales.length === 0)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              title="Print 80mm Thermal Cashier Slip"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Thermal Slip</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={loading || (activeTab === "sales" ? filteredSales.length === 0 : filteredRepairs.length === 0)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download Official Report as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrintBusinessReport}
              disabled={loading || (activeTab === "sales" ? filteredSales.length === 0 : filteredRepairs.length === 0)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF Report</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-all ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Tabs Switcher */}
        <div className="px-5 pt-2.5 pb-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab("sales")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "sales"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Sales Report</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeTab === "sales" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                {filteredSales.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("repairs")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "repairs"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Repairs Report</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${activeTab === "repairs" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                {filteredRepairs.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("sales");
                handleDatePresetChange("today");
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 cursor-pointer"
              title="Today's Register Shift Summary"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Today Shift Register</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer shadow-2xs transition-all"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* 3. Comprehensive Filter Bar */}
        <div className="px-5 py-3 bg-white border-b border-slate-200 shrink-0 space-y-2.5">
          {/* Row 1: Date Range Presets & Dates */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200 text-xs">
              {(["today", "yesterday", "last7", "thisMonth", "all", "custom"] as const).map((p) => {
                const label =
                  p === "today"
                    ? "Today"
                    : p === "yesterday"
                    ? "Yesterday"
                    : p === "last7"
                    ? "Last 7 Days"
                    : p === "thisMonth"
                    ? "This Month"
                    : p === "all"
                    ? "All Time"
                    : "Custom Range";
                return (
                  <button
                    key={p}
                    onClick={() => handleDatePresetChange(p)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                      datePreset === p
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Date Pickers */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span className="text-[11px] text-slate-400 font-bold uppercase">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setDatePreset("custom");
                  setStartDate(e.target.value);
                }}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 font-bold uppercase">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setDatePreset("custom");
                  setEndDate(e.target.value);
                }}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Row 2: Category, Price Range, Status, Payment, Search */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {/* Category Filter (Sales only) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                disabled={activeTab === "repairs"}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Min Price (Rs.)</label>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Max Price (Rs.)</label>
              <input
                type="number"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Payment Method (Sales only) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Payment</label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                disabled={activeTab === "repairs"}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-40 cursor-pointer"
              >
                <option value="all">All Methods</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque / Credit</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                {activeTab === "sales" ? (
                  <>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="VOIDED">Voided</option>
                  </>
                ) : (
                  <>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </>
                )}
              </select>
            </div>

            {/* Text Search */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Search Keywords</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={activeTab === "sales" ? "Invoice, Item, Phone..." : "Job #, Device, Phone..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Live Filter KPI Cards */}
        <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center gap-3 shrink-0">
          {activeTab === "sales" ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  #
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Sales</div>
                  <div className="text-xs font-black text-slate-800">{salesMetrics.totalRecords} bills</div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/60 border border-emerald-200 rounded-xl shadow-2xs">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  Rs
                </div>
                <div>
                  <div className="text-[10px] text-emerald-600 uppercase font-bold">Total Revenue</div>
                  <div className="text-xs font-black text-emerald-800">
                    Rs. {salesMetrics.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Items Sold</div>
                  <div className="text-xs font-black text-slate-800">{salesMetrics.totalItems} units</div>
                </div>
              </div>

              {salesMetrics.totalDiscount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50/60 border border-rose-200 rounded-xl shadow-2xs">
                  <div>
                    <div className="text-[10px] text-rose-500 uppercase font-bold">Discounts Given</div>
                    <div className="text-xs font-bold text-rose-700">
                      - Rs. {salesMetrics.totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Jobs</div>
                  <div className="text-xs font-black text-slate-800">{repairsMetrics.totalRecords} jobs</div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/60 border border-emerald-200 rounded-xl shadow-2xs">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  Rs
                </div>
                <div>
                  <div className="text-[10px] text-emerald-600 uppercase font-bold">Total Service Value</div>
                  <div className="text-xs font-black text-emerald-800">
                    Rs. {repairsMetrics.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Paid / Advance</div>
                  <div className="text-xs font-bold text-slate-800">
                    Rs. {repairsMetrics.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/60 border border-amber-200 rounded-xl shadow-2xs">
                <div>
                  <div className="text-[10px] text-amber-600 uppercase font-bold">Balance Due</div>
                  <div className="text-xs font-bold text-amber-800">
                    Rs. {repairsMetrics.totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="ml-auto text-xs text-slate-500 font-medium">
            Filtering <span className="font-bold text-slate-800">{activeTab === "sales" ? filteredSales.length : filteredRepairs.length}</span> records
          </div>
        </div>

        {/* 5. Main Content: Interactive Table */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100/60">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold">Filtering & fetching report records...</p>
            </div>
          ) : errorMsg ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : activeTab === "sales" ? (
            filteredSales.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-600">No sales match current filters</p>
                <p className="text-[11px] mt-1">Try expanding the date range, clearing the category, or resetting filters.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0f172a] text-white text-[11px] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Items Sold</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Total (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredSales.map((sale, idx) => {
                      const sNum = sale.saleNumber || ("#" + String(sale._id || idx + 1).slice(-6));
                      const sDate = sale.createdAt
                        ? new Date(sale.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + " " +
                          new Date(sale.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
                        : "-";
                      const cName = sale.customer?.name || sale.client?.name || "Walk-in";
                      const cPhone = sale.customer?.phone || sale.client?.phone || "";
                      const method = (sale.paymentMethod || (Array.isArray(sale.payments) && sale.payments[0]?.method) || "CASH").toUpperCase();
                      const status = sale.status || "COMPLETED";
                      const total = Number(sale.grandTotal !== undefined ? sale.grandTotal : (sale.total || 0));

                      const itemsList = Array.isArray(sale.items) ? sale.items : [];

                      return (
                        <tr key={sale._id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">{sDate}</td>
                          <td className="py-2.5 px-3 font-extrabold text-blue-600">{sNum}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800">{cName}</div>
                            {cPhone && <div className="text-[10px] text-slate-400">{cPhone}</div>}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] max-w-xs">
                            <div className="line-clamp-2">
                              {itemsList.map((it: any, iIdx: number) => (
                                <span key={iIdx} className="inline-block mr-1.5">
                                  {it.productName || it.product?.name || "Item"} &times; {it.quantity || 1}
                                  {iIdx < itemsList.length - 1 ? "," : ""}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-700 text-[11px]">{method}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : status === "CANCELLED" || status === "VOIDED"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900">
                            {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            filteredRepairs.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <Wrench className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-600">No repair jobs match current filters</p>
                <p className="text-[11px] mt-1">Try expanding the date range or resetting status filters.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0f172a] text-white text-[11px] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Job #</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Device & Issue</th>
                      <th className="py-2.5 px-3">Technician</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Cost (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredRepairs.map((repair, idx) => {
                      const jNum = repair.jobNumber || ("#" + String(repair._id || idx + 1).slice(-6));
                      const rDate = repair.createdAt
                        ? new Date(repair.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "-";
                      const cName = repair.customer?.name || "Customer";
                      const cPhone = repair.customer?.phone || "";
                      const dBrand = repair.device?.brand || "";
                      const dModel = repair.device?.model || "";
                      const issue = repair.problemDescription || "Service";
                      const tech = repair.assignedTo?.username || "Unassigned";
                      const status = repair.status || "PENDING";
                      const cost = Number(repair.totalCost || repair.serviceCost || repair.estimatedCost || 0);

                      return (
                        <tr key={repair._id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">{rDate}</td>
                          <td className="py-2.5 px-3 font-extrabold text-blue-600">{jNum}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800">{cName}</div>
                            {cPhone && <div className="text-[10px] text-slate-400">{cPhone}</div>}
                          </td>
                          <td className="py-2.5 px-3 max-w-xs">
                            <div className="font-bold text-slate-800">{`${dBrand} ${dModel}`.trim() || "Device"}</div>
                            <div className="text-[11px] text-slate-500 truncate">{issue}</div>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-700">{tech}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                status === "COMPLETED" || status === "DELIVERED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : status === "IN_PROGRESS"
                                  ? "bg-blue-100 text-blue-800"
                                  : status === "PENDING"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900">
                            {cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

        {/* 6. Modal Footer Bar */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Active view: <span className="font-bold text-slate-800">{activeTab === "sales" ? "Sales & Revenue" : "Device Repairs"}</span>
            {" &bull; "}
            Date period: <span className="font-bold text-slate-800">{datePreset.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              Close
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={loading || isDownloading || isPrinting || (activeTab === "sales" ? filteredSales.length === 0 : filteredRepairs.length === 0)}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/25 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Report...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrintBusinessReport}
              disabled={loading || isPrinting || isDownloading || (activeTab === "sales" ? filteredSales.length === 0 : filteredRepairs.length === 0)}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/25 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Print...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Generate & Print PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
