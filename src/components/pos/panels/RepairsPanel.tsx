import { useState, useEffect } from "react";
import {
  Wrench,
  RotateCw,
  X,
  Layers,
  Inbox,
  UserCheck,
  Clock,
  CheckCircle2,
  ClipboardList,
  Plus,
  Search,
  User,
  Smartphone,
  Printer,
  Receipt,
  FileText,
  CreditCard,
  Sparkles,
} from "lucide-react";
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
          bg: "bg-rose-50/40",
          border: "border-rose-200",
          badge: "bg-rose-50 text-rose-700 border border-rose-200",
          glow: "shadow-rose-500/10",
        };
      case "HIGH":
        return {
          bg: "bg-amber-50/40",
          border: "border-amber-200",
          badge: "bg-amber-50 text-amber-700 border border-amber-200",
          glow: "shadow-amber-500/10",
        };
      default:
        return {
          bg: "bg-white",
          border: "border-slate-200",
          badge: "bg-slate-100 text-slate-700 border border-slate-200",
          glow: "",
        };
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "ALL":
        return {
          icon: Layers,
          label: "All Jobs",
          color: "text-blue-700",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "PENDING":
      case "RECEIVED":
        return {
          icon: Inbox,
          label: "Received",
          color: "text-slate-700",
          bgColor: "bg-slate-100",
          borderColor: "border-slate-200",
        };
      case "ASSIGNED":
        return {
          icon: UserCheck,
          label: "Assigned",
          color: "text-blue-700",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "IN_PROGRESS":
        return {
          icon: Wrench,
          label: "In Progress",
          color: "text-amber-800",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
        };
      case "WAITING_FOR_PARTS":
        return {
          icon: Clock,
          label: "Waiting Parts",
          color: "text-rose-700",
          bgColor: "bg-rose-50",
          borderColor: "border-rose-200",
        };
      case "COMPLETED":
      case "READY":
        return {
          icon: CheckCircle2,
          label: "Completed",
          color: "text-emerald-700",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
        };
      default:
        return {
          icon: ClipboardList,
          label: status,
          color: "text-slate-700",
          bgColor: "bg-slate-100",
          borderColor: "border-slate-200",
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
                <Wrench className="w-5 h-5" />
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
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {(["ALL", "PENDING", "ASSIGNED", "IN_PROGRESS", "WAITING_FOR_PARTS", "COMPLETED"] as const).map((status) => {
              const styles = getStatusStyles(status);
              const StatusIcon = styles.icon;
              const count = (statusCounts as any)[status] || 0;
              const isActive = activeStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap shrink-0 text-xs cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <StatusIcon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{styles.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats & Filters */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Showing:</span>
                <span className="text-slate-900 font-bold font-mono">
                  {filteredRepairs.length}
                </span>
              </div>
              {urgentCount > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 rounded-lg border border-rose-200 text-xs">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                  <span className="text-rose-700 font-semibold">
                    {urgentCount} Urgent
                  </span>
                </div>
              )}
              {highCount > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  <span className="text-amber-700 font-semibold">
                    {highCount} High
                  </span>
                </div>
              )}
              {activeStatus === "READY" && totalBalance > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                  <span className="text-emerald-700 font-medium">Collectible:</span>
                  <span className="text-emerald-800 font-bold font-mono">
                    Rs. {totalBalance.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 font-semibold text-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create Job
              </button>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs, customers..."
                  className="w-56 pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-medium"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-blue-500 transition-all cursor-pointer text-xs font-medium"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent Only</option>
                <option value="HIGH">High Only</option>
                <option value="NORMAL">Normal Only</option>
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
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1">
                All Caught Up!
              </h4>
              <p className="text-slate-500 text-center max-w-sm text-xs">
                No repairs are currently ready for payment. Completed repairs
                will appear here automatically.
              </p>
              <button
                onClick={onRefresh}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Check Again
              </button>
            </div>
          ) : filteredRepairs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3 border border-slate-200">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-slate-700 font-semibold text-sm">No repairs match your search</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterPriority("ALL");
                }}
                className="mt-2 text-blue-600 hover:text-blue-700 text-xs font-semibold cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-3.5">
              {filteredRepairs.map((repair) => {
                const styles = getPriorityStyles(repair.priority);
                const finalTotal = (repair.serviceCost || 0) + (repair.partsTotal || 0);
                const balanceDue = Math.max(0, finalTotal - (repair.advancePayment || 0));

                return (
                  <div
                    key={repair._id}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 transition-all shadow-xs"
                  >
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-3.5">
                          <span className="text-base font-bold text-slate-900 tracking-tight font-mono">
                            {repair.jobNumber}
                          </span>
                          <span
                            className={`${styles.badge} px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider`}
                          >
                            {repair.priority}
                          </span>
                          {(() => {
                            const statusStyle = getStatusStyles(repair.status);
                            const StatusIcon = statusStyle.icon;
                            return (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 ${statusStyle.bgColor} ${statusStyle.color} rounded-md text-[11px] font-semibold border ${statusStyle.borderColor}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {statusStyle.label}
                              </span>
                            );
                          })()}
                          <span className="text-slate-400 text-xs ml-auto font-mono">
                            {new Date(repair.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 border border-slate-200/80">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                                Customer
                              </p>
                              <p className="text-slate-800 font-bold text-xs truncate">
                                {repair.customer.name}
                              </p>
                              <p className="text-slate-500 text-[11px] font-mono truncate">
                                {repair.customer.phone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 border border-slate-200/80">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                                Device
                              </p>
                              <p className="text-slate-800 font-bold text-xs truncate">
                                {repair.device.brand}
                              </p>
                              <p className="text-slate-500 text-[11px] font-mono truncate">
                                {repair.device.model}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 border border-slate-200/80">
                              <Wrench className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                                Technician
                              </p>
                              <p className="text-slate-800 font-bold text-xs truncate">
                                {repair.assignedTo?.username || "Unassigned"}
                              </p>
                              <div className="flex gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
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
                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200">
                          {repair.advancePayment > 0 ? (
                            <>
                              <div className="flex justify-between items-center text-xs mb-1">
                                <span className="text-slate-500">
                                  Total Amount
                                </span>
                                <span className="text-slate-700 font-mono font-medium">
                                  Rs. {finalTotal.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs mb-2 pb-2 border-b border-slate-200">
                                <span className="text-emerald-700 font-medium">
                                  Advance Paid
                                </span>
                                <span className="text-emerald-700 font-mono font-medium">
                                  Rs. - {repair.advancePayment.toLocaleString()}
                                </span>
                              </div>
                              <div className="text-center mb-2">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                                  Balance Due
                                </p>
                                <p className="text-xl font-bold text-slate-900 font-mono">
                                  Rs. {balanceDue.toLocaleString()}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="text-center mb-2">
                              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                                Total Due
                              </p>
                              <p className="text-xl font-bold text-blue-700 font-mono">
                                Rs. {finalTotal.toLocaleString()}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-col gap-1.5 mt-2.5">
                            {repair.status === "IN_PROGRESS" && (
                              <div className="w-full h-8 px-2 bg-amber-50 text-amber-800 font-bold rounded-lg text-center border border-amber-200 text-xs flex items-center justify-center gap-1.5">
                                <Wrench className="w-3.5 h-3.5 shrink-0" />
                                Work in Progress
                              </div>
                            )}
                            {repair.status === "WAITING_FOR_PARTS" && (
                              <div className="w-full h-8 px-2 bg-rose-50 text-rose-800 font-bold rounded-lg text-center border border-rose-200 text-xs flex items-center justify-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                Waiting for Parts
                              </div>
                            )}
                            {repair.status === "ASSIGNED" && (
                              <div className="w-full h-8 px-2 bg-blue-50 text-blue-700 font-bold rounded-lg text-center border border-blue-200 text-xs flex items-center justify-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                                Assigned to Tech
                              </div>
                            )}

                            {(repair.status === "RECEIVED" || repair.status === "PENDING") ? (
                              <button
                                type="button"
                                onClick={() => printDeviceReceivedReceipt(repair)}
                                className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 shrink-0" />
                                Print Receipt
                              </button>
                            ) : (
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => printRepairBill(repair)}
                                  className="h-8 px-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-1 text-[10px] whitespace-nowrap cursor-pointer select-none"
                                  title="Print Bill"
                                >
                                  <Receipt className="w-3 h-3 text-slate-500 shrink-0" />
                                  <span>Print Bill</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const invoiceHtml = generateRepairInvoiceHtml(repair);
                                    printDocument(invoiceHtml, `Repair-Invoice-${repair.jobNumber}`, "invoice");
                                  }}
                                  className="h-8 px-1.5 bg-blue-50 hover:bg-blue-100/80 active:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 shadow-2xs transition-all flex items-center justify-center gap-1 text-[10px] whitespace-nowrap cursor-pointer select-none"
                                  title="Print Invoice"
                                >
                                  <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                                  <span>Print Invoice</span>
                                </button>
                              </div>
                            )}

                            {(repair.status === "READY" || repair.status === "COMPLETED") && (
                              <button
                                type="button"
                                onClick={() => onCollectPayment(repair)}
                                className="w-full h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5 shrink-0" />
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
