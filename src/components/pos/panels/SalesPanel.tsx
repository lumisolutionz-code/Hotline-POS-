import { useState } from "react";
import { api } from "../../../lib/api";
import { PermissionOverrideModal } from "../modals/PermissionOverrideModal";
import { generateSaleBillHtml, generateSaleInvoiceHtml, printDocument } from "../../../lib/invoiceGenerator";
import type { SalesPanelProps } from "../../../types/pos";

export function SalesPanel({
  salesData,
  dailySummary,
  loading,
  canVoidSale,
  onClose,
  onRefresh,
}: SalesPanelProps & { onRefresh: (filters?: { search?: string; startDate?: string; endDate?: string }) => void }): JSX.Element {
  const [voidReason, setVoidReason] = useState<string>("");
  const [voidingSaleId, setVoidingSaleId] = useState<string | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideId, setOverrideId] = useState<string | null>(null);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleApplyFilters = () => {
    onRefresh({ search, startDate, endDate });
  };

  const handleClearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    onRefresh();
  };

  const handleVoidSale = async (saleId: string) => {
    if (!voidReason.trim()) {
      alert("Please enter void reason");
      return;
    }
    try {
      const body: any = { reason: voidReason };
      if (overrideId) {
        body.permissionOverrideId = overrideId;
      }
      
      const res = await api<any>(`/sales/${saleId}/void`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (res.status === "success") {
        alert("Sale voided!");
        setVoidingSaleId(null);
        setVoidReason("");
        setOverrideId(null);
        onRefresh();
      }
    } catch {
      alert("Failed to void");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] border border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700 flex justify-between">
          <h3 className="text-xl font-bold text-white">📊 Sales Report</h3>
          <div className="flex gap-2">
            <button onClick={() => onRefresh({ search, startDate, endDate })} className="p-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600">
              🔄
            </button>
            <button onClick={onClose} className="p-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600">
              ✕
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-slate-400 mb-1">Search (Number, Phone, IMEI)</label>
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search..." 
              className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="px-3 py-2 bg-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="px-3 py-2 bg-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500" 
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleApplyFilters} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors">
              Apply
            </button>
            <button onClick={handleClearFilters} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors">
              Clear
            </button>
          </div>
        </div>

        {dailySummary && (
          <div className="p-4 grid grid-cols-4 gap-3 border-b border-slate-700">
            <div className="bg-cyan-500/20 rounded-xl p-3">
              <p className="text-xs text-cyan-400">Today's Sales</p>
              <p className="text-2xl font-bold text-white">{dailySummary.totalSales || 0}</p>
            </div>
            <div className="bg-green-500/20 rounded-xl p-3">
              <p className="text-xs text-green-400">Revenue</p>
              <p className="text-2xl font-bold text-white">Rs. {(dailySummary.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="bg-purple-500/20 rounded-xl p-3">
              <p className="text-xs text-purple-400">Cash</p>
              <p className="text-2xl font-bold text-white">Rs. {(dailySummary.cashTotal || 0).toLocaleString()}</p>
            </div>
            <div className="bg-red-500/20 rounded-xl p-3">
              <p className="text-xs text-red-400">Voided</p>
              <p className="text-2xl font-bold text-white">{dailySummary.voidedSales || 0}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : salesData.length === 0 ? (
            <p className="text-center text-slate-500 py-12 dark:text-slate-400">No sales found</p>
          ) : (
            <div className="space-y-2">
              {salesData.map((sale) => (
                <div key={sale._id} className={`bg-slate-700/30 rounded-lg p-3 ${sale.status === "VOIDED" ? "opacity-50" : ""}`}>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-white font-medium">{sale.saleNumber}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${sale.status === "COMPLETED" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {sale.status}
                      </span>
                      <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                        {new Date(sale.createdAt).toLocaleString()} • {sale.items?.length || 0} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-cyan-400">Rs. {sale.grandTotal?.toFixed(2)}</p>
                      {sale.discountTotal > 0 && (
                        <p className="text-xs text-rose-400 font-medium">Disc: -Rs. {sale.discountTotal.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                  {sale.status === "COMPLETED" && (
                    <div className="mt-2 pt-2 border-t border-slate-600/30">
                      {voidingSaleId === sale._id ? (
                        <div className="flex flex-col gap-2">
                          {!canVoidSale && !overrideId && (
                            <div className="flex justify-between items-center bg-red-500/10 p-2 rounded">
                              <span className="text-xs text-red-400">Manager override required</span>
                              <button onClick={() => setShowOverrideModal(true)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30">Get Override</button>
                            </div>
                          )}
                          {overrideId && (
                            <div className="text-xs text-green-400 bg-green-500/10 p-2 rounded text-center">
                              ✓ Manager Override Applied
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input value={voidReason} onChange={(e) => setVoidReason(e.target.value)} placeholder="Void reason..." className="flex-1 px-3 py-1 bg-slate-700 rounded text-white text-sm" />
                            <button 
                              onClick={() => handleVoidSale(sale._id)} 
                              className={`px-3 py-1 bg-red-500 rounded text-white text-sm disabled:opacity-50`}
                              disabled={!canVoidSale && !overrideId}
                            >Void</button>
                            <button onClick={() => { setVoidingSaleId(null); setOverrideId(null); }} className="px-3 py-1 bg-slate-600 rounded text-white text-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 items-center">
                          <button onClick={() => setVoidingSaleId(sale._id)} className="text-xs text-red-400 hover:text-red-300">Void Sale</button>
                          <button 
                            onClick={() => {
                              const customerName = sale.customer?.name || '';
                              const customerPhone = sale.customer?.phone || '';
                              const customerEmail = sale.customer?.email || '';
                              const html = generateSaleBillHtml(sale, undefined, customerName, customerPhone, customerEmail);
                              printDocument(html, `Receipt-${sale.saleNumber}`, "bill");
                            }} 
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
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
                            className="text-xs text-indigo-400 hover:text-indigo-300"
                          >
                            Print Invoice
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showOverrideModal && (
        <PermissionOverrideModal
          permission="CANCEL_SALE"
          onClose={() => setShowOverrideModal(false)}
          onSuccess={(id) => {
            setOverrideId(id);
            setShowOverrideModal(false);
          }}
        />
      )}
    </div>
  );
}
