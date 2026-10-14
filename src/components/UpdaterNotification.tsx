import { useState, useEffect } from "react";
import { DownloadCloud, RefreshCw, AlertCircle, X, CheckCircle2 } from "lucide-react";

export default function UpdaterNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [updateError, setUpdateError] = useState<{ message: string; hint?: string } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!window.ipcRenderer) return;

    const handleUpdateAvailable = (_event: any, info: any) => {
      setUpdateAvailable(true);
      setUpdateVersion(info?.version || null);
      setUpdateError(null);
      setIsDismissed(false);
    };

    const handleUpdateProgress = (_event: any, progressObj: any) => {
      setUpdateAvailable(true);
      if (progressObj?.percent) {
        setDownloadProgress(Math.round(progressObj.percent));
      }
    };

    const handleUpdateDownloaded = (_event: any, info: any) => {
      setUpdateAvailable(false);
      setUpdateDownloaded(true);
      setUpdateVersion(info?.version || null);
      setUpdateError(null);
      setIsDismissed(false);
    };

    const handleUpdateError = (_event: any, errData: any) => {
      console.warn("AutoUpdater Notification received error:", errData);
      setUpdateAvailable(false);
      if (errData?.is404) {
        setUpdateError({
          message: "Unable to check updates: GitHub returned 404",
          hint: "Your GitHub repo is set to Private. Make it Public on GitHub (Settings → Change visibility to Public) so client computers can detect and download updates.",
        });
      }
    };

    window.ipcRenderer.on("update-available", handleUpdateAvailable);
    window.ipcRenderer.on("update-progress", handleUpdateProgress);
    window.ipcRenderer.on("update-downloaded", handleUpdateDownloaded);
    window.ipcRenderer.on("update-error", handleUpdateError);

    return () => {
      window.ipcRenderer.off("update-available", handleUpdateAvailable);
      window.ipcRenderer.off("update-progress", handleUpdateProgress);
      window.ipcRenderer.off("update-downloaded", handleUpdateDownloaded);
      window.ipcRenderer.off("update-error", handleUpdateError);
    };
  }, []);

  const handleRestart = () => {
    if (window.ipcRenderer) {
      window.ipcRenderer.send("restart_app");
    }
  };

  if (isDismissed) return null;
  if (!updateAvailable && !updateDownloaded && !updateError) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[99999] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 min-w-[340px] max-w-[420px] text-white">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {updateDownloaded ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : updateError ? (
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 animate-pulse">
                <DownloadCloud className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold leading-tight">
                  {updateDownloaded
                    ? "Update Ready to Install!"
                    : updateError
                    ? "Auto-Update Notice"
                    : "Downloading New Version..."}
                </h3>
                {updateVersion && (
                  <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded-md">
                    v{updateVersion}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                {updateDownloaded
                  ? "The update has been downloaded. Click below to restart and apply."
                  : updateError
                  ? updateError.message
                  : `Downloading update in background... ${downloadProgress > 0 ? downloadProgress + "%" : ""}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Download Progress Bar */}
        {updateAvailable && !updateDownloaded && downloadProgress > 0 && (
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            ></div>
          </div>
        )}

        {/* Private Repo Hint */}
        {updateError?.hint && (
          <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 leading-relaxed">
            {updateError.hint}
          </p>
        )}

        {/* Action Button */}
        {updateDownloaded && (
          <button
            onClick={handleRestart}
            className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            Restart POS to Update
          </button>
        )}
      </div>
    </div>
  );
}
