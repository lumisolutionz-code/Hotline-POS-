import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import type { WarrantyPanelProps, Warranty } from "../../../types/pos";

export function WarrantyPanel({
  onClose,
  canCreateClaim,
  onCreateClaim,
}: WarrantyPanelProps): JSX.Element {
  const [searchSaleNumber, setSearchSaleNumber] = useState<string>("");
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchSaleNumber.trim().length >= 2 && warranties.length === 0) {
        searchSalesDropdown(searchSaleNumber.trim());
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchSaleNumber, warranties]);

  const searchSalesDropdown = async (query: string) => {
    try {
      const response = await api<{ status: string; data?: { sales: any[] } }>(`/sales/search?q=${query}`);
      if (response.status === "success" && response.data?.sales) {
        setSearchResults(response.data.sales);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("Failed to fetch search results:", err);
    }
  };

  const searchWarranties = async (specificSaleNumber?: string) => {
    const numberToSearch = typeof specificSaleNumber === 'string' ? specificSaleNumber : searchSaleNumber;
    if (!numberToSearch.trim()) return;
    setLoading(true);
    setSearched(true);
    setShowDropdown(false);
    try {
      const data = await api<{
        status: string;
        data?: { sale: any };
      }>(`/sales/number/${encodeURIComponent(numberToSearch.trim())}`);
      
      if (data.status === "success" && data.data?.sale?.items) {
        if (typeof specificSaleNumber === 'string') setSearchSaleNumber(data.data.sale.saleNumber);
        // Extract warranties from sale items
        const extractedWarranties = data.data.sale.items
          .map((item: any) => item.warranty)
          .filter((warranty: any) => warranty != null);
        
        setWarranties(extractedWarranties);
      } else {
        setWarranties([]);
      }
    } catch (err) {
      console.error("Error searching warranties:", err);
      setWarranties([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "EXPIRED":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "CLAIMED":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "VOID":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-2xl min-h-[500px] max-h-[90vh] overflow-hidden border border-sky-200/50 shadow-2xl flex flex-col rounded-3xl">
        <div className="p-5 border-b border-sky-200/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 dark:text-white">
              🛡️ Warranty Lookup
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-50 rounded-xl text-slate-500 hover:text-red-500 transition-all dark:text-slate-400"
            >
              ✕
            </button>
          </div>
          
          <div className="mt-4 flex gap-2 relative">
            <input
              type="text"
              value={searchSaleNumber}
              onChange={(e) => {
                setSearchSaleNumber(e.target.value);
                if (warranties.length > 0) setWarranties([]);
              }}
              onKeyDown={(e) => e.key === "Enter" && searchWarranties()}
              onFocus={() => { if (searchResults.length > 0 && warranties.length === 0) setShowDropdown(true); }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Enter Sale Number (e.g., SL-20231015-0001)..."
              className="flex-1 px-4 py-3 bg-white border border-sky-200/50 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-sm dark:bg-slate-800 dark:text-white"
            />
            <button
              onClick={() => searchWarranties()}
              disabled={loading || !searchSaleNumber.trim()}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-blue-600 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? "..." : "🔍 Search"}
            </button>

            {/* Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-32 mt-1 bg-white dark:bg-slate-800 border border-sky-200/50 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result._id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      searchWarranties(result.saleNumber);
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
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading && (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              <div className="animate-spin w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full mx-auto mb-3"></div>
              Searching warranties...
            </div>
          )}

          {!loading && searched && warranties.length === 0 && (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-slate-500 dark:text-slate-400">
                No warranties found for this sale number
              </p>
            </div>
          )}

          {!loading &&
            warranties.map((warranty) => {
              const daysRemaining = getDaysRemaining(warranty.endDate);
              const isActive =
                warranty.status === "ACTIVE" && daysRemaining > 0;
              
              // Max claims check (assumed 3 if not present in the type, or we check if claims length >= maxClaims)
              const maxClaims = (warranty as any).maxClaims || 3;
              const claimsCount = warranty.claims ? warranty.claims.length : 0;
              const hasReachedClaimLimit = claimsCount >= maxClaims;
              const canClaimNow = isActive && !hasReachedClaimLimit;

              return (
                <div
                  key={warranty._id}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-sky-200/50 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs text-slate-500 font-mono dark:text-slate-400">
                        {warranty.warrantyNumber}
                      </span>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        {warranty.product?.name ||
                          warranty.productName ||
                          "Unknown Product"}
                      </h3>
                      {warranty.serialNumber && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          SN: {warranty.serialNumber}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(warranty.status)}`}
                    >
                      {warranty.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Customer:</span>
                      <span className="text-slate-800 ml-2 dark:text-white">
                        {warranty.customer?.name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                      <span className="text-slate-800 ml-2 dark:text-white">
                        {warranty.customer?.phone || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Type:</span>
                      <span className="text-sky-600 ml-2">
                        {warranty.warrantyType}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Expires:</span>
                      <span
                        className={`ml-2 ${daysRemaining > 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {new Date(warranty.endDate).toLocaleDateString()}
                        {daysRemaining > 0 && ` (${daysRemaining} days left)`}
                      </span>
                    </div>
                  </div>

                  {claimsCount > 0 && (
                    <div className="mb-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-amber-600 text-xs font-semibold">
                        {claimsCount} of {maxClaims} claim(s) on record
                      </span>
                    </div>
                  )}

                  {hasReachedClaimLimit && (
                    <div className="mb-3 p-2 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-red-600 text-xs font-semibold">
                        Claim limit reached ({maxClaims}/{maxClaims})
                      </span>
                    </div>
                  )}

                  {canCreateClaim && canClaimNow && (
                    <button
                      onClick={() => onCreateClaim(warranty)}
                      className="w-full py-2 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-blue-600 transition-all shadow-md"
                    >
                      📋 Create Claim
                    </button>
                  )}
                </div>
              );
            })}

          {!searched && !loading && (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-slate-500 dark:text-slate-400">
                Enter a Sale Number to search for warranties
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
