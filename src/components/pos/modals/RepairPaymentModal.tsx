import { useState } from "react";
import { api } from "../../../lib/api";
import { getShopSettings } from "../../../lib/settings";
import {
  generateRepairInvoiceHtml,
  generateRepairBillHtml,
  printDocument,
} from "../../../lib/invoiceGenerator";
import type { RepairPaymentModalProps } from "../../../types/pos";

export function RepairPaymentModal({
  repair,
  canCollectPayment,
  onClose,
  onSuccess,
}: RepairPaymentModalProps): JSX.Element {
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
  const [printBill, setPrintBill] = useState<boolean>(true);
  const [printInvoice, setPrintInvoice] = useState<boolean>(false);
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const totalCost = (repair.serviceCost || 0) + (repair.partsTotal || 0);
  const advancePaid = repair.advancePayment || 0;
  const balanceDue = Math.max(0, totalCost - advancePaid);
  const change = parseFloat(amountReceived || "0") - balanceDue;
  const isValidAmount = parseFloat(amountReceived || "0") >= balanceDue;

  const getQuickAmounts = () => {
    const base = [100, 500, 1000, 2000, 5000];
    if (balanceDue > 0 && !base.includes(Math.ceil(balanceDue))) {
      return [
        Math.ceil(balanceDue),
        ...base.filter((a) => a !== Math.ceil(balanceDue)),
      ].slice(0, 5);
    }
    return base;
  };

  const handlePayment = async (printReceipt: boolean = true): Promise<void> => {
    if (!canCollectPayment) {
      setError("You don't have permission to collect repair payments");
      return;
    }
    if (!isValidAmount) {
      setError("Amount received is less than balance due");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api<{ status: string; message?: string; data?: any }>(
        `/repairs/${repair._id}/payment`,
        {
          method: "PUT",
          body: JSON.stringify({
            amount: parseFloat(amountReceived),
            paymentMethod: paymentMethod,
          }),
        },
      );
      if (res.status === "success") {
        if (printReceipt) {
          const settings = getShopSettings();
          if (printBill && printInvoice) {
            const billHtml = generateRepairBillHtml(repair, settings, totalCost, advancePaid, balanceDue, amountReceived, change);
            const invoiceHtml = generateRepairInvoiceHtml(repair, settings, totalCost, advancePaid, balanceDue, amountReceived, change);
            printDocument(billHtml, `Repair-Bill-${repair.jobNumber || "JOB"}`, "bill");
            setTimeout(() => {
              printDocument(invoiceHtml, `Repair-Invoice-${repair.jobNumber || "JOB"}`, "invoice");
            }, 600);
          } else if (printBill) {
            const billHtml = generateRepairBillHtml(repair, settings, totalCost, advancePaid, balanceDue, amountReceived, change);
            printDocument(billHtml, `Repair-Bill-${repair.jobNumber || "JOB"}`, "bill");
          } else if (printInvoice) {
            const invoiceHtml = generateRepairInvoiceHtml(repair, settings, totalCost, advancePaid, balanceDue, amountReceived, change);
            printDocument(invoiceHtml, `Repair-Invoice-${repair.jobNumber || "JOB"}`, "invoice");
          }
        }
        setShowSuccess(true);
        setTimeout(() => onSuccess(), 2000);
      } else {
        setError(res.message || "Payment failed");
      }
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md border border-slate-200/80 dark:border-slate-800 shadow-2xl text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center animate-bounce shadow-lg shadow-emerald-500/25">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-1 dark:text-slate-100">
            Payment Complete!
          </h3>
          <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-6">Transaction successful</p>

          <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl p-4 mb-6 text-left space-y-2 border border-slate-200/80 dark:border-slate-700/80 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Job Number</span>
              <span className="text-slate-800 font-bold dark:text-slate-100 font-mono">
                {repair.jobNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Customer</span>
              <span className="text-slate-800 font-semibold dark:text-slate-100">
                {repair.customer.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Amount Paid</span>
              <span className="text-sky-600 dark:text-sky-400 font-bold">
                Rs. {parseFloat(amountReceived).toLocaleString()}
              </span>
            </div>
            {change > 0 && (
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">Change</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Rs. {change.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <p className="text-slate-400 text-xs dark:text-slate-500">Closing automatically...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg max-h-[96vh] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-sky-500/10 pointer-events-none"></div>
          <div className="relative px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/30 text-white shrink-0">
                <span className="text-lg">💵</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  Collect Payment
                </h3>
                <p className="text-slate-500 text-xs dark:text-slate-400">
                  {repair.jobNumber} • {repair.customer.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-white/80 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-all border border-slate-200/80 dark:border-slate-700 cursor-pointer"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable / Flexible Form Content */}
        <div className="px-4 py-2.5 space-y-2 overflow-y-auto flex-1 scrollbar-thin">
          {/* Device Info */}
          <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl px-3.5 py-2 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950/80 flex items-center justify-center text-lg border border-sky-200 dark:border-sky-800/60 shrink-0">
                📱
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 font-bold dark:text-slate-100 text-xs truncate">
                  {repair.device.brand} {repair.device.model}
                </p>
                <p className="text-slate-500 text-[11px] dark:text-slate-400 truncate">
                  {repair.problemDescription?.slice(0, 50) || "Device repair"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Tech: {repair.assignedTo?.username || "N/A"}
                  </span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-semibold border border-emerald-300 dark:border-emerald-800/60">
                    ✓ Ready
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl px-3.5 py-2 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
            <div className="space-y-1 text-xs bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Labor Cost</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Rs. {(repair.serviceCost || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Parts Total</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Rs. {(repair.partsTotal || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs pt-0.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Total Cost</span>
                <span className="text-slate-800 font-bold dark:text-slate-100">
                  Rs. {totalCost.toLocaleString()}
                </span>
              </div>
              {advancePaid > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1 font-medium">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Advance Paid
                  </span>
                  <span className="text-sky-600 dark:text-sky-400 font-bold">
                    - Rs. {advancePaid.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Balance Due</span>
                <span className="text-lg font-black text-sky-600 dark:text-sky-400">
                  Rs. {balanceDue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method & Print Documents in 2 columns */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Payment Method */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { method: "CASH", icon: "💵", label: "Cash" },
                    { method: "CARD", icon: "💳", label: "Card" },
                  ] as const
                ).map(({ method, icon, label }) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${paymentMethod === method ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 border border-sky-400 dark:border-sky-500" : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700"}`}
                  >
                    <span className="text-sm">{icon}</span>
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Print Documents (Bill / Invoice) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Print Documents
                </label>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPrintBill(!printBill)}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    printBill
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 border border-sky-400 dark:border-sky-500"
                      : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700"
                  }`}
                >
                  <span className="text-sm">🧾</span>
                  <span className="text-xs font-semibold flex items-center gap-0.5">
                    Bill
                    {printBill && (
                      <span className="text-[10px] bg-white/25 dark:bg-white/20 px-1 rounded-full font-bold">
                        ✓
                      </span>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintInvoice(!printInvoice)}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    printInvoice
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 border border-sky-400 dark:border-sky-500"
                      : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700"
                  }`}
                >
                  <span className="text-sm">📑</span>
                  <span className="text-xs font-semibold flex items-center gap-0.5">
                    Invoice
                    {printInvoice && (
                      <span className="text-[10px] bg-white/25 dark:bg-white/20 px-1 rounded-full font-bold">
                        ✓
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Quick Amounts */}
          {paymentMethod === "CASH" && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Quick Select
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {getQuickAmounts().map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmountReceived(String(amt))}
                    className={`py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${parseFloat(amountReceived) === amt ? "bg-sky-500/20 text-sky-600 dark:text-sky-400 border-2 border-sky-500 dark:border-sky-400 font-bold" : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700"}`}
                  >
                    {amt >= 1000 ? `${amt / 1000}K` : amt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {paymentMethod === "CASH"
                ? "Amount Received"
                : "Amount to Charge"}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-sm">
                Rs.
              </span>
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                className={`w-full pl-12 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white text-xl text-center font-black border-2 transition-all focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 ${amountReceived && isValidAmount ? "border-emerald-500/70 dark:border-emerald-500/70 focus:border-emerald-500 text-emerald-600 dark:text-emerald-400" : amountReceived && !isValidAmount ? "border-amber-500/70 dark:border-amber-500/70 focus:border-amber-500" : "border-slate-200 dark:border-slate-700 focus:border-sky-500"}`}
                placeholder="0"
                autoFocus
              />
              {paymentMethod !== "CASH" && balanceDue > 0 && (
                <button
                  onClick={() => setAmountReceived(String(balanceDue))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-600 dark:text-sky-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Exact
                </button>
              )}
            </div>
          </div>

          {/* Change Display */}
          {paymentMethod === "CASH" && isValidAmount && amountReceived && (
            <div className="px-3 py-1.5 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-500/40 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <svg
                      className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                    Change to Return
                  </span>
                </div>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  Rs. {change.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer (Pinned at bottom, always visible with no scrolling) */}
        <div className="p-3 bg-slate-50/90 dark:bg-slate-800/90 border-t border-slate-200/80 dark:border-slate-700/80 grid grid-cols-2 gap-2.5 shrink-0">
          <button
            onClick={() => handlePayment(false)}
            disabled={
              loading ||
              !canCollectPayment ||
              !isValidAmount ||
              !amountReceived
            }
            className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? "⏳ Processing..." : "Complete Only"}
          </button>
          <button
            onClick={() => handlePayment(printBill || printInvoice)}
            disabled={
              loading ||
              !canCollectPayment ||
              !isValidAmount ||
              !amountReceived
            }
            className="py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-sky-500/25 hover:shadow-sky-500/40 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? (
              "⏳ Processing..."
            ) : printBill && printInvoice ? (
              "Complete & Print Both"
            ) : printBill ? (
              "Complete & Print Bill"
            ) : printInvoice ? (
              "Complete & Print Invoice"
            ) : (
              "Complete Payment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
