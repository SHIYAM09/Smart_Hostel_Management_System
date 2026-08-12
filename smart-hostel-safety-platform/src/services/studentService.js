import { mainApi } from "./api";

const getCurrentStudentId = (providedId) => {
  if (providedId && providedId !== 1) return providedId;
  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.id) return parsed.id;
      if (parsed.studentId) return parsed.studentId;
    }
  } catch {}
  return providedId || 1;
};

export const studentService = {
  // Get student dashboard metrics
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

  // Student Attendance - 100% MongoDB Driven
  getAttendance: async (studentId) => {
    const targetId = getCurrentStudentId(studentId);
    try {
      let res = await mainApi.get(`/attendance/student/${targetId}`);
      let list = res.data?.data || res.data || [];
      if (!Array.isArray(list) || list.length === 0) {
        try {
          res = await mainApi.get("/attendance");
          list = res.data?.data || res.data || [];
        } catch {}
      }
      const uniqueByDateMap = new Map();
      (Array.isArray(list) ? list : []).forEach((item) => {
        const dateStr = item.attendanceDate ? String(item.attendanceDate).slice(0, 10) : (item.date || new Date().toISOString().slice(0, 10));
        uniqueByDateMap.set(dateStr, {
          ...item,
          id: item.id || item._id,
          date: dateStr,
          status: (item.status || "PRESENT").toLowerCase(),
          time: item.remarks || item.time || "Logged",
          studentName: item.studentName || item.name || "Student",
          rollNo: item.rollNumber || item.rollNo || "",
          room: item.roomNumber || item.room || "",
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
      let res = await mainApi.get(`/complaints/student/${targetId}`);
      let list = res.data?.data || res.data || [];
      if (!Array.isArray(list) || list.length === 0) {
        res = await mainApi.get("/complaints");
        list = res.data?.data || res.data || [];
      }
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
      console.warn("API getComplaints failed, falling back:", err.message);
      try {
        const res = await mainApi.get("/complaints");
        const list = res.data?.data || res.data || [];
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
      } catch (e) {
        return [];
      }
    }
  },

  createComplaint: async (complaintData) => {
    const targetId = getCurrentStudentId(complaintData.studentId);
    const parsedId = typeof targetId === "number" 
      ? targetId 
      : parseInt(String(targetId || "").replace(/\D/g, ""), 10) || 1;
    const payload = {
      title: complaintData.subject || complaintData.title,
      subject: complaintData.subject || complaintData.title,
      description: complaintData.description,
      category: complaintData.category || "Maintenance",
      priority: (complaintData.priority || "medium").toUpperCase(),
      status: "OPEN",
      studentId: parsedId,
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
      let res = await mainApi.get(`/leave-requests/student/${targetId}`);
      let list = res.data?.data || res.data || [];
      if (!Array.isArray(list) || list.length === 0) {
        res = await mainApi.get("/leave-requests");
        list = res.data?.data || res.data || [];
      }
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
      console.warn("API getLeaveRequests failed, falling back:", err.message);
      try {
        const res = await mainApi.get("/leave-requests");
        const list = res.data?.data || res.data || [];
        return Array.isArray(list) ? list.map((l) => ({
          ...l,
          id: l.id ? String(l.id) : `LR${Date.now()}`,
          fromDate: l.startDate ? String(l.startDate).slice(0, 10) : (l.fromDate || ""),
          toDate: l.endDate ? String(l.endDate).slice(0, 10) : (l.toDate || ""),
          submittedAt: l.createdAt ? String(l.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
          wardenNote: l.wardenRemarks || l.wardenNote || null,
          status: (l.status || "PENDING").toLowerCase(),
        })) : [];
      } catch (e) {
        return [];
      }
    }
  },

  applyLeave: async (leaveData) => {
    const targetId = getCurrentStudentId(leaveData.studentId);
    const payload = {
      studentId: targetId,
      studentName: leaveData.studentName || leaveData.name || "",
      roomNumber: leaveData.roomNumber || leaveData.room || "",
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
    const targetId = getCurrentStudentId(visitorData.studentId);
    const parsedId = typeof targetId === "number" 
      ? targetId 
      : parseInt(String(targetId || "").replace(/\D/g, ""), 10) || 1;
    const payload = {
      visitorName: visitorData.visitorName,
      studentName: visitorData.studentName || "SHIYAM M",
      studentId: String(parsedId),
      roomNumber: visitorData.room || visitorData.roomNumber || "A-101",
      phone: visitorData.phone || "9876543210",
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
    const payload = {
      mealType: (feedbackData.mealType || feedbackData.meal || "LUNCH").toUpperCase(),
      rating: feedbackData.rating,
      remarks: feedbackData.comment || feedbackData.remarks || "",
    };
    const res = await mainApi.post("/mess/feedback", payload);
    return res.data?.data || res.data;
  },
};
