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
  canApplyDiscount,
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
  const [discountType, setDiscountType] = useState<
    "PERCENTAGE" | "FIXED" | null
  >(null);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
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
  const [showCustomerInfo, setShowCustomerInfo] =
    useState<boolean>(hasWarrantyProducts);

  const discountAmount =
    discountType === "PERCENTAGE"
      ? (subtotal * discountValue) / 100
      : discountType === "FIXED"
        ? discountValue
        : 0;
  const finalTotal = total - discountAmount;
  const change = parseFloat(amountReceived || "0") - finalTotal;
  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const handlePayment = async (printReceipt: boolean = true, overrideIdParam?: string): Promise<void> => {
    if (hasWarrantyProducts && !customerPhone.trim()) {
      setError("Customer phone is required for products with warranty");
      setShowCustomerInfo(true);
      return;
    }

    setLoading(true);
    setError("");
    try {
      let data;
      
      if (exchangePayload) {
        // Exchange Flow
        const newSaleItems = cart.filter(item => !item.isReturnCredit).map((item) => {
          const origPrice = Number(item.originalPrice ?? item.sellingPrice ?? item.effectivePrice ?? 0);
          const effectivePrice = Number(item.effectivePrice ?? item.sellingPrice ?? 0);
          const discount = Math.max(0, origPrice - effectivePrice) || Number(item.discountAmount) || 0;
          return {
            productId: item._id,
            variantId: item.variantId,
            stockItemId: item.stockItemId,
            quantity: item.quantity,
            unitPrice: origPrice > 0 ? origPrice : effectivePrice,
            originalPrice: origPrice > 0 ? origPrice : effectivePrice,
            discount: discount,
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
                    amount: Math.max(0, parseFloat(amountReceived) || finalTotal),
                  },
                ],
                discountType: discountType,
                discountValue: discountValue,
                customer: customerPhone
                  ? {
                      name: customerName || undefined,
                      phone: customerPhone,
                    }
                  : undefined,
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
                const origPrice = Number(item.originalPrice ?? item.sellingPrice ?? item.effectivePrice ?? 0);
                const effectivePrice = Number(item.effectivePrice ?? item.sellingPrice ?? 0);
                const discount = Math.max(0, origPrice - effectivePrice) || Number(item.discountAmount) || 0;
                return {
                  productId: item._id,
                  variantId: item.variantId,
                  stockItemId: item.stockItemId,
                  quantity: item.quantity,
                  unitPrice: origPrice > 0 ? origPrice : effectivePrice,
                  originalPrice: origPrice > 0 ? origPrice : effectivePrice,
                  discount: discount,
                  serialNumber: item.serialNumber,
                };
              }),
              payments: [
                {
                  method: paymentMethod,
                  amount: parseFloat(amountReceived) || finalTotal,
                },
              ],
              discountType: discountType,
              discountValue: discountValue,
              customer: customerPhone
                ? {
                    name: customerName || undefined,
                    phone: customerPhone,
                  }
                : undefined,
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
            const billHtml = generateSaleBillHtml(sale, settings, customerName, customerPhone);
            const invoiceHtml = generateSaleInvoiceHtml(sale, settings, customerName, customerPhone);
            printDocument(billHtml, `Bill-${sale.saleNumber || "POS"}`, "bill");
            setTimeout(() => {
              printDocument(invoiceHtml, `Invoice-${sale.saleNumber || "POS"}`, "invoice");
            }, 600);
          } else if (printBill) {
            const billHtml = generateSaleBillHtml(sale, settings, customerName, customerPhone);
            printDocument(billHtml, `Bill-${sale.saleNumber || "POS"}`, "bill");
          } else if (printInvoice) {
            const invoiceHtml = generateSaleInvoiceHtml(sale, settings, customerName, customerPhone);
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/80">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-sky-500/10 pointer-events-none"></div>
          <div className="relative p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30 text-white shrink-0">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Complete Payment
                </h3>
                <p className="text-slate-500 text-sm dark:text-slate-400">
                  {cart.length} items in order
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/80 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-xl text-slate-400 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-all border border-slate-200/80 dark:border-slate-700 cursor-pointer"
            >
              <svg
                className="w-5 h-5"
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

        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-100px)] scrollbar-thin">
          {/* Order Summary Card */}
          <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-800 dark:text-slate-100 font-semibold">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1 font-medium">
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
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    Discount
                  </span>
                  <span className="text-sky-600 dark:text-sky-400 font-semibold">
                    - Rs. {discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Tax</span>
                <span className="text-slate-800 dark:text-slate-100 font-semibold">
                  Rs. {tax.toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Total
                </span>
                {canApplyDiscount ? (
                  <div className="flex items-center gap-1 bg-sky-50 dark:bg-sky-950/30 px-2 py-1 rounded-xl border border-sky-200 dark:border-sky-800/50 transition-colors focus-within:border-sky-400">
                    <span className="text-2xl font-black text-sky-600 dark:text-sky-400">Rs.</span>
                    <input 
                      type="number"
                      className="w-24 bg-transparent text-2xl font-black text-sky-600 dark:text-sky-400 focus:outline-none hide-arrows text-right"
                      value={finalTotal}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0) {
                          const maxAllowed = subtotal + tax;
                          if (val <= maxAllowed) {
                            setDiscountType("FIXED");
                            setDiscountValue(maxAllowed - val);
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
                    Rs. {finalTotal.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Discount Section */}
          {canApplyDiscount && (
            <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Apply Discount
                </span>
                {!discountType ? (
                  <button
                    onClick={() => setDiscountType("PERCENTAGE")}
                    className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-500 flex items-center gap-1 cursor-pointer"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setDiscountType(null);
                      setDiscountValue(0);
                    }}
                    className="text-xs font-semibold text-red-500 hover:text-red-400 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
              {discountType && (
                <div className="flex gap-2 mt-2">
                  <select
                    value={discountType}
                    onChange={(e) =>
                      setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")
                    }
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-sky-500"
                  >
                    <option value="PERCENTAGE" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Percentage (%)</option>
                    <option value="FIXED" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Fixed (Rs)</option>
                  </select>
                  <input
                    type="number"
                    value={discountValue || ""}
                    onChange={(e) =>
                      setDiscountValue(parseFloat(e.target.value) || 0)
                    }
                    placeholder="Enter value"
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0"
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

          {/* Customer Info Section */}
          <div
            className={`bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border overflow-hidden transition-colors ${hasWarrantyProducts && !customerPhone.trim() ? "border-amber-400 dark:border-amber-500/70 ring-1 ring-amber-400/40" : "border-slate-200/80 dark:border-slate-700/80"}`}
          >
            <button
              type="button"
              onClick={() => setShowCustomerInfo(!showCustomerInfo)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
            >
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
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
                Customer Info
                {hasWarrantyProducts && !customerPhone.trim() && (
                  <span className="text-xs bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60 font-semibold animate-pulse">
                    ⚠️ REQUIRED
                  </span>
                )}
                {customerPhone && (
                  <span className="text-xs bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-300 dark:border-sky-700/60 font-semibold">
                    ✓ Added
                  </span>
                )}
              </span>
              <svg
                className={`w-4 h-4 text-slate-400 dark:text-slate-400 transition-transform ${showCustomerInfo ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showCustomerInfo && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-200/80 dark:border-slate-700/80 pt-3">
                {hasWarrantyProducts && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    Cart contains warranty products - Customer phone is REQUIRED
                  </p>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Phone Number <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 0771234567"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { method: "CASH" as const, icon: "💵", label: "Cash" },
                { method: "CARD" as const, icon: "💳", label: "Card" },
              ].map(({ method, icon, label }) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-3.5 rounded-xl font-medium transition-all flex flex-col items-center gap-1 cursor-pointer ${paymentMethod === method ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 border border-sky-400 dark:border-sky-500" : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700"}`}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Print Documents (Bill / Invoice) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Print Documents
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Multi-select (select Bill, Invoice, or both)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPrintBill(!printBill)}
                className={`py-3.5 rounded-xl font-medium transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  printBill
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 border border-sky-400 dark:border-sky-500"
                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700"
                }`}
              >
                <span className="text-xl">🧾</span>
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  Bill
                  {printBill && (
                    <span className="text-[11px] bg-white/25 dark:bg-white/20 px-1.5 py-0.2 rounded-full font-bold">
                      ✓
                    </span>
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPrintInvoice(!printInvoice)}
                className={`py-3.5 rounded-xl font-medium transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  printInvoice
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 border border-sky-400 dark:border-sky-500"
                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700"
                }`}
              >
                <span className="text-xl">📑</span>
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  Invoice
                  {printInvoice && (
                    <span className="text-[11px] bg-white/25 dark:bg-white/20 px-1.5 py-0.2 rounded-full font-bold">
                      ✓
                    </span>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Cash Payment Options */}
          {paymentMethod === "CASH" && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Quick Amount
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmountReceived(String(amt))}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${parseFloat(amountReceived) === amt ? "bg-sky-500/20 text-sky-600 dark:text-sky-400 border-2 border-sky-500 dark:border-sky-400 font-bold" : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700"}`}
                    >
                      {amt >= 1000 ? `${amt / 1000}K` : amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Amount Received
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-lg">
                    Rs.
                  </span>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className={`w-full pl-14 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-900 dark:text-white text-3xl text-center font-black border-2 transition-all focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 ${amountReceived && parseFloat(amountReceived) >= finalTotal ? "border-emerald-500/70 dark:border-emerald-500/70 focus:border-emerald-500 text-emerald-600 dark:text-emerald-400" : amountReceived && parseFloat(amountReceived) < finalTotal ? "border-amber-500/70 dark:border-amber-500/70 focus:border-amber-500" : "border-slate-200 dark:border-slate-700 focus:border-sky-500"}`}
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              {change >= 0 &&
                parseFloat(amountReceived || "0") >= finalTotal && (
                  <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-500/40 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
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
                        <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                          Change to Return
                        </span>
                      </div>
                      <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                        Rs. {change.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
            </>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handlePayment(false)}
              disabled={
                loading ||
                (paymentMethod === "CASH" &&
                  parseFloat(amountReceived || "0") < finalTotal)
              }
              className="py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-800 dark:border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
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
              onClick={() => handlePayment(printBill || printInvoice)}
              disabled={
                loading ||
                (paymentMethod === "CASH" &&
                  parseFloat(amountReceived || "0") < finalTotal)
              }
              className="py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
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
