import { useState, useEffect } from "react";
import { getReceiptHeader } from "../../../lib/settings";
import { generateRepairInvoiceHtml, printDocument } from "../../../lib/invoiceGenerator";
import type { RepairsPanelProps, RepairJob } from "../../../types/pos";
import { CreateRepairModal } from "../modals/CreateRepairModal";

export function RepairsPanel({
  repairs,
  loading,
  onClose,
  onRefresh,
  onCollectPayment,
}: RepairsPanelProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [activeStatus, setActiveStatus] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCreateModalOpen) return;
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isCreateModalOpen]);

  const activeRepairs = repairs.filter((r) => !r.pickupDate);

  const statusCounts = {
    ALL: activeRepairs.length,
    PENDING: activeRepairs.filter((r) => r.status === "PENDING").length,
    ASSIGNED: activeRepairs.filter((r) => r.status === "ASSIGNED").length,
    IN_PROGRESS: activeRepairs.filter((r) => r.status === "IN_PROGRESS").length,
    WAITING_FOR_PARTS: activeRepairs.filter((r) => r.status === "WAITING_FOR_PARTS").length,
    COMPLETED: activeRepairs.filter((r) => r.status === "COMPLETED").length,
  };

  const filteredRepairs = activeRepairs.filter((repair) => {
    const matchesSearch =
      repair.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.customer.phone.includes(searchQuery) ||
      repair.device.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.device.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      filterPriority === "ALL" || repair.priority === filterPriority;
    const matchesStatus = activeStatus === "ALL" || repair.status === activeStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const readyRepairs = activeRepairs.filter((r) => r.status === "COMPLETED");
  const totalBalance = readyRepairs.reduce(
    (sum, r) => sum + Math.max(0, (r.totalCost || 0) - (r.advancePayment || 0)),
    0,
  );
  const urgentCount = filteredRepairs.filter(
    (r) => r.priority === "URGENT",
  ).length;
  const highCount = filteredRepairs.filter((r) => r.priority === "HIGH").length;

  const printDeviceReceivedReceipt = (repair: RepairJob) => {
    const shopHeader = getReceiptHeader();
    const receiptContent = `
${shopHeader}═══════════════════════════════════════════
        DEVICE RECEIVED SLIP
═══════════════════════════════════════════

Job Number: ${repair.jobNumber}
Date: ${new Date(repair.receivedAt || repair.createdAt).toLocaleString()}

───────────────────────────────────────────
CUSTOMER DETAILS
───────────────────────────────────────────
Name: ${repair.customer.name}
Phone: ${repair.customer.phone}
${repair.customer.email ? `Email: ${repair.customer.email}` : ""}

───────────────────────────────────────────
DEVICE DETAILS
───────────────────────────────────────────
Device: ${repair.device.brand} ${repair.device.model}
${repair.device.imei ? `IMEI: ${repair.device.imei}` : ""}
${repair.device.serialNumber ? `Serial: ${repair.device.serialNumber}` : ""}
${repair.device.color ? `Color: ${repair.device.color}` : ""}
${repair.device.accessories?.length ? `Accessories: ${repair.device.accessories.join(", ")}` : ""}

───────────────────────────────────────────
PROBLEM DESCRIPTION
───────────────────────────────────────────
${repair.problemDescription}

───────────────────────────────────────────
PAYMENT DETAILS
───────────────────────────────────────────
Estimated Cost:     Rs. ${(repair.estimatedCost || 0).toLocaleString()}
Advance Paid:       Rs. ${(repair.advancePayment || 0).toLocaleString()}
Balance (Est):      Rs. ${((repair.estimatedCost || 0) - (repair.advancePayment || 0)).toLocaleString()}

───────────────────────────────────────────
Received By: ${repair.receivedBy?.username || "N/A"}

═══════════════════════════════════════════
      Please keep this slip safe.
       Present it when collecting
            your device.
-------------------------------------------
        © Powered by Lumisolutionz
-------------------------------------------
    `.trim();

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Device Received - ${repair.jobNumber}</title>
            <style>
              body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; }
              pre { white-space: pre-wrap; word-wrap: break-word; }
            </style>
          </head>
          <body>
            <pre>${receiptContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const printRepairBill = (repair: RepairJob) => {
    const shopHeader = getReceiptHeader();
    const finalTotal = (repair.serviceCost || 0) + (repair.partsTotal || 0);
    const balance = Math.max(0, finalTotal - (repair.advancePayment || 0));
    
    const receiptContent = `
${shopHeader}═══════════════════════════════════════════
            REPAIR FINAL BILL
═══════════════════════════════════════════

Job Number: ${repair.jobNumber}
Date: ${new Date().toLocaleString()}
Status: ${repair.status}

───────────────────────────────────────────
CUSTOMER DETAILS
───────────────────────────────────────────
Name: ${repair.customer.name}
Phone: ${repair.customer.phone}

───────────────────────────────────────────
DEVICE DETAILS
───────────────────────────────────────────
Device: ${repair.device.brand} ${repair.device.model}
${repair.device.imei ? `IMEI: ${repair.device.imei}` : ""}

───────────────────────────────────────────
REPAIR SUMMARY
───────────────────────────────────────────
Labor Cost:         Rs. ${(repair.serviceCost || 0).toLocaleString()}
${repair.partsUsed?.length ? repair.partsUsed.map((p: any) => {
  const name = p.partName || p.productName || 'Part';
  const shortName = name.length > 16 ? name.substring(0, 13) + '...' : name;
  return `${shortName.padEnd(16)}: ${p.quantity} x Rs. ${p.unitPrice.toLocaleString()} = Rs. ${p.total.toLocaleString()}`;
}).join("\n") + '\n' : ""}Parts Total:        Rs. ${(repair.partsTotal || 0).toLocaleString()}

───────────────────────────────────────────
PAYMENT SUMMARY
───────────────────────────────────────────
Total Amount:       Rs. ${finalTotal.toLocaleString()}
Advance Paid:       Rs. ${(repair.advancePayment || 0).toLocaleString()}
Balance Due:        Rs. ${balance.toLocaleString()}

───────────────────────────────────────────
Technician: ${repair.assignedTo?.username || "N/A"}

═══════════════════════════════════════════
         Thank you for your business!
-------------------------------------------
        © Powered by Lumisolutionz
-------------------------------------------
    `.trim();

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Repair Bill - ${repair.jobNumber}</title>
            <style>
              body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; }
              pre { white-space: pre-wrap; word-wrap: break-word; }
            </style>
          </head>
          <body>
            <pre>${receiptContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return {
          bg: "bg-gradient-to-r from-red-500/20 to-rose-500/20",
          border: "border-red-500/40",
          badge: "bg-red-500 text-white",
          glow: "shadow-red-500/20",
        };
      case "HIGH":
        return {
          bg: "bg-gradient-to-r from-orange-500/20 to-amber-500/20",
          border: "border-orange-500/40",
          badge: "bg-orange-500 text-white",
          glow: "shadow-orange-500/20",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-emerald-500/10 to-teal-500/10",
          border: "border-emerald-500/30",
          badge: "bg-emerald-500 text-white",
          glow: "shadow-emerald-500/20",
        };
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "ALL":
        return {
          icon: "📑",
          label: "All Jobs",
          color: "text-sky-400",
          bgColor: "bg-sky-500/20",
          borderColor: "border-sky-500/30",
        };
      case "PENDING":
      case "RECEIVED":
        return {
          icon: "📥",
          label: "Received",
          color: "text-blue-400",
          bgColor: "bg-blue-500/20",
          borderColor: "border-blue-500/30",
        };
      case "ASSIGNED":
        return {
          icon: "👤",
          label: "Assigned",
          color: "text-indigo-400",
          bgColor: "bg-indigo-500/20",
          borderColor: "border-indigo-500/30",
        };
      case "IN_PROGRESS":
        return {
          icon: "⚙️",
          label: "In Progress",
          color: "text-amber-400",
          bgColor: "bg-amber-500/20",
          borderColor: "border-amber-500/30",
        };
      case "WAITING_FOR_PARTS":
        return {
          icon: "⏳",
          label: "Waiting Parts",
          color: "text-rose-400",
          bgColor: "bg-rose-500/20",
          borderColor: "border-rose-500/30",
        };
      case "COMPLETED":
      case "READY":
        return {
          icon: "✅",
          label: "Completed",
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/20",
          borderColor: "border-emerald-500/30",
        };
      default:
        return {
          icon: "📋",
          label: status,
          color: "text-slate-400",
          bgColor: "bg-slate-500/20",
          borderColor: "border-slate-500/30",
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] border border-slate-800/80 flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Header: Deep Dark Slate (#0f172a) */}
        <div className="bg-[#0f172a] text-white border-b border-slate-800 shrink-0">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-extrabold shadow-md shrink-0">
                🔧
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                    Repair Jobs
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#1e293b] text-blue-400 border border-blue-900/60">
                    SERVICE CENTER
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  View and manage all customer repair tickets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onRefresh}
                className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                title="Refresh"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="px-4 py-2.5 border-b border-sky-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
            {(["ALL", "PENDING", "ASSIGNED", "IN_PROGRESS", "WAITING_FOR_PARTS", "COMPLETED"] as const).map((status) => {
              const styles = getStatusStyles(status);
              const count = (statusCounts as any)[status] || 0;
              const isActive = activeStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap shrink-0 text-sm ${isActive ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/25" : "bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-600 border border-sky-200/50 dark:border-slate-600/50"}`}
                >
                  <span>{styles.icon}</span>
                  <span>{styles.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? "bg-white/25 text-white" : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats & Filters */}
        <div className="px-5 py-4 border-b border-sky-200/50 bg-white/60 dark:bg-slate-800/60">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 rounded-xl border border-sky-200/50">
                <span className="text-slate-500 text-sm dark:text-slate-400">Showing:</span>
                <span className="text-sky-700 font-bold text-lg">
                  {filteredRepairs.length}
                </span>
              </div>
              {urgentCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 rounded-xl border border-red-500/30">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-red-400 font-medium">
                    {urgentCount} Urgent
                  </span>
                </div>
              )}
              {highCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 rounded-xl border border-orange-500/30">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="text-orange-400 font-medium">
                    {highCount} High
                  </span>
                </div>
              )}
              {activeStatus === "READY" && totalBalance > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                  <span className="text-emerald-400 text-sm">Collectible:</span>
                  <span className="text-emerald-400 font-bold">
                    Rs. {totalBalance.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-md transition-all flex items-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Job
              </button>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs, customers..."
                  className="w-64 pl-10 pr-4 py-2.5 bg-white border border-sky-200/50 rounded-xl text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-sm dark:bg-slate-800 dark:text-white"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2.5 bg-white border border-sky-200/50 rounded-xl text-slate-700 focus:border-sky-500 transition-all cursor-pointer shadow-sm dark:bg-slate-800 dark:text-white"
              >
                <option value="ALL" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">All Priorities</option>
                <option value="URGENT" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">🔴 Urgent Only</option>
                <option value="HIGH" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">🟠 High Only</option>
                <option value="NORMAL" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">🟢 Normal Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-500/30 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-500 mt-4 dark:text-slate-400">Loading repairs...</p>
            </div>
          ) : repairs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
                <span className="text-5xl">✨</span>
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-2 dark:text-white">
                All Caught Up!
              </h4>
              <p className="text-slate-500 text-center max-w-md dark:text-slate-400">
                No repairs are currently ready for payment. Completed repairs
                will appear here automatically.
              </p>
              <button
                onClick={onRefresh}
                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Check Again
              </button>
            </div>
          ) : filteredRepairs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">No repairs match your search</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterPriority("ALL");
                }}
                className="mt-4 text-sky-600 hover:text-sky-700 text-sm font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRepairs.map((repair) => {
                const styles = getPriorityStyles(repair.priority);
                const finalTotal = (repair.serviceCost || 0) + (repair.partsTotal || 0);
                const balanceDue = Math.max(0, finalTotal - (repair.advancePayment || 0));

                return (
                  <div
                    key={repair._id}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-sky-200/50 rounded-2xl p-5 hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300/50 transition-all duration-300 group"
                  >
                    <div className="flex gap-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-xl font-bold text-slate-800 tracking-wide dark:text-white">
                            {repair.jobNumber}
                          </span>
                          <span
                            className={`${styles.badge} px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider`}
                          >
                            {repair.priority}
                          </span>
                          {(() => {
                            const statusStyle = getStatusStyles(repair.status);
                            return (
                              <span
                                className={`px-2.5 py-1 ${statusStyle.bgColor} ${statusStyle.color} rounded-lg text-xs font-medium border ${statusStyle.borderColor}`}
                              >
                                {statusStyle.icon} {statusStyle.label}
                              </span>
                            );
                          })()}
                          <span className="text-slate-500 text-sm ml-auto dark:text-slate-400">
                            {new Date(repair.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-lg flex-shrink-0">
                              👤
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5 dark:text-slate-400">
                                Customer
                              </p>
                              <p className="text-slate-800 font-medium dark:text-white">
                                {repair.customer.name}
                              </p>
                              <p className="text-slate-500 text-sm dark:text-slate-400">
                                {repair.customer.phone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-lg flex-shrink-0">
                              📱
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5 dark:text-slate-400">
                                Device
                              </p>
                              <p className="text-slate-800 font-medium dark:text-white">
                                {repair.device.brand}
                              </p>
                              <p className="text-slate-500 text-sm dark:text-slate-400">
                                {repair.device.model}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-lg flex-shrink-0">
                              🔧
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5 dark:text-slate-400">
                                Technician
                              </p>
                              <p className="text-slate-800 font-medium dark:text-white">
                                {repair.assignedTo?.username || "Unassigned"}
                              </p>
                              <div className="flex gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                <span>
                                  Service: Rs.{" "}
                                  {(repair.serviceCost || 0).toLocaleString()}
                                </span>
                                <span>
                                  Parts: Rs.{" "}
                                  {(repair.partsTotal || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="w-56 flex-shrink-0">
                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-sky-200/50">
                          {repair.advancePayment > 0 ? (
                            <>
                              <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-slate-500 dark:text-slate-400">
                                  Total Amount
                                </span>
                                <span className="text-slate-700 dark:text-slate-300">
                                  Rs. {finalTotal.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm mb-3 pb-3 border-b border-sky-200/50">
                                <span className="text-emerald-600">
                                  Advance Paid
                                </span>
                                <span className="text-emerald-600">
                                  Rs. - {repair.advancePayment.toLocaleString()}
                                </span>
                              </div>
                              <div className="text-center mb-3">
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">
                                  Balance Due
                                </p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                                  Rs. {balanceDue.toLocaleString()}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="text-center mb-3">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 dark:text-slate-400">
                                Total Due
                              </p>
                              <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                Rs. {finalTotal.toLocaleString()}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-col gap-2 mt-4">
                            {repair.status === "IN_PROGRESS" && (
                              <div className="w-full py-2 bg-amber-500/10 text-amber-400 font-medium rounded-xl text-center border border-amber-500/30">
                                <span className="text-lg mr-2">⚙️</span>
                                Work in Progress
                              </div>
                            )}
                            {repair.status === "WAITING_FOR_PARTS" && (
                              <div className="w-full py-2 bg-orange-500/10 text-orange-400 font-medium rounded-xl text-center border border-orange-500/30">
                                <span className="text-lg mr-2">📦</span>
                                Waiting for Parts
                              </div>
                            )}
                            {repair.status === "ASSIGNED" && (
                              <div className="w-full py-2 bg-blue-500/10 text-blue-400 font-medium rounded-xl text-center border border-blue-500/30">
                                <span className="text-lg mr-2">👨‍🔧</span>
                                Assigned to Tech
                              </div>
                            )}

                            {(repair.status === "RECEIVED" || repair.status === "PENDING") ? (
                              <button
                                onClick={() => printDeviceReceivedReceipt(repair)}
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                              >
                                <span className="text-lg">🖨️</span>
                                Print Receipt
                              </button>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => printRepairBill(repair)}
                                  className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                                >
                                  <span>🧾</span>
                                  Print Bill
                                </button>
                                <button
                                  onClick={() => {
                                    const invoiceHtml = generateRepairInvoiceHtml(repair);
                                    printDocument(invoiceHtml, `Repair-Invoice-${repair.jobNumber}`, "invoice");
                                  }}
                                  className="w-full py-2 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-200/80 dark:border-sky-800/60 transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                                >
                                  <span>📑</span>
                                  Print Invoice
                                </button>
                              </div>
                            )}

                            {(repair.status === "READY" || repair.status === "COMPLETED") && (
                              <button
                                onClick={() => onCollectPayment(repair)}
                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                              >
                                <span className="text-lg">💵</span>
                                Collect Payment
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {filteredRepairs.length > 0 && (
          <div className="px-5 py-3 border-t border-sky-200/50 bg-white/80 dark:bg-slate-800/80 flex items-center justify-between">
            <p className="text-slate-500 text-sm dark:text-slate-400">
              Showing {filteredRepairs.length} of {repairs.length} repairs
            </p>
            <p className="text-slate-500 text-sm dark:text-slate-400">
              Press{" "}
              <kbd className="px-2 py-0.5 bg-sky-100 rounded text-xs mx-1 text-sky-700">
                ESC
              </kbd>{" "}
              to close
            </p>
          </div>
        )}
      </div>

      <CreateRepairModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={async (createdRepair?: any) => {
          setIsCreateModalOpen(false);
          // Make sure the newly created job's status tab is selected so it's immediately visible
          const targetStatus = createdRepair?.status || "PENDING";
          setActiveStatus(targetStatus);
          setSearchQuery("");
          setFilterPriority("ALL");
          // Immediately refresh repairs from API
          if (onRefresh) {
            await onRefresh();
          }
        }} 
      />
    </div>
  );
}
