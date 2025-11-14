import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import SignupPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/dashboard";
import GoogleRedirectHandler from "./pages/GoogleRedirectHandler";
import UploadPage from "./pages/uploadbook";
import ManageBooksPage from "./pages/managebooks";
import NewChatPage from "./pages/newchat";
import ChatHistoryPage from "./pages/chat";
import ProfilePage from "./pages/profile";

const RootRedirect = () => {
  const accessToken = localStorage.getItem("accessToken");

  return accessToken ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("accessToken"); // fixed key

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Google OAuth callback */}
        <Route
          path="/auth/google/callback"
          element={<GoogleRedirectHandler />}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/new-chat"
          element={
            <ProtectedRoute>
              <NewChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage"
          element={
            <ProtectedRoute>
              <ManageBooksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:chatId"
          element={
            <ProtectedRoute>
              <ChatHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/setting"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
