import { useState, useEffect } from "react";
import { authService } from "../services/api";

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return !!localStorage.getItem("token");
  });

  const [role, setRole] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.role || "student";
      } catch {
        // ignore
      }
    }
    return "student";
  });

  const [userName, setUserName] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return parsed.fullName || parsed.username || "";
      } catch {
        // ignore
      }
    }
    return "";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoggedIn(false);
        setUserName("");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (userRole, name, accessToken, refreshToken = null, userObj = null) => {
    const normalizedRole = (userRole || "student").toLowerCase().replace("role_", "");
    setRole(normalizedRole);
    setUserName(name);
    setLoggedIn(true);

    if (accessToken) {
      localStorage.setItem("token", accessToken);
    }
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    if (userObj) {
      localStorage.setItem("user", JSON.stringify({ ...userObj, role: normalizedRole, fullName: name }));
    } else {
      localStorage.setItem("user", JSON.stringify({ role: normalizedRole, fullName: name }));
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      setLoggedIn(false);
      setUserName("");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("hostel_")) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  return { loggedIn, role, userName, login, logout };
}
