import { mainApi } from "./api";

const getActiveUser = () => {
  try {
    const savedUserStr = localStorage.getItem("user");
    return savedUserStr ? JSON.parse(savedUserStr) : {};
  } catch {
    return {};
  }
};

const getCurrentStudentId = (providedId) => {
  if (providedId) return providedId;
  const user = getActiveUser();
  return user.id || user.studentId || user.userId || user.username || "";
};

export const studentService = {
  // Get student dashboard metrics from live backend
  getDashboard: async () => {
    try {
      const res = await mainApi.get("/dashboards/student");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getDashboard failed:", err.message);
      return null;
    }
  },

  // Get current student profile
  getProfile: async () => {
    try {
      const res = await mainApi.get("/students/me");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getProfile failed:", err.message);
      return null;
    }
  },

  // Update profile
  updateProfile: async (studentId, data) => {
    const targetId = getCurrentStudentId(studentId);
    const res = await mainApi.put(`/students/${targetId}`, data);
    return res.data?.data || res.data;
  },

  // Student Attendance
  getAttendance: async (studentId) => {
    const targetId = getCurrentStudentId(studentId);
    const activeUser = getActiveUser();

    const currentUserFullName = activeUser.fullName || activeUser.name || activeUser.username || "Student";
    const currentUserRoll = activeUser.rollNumber || activeUser.rollNo || activeUser.username || "";
    const currentUserRoom = activeUser.roomNumber || activeUser.room || "";

    try {
      const res = await mainApi.get(`/attendance/student/${targetId}`);
      let list = res.data?.data || res.data || [];
      const uniqueByDateMap = new Map();
      (Array.isArray(list) ? list : []).forEach((item) => {
        const dateStr = item.attendanceDate ? String(item.attendanceDate).slice(0, 10) : (item.date || new Date().toISOString().slice(0, 10));
        uniqueByDateMap.set(dateStr, {
          ...item,
          id: item.id || item._id,
          date: dateStr,
          status: (item.status || "PRESENT").toLowerCase(),
          time: item.remarks || item.time || "Logged",
          studentName: item.studentName || currentUserFullName,
          rollNo: item.rollNumber || item.rollNo || currentUserRoll,
          room: item.roomNumber || item.room || currentUserRoom,
        });
      });
      return Array.from(uniqueByDateMap.values());
    } catch (err) {
      console.warn("API getAttendance failed:", err.message);
      return [];
    }
  },

  // Student Complaints
  getComplaints: async (studentId) => {
    const targetId = getCurrentStudentId(studentId);
    try {
      const res = await mainApi.get(`/complaints/student/${targetId}`);
      let list = res.data?.data || res.data || [];
      return Array.isArray(list) ? list.map((c) => ({
        ...c,
        id: c.id ? String(c.id) : `C${Date.now()}`,
        subject: c.title || c.subject || "Complaint",
        description: c.description || "",
        status: (c.status || "OPEN").toLowerCase(),
        priority: (c.priority || "MEDIUM").toLowerCase(),
        date: c.createdAt ? String(c.createdAt).slice(0, 10) : (c.date || new Date().toISOString().slice(0, 10)),
        wardenReply: c.wardenRemarks || c.wardenReply || null,
      })) : [];
    } catch (err) {
      console.warn("API getComplaints failed:", err.message);
      return [];
    }
  },

  createComplaint: async (complaintData) => {
    const activeUser = getActiveUser();

    const studentName = complaintData.studentName || activeUser.fullName || activeUser.name || activeUser.username || "Student";
    const roomNumber = complaintData.roomNumber || complaintData.room || activeUser.roomNumber || activeUser.room || "";

    const targetId = getCurrentStudentId(complaintData.studentId);
    const parsedId = typeof targetId === "number" 
      ? targetId 
      : parseInt(String(targetId || "").replace(/\D/g, ""), 10) || activeUser.id || 0;
    const payload = {
      title: complaintData.subject || complaintData.title,
      subject: complaintData.subject || complaintData.title,
      description: complaintData.description,
      category: complaintData.category || "Maintenance",
      priority: (complaintData.priority || "medium").toUpperCase(),
      status: "OPEN",
      studentId: parsedId,
      studentName,
      roomNumber,
    };
    const res = await mainApi.post("/complaints", payload);
    return res.data?.data || res.data;
  },

  submitComplaintFeedback: async (complaintId, rating, comment) => {
    const res = await mainApi.post(`/complaints/${complaintId}/feedback?rating=${rating}&comment=${encodeURIComponent(comment || "")}`);
    return res.data?.data || res.data;
  },

  // Student Leave Requests
  getLeaveRequests: async (studentId) => {
    const targetId = getCurrentStudentId(studentId);
    try {
      const res = await mainApi.get(`/leave-requests/student/${targetId}`);
      let list = res.data?.data || res.data || [];
      return Array.isArray(list) ? list.map((l) => ({
        ...l,
        id: l.id ? String(l.id) : `LR${Date.now()}`,
        fromDate: l.startDate ? String(l.startDate).slice(0, 10) : (l.fromDate || ""),
        toDate: l.endDate ? String(l.endDate).slice(0, 10) : (l.toDate || ""),
        submittedAt: l.createdAt ? String(l.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
        wardenNote: l.wardenRemarks || l.wardenNote || null,
        status: (l.status || "PENDING").toLowerCase(),
      })) : [];
    } catch (err) {
      console.warn("API getLeaveRequests failed:", err.message);
      return [];
    }
  },

  applyLeave: async (leaveData) => {
    const activeUser = getActiveUser();

    const studentName = leaveData.studentName || activeUser.fullName || activeUser.name || activeUser.username || "Student";
    const roomNumber = leaveData.roomNumber || leaveData.room || activeUser.roomNumber || activeUser.room || "";

    const targetId = getCurrentStudentId(leaveData.studentId);
    const parsedId = typeof targetId === "number" 
      ? targetId 
      : parseInt(String(targetId || "").replace(/\D/g, ""), 10) || activeUser.id || 0;

    const payload = {
      studentId: parsedId,
      studentName,
      roomNumber,
      startDate: leaveData.fromDate || leaveData.startDate,
      endDate: leaveData.toDate || leaveData.endDate,
      reason: leaveData.reason,
      status: "PENDING",
    };
    const res = await mainApi.post("/leave-requests", payload);
    return res.data?.data || res.data;
  },

  // Visitors
  getVisitors: async () => {
    try {
      const res = await mainApi.get("/visitors/logs");
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("API getVisitors failed:", err.message);
      return [];
    }
  },

  registerVisitor: async (visitorData) => {
    const activeUser = getActiveUser();
    const targetId = getCurrentStudentId(visitorData.studentId);
    const parsedId = typeof targetId === "number" 
      ? targetId 
      : parseInt(String(targetId || "").replace(/\D/g, ""), 10) || activeUser.id || 0;

    const payload = {
      visitorName: visitorData.visitorName,
      studentName: visitorData.studentName || activeUser.fullName || activeUser.name || "Student",
      studentId: String(parsedId),
      roomNumber: visitorData.room || visitorData.roomNumber || activeUser.roomNumber || "",
      phone: visitorData.phone || "",
      relationship: visitorData.relation || visitorData.relationship || "Parent",
      purpose: visitorData.purpose || "Visit",
      status: visitorData.status || "PENDING",
      riskLevel: visitorData.riskLevel || "LOW",
      idVerified: visitorData.idVerified || false,
      student: { id: parsedId },
    };
    const res = await mainApi.post("/visitors", payload);
    return res.data?.data || res.data;
  },

  // Mess Menu & Feedback
  getMessMenu: async () => {
    try {
      const res = await mainApi.get("/mess/menu");
      return res.data?.data || res.data;
    } catch (err) {
      console.warn("API getMessMenu failed:", err.message);
      return null;
    }
  },

  submitMessFeedback: async (feedbackData) => {
    const activeUser = getActiveUser();

    const studentName = feedbackData.studentName || activeUser.fullName || activeUser.name || activeUser.username || "Student";
    const studentId = String(feedbackData.studentId || activeUser.id || activeUser.studentId || "");

    const payload = {
      studentId,
      studentName,
      date: feedbackData.date || new Date().toISOString().slice(0, 10),
    };

    if (feedbackData.mealType || feedbackData.meal) {
      payload.mealType = String(feedbackData.mealType || feedbackData.meal).toUpperCase();
    }
    if (feedbackData.rating !== undefined && feedbackData.rating !== null) {
      payload.rating = Number(feedbackData.rating);
    }
    if (feedbackData.comments || feedbackData.comment || feedbackData.remarks) {
      payload.comments = feedbackData.comments || feedbackData.comment || feedbackData.remarks;
    }

    if (feedbackData.breakfastRating !== undefined) payload.breakfastRating = Number(feedbackData.breakfastRating);
    if (feedbackData.lunchRating !== undefined) payload.lunchRating = Number(feedbackData.lunchRating);
    if (feedbackData.snacksRating !== undefined) payload.snacksRating = Number(feedbackData.snacksRating);
    if (feedbackData.dinnerRating !== undefined) payload.dinnerRating = Number(feedbackData.dinnerRating);

    if (feedbackData.breakfastComment) payload.breakfastComment = feedbackData.breakfastComment;
    if (feedbackData.lunchComment) payload.lunchComment = feedbackData.lunchComment;
    if (feedbackData.snacksComment) payload.snacksComment = feedbackData.snacksComment;
    if (feedbackData.dinnerComment) payload.dinnerComment = feedbackData.dinnerComment;

    const res = await mainApi.post("/mess/feedback", payload);
    return res.data?.data || res.data;
  },

  getAISafetyAnalytics: async () => {
    const res = await mainApi.get("/dashboards/ai-safety");
    return res.data?.data || res.data;
  },
};
