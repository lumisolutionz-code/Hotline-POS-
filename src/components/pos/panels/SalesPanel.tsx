import { useState } from "react";
import { BarChart3, RotateCw, X, Receipt, FileText, Ban, Eye, CheckCircle2, Smartphone } from "lucide-react";
import { api } from "../../../lib/api";
import { PermissionOverrideModal } from "../modals/PermissionOverrideModal";
import { SaleDetailsModal } from "../modals/SaleDetailsModal";
import { generateSaleBillHtml, generateSaleInvoiceHtml, printDocument } from "../../../lib/invoiceGenerator";
import type { SalesPanelProps } from "../../../types/pos";

export function SalesPanel({
  salesData,
  dailySummary,
  loading,
  canVoidSale,
  onClose,
  onRefresh,
}: SalesPanelProps): JSX.Element {
  const [voidingSaleId, setVoidingSaleId] = useState<string | null>(null);
  const [settlingSaleId, setSettlingSaleId] = useState<string | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");

  const handleApplyFilters = () => {
    onRefresh({
      search,
      startDate,
      endDate,
      status: selectedStatus !== "all" ? selectedStatus : undefined,
      paymentMethod: selectedMethod !== "all" ? selectedMethod : undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setSelectedStatus("all");
    setSelectedMethod("all");
    onRefresh();
  };

  const handleSettleKoko = async (saleId: string) => {
    if (!window.confirm("Confirm that full settlement has been received from Koko Pay? This will mark the sale as COMPLETED.")) {
      return;
    }
    setSettlingSaleId(saleId);
    try {
      const res = await api<any>(`/sales/${saleId}/settle-koko`, {
        method: "POST",
        body: JSON.stringify({ notes: "Koko settlement confirmed and completed from POS" }),
      });
      if (res.status === "success" || res.data) {
        alert("Koko payment settled successfully! Sale marked as COMPLETED.");
        handleApplyFilters();
      } else {
        alert(res.message || "Failed to settle Koko payment");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to settle Koko payment");
    } finally {
      setSettlingSaleId(null);
    }
  };

  const handleVoidSale = async (saleId: string, overrideIdParam?: string) => {
    const currentOverride = overrideIdParam || overrideId;
    if (!canVoidSale && !currentOverride) {
      setVoidingSaleId(saleId);
      setShowOverrideModal(true);
      return;
    }

    if (!window.confirm("Are you sure you want to void this sale? All items will be returned to stock.")) {
      return;
    }

    try {
      const body: any = { reason: "Voided from POS" };
      if (currentOverride) {
        body.permissionOverrideId = currentOverride;
      }
      
      const res = await api<any>(`/sales/${saleId}/void`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (res.status === "success" || res.data) {
        alert("Sale voided successfully!");
        setVoidingSaleId(null);
        setOverrideId(null);
        onRefresh({ search, startDate, endDate });
      } else {
        alert(res.message || "Failed to void sale");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to void sale");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] border border-slate-800/80 shadow-2xl flex flex-col overflow-hidden text-slate-800">
        {/* Header: Deep Dark Slate (#0f172a) */}
        <div className="px-6 py-4 bg-[#0f172a] text-white border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-extrabold shadow-md shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">Sales History</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#1e293b] text-blue-400 border border-blue-900/60">
                  REPORTS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">View and filter completed sales records</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onRefresh({ search, startDate, endDate })} className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer" title="Refresh">
              <RotateCw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer" title="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Section (Dark Top Part) */}
        <div className="p-4 border-b border-slate-800 bg-[#0f172a]/95 flex gap-4 items-end flex-wrap text-slate-200 shrink-0">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Search (Number, Phone, IMEI)</label>
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search..." 
              style={{ colorScheme: 'dark', color: '#ffffff' }}
              className="dark-input w-full px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-white font-medium text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              style={{ colorScheme: 'dark', color: '#ffffff' }}
              className="dark-input px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-white font-medium text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              style={{ colorScheme: 'dark', color: '#ffffff' }}
              className="dark-input px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-white font-medium text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)} 
              style={{ colorScheme: 'dark', color: '#ffffff' }}
              className="dark-input px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-white font-medium text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending (Koko / Credit)</option>
              <option value="COMPLETED">Completed</option>
              <option value="VOID">Voided</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
            <select 
              value={selectedMethod} 
              onChange={(e) => setSelectedMethod(e.target.value)} 
              style={{ colorScheme: 'dark', color: '#ffffff' }}
              className="dark-input px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-white font-medium text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Methods</option>
              <option value="KOKO">Koko Pay</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleApplyFilters} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-xs transition-colors cursor-pointer">
              Apply
            </button>
            <button onClick={handleClearFilters} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer">
              Clear
            </button>
          </div>
        </div>

        {/* Daily Summary (White/Light Theme) */}
        {dailySummary && (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-200 bg-slate-50/70 shrink-0">
            <div className="bg-white rounded-xl p-3 border border-sky-200/80 shadow-xs">
              <p className="text-xs text-sky-600 font-semibold uppercase tracking-wider">Today's Sales</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{dailySummary.totalSales || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-200/80 shadow-xs">
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Revenue</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-0.5">Rs. {(dailySummary.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-purple-200/80 shadow-xs">
              <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider">Cash</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-0.5">Rs. {(dailySummary.cashTotal || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-rose-200/80 shadow-xs">
              <p className="text-xs text-rose-600 font-semibold uppercase tracking-wider">Voided</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{dailySummary.voidedSales || 0}</p>
            </div>
          </div>
        )}

        {/* Sales Records List (White/Light Theme) */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-2.5">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 font-medium mt-3">Loading sales records...</p>
            </div>
          ) : salesData.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2 border border-slate-200">
                <Receipt className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No sales records found</p>
              <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search or date filter.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {salesData.map((sale) => {
                const isKoko = Boolean(sale.kokoDetails || (Array.isArray(sale.payments) && sale.payments.some((p: any) => p.method === "KOKO")));
                const isPending = sale.status === "PENDING";

                return (
                  <div
                    key={sale._id}
                    className={`bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all ${
                      sale.status === "VOIDED" || sale.status === "VOID" || sale.status === "CANCELLED" ? "opacity-60 bg-slate-100/70" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-900 font-bold font-mono text-sm tracking-tight">{sale.saleNumber}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              sale.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isPending
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : sale.status === "FULL_RETURN" || sale.status === "PARTIAL_RETURN" || sale.status === "RETURNED"
                                ? "bg-amber-50 text-amber-700 border border-amber-300"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {sale.status}
                          </span>
                          {isKoko && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                              <Smartphone className="w-2.5 h-2.5 text-purple-700" />
                              Koko Pay
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedSale(sale)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="View Sale Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-mono">
                          {new Date(sale.createdAt).toLocaleString()} • {sale.items?.length || 0} items
                        </p>
                        {isKoko && sale.kokoDetails && (
                          <div className="mt-1 text-[11px] text-purple-800 font-medium flex items-center gap-2 flex-wrap">
                            <span>1st Payout: <strong className="font-bold text-emerald-700">Rs. {Number(sale.kokoDetails.netFirstPayout || 0).toLocaleString()}</strong></span>
                            <span>•</span>
                            <span>Pending Balance: <strong className="font-bold text-purple-900">Rs. {Number(sale.kokoDetails.remainingAmount || 0).toLocaleString()}</strong></span>
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-slate-900 font-mono">Rs. {sale.grandTotal?.toFixed(2)}</p>
                        {sale.discountTotal > 0 && (
                          <p className="text-xs text-rose-600 font-medium font-mono">Disc: Rs. - {sale.discountTotal.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                      <button 
                        onClick={() => setSelectedSale(sale)} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs border border-blue-200 transition-colors cursor-pointer"
                        title="View Complete Sale Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        View Details
                      </button>

                      {/* Settle Koko Payment button for Pending status */}
                      {isPending && (
                        <button
                          onClick={() => handleSettleKoko(sale._id)}
                          disabled={settlingSaleId === sale._id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                          title="Mark full payment received from Koko & complete sale"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {settlingSaleId === sale._id ? "Settling..." : "Mark Settled & Complete"}
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          const customerName = sale.customer?.name || '';
                          const customerPhone = sale.customer?.phone || '';
                          const customerEmail = sale.customer?.email || '';
                          const html = generateSaleBillHtml(sale, undefined, customerName, customerPhone, customerEmail);
                          printDocument(html, `Receipt-${sale.saleNumber}`, "bill");
                        }} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5 text-slate-500" />
                        Print Receipt
                      </button>

                      <button 
                        onClick={() => {
                          const customerName = sale.customer?.name || '';
                          const customerPhone = sale.customer?.phone || '';
                          const customerEmail = sale.customer?.email || '';
                          const html = generateSaleInvoiceHtml(sale, undefined, customerName, customerPhone, customerEmail);
                          printDocument(html, `Invoice-${sale.saleNumber}`, "invoice");
                        }} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        Print Invoice
                      </button>

                      {sale.status === "COMPLETED" && (
                        <button 
                          onClick={() => handleVoidSale(sale._id)} 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-xs border border-rose-200 ml-auto transition-colors cursor-pointer"
                          title="Void Sale (return items to stock)"
                        >
                          <Ban className="w-3.5 h-3.5 text-rose-600" />
                          Void Sale
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {selectedSale && (
        <SaleDetailsModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
          onVoidSale={(id) => handleVoidSale(id)}
          onSettleKoko={async (id) => {
            await handleSettleKoko(id);
            setSelectedSale(null);
          }}
        />
      )}

      {showOverrideModal && (
        <PermissionOverrideModal
          permission="CANCEL_SALE"
          onClose={() => {
            setShowOverrideModal(false);
            setVoidingSaleId(null);
          }}
          onSuccess={(id) => {
            setOverrideId(id);
            setShowOverrideModal(false);
            if (voidingSaleId) {
              handleVoidSale(voidingSaleId, id);
            }
          }}
        />
      )}
    </div>
  );
}
