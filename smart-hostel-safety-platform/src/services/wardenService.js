import { mainApi } from "./api";

export const wardenService = {
  // Warden Dashboard metrics
  getDashboard: async () => {
    try {
      const res = await mainApi.get("/dashboards/warden");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getWardenDashboard failed:", err.message);
      return null;
    }
  },

  // Students Management
  getAllStudents: async () => {
    try {
      const res = await mainApi.get("/students");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getAllStudents failed:", err.message);
      return null;
    }
  },

  createStudent: async (studentData) => {
    const res = await mainApi.post("/students", studentData);
    return res.data?.data || res.data;
  },

  updateStudent: async (id, studentData) => {
    const res = await mainApi.put(`/students/${id}`, studentData);
    return res.data?.data || res.data;
  },

  deleteStudent: async (id) => {
    const res = await mainApi.delete(`/students/${id}`);
    return res.data?.data || res.data;
  },

  // Rooms & Allocations
  getRooms: async () => {
    try {
      const res = await mainApi.get("/rooms");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getRooms failed:", err.message);
      return [];
    }
  },

  createRoom: async (roomData) => {
    const res = await mainApi.post("/rooms", roomData);
    return res.data?.data || res.data;
  },

  allocateRoom: async (studentId, roomId) => {
    const res = await mainApi.post(`/rooms/allocate?studentId=${studentId}&roomId=${roomId}`);
    return res.data?.data || res.data;
  },

  vacateRoom: async (allocationId) => {
    const res = await mainApi.post(`/rooms/vacate/${allocationId}`);
    return res.data?.data || res.data;
  },

  // Attendance
  getAttendanceByDate: async (dateStr) => {
    try {
      const res = await mainApi.get(`/attendance/date/${dateStr}`);
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getAttendanceByDate failed:", err.message);
      return [];
    }
  },

  markBulkAttendance: async (attendanceList) => {
    const res = await mainApi.post("/attendance/bulk", attendanceList);
    return res.data?.data || res.data;
  },

  // Leave Requests
  getAllLeaveRequests: async () => {
    try {
      const res = await mainApi.get("/leave-requests");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getAllLeaveRequests failed:", err.message);
      return [];
    }
  },

  updateLeaveStatus: async (id, status, remarks = "") => {
    const res = await mainApi.put(`/leave-requests/${id}/status?status=${status.toUpperCase()}&remarks=${encodeURIComponent(remarks)}`);
    return res.data?.data || res.data;
  },

  // Visitors Verification
  getVisitorLogs: async () => {
    try {
      const res = await mainApi.get("/visitors/logs");
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("API getVisitorLogs failed:", err.message);
      return [];
    }
  },

  logVisitorEntry: async (logData) => {
    const res = await mainApi.post("/visitors/logs/entry", logData);
    return res.data?.data || res.data;
  },

  checkOutVisitor: async (logId) => {
    const res = await mainApi.post(`/visitors/logs/checkout/${logId}`);
    return res.data?.data || res.data;
  },

  // Complaints
  getAllComplaints: async () => {
    try {
      const res = await mainApi.get("/complaints");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getAllComplaints failed:", err.message);
      return [];
    }
  },

  updateComplaintStatus: async (id, status) => {
    const res = await mainApi.put(`/complaints/${id}/status?status=${status.toUpperCase()}`);
    return res.data?.data || res.data;
  },

  // Mess Analytics & Food Wastage
  getMessFeedback: async () => {
    try {
      const res = await mainApi.get("/mess/feedback");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getMessFeedback failed:", err.message);
      return [];
    }
  },

  getFoodWastage: async () => {
    try {
      const res = await mainApi.get("/mess/food-wastage");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getFoodWastage failed:", err.message);
      return [];
    }
  },

  recordFoodWastage: async (wastageData) => {
    const res = await mainApi.post("/mess/food-wastage", wastageData);
    return res.data?.data || res.data;
  },

  updateMessMenu: async (menuData) => {
    const res = await mainApi.post("/mess/menu", menuData);
    return res.data?.data || res.data;
  },

  getWeeklyMessMenu: async () => {
    try {
      const res = await mainApi.get("/mess/menu");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getWeeklyMessMenu failed:", err.message);
      return [];
    }
  },

  // Resources & Utilities
  getResources: async () => {
    try {
      const res = await mainApi.get("/resources");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getResources failed:", err.message);
      return [];
    }
  },

  createResource: async (resourceData) => {
    const res = await mainApi.post("/resources", resourceData);
    return res.data?.data || res.data;
  },

  getUtilities: async () => {
    try {
      const res = await mainApi.get("/utilities");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getUtilities failed:", err.message);
      return [];
    }
  },

  recordUtility: async (utilityData) => {
    const res = await mainApi.post("/utilities", utilityData);
    return res.data?.data || res.data;
  },

  // Notifications Management
  createNotification: async (notificationData) => {
    const res = await mainApi.post("/notifications", notificationData);
    return res.data?.data || res.data;
  },

  getAllNotifications: async () => {
    try {
      const res = await mainApi.get("/notifications");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getAllNotifications failed:", err.message);
      return [];
    }
  },

  markNotificationAsRead: async (id) => {
    const res = await mainApi.put(`/notifications/${id}/read`);
    return res.data?.data || res.data;
  },

  deleteNotification: async (id) => {
    const res = await mainApi.delete(`/notifications/${id}`);
    return res.data?.data || res.data;
  },

  clearAllNotifications: async () => {
    const res = await mainApi.delete("/notifications");
    return res.data?.data || res.data;
  },

  // AI Safety Chat History
  saveAiChat: async (chatData) => {
    const res = await mainApi.post("/authz/ai-history", chatData);
    return res.data?.data || res.data;
  },

  getAiChatHistory: async (username) => {
    try {
      const res = await mainApi.get(`/authz/ai-history/${username}`);
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getAiChatHistory failed:", err.message);
      return [];
    }
  },
};
