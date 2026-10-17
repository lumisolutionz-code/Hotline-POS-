import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PERMISSIONS } from "../constants/permission";
import logo from "../assets/logo.png";
const API_URL = (import.meta.env.VITE_API_URL as string) || "https://api.hotlinecellular.lk/api/v1";

export default function Login(): JSX.Element {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState<{ _id: string; name: string }[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchError, setBranchError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [appVersion, setAppVersion] = useState("1.2.1");
  const navigate = useNavigate();
  const { login, isAuthenticated, hasPermission, user } = useAuth();

  useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke("get_app_version").then((ver: string) => {
        if (ver) setAppVersion(ver);
      }).catch(() => {});
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectBasedOnPermissions();
    }
  }, [isAuthenticated, user]);

  const fetchBranches = async () => {
    setBranchesLoading(true);
    setBranchError("");
    try {
      const res = await fetch(`${API_URL}/branches/public`);
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.data?.branches)) {
        setBranches(data.data.branches);
        if (data.data.branches.length > 0) {
          setBranchId(data.data.branches[0]._id);
        } else {
          setBranchError("No active branches found");
        }
      } else {
        setBranchError("Invalid branch data received");
      }
    } catch (err: any) {
      console.error("Failed to fetch branches", err);
      setBranchError("Could not connect to backend server");
    } finally {
      setBranchesLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);
  const redirectBasedOnPermissions = () => {
    // Check which page user should go to
    if (hasPermission(PERMISSIONS.CREATE_SALE)) {
      navigate("/pos", { replace: true });
    } else if (hasPermission(PERMISSIONS.DEVICE_REPAIR)) {
      navigate("/repairs", { replace: true });
    } else if (hasPermission(PERMISSIONS.VIEW_SALES_REPORT)) {
      navigate("/reports", { replace: true });
    } else {
      // No specific access - show error or default page
      setError("You don't have access to any POS features. Contact admin.");
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(username, password, branchId);
    if (result.success) {
      // Redirect will happen via useEffect
    } else {
      setError(result.error || "Login failed");
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl blur opacity-20"></div>
        <div className="relative bg-white/95 dark:bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-xl border border-sky-200/50 dark:border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-sky-100/20 dark:shadow-none">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logo} alt="Hotline Cellular" className="h-20 mx-auto mb-4 object-contain drop-shadow-sm" />
            <p className="text-slate-600 mt-1 dark:text-slate-400">Sign in to your account</p>
          </div>
          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Branch
                </label>
                {branchError && (
                  <button
                    type="button"
                    onClick={fetchBranches}
                    className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 font-medium underline"
                  >
                    Retry
                  </button>
                )}
              </div>
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  disabled={branchesLoading || branches.length === 0}
                  className="w-full pl-12 pr-10 py-3 bg-white border border-sky-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 transition-all appearance-none disabled:opacity-75 font-medium"
                  required
                >
                  {branchesLoading && <option value="" className="bg-white text-slate-800">Loading branches...</option>}
                  {!branchesLoading && branches.length === 0 && (
                    <option value="" className="bg-white text-slate-800">{branchError || "No branches available"}</option>
                  )}
                  {branches.map((b) => (
                    <option key={b._id} value={b._id} className="bg-white text-slate-800">{b.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  {branchesLoading ? (
                    <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
              {branchError && (
                <p className="mt-1.5 text-xs text-red-500">{branchError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white border border-sky-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 transition-all font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white border border-sky-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 transition-all font-medium"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold rounded-xl hover:from-sky-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Hotline POS System v{appVersion}
          </p>
        </div>
      </div>
    </div>
  );
}
