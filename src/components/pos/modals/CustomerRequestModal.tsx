import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import {
  FileText,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Trash2,
  Search,
  RefreshCw,
  X,
  AlertCircle,
  Package,
} from "lucide-react";

export interface ProductRequestItem {
  _id: string;
  requestNo: string;
  productName: string;
  quantity: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  status: "PENDING" | "ORDERED" | "RECEIVED" | "COMPLETED" | "CANCELLED";
  branch?: { _id: string; name: string };
  createdBy?: { _id: string; username: string; name?: string };
  createdAt: string;
  updatedAt: string;
}

interface CustomerRequestModalProps {
  onClose: () => void;
  onRequestCreated?: () => void;
}

export function CustomerRequestModal({
  onClose,
  onRequestCreated,
}: CustomerRequestModalProps) {
  const [activeTab, setActiveTab] = useState<"new" | "list">("new");

  // Form state
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // List state
  const [requests, setRequests] = useState<ProductRequestItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Fetch requests for the list tab (excluding completed items so POS doesn't see them)
  const fetchRequests = async () => {
    setListLoading(true);
    try {
      let url = "/product-requests?limit=100&excludeCompleted=true";
      if (statusFilter !== "ALL") {
        url += `&status=${statusFilter}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await api<{
        status: string;
        data?: { requests: ProductRequestItem[] };
      }>(url);

      if (res.status === "success" && res.data?.requests) {
        // POS only shows active requests; filter out COMPLETED items
        setRequests(res.data.requests.filter((r) => r.status !== "COMPLETED"));
      }
    } catch (err: any) {
      console.error("Failed to load customer requests", err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") {
      fetchRequests();
    }
  }, [activeTab, statusFilter]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setFormError("Product name is required");
      return;
    }
    if (quantity < 1) {
      setFormError("Quantity must be at least 1");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const res = await api<{
        status: string;
        data?: { request: ProductRequestItem };
      }>("/product-requests", {
        method: "POST",
        body: JSON.stringify({
          productName: productName.trim(),
          quantity,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          notes: notes.trim(),
        }),
      });

      if (res.status === "success" && res.data?.request) {
        setFormSuccess(`Request ${res.data.request.requestNo} recorded successfully!`);
        setProductName("");
        setQuantity(1);
        setCustomerName("");
        setCustomerPhone("");
        setNotes("");
        onRequestCreated?.();
        
        // Auto-switch to list tab after 1.2s or let user submit another
        setTimeout(() => {
          setFormSuccess("");
        }, 3000);
      } else {
        setFormError((res as any)?.message || "Failed to save request");
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to save product request");
    } finally {
      setSubmitting(false);
    }
  };

  // Update status of an existing request
  const handleUpdateStatus = async (
    id: string,
    newStatus: ProductRequestItem["status"]
  ) => {
    try {
      const res = await api<{
        status: string;
        message?: string;
        data?: { request: ProductRequestItem };
      }>(`/product-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.status === "success") {
        if (newStatus === "COMPLETED") {
          // Immediately remove from POS view so it disappears from POS
          setRequests((prev) => prev.filter((r) => r._id !== id));
        } else {
          setRequests((prev) =>
            prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
          );
        }
      } else {
        alert("Failed to update status: " + ((res as any)?.message || "Unknown error"));
      }
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Delete a request
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;
    try {
      await api(`/product-requests/${id}`, { method: "DELETE" });
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      alert("Failed to delete request: " + err.message);
    }
  };

  const getStatusBadge = (status: ProductRequestItem["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock size={11} /> Pending
          </span>
        );
      case "ORDERED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <Package size={11} /> Ordered
          </span>
        );
      case "RECEIVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <CheckCircle2 size={11} /> Received
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={11} /> Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        {/* Header: Deep Dark Slate (#0f172a) */}
        <div className="px-6 py-4 bg-[#0f172a] text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  Customer Product Request
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#1e293b] text-blue-400 border border-blue-900/60">
                  REQUEST
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Note down out-of-stock items asked by customers for procurement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-6 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "new"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Plus size={14} />
            New Request
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "list"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <FileText size={14} />
            View All Requests
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {activeTab === "new" ? (
            /* NEW REQUEST FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {formSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 size={16} className="flex-shrink-0" />
                  <span className="font-semibold">{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Apple Lightning Cable, Samsung 25W Charger..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Quantity Stepper */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quantity Required <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 active:scale-95 transition-all cursor-pointer font-bold"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 text-center px-3 py-2 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 active:scale-95 transition-all cursor-pointer font-bold"
                  >
                    <Plus size={16} />
                  </button>
                  <span className="text-xs text-slate-400">units</span>
                </div>
              </div>

              {/* Customer Info (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <User size={13} /> Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Kasun Perera"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <Phone size={13} /> Customer Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 0771234567"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Notes / Reminder (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Customer will visit tomorrow morning; prefer 2-meter length in black..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl px-5 py-2.5 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 active:scale-[0.99] text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Save Product Request
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ALL REQUESTS LIST */
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex items-center gap-2 flex-wrap justify-between">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchRequests()}
                    placeholder="Search product, customer, phone..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:outline-none"
                >
                  <option value="ALL">All Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="ORDERED">Ordered</option>
                  <option value="RECEIVED">Received</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <button
                  type="button"
                  onClick={fetchRequests}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Refresh List"
                >
                  <RefreshCw size={14} className={listLoading ? "animate-spin" : ""} />
                </button>
              </div>

              {/* List Table / Cards */}
              {listLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <RefreshCw size={24} className="animate-spin text-amber-500" />
                  <span className="text-xs">Loading requests...</span>
                </div>
              ) : requests.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <FileText size={32} className="opacity-40 text-amber-500" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    No requests found
                  </p>
                  <p className="text-xs text-slate-400">
                    Switch to the "New Request" tab to record a customer inquiry.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {requests.map((item) => (
                    <div
                      key={item._id}
                      className="p-3.5 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl hover:border-amber-300 dark:hover:border-amber-600/50 transition-all flex flex-col gap-2 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                              {item.requestNo}
                            </span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {item.productName}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold">
                              Qty: {item.quantity}
                            </span>
                          </div>

                          {(item.customerName || item.customerPhone) && (
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {item.customerName && (
                                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                  <User size={12} /> {item.customerName}
                                </span>
                              )}
                              {item.customerPhone && (
                                <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-mono">
                                  <Phone size={12} /> {item.customerPhone}
                                </span>
                              )}
                            </div>
                          )}

                          {item.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1 bg-white/60 dark:bg-slate-900/40 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                              "{item.notes}"
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                            <span>
                              {new Date(item.createdAt).toLocaleDateString()} at{" "}
                              {new Date(item.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {item.createdBy?.username && (
                              <span>by @{item.createdBy.username}</span>
                            )}
                          </div>
                        </div>

                        {/* Status badge & Quick Actions */}
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          {getStatusBadge(item.status)}
                          <div className="flex items-center gap-1 mt-1">
                            {item.status === "PENDING" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(item._id, "ORDERED")}
                                className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[10px] font-bold cursor-pointer transition-colors"
                                title="Mark as Ordered"
                              >
                                Mark Ordered
                              </button>
                            )}
                            {(item.status === "PENDING" || item.status === "ORDERED") && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(item._id, "RECEIVED")}
                                className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold cursor-pointer transition-colors"
                                title="Mark as Stock Received"
                              >
                                Mark Received
                              </button>
                            )}
                            {item.status !== "COMPLETED" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(item._id, "COMPLETED")}
                                className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold cursor-pointer transition-colors"
                                title="Mark as Customer Notified / Completed"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(item._id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Delete Request"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerRequestModal;
