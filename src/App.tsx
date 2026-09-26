import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { PERMISSIONS } from "./constants/permission";
import Login from "./pages/Login";
import POS from "./pages/POS";
import Settings from "./pages/Settings";
import UpdaterNotification from "./components/UpdaterNotification";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Public routes */}
          <Route path="/login" element={<Login />} />
          {/* Protected POS route - requires CREATE_SALE */}
          <Route
            path="/pos"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.CREATE_SALE}>
                <POS />
              </ProtectedRoute>
            }
          />
          {/* Settings route */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.CREATE_SALE}>
                <Settings />
              </ProtectedRoute>
            }
          />
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        
        {/* Global Auto-Updater Notification */}
        <UpdaterNotification />
      </HashRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}
export default App;
