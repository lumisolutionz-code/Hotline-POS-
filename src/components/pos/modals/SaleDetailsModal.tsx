import { X, User, Phone, Mail, FileText, Ban, Printer, CheckCircle2, Landmark, CreditCard, Banknote, Smartphone } from "lucide-react";
import { generateSaleBillHtml, generateSaleInvoiceHtml, printDocument } from "../../../lib/invoiceGenerator";

export interface SaleDetailsModalProps {
  sale: any;
  onClose: () => void;
  onVoidSale?: (saleId: string) => void;
  onSettleKoko?: (saleId: string) => void;
}

export function SaleDetailsModal({ sale, onClose, onVoidSale, onSettleKoko }: SaleDetailsModalProps): JSX.Element | null {
  if (!sale) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const formatCurrency = (amount?: number) => {
    const num = Number(amount || 0);
    if (num < 0) {
      return "Rs. - " + Math.abs(num).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return "Rs. " + num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const customerName = sale.customer?.name || "";
  const customerPhone = sale.customer?.phone || "";
  const customerEmail = sale.customer?.email || "";
  const saleDocNum = sale.saleNumber || sale.receiptNumber || "POS";

  const handlePrintBill = () => {
    try {
      const html = generateSaleBillHtml(sale, undefined, customerName, customerPhone, customerEmail);
      printDocument(html, `Receipt-${saleDocNum}`, "bill");
    } catch (err: any) {
      alert("Failed generating bill: " + (err?.message || err));
    }
  };

  const handlePrintInvoice = () => {
    try {
      const html = generateSaleInvoiceHtml(sale, undefined, customerName, customerPhone, customerEmail);
      printDocument(html, `Invoice-${saleDocNum}`, "invoice");
    } catch (err: any) {
      alert("Failed generating invoice: " + (err?.message || err));
    }
  };

  const status = sale.status || "COMPLETED";

  const getSalePaymentMethods = (s: any): string[] => {
    if (Array.isArray(s.payments) && s.payments.length > 0) {
      const valid = s.payments.filter((p: any) => Number(p.amount) > 0 || s.payments.length === 1);
      const methods: string[] = Array.from(new Set<string>(valid.map((p: any) => String(p.method || "CASH").toUpperCase())));
      if (methods.length > 0) return methods;
    }
    if (s.paymentMethod) return [String(s.paymentMethod).toUpperCase()];
    return ["CASH"];
  };

  const paymentMethods = getSalePaymentMethods(sale);
  const isKokoSale =
    paymentMethods.includes("KOKO") ||
    Boolean(sale.kokoDetails && (Number(sale.kokoDetails.firstInstallmentAmount || 0) > 0 || Number(sale.kokoDetails.remainingAmount || 0) > 0));
  const koko = sale.kokoDetails || {};
  const gTotal = Number(sale.grandTotal || sale.finalTotal || 0);
  const kokoParts = Number(koko.splitParts || 3);
  const kokoFeePct = Number(koko.feePercentage || 12);
  const firstInst = Number(koko.firstInstallmentAmount || (kokoParts > 0 ? gTotal / kokoParts : 0));
  const feeAmt = Number(koko.feeAmount || ((firstInst * kokoFeePct) / 100));
  const netBank = Number(koko.netFirstPayout || (firstInst - feeAmt));
  const remAmt = Number(koko.remainingAmount || (gTotal - firstInst));
  const kokoSettled = koko.settlementStatus === "SETTLED" || (status === "COMPLETED" && koko.settlementStatus !== "PENDING");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col text-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (Pinned) */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6 pb-4 shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Receipt #{saleDocNum}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  status === "COMPLETED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : status === "CANCELLED" || status === "VOID" || status === "VOIDED"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : status.includes("RETURN") || status.includes("REFUND")
                    ? "bg-orange-50 text-orange-700 border border-orange-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {status.replace("_", " ")}
              </span>

              {/* Payment Method Badges */}
              {paymentMethods.map((method) => {
                if (method === "KOKO") {
                  return (
                    <span key={method} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-purple-700" />
                      Koko Pay
                    </span>
                  );
                }
                if (method === "CARD") {
                  return (
                    <span key={method} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-blue-700" />
                      Card
                    </span>
                  );
                }
                if (method === "CASH") {
                  return (
                    <span key={method} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Banknote className="w-3 h-3 text-emerald-700" />
                      Cash
                    </span>
                  );
                }
                return (
                  <span key={method} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                    {method.replace("_", " ")}
                  </span>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <span>{formatDate(sale.createdAt)}</span>
              <span className="mx-1.5">•</span>
              <span className="font-medium text-slate-700">{sale.saleType || "POS"}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin">
          {/* Customer Info Card */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Info</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800">{customerName || "Walk-in Customer"}</span>
              </div>
              {customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600 font-mono text-xs">{customerPhone}</span>
                </div>
              )}
              {customerEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600 text-xs">{customerEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Items</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {(sale.items || []).length} {sale.items?.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs bg-white">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Item Details</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(sale.items || []).map((item: any, idx: number) => {
                    const isImei = Boolean(
                      item.imei1 || item.imei2 || (item.trackingType && String(item.trackingType).toUpperCase() === "IMEI")
                    );
                    const variantDisplay = item.variantSnapshot?.display || item.variantName;

                    return (
                      <tr key={item._id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900">{item.productName || "Product"}</div>
                          {variantDisplay && (
                            <div className="text-[11px] text-slate-500 mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                {variantDisplay}
                              </span>
                            </div>
                          )}
                          {/* IMEI Tracking Format (3 lines in a clean micro-card) */}
                          {isImei && (
                            <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-14 shrink-0">Serial</span>
                                <span className="font-mono font-bold text-slate-800 select-all">{item.serialNumber || "-"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-14 shrink-0">IMEI 1</span>
                                <span className="font-mono font-bold text-slate-800 select-all">{item.imei1 || "-"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-14 shrink-0">IMEI 2</span>
                                <span className="font-mono font-bold text-slate-800 select-all">{item.imei2 || "-"}</span>
                              </div>
                            </div>
                          )}
                          {/* Quantity Tracking Type with Serial */}
                          {!isImei && item.serialNumber && (
                            <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-14 shrink-0">Serial</span>
                                <span className="font-mono font-bold text-slate-800 select-all">{item.serialNumber}</span>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-700 text-xs">
                            {item.quantity || 1}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right text-slate-600 font-mono">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(item.total || item.totalPrice || (item.unitPrice * (item.quantity || 1)))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Koko Pay BNPL Settlement Card (if applicable) */}
          {isKokoSale && (
            <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-purple-700/50 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                    Koko Pay BNPL Settlement Breakdown
                  </span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    kokoSettled
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                  }`}
                >
                  {kokoSettled ? "SETTLED" : "PENDING SETTLEMENT"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-purple-950/60 rounded-xl p-3 border border-purple-800/40 space-y-1.5">
                  <div className="flex justify-between text-purple-300">
                    <span>1st Installment (1/{kokoParts}):</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(firstInst)}</span>
                  </div>
                  <div className="flex justify-between text-rose-300">
                    <span>Koko Fee ({kokoFeePct}%):</span>
                    <span className="font-mono font-bold text-rose-300">- {formatCurrency(feeAmt)}</span>
                  </div>
                  <div className="pt-1.5 border-t border-purple-800/60 flex justify-between items-center text-emerald-300 font-bold">
                    <span className="flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5" /> Net Direct to Bank:
                    </span>
                    <span className="font-mono font-black text-sm text-emerald-300">{formatCurrency(netBank)}</span>
                  </div>
                </div>

                <div className="bg-purple-950/60 rounded-xl p-3 border border-purple-800/40 space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-purple-300">
                      <span>Remaining Balance ({kokoParts - 1}/{kokoParts}):</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(remAmt)}</span>
                    </div>
                    <p className="text-[11px] text-purple-400/90 mt-1">
                      Remaining {kokoParts - 1} installments due in ~2 weeks directly from Koko Pay.
                    </p>
                  </div>
                  {kokoSettled ? (
                    <div className="text-[11px] text-emerald-300 font-medium flex items-center gap-1 pt-1 border-t border-purple-800/40">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Full payment received & settled
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1 pt-1 border-t border-purple-800/40">
                      <span>Status: Waiting on remaining settlement</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Summary & Payments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payments */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payments</span>
              {sale.payments && sale.payments.length > 0 ? (
                <div className="space-y-1.5">
                  {sale.payments.map((p: any, idx: number) => (
                    <div key={p._id || idx} className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">
                        {p.method === "KOKO" ? "Koko Pay" : p.method}
                      </span>
                      <span className="text-slate-900 font-bold">{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400">Cash / Default payment</div>
              )}
              {sale.changeGiven > 0 && (
                <div className="pt-2 border-t border-slate-200/60 flex justify-between text-xs text-slate-500">
                  <span>Change Given</span>
                  <span className="font-medium text-slate-700">{formatCurrency(sale.changeGiven)}</span>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-800">{formatCurrency(sale.subtotal)}</span>
              </div>
              {(sale.discountTotal || sale.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Discount</span>
                  <span className="text-red-500 font-medium">
                    Rs. - {Number(sale.discountTotal || sale.discountAmount || 0).toLocaleString("en-US")}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200/60 flex justify-between text-base font-bold text-slate-900">
                <span>Grand Total</span>
                <span className="text-blue-600 font-mono font-bold">
                  {formatCurrency(sale.grandTotal || sale.finalTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions (Pinned) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-100 shrink-0 bg-slate-50/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" /> Close
          </button>
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mark Settled / Complete Action */}
            {(status === "PENDING" || (isKokoSale && !kokoSettled)) && onSettleKoko && (
              <button
                type="button"
                onClick={() => onSettleKoko(sale._id)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Mark Settled and Complete"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Settled & Complete
              </button>
            )}
            {status === "COMPLETED" && onVoidSale && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVoidSale(sale._id);
                }}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-sm font-semibold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Void Sale"
              >
                <Ban className="w-4 h-4" /> Void Sale
              </button>
            )}
            <button
              type="button"
              onClick={handlePrintBill}
              className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-sm font-semibold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Print POS Bill"
            >
              <Printer className="w-4 h-4" /> Print Bill
            </button>
            <button
              type="button"
              onClick={handlePrintInvoice}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-sm font-semibold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Print Invoice"
            >
              <FileText className="w-4 h-4" /> Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
