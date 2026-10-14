import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import { getShopSettings } from "../../../lib/settings";
import {
  generateSaleInvoiceHtml,
  generateSaleBillHtml,
  printDocument,
} from "../../../lib/invoiceGenerator";
import { PermissionOverrideModal } from "./PermissionOverrideModal";
import type { PaymentModalProps } from "../../../types/pos";

export function PaymentModal({
  total,
  subtotal,
  tax,
  cart,
  exchangePayload,
  onClose,
  onSuccess,
}: PaymentModalProps): JSX.Element {
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
  const [printBill, setPrintBill] = useState<boolean>(true);
  const [printInvoice, setPrintInvoice] = useState<boolean>(false);
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [processing] = useState<boolean>(false);
  const [success] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [overrideId, setOverrideId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showOverrideModal && !processing && !success) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, showOverrideModal, processing, success]);

  const hasWarrantyProducts = cart.some(
    (item) => (item.warrantyDuration ?? 0) > 0,
  );

  const totalItemDiscount = cart.reduce(
    (sum, item) => sum + (Number(item.discountAmount ?? 0) * item.quantity),
    0,
  );

  const change = parseFloat(amountReceived || "0") - total;
  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const handlePayment = async (printReceipt: boolean = true, overrideIdParam?: string): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      let data;
      const trimmedName = customerName.trim();
      const trimmedPhone = customerPhone.trim();
      const trimmedEmail = customerEmail.trim();
      const customerData = {
        name: trimmedName || "-",
        phone: trimmedPhone || "-",
        email: trimmedEmail || undefined,
      };

      if (exchangePayload) {
        // Exchange Flow
        const newSaleItems = cart.filter(item => !item.isReturnCredit).map((item) => {
          const origPrice = Number(item.originalPrice ?? item.sellingPrice ?? 0);
          const disc = Number(item.discountAmount ?? 0);
          return {
            productId: item._id,
            variantId: item.variantId,
            stockItemId: item.stockItemId,
            quantity: item.quantity,
            unitPrice: origPrice,
            originalPrice: origPrice,
            discount: disc,
            serialNumber: item.serialNumber,
          };
        });

        data = await api<{ status: string; message?: string; data?: any }>(
          "/returns",
          {
            method: "POST",
            body: JSON.stringify({
              originalSaleId: exchangePayload.originalSaleId,
              returnType: "EXCHANGE",
              items: exchangePayload.items,
              reason: exchangePayload.reason,
              authorizationOverrideId: overrideIdParam || overrideId || exchangePayload.authorizationOverrideId || undefined,
              refundMethod: "CASH",
              newSaleData: {
                items: newSaleItems,
                payments: [
                  {
                    method: paymentMethod,
                    amount: Math.max(0, parseFloat(amountReceived) || total),
                  },
                ],
                customer: customerData,
              }
            })
          }
        );
      } else {
        // Normal Sale Flow
        data = await api<{ status: string; message?: string; data?: any }>(
          "/sales",
          {
            method: "POST",
            body: JSON.stringify({
              items: cart.filter(item => !item.isReturnCredit).map((item) => {
                const origPrice = Number(item.originalPrice ?? item.sellingPrice ?? 0);
                const disc = Number(item.discountAmount ?? 0);
                const unitPrice = origPrice > 0 ? origPrice : Number(item.effectivePrice ?? 0);
                return {
                  productId: item._id,
                  variantId: item.variantId,
                  stockItemId: item.stockItemId,
                  quantity: item.quantity,
                  unitPrice: unitPrice,
                  originalPrice: unitPrice,
                  discount: disc,
                  serialNumber: item.serialNumber,
                  isSimReload: item.isSimReload,
                  simReloadType: item.simReloadType,
                  simReloadId: item.simReloadId,
                  provider: item.provider,
                  phoneNumber: item.phoneNumber,
                };
              }),
              payments: [
                {
                  method: paymentMethod,
                  amount: parseFloat(amountReceived) || total,
                },
              ],
              tax: tax,
              customer: customerData,
            }),
          },
        );
      }

      if (data.status === "success") {
        const sale = exchangePayload ? data.data?.newSale : data.data?.sale;
        // Print receipt/invoice for sales
        if (printReceipt && sale && !exchangePayload) {
          const settings = getShopSettings();
          if (printBill && printInvoice) {
            const billHtml = generateSaleBillHtml(sale, settings, trimmedName, trimmedPhone, trimmedEmail);
            const invoiceHtml = generateSaleInvoiceHtml(sale, settings, trimmedName, trimmedPhone, trimmedEmail);
            printDocument(billHtml, `Bill-${sale.saleNumber || "POS"}`, "bill");
            setTimeout(() => {
              printDocument(invoiceHtml, `Invoice-${sale.saleNumber || "POS"}`, "invoice");
            }, 600);
          } else if (printBill) {
            const billHtml = generateSaleBillHtml(sale, settings, trimmedName, trimmedPhone, trimmedEmail);
            printDocument(billHtml, `Bill-${sale.saleNumber || "POS"}`, "bill");
          } else if (printInvoice) {
            const invoiceHtml = generateSaleInvoiceHtml(sale, settings, trimmedName, trimmedPhone, trimmedEmail);
            printDocument(invoiceHtml, `Invoice-${sale.saleNumber || "POS"}`, "invoice");
          }
        }
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      } else {
        if ((data as any).requiresOverride) {
          setShowOverrideModal(true);
          setError(data.message || "Manager authorization required.");
        } else {
          setError(data.message || "Payment failed");
        }
      }
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[96vh] flex flex-col border border-slate-800/80 shadow-2xl overflow-hidden text-slate-800">
        {/* Header: Deep Dark Slate (#0f172a) */}
        <div className="px-6 py-4 bg-[#0f172a] text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-extrabold shadow-md shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  Complete Payment
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#1e293b] text-blue-400 border border-blue-900/60">
                  CHECKOUT
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {cart.length} item(s) in order • Total: Rs. {total.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable / Flexible Form Content */}
        <div className="px-5 py-3.5 space-y-3 overflow-y-auto flex-1 scrollbar-thin">
          {/* Order Summary Card */}
          <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl px-4 py-2.5 border border-slate-200/80 dark:border-slate-700/80">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-800 dark:text-slate-100 font-semibold">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>
              {totalItemDiscount > 0 && (
                <div className="flex justify-between items-center text-rose-500 font-medium">
                  <span className="flex items-center gap-1">
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
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    Item Discount
                  </span>
                  <span className="font-semibold">
                    Rs. - {totalItemDiscount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Tax</span>
                <span className="text-slate-800 dark:text-slate-100 font-semibold">
                  Rs. {tax.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Total
                </span>
                <span className="text-xl font-black text-sky-600 dark:text-sky-400">
                  Rs. {total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info Section (Always Visible) */}
          <div
            className={`bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border p-3 transition-colors ${
              hasWarrantyProducts && (!customerName.trim() || !customerPhone.trim())
                ? "border-amber-400 dark:border-amber-500/70 ring-1 ring-amber-400/40"
                : "border-slate-200/80 dark:border-slate-700/80"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-sky-500 dark:text-sky-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Customer Information
              </span>
              {hasWarrantyProducts && (!customerName.trim() || !customerPhone.trim()) ? (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60 font-bold animate-pulse">
                  ⚠️ Name & Number Required
                </span>
              ) : (customerName.trim() || customerPhone.trim() || customerEmail.trim()) ? (
                <span className="text-[10px] bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded-full border border-sky-300 dark:border-sky-700/60 font-semibold">
                  ✓ Added
                </span>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Customer Name <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Name"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Phone Number <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0771234567"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Customer Email <span className="text-slate-400 font-normal text-[10px]">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@gmail.com"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
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

          {/* Payment Method & Print Documents in 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            {/* Payment Method */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { method: "CASH" as const, icon: "💵", label: "Cash" },
                  { method: "CARD" as const, icon: "💳", label: "Card" },
                ].map(({ method, icon, label }) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === method
                        ? "bg-blue-600 text-white shadow-xs border border-blue-600 font-bold"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
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
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Print Documents
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrintBill(!printBill)}
                  className={`py-2 px-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    printBill
                      ? "bg-blue-600 text-white shadow-xs border border-blue-600 font-bold"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span className="text-sm">🧾</span>
                  <span className="text-xs font-semibold flex items-center gap-0.5">
                    Bill
                    {printBill && (
                      <span className="text-[10px] bg-white/25 px-1 rounded-full font-bold">
                        ✓
                      </span>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintInvoice(!printInvoice)}
                  className={`py-2 px-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    printInvoice
                      ? "bg-blue-600 text-white shadow-xs border border-blue-600 font-bold"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span className="text-sm">📑</span>
                  <span className="text-xs font-semibold flex items-center gap-0.5">
                    Invoice
                    {printInvoice && (
                      <span className="text-[10px] bg-white/25 px-1 rounded-full font-bold">
                        ✓
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Cash Payment Options */}
          {paymentMethod === "CASH" && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Quick Amount
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmountReceived(String(amt))}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        parseFloat(amountReceived) === amt
                          ? "bg-sky-500/20 text-sky-600 dark:text-sky-400 border-2 border-sky-500 dark:border-sky-400 font-bold"
                          : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700"
                      }`}
                    >
                      {amt >= 1000 ? `${amt / 1000}K` : amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Amount Received
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-sm">
                    Rs.
                  </span>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className={`w-full pl-12 pr-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white text-xl text-center font-black border-2 transition-all focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 ${
                      amountReceived && parseFloat(amountReceived) >= total
                        ? "border-emerald-500/70 dark:border-emerald-500/70 focus:border-emerald-500 text-emerald-600 dark:text-emerald-400"
                        : amountReceived && parseFloat(amountReceived) < total
                          ? "border-amber-500/70 dark:border-amber-500/70 focus:border-amber-500"
                          : "border-slate-200 dark:border-slate-700 focus:border-sky-500"
                    }`}
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              {change >= 0 && parseFloat(amountReceived || "0") >= total && (
                <div className="px-3.5 py-2 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-500/40 rounded-xl">
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
                      Rs. {change.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons Footer (Pinned at bottom, always visible with no scrolling) */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 grid grid-cols-2 gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handlePayment(false)}
            disabled={
              loading ||
              (paymentMethod === "CASH" &&
                parseFloat(amountReceived || "0") < total)
            }
            className="py-2.5 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-800 rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Complete Only
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => handlePayment(printBill || printInvoice)}
            disabled={
              loading ||
              (paymentMethod === "CASH" &&
                parseFloat(amountReceived || "0") < total)
            }
            className="py-2.5 px-6 bg-[#0f172a] hover:bg-slate-800 active:scale-[0.99] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
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
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                {printBill && printInvoice
                  ? "Complete & Print Both"
                  : printBill
                    ? "Complete & Print Bill"
                    : printInvoice
                      ? "Complete & Print Invoice"
                      : "Complete Sale"}
              </>
            )}
          </button>
        </div>
      </div>
      
      {showOverrideModal && (
        <PermissionOverrideModal
          permission="CREATE_RETURN"
          onClose={() => setShowOverrideModal(false)}
          onSuccess={(id) => {
            setOverrideId(id);
            setShowOverrideModal(false);
            handlePayment(printBill || printInvoice, id);
          }}
        />
      )}
    </div>
  );
}
