import { useState, useEffect } from "react";
import { authService } from "../services/api";
import { getSanitizedUsername } from "../utils/userUtils";

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
        return getSanitizedUsername(parsed, "");
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
      } else {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            const disp = getSanitizedUsername(parsed, "");
            if (disp) {
              setUserName(disp);
            }
          } catch {}
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userProfileUpdated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userProfileUpdated", handleStorageChange);
    };
  }, []);

  const login = (userRole, name, accessToken, refreshToken = null, userObj = null) => {
    const normalizedRole = (userRole || "student").toLowerCase().replace("role_", "");
    const cleanName = getSanitizedUsername(userObj || name, name);
    setRole(normalizedRole);
    setUserName(cleanName);
    setLoggedIn(true);

    if (accessToken) {
      localStorage.setItem("token", accessToken);
    }
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    const storeObj = userObj ? { ...userObj } : {};
    storeObj.role = normalizedRole;
    storeObj.fullName = cleanName;
    if (!storeObj.username || storeObj.username.includes("@")) {
      storeObj.username = cleanName;
    }
    localStorage.setItem("user", JSON.stringify(storeObj));
  };

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("hostel_")) {
        localStorage.removeItem(key);
      }
    });
    setLoggedIn(false);
    setUserName("");

    try {
      await authService.logout();
    } catch {
      // ignore
    }
  };

  return { loggedIn, role, userName, login, logout };
}
