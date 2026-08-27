import { mainApi } from "./api";

export const adminService = {
  // Admin Dashboard Metrics
  getDashboard: async () => {
    try {
      const res = await mainApi.get("/dashboards/admin");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getAdminDashboard failed:", err.message);
      return null;
    }
  },

  // Admin Profile Operations
  getAllAdmins: async () => {
    try {
      const res = await mainApi.get("/admins");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getAllAdmins failed:", err.message);
      return null;
    }
  },

  getAdminById: async (id) => {
    try {
      const res = await mainApi.get(`/admins/${id}`);
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getAdminById failed:", err.message);
      return null;
    }
  },

  updateAdmin: async (id, adminData) => {
    const res = await mainApi.put(`/admins/${id || "1"}`, adminData);
    return res.data?.data || res.data;
  },

  // Wardens Management
  getAllWardens: async () => {
    try {
      const res = await mainApi.get("/wardens");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getAllWardens failed:", err.message);
      return null;
    }
  },

  createWarden: async (wardenData) => {
    const res = await mainApi.post("/wardens", wardenData);
    return res.data?.data || res.data;
  },

  updateWarden: async (id, wardenData) => {
    const res = await mainApi.put(`/wardens/${id}`, wardenData);
    return res.data?.data || res.data;
  },

  deleteWarden: async (id) => {
    const res = await mainApi.delete(`/wardens/${id}`);
    return res.data?.data || res.data;
  },

  // Audit Logs & System Reports
  getAuditLogs: async () => {
    try {
      const res = await mainApi.get("/authz/audit/logs");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getAuditLogs failed:", err.message);
      return [];
    }
  },

  getLoginHistory: async () => {
    try {
      const res = await mainApi.get("/authz/audit/login-history");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getLoginHistory failed:", err.message);
      return [];
    }
  },

  getApiAccessLogs: async () => {
    try {
      const res = await mainApi.get("/authz/audit/api-logs");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getApiAccessLogs failed:", err.message);
      return [];
    }
  },

  // Hostel Blocks Management
  getHostelBlocks: async () => {
    try {
      const res = await mainApi.get("/hostel-blocks");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getHostelBlocks failed:", err.message);
      return [];
    }
  },

  createHostelBlock: async (blockData) => {
    const res = await mainApi.post("/hostel-blocks", blockData);
    return res.data?.data || res.data;
  },

  updateHostelBlock: async (id, blockData) => {
    const res = await mainApi.put(`/hostel-blocks/${id}`, blockData);
    return res.data?.data || res.data;
  },

  deleteHostelBlock: async (id) => {
    const res = await mainApi.delete(`/hostel-blocks/${id}`);
    return res.data?.data || res.data;
  },
};
