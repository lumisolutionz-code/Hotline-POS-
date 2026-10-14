import { useState } from "react";
import { api } from "../../../lib/api";

export function PermissionOverrideModal({
  permission,
  onClose,
  onSuccess,
}: {
  permission: string;
  onClose: () => void;
  onSuccess: (overrideId: string) => void;
}) {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!barcode.trim()) {
      setError("Barcode is required");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await api<{ status: string; message?: string; data?: { overrideId: string } }>("/permission-overrides/verify", {
        method: "POST",
        body: JSON.stringify({ 
          barcodeValue: barcode.trim(), 
          permission,
          action: `${permission} Override` 
        }),
      });

      if (res.status === "success" && res.data?.overrideId) {
        onSuccess(res.data.overrideId);
      } else {
        setError(res.message || "Invalid barcode or insufficient permissions");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify barcode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-800/80 overflow-hidden flex flex-col text-slate-800">
        {/* Header: Deep Dark Slate (#0f172a) */}
        <div className="px-6 py-4 bg-[#0f172a] text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
              🔒
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Manager Override</h2>
              <p className="text-[11px] text-slate-400 font-mono">Authorization required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">
          <p className="text-xs text-slate-600 mb-4 text-center">
            Scan or enter a manager barcode to authorize <strong className="text-slate-900 font-mono">{permission}</strong>.
          </p>

          {error && <div className="p-3 mb-4 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl text-center">{error}</div>}

          <input
            type="password"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleVerify();
            }}
            placeholder="Scan Barcode"
            className="w-full px-4 py-3 text-center bg-white border-2 border-blue-500 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 mb-4 font-mono tracking-widest text-lg"
            autoFocus
            disabled={loading}
          />

          <button
            onClick={handleVerify}
            disabled={loading || !barcode.trim()}
            className="w-full py-2.5 bg-[#0f172a] hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                Authorize
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
