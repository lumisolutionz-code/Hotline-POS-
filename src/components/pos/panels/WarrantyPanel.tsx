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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl min-h-[500px] max-h-[90vh] overflow-hidden border border-slate-800/80 shadow-2xl flex flex-col rounded-2xl">
        {/* Header */}
        <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-white tracking-wide">
                Warranty Lookup
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#1e293b] text-blue-400 border border-blue-900/60">
                WARRANTY
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Search and verify customer device warranties
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex gap-2 relative">
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
              className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm shadow-sm font-mono"
            />
            <button
              onClick={() => searchWarranties()}
              disabled={loading || !searchSaleNumber.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl disabled:opacity-50 transition-all shadow-sm flex items-center justify-center cursor-pointer"
            >
              {loading ? "Searching..." : "Search"}
            </button>

            {/* Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-28 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result._id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      searchWarranties(result.saleNumber);
                    }}
                    className="p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-blue-50/60 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-sm text-blue-600 dark:text-blue-400 font-bold">{result.saleNumber}</span>
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
                  className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs text-slate-500 font-mono dark:text-slate-400">
                        {warranty.warrantyNumber}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {warranty.product?.name ||
                          warranty.productName ||
                          "Unknown Product"}
                      </h3>
                      {warranty.serialNumber && (
                        <p className="text-xs text-slate-500 font-mono dark:text-slate-400 mt-0.5">
                          SN: {warranty.serialNumber}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(warranty.status)}`}
                    >
                      {warranty.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3.5 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <div>
                      <span className="text-slate-400 dark:text-slate-400">Customer:</span>
                      <span className="text-slate-800 ml-1.5 font-medium dark:text-white">
                        {warranty.customer?.name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-400">Phone:</span>
                      <span className="text-slate-800 ml-1.5 font-medium dark:text-white">
                        {warranty.customer?.phone || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-400">Type:</span>
                      <span className="text-blue-600 ml-1.5 font-semibold">
                        {warranty.warrantyType}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-400">Expires:</span>
                      <span
                        className={`ml-1.5 font-medium ${daysRemaining > 0 ? "text-emerald-500" : "text-rose-500"}`}
                      >
                        {new Date(warranty.endDate).toLocaleDateString()}
                        {daysRemaining > 0 && ` (${daysRemaining}d left)`}
                      </span>
                    </div>
                  </div>

                  {claimsCount > 0 && (
                    <div className="mb-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-amber-700 text-xs font-semibold">
                        {claimsCount} of {maxClaims} claim(s) on record
                      </span>
                    </div>
                  )}

                  {hasReachedClaimLimit && (
                    <div className="mb-3 p-2 bg-rose-50 rounded-lg border border-rose-200">
                      <span className="text-rose-600 text-xs font-semibold">
                        Claim limit reached ({maxClaims}/{maxClaims})
                      </span>
                    </div>
                  )}

                  {canCreateClaim && canClaimNow && (
                    <button
                      onClick={() => onCreateClaim(warranty)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Create Warranty Claim</span>
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
