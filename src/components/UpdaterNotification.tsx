import { useState, useEffect } from "react";
import { DownloadCloud, RefreshCw } from "lucide-react";

export default function UpdaterNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);

  useEffect(() => {
    // We must check if window.ipcRenderer exists before using it
    if (!window.ipcRenderer) return;

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    const handleUpdateDownloaded = () => {
      setUpdateAvailable(false);
      setUpdateDownloaded(true);
    };

    // Listen for update available
    window.ipcRenderer.on("update-available", handleUpdateAvailable);

    // Listen for update downloaded
    window.ipcRenderer.on("update-downloaded", handleUpdateDownloaded);

    return () => {
      window.ipcRenderer.off("update-available", handleUpdateAvailable);
      window.ipcRenderer.off("update-downloaded", handleUpdateDownloaded);
    };
  }, []);

  const handleRestart = () => {
    if (window.ipcRenderer) {
      window.ipcRenderer.send("restart_app");
    }
  };

  if (!updateAvailable && !updateDownloaded) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 shadow-xl rounded-lg p-4 flex flex-col gap-3 min-w-[320px]">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-full text-blue-400">
            <DownloadCloud size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {updateDownloaded ? "Update Ready!" : "Downloading Update..."}
            </h3>
            <p className="text-sm text-slate-400">
              {updateDownloaded
                ? "A new version of the POS is ready to install."
                : "A new version is downloading in the background."}
            </p>
          </div>
        </div>

        {updateDownloaded && (
          <button
            onClick={handleRestart}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            <RefreshCw size={16} />
            Restart to Install
          </button>
        )}
      </div>
    </div>
  );
}
