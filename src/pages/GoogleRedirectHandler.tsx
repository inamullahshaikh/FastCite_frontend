import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GoogleRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Read token from query string
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      // Store token in localStorage (or sessionStorage)
      localStorage.setItem("access_token", token);

      // Remove token from URL for cleanliness
      // Keeps the history entry and changes URL without reloading
      const newUrl = location.pathname.replace("/auth/google/callback", "/dashboard");
      window.history.replaceState({}, document.title, newUrl);

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } else {
      // If no token, send to login
      navigate("/login", { replace: true });
    }
  }, [navigate, location]);

  return <div>Logging in...</div>;
};

export default GoogleRedirectHandler;
