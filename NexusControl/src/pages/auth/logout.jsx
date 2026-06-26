import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const API_URL = import.meta.env.VITE_API_URL;

        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.clear();

        setTimeout(() => navigate("/login"), 300);
      } catch (err) {
        console.error("Logout error:", err);

        localStorage.clear();
        sessionStorage.clear();
        navigate("/login");
      }
    };

    logoutUser();
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "20%" }}>
      <h2>Logging out...</h2>
    </div>
  );
}