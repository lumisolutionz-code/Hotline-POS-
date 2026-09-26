import { useState, useEffect } from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh] dark:bg-slate-800">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Select Branch</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 dark:hover:bg-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {branches.map(b => (
                <button
                  key={b._id}
                  onClick={() => handleSelect(b._id)}
                  disabled={saving}
                  className={`w-full p-4 rounded-xl text-left border transition-all ${ b._id === branchId ? "border-sky-500 bg-sky-50 ring-2 ring-sky-500/20" : "border-slate-200 hover:border-sky-300 hover:bg-slate-50" }`}
                >
                  <div className="font-semibold text-slate-800 dark:text-white">{b.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Code: {b.code}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
