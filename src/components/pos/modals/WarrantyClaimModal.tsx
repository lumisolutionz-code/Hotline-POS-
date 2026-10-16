import { useState, useEffect } from "react";
import { Scan, Wrench, ArrowLeftRight, Banknote, ClipboardList, X, Check, Package, AlertTriangle } from "lucide-react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../contexts/AuthContext";
import type { WarrantyClaimModalProps } from "../../../types/pos";

export function WarrantyClaimModal({
  warranty,
  onClose,
  onSuccess,
}: WarrantyClaimModalProps): JSX.Element {
  const { branchId } = useAuth();
  const [issue, setIssue] = useState<string>("");
  const [resolution, setResolution] = useState<"REPAIR" | "REPLACE" | "REFUND">(
    "REPAIR",
  );
  const [replacementSerialNumber, setReplacementSerialNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  
  const [replacementProduct, setReplacementProduct] = useState<any>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [result, setResult] = useState<{
    claimNumber?: string;
    resolutionResult?: {
      createdRepairJob?: string;
      linkedRepairJob?: string;
      replacedProduct?: string;
      stockDeducted?: number;
      claimCost?: number;
      refundAmount?: number;
      returnNumber?: string;
      warrantyVoided?: boolean;
    };
  } | null>(null);

  const [technicians, setTechnicians] = useState<{ _id: string; username: string }[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");

  useEffect(() => {
    if (resolution === "REPAIR") {
      const fetchTechnicians = async () => {
        try {
          const res = await api<{ status: string; data?: { users: any[] } }>("/users");
          if (res.status === "success" && res.data?.users) {
            const techs = res.data.users.filter((u: any) => 
              u.roles?.some((r: any) => r.name === "TECHNICIAN") &&
              (!u.branch || u.branch === branchId || u.branch?._id === branchId)
            );
            setTechnicians(techs);
          } else {
            console.error("Failed to load users:", res);
          }
        } catch (err) {
          console.error("Error fetching technicians:", err);
        }
      };
      fetchTechnicians();
    }
  }, [resolution, technicians.length]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (resolution === "REPLACE" && replacementSerialNumber.trim().length >= 3) {
        setLookupLoading(true);
        setError("");
        try {
          const res = await api<{ status?: string; data?: any }>(`/inventory/lookup/serial/${encodeURIComponent(replacementSerialNumber.trim())}`);
          if (res.status === "success" && res.data?.stockItem?.product) {
            setReplacementProduct(res.data.stockItem.product);
          } else {
            setReplacementProduct(null);
          }
        } catch (err: any) {
          setReplacementProduct(null);
        } finally {
          setLookupLoading(false);
        }
      } else if (replacementSerialNumber.trim().length === 0) {
        setReplacementProduct(null);
        setError("");
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [replacementSerialNumber, resolution]);

  const resolutionInfo = {
    REPAIR: {
      icon: Wrench,
      title: "Repair",
      description: "Create a repair job for the technician to fix the product",
    },
    REPLACE: {
      icon: ArrowLeftRight,
      title: "Replace",
      description: "Deduct a new product from inventory as replacement",
    },
    REFUND: {
      icon: Banknote,
      title: "Refund",
      description: "Refund the customer and void this warranty",
    },
  };

  const handleSubmit = async () => {
    if (!issue.trim()) {
      setError("Please describe the issue");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await api<{
        status: string;
        message?: string;
        data?: { newClaim?: { claimNumber: string }; resolutionResult?: any };
      }>(`/warranties/${warranty._id}/claims`, {
        method: "POST",
        body: JSON.stringify({
          issue: issue.trim(),
          resolution,
          technicianId: resolution === "REPAIR" && selectedTechnician ? selectedTechnician : undefined,
          replacementSerialNumber: resolution === "REPLACE" ? replacementSerialNumber.trim() || undefined : undefined,
          replacementProductId: resolution === "REPLACE" && replacementProduct ? replacementProduct._id : undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (data.status === "success") {
        setSuccess(true);
        setResult({
          claimNumber: data.data?.newClaim?.claimNumber,
          resolutionResult: data.data?.resolutionResult,
        });
      } else {
        setError(data.message || "Failed to create claim");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create claim");
    } finally {
      setLoading(false);
    }
  };

  if (success && result) {
    const ResIcon = resolutionInfo[resolution].icon;
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden border border-slate-800/80 shadow-2xl">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-200">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-slate-800 text-center mt-3">
              Claim Created Successfully!
            </h2>
            <p className="text-slate-500 text-center mt-0.5 text-xs">
              {result.claimNumber && (
                <span className="text-blue-600 font-mono font-bold">{result.claimNumber}</span>
              )}
            </p>
          </div>

          <div className="p-5 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <ResIcon className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-800 text-sm">
                  {resolutionInfo[resolution].title} Resolution
                </span>
              </div>

              {resolution === "REPAIR" && result.resolutionResult && (
                <div className="space-y-1.5 text-xs">
                  {result.resolutionResult.createdRepairJob && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">New Repair Job:</span>
                      <span className="text-blue-600 font-mono font-bold">
                        {result.resolutionResult.createdRepairJob}
                      </span>
                    </div>
                  )}
                  <p className="text-slate-500 mt-2 text-[11px] flex items-center gap-1">
                    <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                    Technician can find this job in the Repairs panel
                  </p>
                </div>
              )}

              {resolution === "REPLACE" && result.resolutionResult && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Replaced Product:</span>
                    <span className="text-sky-600 dark:text-sky-400 font-semibold">
                      {result.resolutionResult.replacedProduct}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Stock Deducted:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">
                      {result.resolutionResult.stockDeducted} unit
                    </span>
                  </div>
                </div>
              )}

              {resolution === "REFUND" && result.resolutionResult && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Refund Amount:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Rs. {result.resolutionResult.refundAmount?.toLocaleString()}
                    </span>
                  </div>
                  {result.resolutionResult.returnNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Return Number:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono">
                        {result.resolutionResult.returnNumber}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-2 text-sm border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Customer:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {warranty.customer?.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Product:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {warranty.product?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Warranty Status:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  {resolution === "REFUND" ? "VOIDED" : "CLAIM_PENDING"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-700/80 flex gap-3">
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden border border-slate-800/80 shadow-2xl flex flex-col text-slate-800">
        {/* Header: Deep Dark Slate (#0f172a) */}
        <div className="px-6 py-4 bg-[#0f172a] text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-extrabold shadow-md shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  Create Warranty Claim
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#1e293b] text-blue-400 border border-blue-900/60">
                  WARRANTY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {warranty.warrantyNumber} • {warranty.product?.name || "Product"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">
              Issue Description *
            </label>
            <textarea required
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Describe the customer's issue..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">
              Resolution
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["REPAIR", "REPLACE", "REFUND"] as const).map((res) => {
                const info = resolutionInfo[res];
                const ResIcon = info.icon;
                const isSelected = resolution === res;
                return (
                  <button
                    type="button"
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`py-2.5 px-3 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <ResIcon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-500"}`} />
                    {info.title}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500 text-center dark:text-slate-400">
              {resolutionInfo[resolution].description}
            </p>
          </div>

          {resolution === "REPAIR" && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Assign Technician *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const fetchTechnicians = async () => {
                      try {
                        const res = await api<{ status: string; data?: { users: any[] } }>("/users");
                        if (res.status === "success" && res.data?.users) {
                          const techs = res.data.users.filter((u: any) => 
                            u.roles?.some((r: any) => r.name === "TECHNICIAN") &&
                            (!u.branch || u.branch === branchId || u.branch?._id === branchId)
                          );
                          setTechnicians(techs);
                        } else {
                          console.error("Failed to fetch technicians:", res);
                        }
                      } catch (err) {
                        console.error("Error fetching technicians:", err);
                      }
                    };
                    fetchTechnicians();
                  }}
                  className="text-xs text-sky-500 hover:text-sky-600 flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Refresh List
                </button>
              </div>
              <select required
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="" className="bg-white text-slate-800">-- Select Technician --</option>
                {technicians.map((tech) => (
                  <option key={tech._id} value={tech._id} className="bg-white text-slate-800">
                    {tech.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          {resolution === "REPLACE" && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs flex items-start gap-2.5">
                <Package className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  This will deduct 1 unit of{" "}
                  <strong>{warranty.product?.name || "this product"}</strong> from
                  inventory.
                </span>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                  Replacement Product (Scan IMEI / Serial / Barcode) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={replacementSerialNumber}
                    onChange={(e) => setReplacementSerialNumber(e.target.value)}
                    placeholder="Scan IMEI/Serial..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium text-xs"
                  />
                  <div 
                    title="Auto-scans as you type"
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    {lookupLoading ? "..." : <Scan className="w-4 h-4" />}
                  </div>
                </div>
                
                {replacementProduct && (
                  <div className="mt-2.5 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{replacementProduct.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Barcode/Code: {replacementProduct.barcode || replacementProduct.itemCode || "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Replacement Cost</p>
                        <p className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                          Rs. {(replacementProduct.sellingPrice || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Original Product Value:</span>
                        <span className="font-mono">Rs. {((warranty.product as any)?.sellingPrice || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold mt-1">
                        <span className={replacementProduct.sellingPrice > (warranty.product as any)?.sellingPrice ? "text-rose-600" : "text-emerald-700"}>
                          Difference (Absorbed by shop):
                        </span>
                        <span className={`font-mono ${replacementProduct.sellingPrice > (warranty.product as any)?.sellingPrice ? "text-rose-600" : "text-emerald-700"}`}>
                          Rs. {Math.abs((replacementProduct.sellingPrice || 0) - ((warranty.product as any)?.sellingPrice || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {resolution === "REFUND" && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                This will <strong>void the warranty</strong> and create a refund
                record. This action cannot be undone.
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-300">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none font-medium"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl px-5 py-2.5 font-semibold text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (resolution === "REPLACE" && !replacementProduct)}
            className="px-6 py-2.5 bg-[#0f172a] hover:bg-slate-800 active:scale-[0.99] text-white rounded-xl font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
          >
            {loading
              ? "Creating..."
              : `Create ${resolutionInfo[resolution].title} Claim`}
          </button>
        </div>
      </form>
    </div>
  );
}
