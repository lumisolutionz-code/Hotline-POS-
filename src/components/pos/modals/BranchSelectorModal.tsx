import { useState, useEffect } from "react";
import { Store, X } from "lucide-react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../contexts/AuthContext";

export function BranchSelectorModal({ onClose }: { onClose: () => void }) {
  const { branchId, switchBranch } = useAuth();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<any>("/branches")
      .then(res => {
        if (res.status === "success" && res.data) {
          setBranches(res.data.branches || []);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (id: string) => {
    if (id === branchId) {
      onClose();
      return;
    }
    setSaving(true);
    const res = await switchBranch(id);
    if (res.success) {
      onClose();
      window.location.reload();
    } else {
      setError(res.error || "Failed to switch branch");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-800/80 overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        {/* Header: Deep Dark Slate (#0f172a) */}
        <div className="px-6 py-4 bg-[#0f172a] text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-extrabold shadow-md shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  Select Branch
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#1e293b] text-blue-400 border border-blue-900/60">
                  LOCATION
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Switch active POS terminal store
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
        <div className="p-5 overflow-y-auto">
          {error && <div className="p-3 mb-4 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl">{error}</div>}
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {branches.map(b => (
                <button
                  key={b._id}
                  onClick={() => handleSelect(b._id)}
                  disabled={saving}
                  className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer ${ b._id === branchId ? "border-2 border-blue-500 bg-blue-50/20 shadow-xs ring-2 ring-blue-500/20" : "border-slate-200/90 hover:border-slate-300 hover:bg-slate-50" }`}
                >
                  <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                    <span>{b.name}</span>
                    {b._id === branchId && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Active</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-1">Code: {b.code}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
