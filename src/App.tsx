import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import SignupPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/dashboard";
import GoogleRedirectHandler from "./pages/GoogleRedirectHandler"; // create this
import UploadPage from "./pages/uploadbook"
import ManageBooksPage from "./pages/managebooks";
// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Google OAuth callback */}
        <Route path="/auth/google/callback" element={<GoogleRedirectHandler />} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/manage" element={<ManageBooksPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
