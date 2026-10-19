import { useState, useEffect } from "react";
import { RotateCcw, X, Search, Loader2, Check, ShoppingCart, ArrowLeftRight } from "lucide-react";
import { apiGet, apiPost } from "../../../lib/api";
import { PermissionOverrideModal } from "../modals/PermissionOverrideModal";
import type { ReturnsPanelProps } from "../../../types/pos";

export function ReturnsPanel({ onClose, onInitiateExchange }: ReturnsPanelProps): JSX.Element {
  const [saleNumber, setSaleNumber] = useState<string>("");
  const [sale, setSale] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: { selected: boolean; quantity: number; condition: string; destination: string };
  }>({});
  const [reason, setReason] = useState<string>("CHANGED_MIND");
  const [returnStatus, setReturnStatus] = useState<"PARTIAL_RETURN" | "FULL_RETURN">("PARTIAL_RETURN");
  const [resolution, setResolution] = useState<"REFUND" | "EXCHANGE">("REFUND");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [overrideAction, setOverrideAction] = useState<string>("");
  const [overrideIdParam, setOverrideIdParam] = useState<string | undefined>(undefined);


  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (saleNumber.trim().length >= 2 && !sale) {
        searchSalesDropdown(saleNumber.trim());
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [saleNumber, sale]);

  const searchSalesDropdown = async (query: string) => {
    try {
      const response = await apiGet<any>(`/sales/search?q=${query}`);
      if (response.status === "success" && response.data?.sales) {
        setSearchResults(response.data.sales);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("Failed to fetch search results:", err);
    }
  };

  const searchSale = async (specificSaleNumber?: string) => {
    const numberToSearch = typeof specificSaleNumber === 'string' ? specificSaleNumber : saleNumber;
    if (!numberToSearch.trim()) return;
    setSearchLoading(true);
    setError(null);
    setSale(null);
    setSelectedItems({});
    setResolution("REFUND");
    setShowDropdown(false);

    try {
      const response = await apiGet<any>(`/sales/number/${numberToSearch.trim()}`);
      if (response.status === "success" && response.data?.sale) {
        const foundSale = response.data.sale;
        setSale(foundSale);
        if (typeof specificSaleNumber === 'string') setSaleNumber(foundSale.saleNumber);
        const initialSelection: {
          [key: string]: { selected: boolean; quantity: number; condition: string; destination: string };
        } = {};
        foundSale.items?.forEach((item: any) => {
          const remaining = Math.max(0, (item.quantity || 1) - (item.returnedQuantity || 0));
          initialSelection[item._id] = {
            selected: false,
            quantity: remaining > 0 ? remaining : (item.quantity || 1),
            condition: "GOOD",
            destination: "RETURN_TO_STOCK",
          };
        });
        setSelectedItems(initialSelection);
      } else {
        setError("Sale not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to find sale");
    } finally {
      setSearchLoading(false);
    }
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const updated = {
        ...prev,
        [itemId]: { ...prev[itemId], selected: !prev[itemId]?.selected },
      };
      if (sale?.items?.length) {
        const allSelected = sale.items.every((it: any) => updated[it._id]?.selected);
        setReturnStatus(allSelected ? "FULL_RETURN" : "PARTIAL_RETURN");
      }
      return updated;
    });
  };

  const updateItemReturnData = (itemId: string, field: string, value: any) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const calculateRefund = () => {
    if (!sale?.items) return 0;
    return sale.items.reduce((total: number, item: any) => {
      const selection = selectedItems[item._id];
      if (selection?.selected) {
        return total + (item.unitPrice || 0) * selection.quantity;
      }
      return total;
    }, 0);
  };

  const refundAmount = calculateRefund();
  const hasSelectedItems = Object.values(selectedItems).some((s) => s.selected);

  const processReturn = async (overrideId?: string) => {
    if (!sale) return;

    // Local 7-day expiration check
    const daysSinceSale = Math.floor((Date.now() - new Date(sale.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = daysSinceSale > 7;

    if (isExpired && !overrideId && !overrideIdParam) {
      setOverrideAction(resolution === "EXCHANGE" ? "EXCHANGE_EXPIRED" : "RETURN_EXPIRED");
      setShowOverrideModal(true);
      setError("Return window of 7 days has expired. Manager authorization required.");
      return;
    }

    const currentOverrideId = overrideId || overrideIdParam;

    const itemsToReturn = sale.items
      .filter((item: any) => selectedItems[item._id]?.selected)
      .map((item: any) => {
        const sel = selectedItems[item._id];
        const isDefective = sel?.condition === "DEFECTIVE";
        return {
          saleItemId: item._id,
          productId: item.product?._id || item.product,
          stockItemId: item.stockItem?._id || item.stockItem,
          serialNumber: item.serialNumber,
          imei1: item.imei1,
          quantity: sel?.quantity || item.quantity,
          condition: sel?.condition || "GOOD",
          destination: isDefective ? "DEFECTIVE_INVENTORY" : "RETURN_TO_STOCK",
        };
      });

    if (itemsToReturn.length === 0) {
      setError("Please select at least one item to return");
      return;
    }

    if (resolution === "EXCHANGE") {
      if (onInitiateExchange) {
        onInitiateExchange(
          {
            originalSaleId: sale._id,
            items: itemsToReturn,
            reason,
            returnType: "EXCHANGE",
            authorizationOverrideId: currentOverrideId,
          },
          refundAmount
        );
      }
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        originalSaleId: sale._id,
        returnType: resolution,
        returnStatus,
        items: itemsToReturn,
        reason,
        refundMethod: "CASH",
        authorizationOverrideId: currentOverrideId,
      };

      const response = await apiPost<any>("/returns", payload);
      if (response.status === "success") {
        setSuccess(
          `Return processed! Refund: Rs. ${response.data?.return?.refundAmount?.toFixed(2) || response.data?.summary?.totalRefund?.toFixed(2)}`
        );
        setTimeout(() => {
          setSale(null);
          setSelectedItems({});
          setSaleNumber("");
          setSuccess(null);
          setOverrideIdParam(undefined);
        }, 3000);
      } else {
        if (response.requiresOverride || response.returnWindowExpired) {
          setOverrideAction("RETURN_EXPIRED");
          setShowOverrideModal(true);
          setError(response.message || "Manager authorization required.");
        } else {
          throw new Error(response.message || "Failed to process return");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to process return");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-4xl border border-slate-800/80 shadow-2xl overflow-hidden min-h-[550px] max-h-[95vh] flex flex-col text-slate-800">
        {/* Header: Deep Dark Slate (#0f172a) */}
        <div className="px-6 py-4 bg-[#0f172a] text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-extrabold shadow-md shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  Process Return / Exchange
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#1e293b] text-blue-400 border border-blue-900/60">
                  RETURNS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Lookup original invoice and process refund or exchange credit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-5 overflow-y-auto flex flex-col md:flex-row gap-6">
          {/* Left Column: Original Sale */}
          <div className="flex-1 space-y-4">
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={saleNumber}
                onChange={(e) => {
                  setSaleNumber(e.target.value);
                  if (sale) setSale(null);
                }}
                placeholder="Enter Sale Number (e.g., SL-20260128-0001)"
                className="flex-1 px-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-xs transition-all"
                onKeyDown={(e) => e.key === "Enter" && searchSale()}
                onFocus={() => { if (searchResults.length > 0 && !sale) setShowDropdown(true); }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              <button
                onClick={() => searchSale()}
                disabled={searchLoading || !saleNumber.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-xs text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {searchLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Finding...
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    Find
                  </>
                )}
              </button>

              {/* Autocomplete Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-28 mt-1 bg-white dark:bg-slate-800 border border-sky-200/50 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result._id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        searchSale(result.saleNumber);
                      }}
                      className="p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-sm text-sky-600 dark:text-sky-400 font-bold">{result.saleNumber}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(result.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span>{result.customer?.name || "Walk-in Customer"} {result.customer?.phone ? `(${result.customer.phone})` : ""}</span>
                        <span className="font-semibold">Rs. {result.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>}
            {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600">{success}</div>}

            {sale && (
              <>
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-sky-200/50 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 dark:text-slate-400">Sale #</span>
                    <span className="text-slate-800 font-mono dark:text-white">{sale.saleNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Date</span>
                    <span className="text-slate-800 dark:text-white">{new Date(sale.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-600 uppercase dark:text-slate-400">Select Items to Return</h4>
                  {sale.items?.map((item: any) => {
                    const remaining = item.quantity - (item.returnedQuantity || 0);
                    if (remaining <= 0) return null;
                    return (
                      <div
                        key={item._id}
                        className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border-2 transition-all shadow-sm ${selectedItems[item._id]?.selected ? "border-sky-500" : "border-sky-100"}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            onClick={() => toggleItem(item._id)}
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${selectedItems[item._id]?.selected ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"}`}
                          >
                            {selectedItems[item._id]?.selected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-800 font-medium dark:text-white">{item.productName}</p>
                            {(item.serialNumber || item.imei1) && (
                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {item.serialNumber && <span>SN: {item.serialNumber} </span>}
                                {item.imei1 && <span>IMEI: {item.imei1}</span>}
                              </p>
                            )}
                            <p className="text-slate-500 text-sm dark:text-slate-400">Rs. {item.unitPrice?.toFixed(2)} × {remaining} (Max)</p>
                            
                            {selectedItems[item._id]?.selected && (
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-semibold text-slate-500">Return Qty:</label>
                                  <span className="w-16 text-center bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded py-1 text-slate-700 dark:text-slate-300 text-sm font-medium select-none cursor-default block">
                                    {selectedItems[item._id]?.quantity || 1}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Condition:</label>
                                  <select 
                                    value={selectedItems[item._id]?.condition || "GOOD"}
                                    onChange={(e) => {
                                      updateItemReturnData(item._id, "condition", e.target.value);
                                      updateItemReturnData(item._id, "destination", e.target.value === "DEFECTIVE" ? "DEFECTIVE_INVENTORY" : "RETURN_TO_STOCK");
                                    }}
                                    className="flex-1 bg-white border border-sky-200 rounded py-1 px-2 text-slate-800 text-sm font-medium"
                                  >
                                    <option value="GOOD" className="bg-white text-slate-800">Good (Return to Stock)</option>
                                    <option value="DEFECTIVE" className="bg-white text-slate-800">Defective (Move to Defective Inventory)</option>
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-1.5 dark:text-slate-400">Return Status</label>
                    <select
                      value={returnStatus}
                      onChange={(e) => setReturnStatus(e.target.value as "PARTIAL_RETURN" | "FULL_RETURN")}
                      className="w-full px-3.5 py-2.5 bg-white border border-sky-300 rounded-xl text-slate-800 shadow-sm focus:border-sky-500 font-medium text-sm"
                    >
                      <option value="PARTIAL_RETURN" className="bg-white text-slate-800">Partial Return</option>
                      <option value="FULL_RETURN" className="bg-white text-slate-800">Full Return</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase block mb-1.5 dark:text-slate-400">Return Reason</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-sky-300 rounded-xl text-slate-800 shadow-sm focus:border-sky-500 font-medium text-sm"
                    >
                      <option value="DEFECTIVE" className="bg-white text-slate-800">Defective Product</option>
                      <option value="WRONG_ITEM" className="bg-white text-slate-800">Wrong Item</option>
                      <option value="CHANGED_MIND" className="bg-white text-slate-800">Customer Changed Mind</option>
                      <option value="NOT_AS_DESCRIBED" className="bg-white text-slate-800">Not as Described</option>
                      <option value="OTHER" className="bg-white text-slate-800">Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Resolution & Exchange */}
          {sale && hasSelectedItems && (
            <div className="flex-1 flex flex-col space-y-4 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-semibold text-slate-600 uppercase dark:text-slate-400">Resolution</h4>
              <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-700 rounded-lg">
                <button
                  onClick={() => setResolution("REFUND")}
                  className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${resolution === "REFUND" ? "bg-white dark:bg-slate-600 shadow text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-600/50 hover:text-slate-700 dark:hover:text-slate-200"}`}
                >
                  Issue Refund
                </button>
                <button
                  onClick={() => setResolution("EXCHANGE")}
                  className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${resolution === "EXCHANGE" ? "bg-white dark:bg-slate-600 shadow text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-600/50 hover:text-sky-600 dark:hover:text-sky-400"}`}
                >
                  Exchange Items
                </button>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500 font-medium">Return Value</span>
                  <span className="text-lg font-bold text-sky-600">Rs. {refundAmount.toFixed(2)}</span>
                </div>
              </div>

              {resolution === "EXCHANGE" && (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] text-center p-6 border border-dashed border-slate-200 rounded-xl mt-4 bg-slate-50/50">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 border border-blue-100">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Continue in Main Order</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Click "Add Exchange to Order" below to add this return credit to the current order. 
                    Then, you can use the main search to add the new exchange items.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 flex gap-3 bg-white">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-semibold text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => processReturn()}
            disabled={loading || !hasSelectedItems}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : resolution === "EXCHANGE" ? (
              <>
                <ArrowLeftRight className="w-4 h-4" />
                Add Exchange to Order
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Issue Refund
              </>
            )}
          </button>
        </div>
      </div>
      
      {showOverrideModal && (
        <PermissionOverrideModal
          permission={overrideAction}
          onClose={() => setShowOverrideModal(false)}
          onSuccess={(overrideId) => {
            setShowOverrideModal(false);
            setOverrideIdParam(overrideId);
            processReturn(overrideId);
          }}
        />
      )}
    </div>
  );
}
