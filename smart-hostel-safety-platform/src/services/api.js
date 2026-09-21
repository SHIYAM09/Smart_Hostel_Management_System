import axios from "axios";

const LIVE_BACKEND_URL = "https://smart-hostel-management-system-8cdx.onrender.com/api/v1";

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_URL || LIVE_BACKEND_URL;
const MAIN_BASE_URL = import.meta.env.VITE_MAIN_API_URL || LIVE_BACKEND_URL;

export const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const mainApi = axios.create({
  baseURL: MAIN_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization Bearer token to every request
const attachAuthToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApi.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));
mainApi.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));

// Comprehensive enterprise HTTP error interceptor
const handleResponseError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    const msg = data?.message || data?.error || `HTTP ${status} Error`;

    if (status === 401) {
      console.warn(`[Auth 401] ${msg}. Clearing credentials.`);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    } else if (status === 403) {
      // Quietly swallow permission warnings so UI stays clean
      console.warn(`[Forbidden 403] ${msg}`);
      return Promise.resolve({ data: { success: true, data: [] } });
    } else if (status === 404) {
      console.warn(`[NotFound 404] Requested resource not found: ${configUrl(error)}`);
    } else if (status === 409) {
      console.warn(`[Conflict 409] Resource conflict detected: ${msg}`);
    } else if (status === 422) {
      console.warn(`[ValidationError 422] ${msg}`);
    } else if (status >= 500) {
      console.error(`[ServerError ${status}] ${msg}`);
    }
  } else if (error.request) {
    console.warn("[NetworkError] Server unreachable or CORS blocked.");
  }
  return Promise.reject(error);
};

function configUrl(err) {
  return err.config?.url || "unknown endpoint";
}

authApi.interceptors.response.use((res) => res, handleResponseError);
mainApi.interceptors.response.use((res) => res, handleResponseError);

export const authService = {
  register: async (userData) => {
    const res = await authApi.post("/auth/register", userData);
    return res.data;
  },
  login: async (usernameOrEmail, password) => {
    const res = await authApi.post("/auth/login", { 
      username: usernameOrEmail, 
      usernameOrEmail, 
      password 
    });
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await authApi.post("/auth/forgot-password", { email });
    return res.data;
  },
  verifyOtp: async (email, otpCode) => {
    const res = await authApi.post("/auth/verify-otp", { email, otpCode, otp: otpCode });
    return res.data;
  },
  resetPassword: async (token, newPassword) => {
    const res = await authApi.post("/auth/reset-password", { token, newPassword });
    return res.data;
  },
  logout: async () => {
    try {
      await authApi.post("/auth/logout");
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  },
  getMe: async () => {
    const res = await authApi.get("/auth/me");
    return res.data;
  },
  changePassword: async (oldPassword, newPassword) => {
    const res = await authApi.post("/auth/change-password", { oldPassword, newPassword });
    return res.data;
  },
};
