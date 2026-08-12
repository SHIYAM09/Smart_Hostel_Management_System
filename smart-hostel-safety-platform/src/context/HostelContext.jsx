import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { studentService } from "../services/studentService";
import { wardenService } from "../services/wardenService";
import { adminService } from "../services/adminService";
import { getIndianDateStr, getIndianTimeStr } from "../utils/dateUtils";

const HostelContext = createContext(null);


let toastId = 0;

export function HostelProvider({ children }) {
  const [complaints, setComplaints] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem("hostel_attendance");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });
  const [notifications, setNotifications] = useState([]);
  const [messFeedback, setMessFeedback] = useState([]);

  const [weeklyMessMenu, setWeeklyMessMenu] = useState(() => {
    const saved = localStorage.getItem("hostel_weekly_mess_menu");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem("hostel_students");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
  });
const DEFAULT_RESOURCES = [
  { id: 1, name: "Water Supply Tank A", current: 8200, max: 10000, unit: "L", threshold: 9000, anomaly: false },
  { id: 2, name: "Electricity Grid Block A", current: 1420, max: 1500, unit: "kWh", threshold: 1400, anomaly: true },
  { id: 3, name: "Generator Diesel Level", current: 450, max: 500, unit: "L", threshold: 400, anomaly: true },
  { id: 4, name: "Wi-Fi Bandwidth Usage", current: 650, max: 1000, unit: "GB", threshold: 850, anomaly: false },
];

const DEFAULT_UTILITY_DATA = [
  { id: "UT1", date: "Mon", electricity: 1200, water: 7500, internet: 520, generator: 4.5, maintenanceCost: 1500 },
  { id: "UT2", date: "Tue", electricity: 1350, water: 8100, internet: 610, generator: 3.0, maintenanceCost: 0 },
  { id: "UT3", date: "Wed", electricity: 1420, water: 8200, internet: 650, generator: 5.2, maintenanceCost: 2200 },
];

  const [wardens, setWardens] = useState([]);
  const [resources, setResources] = useState(() => {
    const saved = localStorage.getItem("hostel_resources");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_RESOURCES;
  });

  const [utilityData, setUtilityData] = useState(() => {
    const saved = localStorage.getItem("hostel_utility_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_UTILITY_DATA;
  });

  const [messData, setMessData] = useState(() => {
    const saved = localStorage.getItem("hostel_mess_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  const [hostelBlocks, setHostelBlocks] = useState(() => {
    const saved = localStorage.getItem("hostel_blocks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch {}
    }
    return [];
  });

  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem("hostel_rooms");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);

  const showToast = useCallback((message, type = "success", duration) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration !== 0) {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration || 3500);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addNotification = useCallback(async (nData) => {
    try {
      const payload = {
        title: nData.title || "Notification",
        message: nData.message || "",
        type: nData.type || "info",
        forRole: nData.forRole || "all",
        read: false,
      };
      const created = await wardenService.createNotification(payload);
      const newNotif = {
        ...payload,
        ...(created || {}),
        id: created?.id ? String(created.id) : `N${Date.now()}`,
        time: "Just now",
      };
      setNotifications((prev) => {
        const next = [newNotif, ...prev.filter((p) => String(p.id) !== String(newNotif.id))];
        localStorage.setItem("hostel_notifications", JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.warn("Failed to persist notification to database:", err.message);
      const localNotif = {
        id: `N${Date.now()}`,
        title: nData.title || "Notification",
        message: nData.message || "",
        type: nData.type || "info",
        forRole: nData.forRole || "all",
        read: false,
        time: "Just now",
      };
      setNotifications((prev) => {
        const next = [localNotif, ...prev];
        localStorage.setItem("hostel_notifications", JSON.stringify(next));
        return next;
      });
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await wardenService.markNotificationAsRead(id);
    } catch (err) {
      console.warn("Failed to mark notification as read in database:", err.message);
    }
    setNotifications((prev) => {
      const updated = prev.map((n) => (String(n.id) === String(id) || String(n._id) === String(id) ? { ...n, read: true } : n));
      localStorage.setItem("hostel_notifications", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => {
        wardenService.markNotificationAsRead(n.id || n._id).catch(() => {});
        return { ...n, read: true };
      });
      localStorage.setItem("hostel_notifications", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      await wardenService.deleteNotification(id);
    } catch (err) {
      console.warn("Failed to delete notification from database:", err.message);
    }
    setNotifications((prev) => {
      const updated = prev.filter((n) => String(n.id) !== String(id) && String(n._id) !== String(id));
      localStorage.setItem("hostel_notifications", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearNotifications = useCallback(async () => {
    try {
      await wardenService.clearAllNotifications();
    } catch (err) {
      console.warn("Failed to clear notifications in database:", err.message);
    }
    setNotifications([]);
    localStorage.removeItem("hostel_notifications");
  }, []);

  // Hydrate all context state from live backend APIs
  const refreshData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const savedUserStr = localStorage.getItem("user");
      let userRole = "student";
      if (savedUserStr) {
        try {
          userRole = JSON.parse(savedUserStr).role || "student";
        } catch {
          // ignore
        }
      }

      // Parallel data fetching from backend APIs according to active user role
      const [
        studentsRes,
        wardensRes,
        roomsRes,
        complaintsRes,
        leaveRes,
        visitorsRes,
        resourcesRes,
        utilitiesRes,
        messWastageRes,
        messFeedbackRes,
        messMenuRes,
        hostelBlocksRes,
        notificationsRes,
        dashMetricsRes,
        attendanceRes,
      ] = await Promise.allSettled([
        userRole === "student" ? Promise.resolve([]) : wardenService.getAllStudents(),
        userRole === "admin" ? adminService.getAllWardens() : Promise.resolve([]),
        wardenService.getRooms(),
        userRole === "student" ? studentService.getComplaints() : wardenService.getAllComplaints(),
        userRole === "student" ? studentService.getLeaveRequests() : wardenService.getAllLeaveRequests(),
        userRole === "student" ? studentService.getVisitors() : wardenService.getVisitorLogs(),
        userRole === "student" ? Promise.resolve([]) : wardenService.getResources(),
        userRole === "student" ? Promise.resolve([]) : wardenService.getUtilities(),
        userRole === "student" ? Promise.resolve([]) : wardenService.getFoodWastage(),
        wardenService.getMessFeedback(),
        wardenService.getWeeklyMessMenu(),
        userRole === "admin" ? adminService.getHostelBlocks() : Promise.resolve([]),
        wardenService.getAllNotifications(),
        userRole === "admin"
          ? adminService.getDashboard()
          : userRole === "warden"
          ? wardenService.getDashboard()
          : studentService.getDashboard(),
        userRole === "student"
          ? studentService.getAttendance()
          : wardenService.getAttendanceByDate(getIndianDateStr()),
      ]);

      if (studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value)) {
        const fetched = studentsRes.value.map(s => ({
          id: s.id,
          rawId: s.id,
          name: s.fullName || s.name || "Student",
          fullName: s.fullName || s.name || "Student",
          rollNo: s.rollNumber || s.rollNo || `22CS${s.id}`,
          rollNumber: s.rollNumber || s.rollNo || `22CS${s.id}`,
          room: s.roomNumber || s.room || "Unassigned",
          roomNumber: s.roomNumber || s.room || "Unassigned",
          block: s.hostelBlock || s.block || "Block A",
          department: s.department || "CSE",
          course: s.department || s.course || "CSE",
          year: s.yearOfStudy ? `${s.yearOfStudy}` : (s.year || "1"),
          yearOfStudy: s.yearOfStudy || 1,
          phone: s.phone || s.guardianPhone || "",
          email: s.email || "",
          status: s.status?.toLowerCase() || "active",
          absenceStreak: s.absenceStreak || 0,
        }));
        setStudents(fetched);
        localStorage.setItem("hostel_students", JSON.stringify(fetched));
      }

      if (wardensRes.status === "fulfilled" && Array.isArray(wardensRes.value)) {
        const fetched = wardensRes.value.map(w => {
          const blockName = w.hostelBlock || w.block || "Block A";
          const blockNorm = blockName.replace(/block\s*/i, "").trim().toLowerCase();

          const matchingStudents = (students || []).filter(s => {
            const studentBlockNorm = (s.hostelBlock || s.block || "").replace(/block\s*/i, "").trim().toLowerCase();
            return !blockNorm || !studentBlockNorm || studentBlockNorm === blockNorm || studentBlockNorm.includes(blockNorm) || blockNorm.includes(studentBlockNorm);
          });

          const realCount = matchingStudents.length > 0 
            ? matchingStudents.length 
            : (students.length > 0 ? students.length : (w.studentsManaged || 0));

          return {
            id: w.id,
            rawId: w.id,
            name: w.fullName || w.name || w.username || "Warden",
            fullName: w.fullName || w.name || w.username || "Warden",
            email: w.email || "",
            phone: w.phone || "",
            block: blockName,
            hostelBlock: blockName,
            status: (w.status || "active").toLowerCase(),
            studentsManaged: realCount,
            joined: w.joinedDate || w.joined || "2024-01-15",
          };
        });
        setWardens(fetched);
        localStorage.setItem("hostel_wardens", JSON.stringify(fetched));
      }

      if (roomsRes.status === "fulfilled" && Array.isArray(roomsRes.value)) {
        const fetchedRooms = roomsRes.value.map(r => ({
          id: r.id,
          number: r.roomNumber || r.number || `${r.id}`,
          block: r.block || "Block A",
          floor: r.floor || 1,
          capacity: r.capacity || 2,
          occupied: r.occupiedBeds || r.occupied || 0,
          status: (r.occupiedBeds >= r.capacity) ? "occupied" : (r.occupiedBeds > 0 ? "partial" : "vacant"),
          condition: r.condition || "good",
        }));
        setRooms(fetchedRooms);
        localStorage.setItem("hostel_rooms", JSON.stringify(fetchedRooms));
      }

      if (complaintsRes.status === "fulfilled" && Array.isArray(complaintsRes.value)) {
        const fetched = complaintsRes.value.map(c => {
          const match = (students || []).find(s =>
            String(s.id) === String(c.studentId) ||
            String(s.rawId) === String(c.studentId) ||
            String(s.rollNo) === String(c.studentId) ||
            String(s.rollNumber) === String(c.studentId) ||
            String(s.id) === String(c.student?.id) ||
            String(s.rawId) === String(c.student?.id)
          );

          const studentName = (c.studentName && c.studentName !== "Student")
            ? c.studentName
            : (c.student?.fullName || c.student?.name || (match ? (match.fullName || match.name) : (students && students[0] ? (students[0].fullName || students[0].name) : "SHIYAM M")));

          const room = (c.roomNumber && c.roomNumber !== "Unassigned" && c.roomNumber !== "Room Unassigned" && c.roomNumber !== "—" && c.roomNumber !== "")
            ? c.roomNumber
            : (c.room && c.room !== "Unassigned" && c.room !== "Room Unassigned" && c.room !== "—" ? c.room : (match ? (match.room || match.roomNumber) : (students && students[0] ? (students[0].room || students[0].roomNumber) : "D-214")));

          return {
            id: c.id ? String(c.id) : `C${Date.now()}`,
            rawId: c.id,
            studentId: c.studentId || c.student?.id,
            studentName: studentName,
            room: room,
            subject: c.title || c.subject || "Issue",
            category: c.category || "Maintenance",
            priority: (c.priority || "medium").toLowerCase(),
            status: (c.status || "open").toLowerCase(),
            date: c.createdAt ? String(c.createdAt).slice(0, 19).replace("T", " ") : (c.date || new Date().toISOString().slice(0, 10)),
            wardenReply: c.wardenRemarks || c.wardenReply || null,
            description: c.description || "",
            feedback: c.feedback || null,
          };
        });
        setComplaints(fetched);
        localStorage.setItem("hostel_complaints", JSON.stringify(fetched));
      }

      if (leaveRes.status === "fulfilled" && Array.isArray(leaveRes.value)) {
        const fetched = leaveRes.value.map(l => {
          const match = (students || []).find(s => 
            String(s.id) === String(l.studentId) || 
            String(s.rawId) === String(l.studentId) || 
            (s.rollNo && String(s.rollNo).toLowerCase() === String(l.studentId).toLowerCase()) ||
            (s.name && String(s.name).toLowerCase() === String(l.studentName).toLowerCase())
          );
          
          let name = l.studentName;
          if (!name || name === "Student") {
            name = match ? (match.name || match.fullName) : (students && students[0]?.name ? students[0].name : "SHIYAM M");
          }
          
          let room = l.roomNumber || l.room;
          if (!room || room === "Unassigned") {
            room = match ? match.room : (students && students[0]?.room ? students[0].room : "D-214");
          }

          return {
            id: l.id ? String(l.id) : `LR${Date.now()}`,
            rawId: l.id,
            studentName: name,
            room: room,
            fromDate: l.startDate ? String(l.startDate).slice(0, 10) : l.fromDate,
            toDate: l.endDate ? String(l.endDate).slice(0, 10) : l.toDate,
            reason: l.reason || "",
            status: (l.status || "pending").toLowerCase(),
            submittedAt: l.createdAt ? String(l.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
            wardenNote: l.wardenRemarks || l.wardenNote || null,
          };
        });
        setLeaveRequests(fetched);
        localStorage.setItem("hostel_leave_requests", JSON.stringify(fetched));
      }

      if (visitorsRes.status === "fulfilled" && Array.isArray(visitorsRes.value)) {
        const fetched = visitorsRes.value.map(v => ({
          id: v.id ? String(v.id) : `V${Date.now()}`,
          rawId: v.id || v.visitorId,
          visitorName: v.visitorName || "Visitor",
          studentName: v.studentName || "Student",
          room: v.roomNumber || v.room || "A-101",
          relation: v.relation || v.relationship || "Parent",
          phone: v.phone || "",
          purpose: v.purpose || "",
          status: (v.status || "pending").toLowerCase().replace(/_/g, "-"),
          checkIn: v.checkInTime || v.checkIn || "—",
          checkOut: v.checkOutTime || v.checkOut || "—",
          date: v.logDate || v.date || new Date().toISOString().slice(0, 10),
          riskLevel: v.riskLevel?.toLowerCase() || "low",
          idVerified: v.idVerified ?? false,
        }));
        setVisitors(fetched);
        localStorage.setItem("hostel_visitors", JSON.stringify(fetched));
      }

      if (resourcesRes.status === "fulfilled" && Array.isArray(resourcesRes.value)) {
        setResources(resourcesRes.value);
        localStorage.setItem("hostel_resources", JSON.stringify(resourcesRes.value));
      }

      if (utilitiesRes.status === "fulfilled" && Array.isArray(utilitiesRes.value)) {
        const mapped = utilitiesRes.value.map((u) => ({
          ...u,
          id: u.id ? String(u.id) : `UT${Date.now()}`,
          date: u.readingDate || u.date || new Date().toISOString().slice(0, 10),
          electricity: Number(u.electricityUsage ?? u.electricity ?? 0),
          water: Number(u.waterUsage ?? u.water ?? 0),
          internet: Number(u.internetUsage ?? u.internet ?? 0),
          generator: Number(u.generatorUsage ?? u.generator ?? 0),
          maintenanceCost: Number(u.maintenanceCost ?? 0),
          hostelBlock: u.hostelBlock || "Block A",
          remarks: u.remarks || "",
        }));
        setUtilityData(mapped);
        localStorage.setItem("hostel_utility_data", JSON.stringify(mapped));
      }

      if (messWastageRes.status === "fulfilled" && Array.isArray(messWastageRes.value)) {
        const mapped = messWastageRes.value.map((m) => {
          const dateStr = m.logDate || m.date || new Date().toISOString().slice(0, 10);
          const dateObj = new Date(dateStr);
          const dayName = isNaN(dateObj.getTime()) ? "Mon" : dateObj.toLocaleDateString("en-US", { weekday: "short" });
          const b = Number(m.breakfastWastage) || 0;
          const l = Number(m.lunchWastage) || 0;
          const d = Number(m.dinnerWastage) || 0;
          const total = Number(m.wastageKg) || (b + l + d);
          return {
            ...m,
            id: m.id ? String(m.id) : `W${Date.now()}`,
            date: dateStr,
            day: m.day || dayName,
            breakfastWastage: b,
            lunchWastage: l,
            dinnerWastage: d,
            wastageKg: total,
            overallRating: Number(m.overallRating) || 4.5,
            remarks: m.remarks || "",
          };
        });
        setMessData(mapped);
        localStorage.setItem("hostel_mess_data", JSON.stringify(mapped));
      }

      if (messFeedbackRes.status === "fulfilled" && Array.isArray(messFeedbackRes.value)) {
        const mapped = messFeedbackRes.value.map((f) => {
          const rawDate = f.date || f.createdAt || f.submittedAt || f.logDate;
          const dateStr = rawDate ? String(rawDate).slice(0, 10) : "";
          return {
            ...f,
            mealType: f.mealType || f.meal || "BREAKFAST",
            meal: f.mealType || f.meal || "breakfast",
            rating: Number(f.rating) || 5,
            comment: f.comments || f.comment || f.remarks || "",
            remarks: f.comments || f.comment || f.remarks || "",
            date: dateStr,
            createdAt: f.createdAt || rawDate || new Date().toISOString(),
          };
        });
        setMessFeedback(mapped);
        localStorage.setItem("hostel_mess_feedback", JSON.stringify(mapped));
      }

      if (messMenuRes.status === "fulfilled" && Array.isArray(messMenuRes.value)) {
        setWeeklyMessMenu(messMenuRes.value);
        localStorage.setItem("hostel_weekly_mess_menu", JSON.stringify(messMenuRes.value));
      }

      if (hostelBlocksRes.status === "fulfilled" && Array.isArray(hostelBlocksRes.value)) {
        setHostelBlocks(hostelBlocksRes.value);
        localStorage.setItem("hostel_blocks", JSON.stringify(hostelBlocksRes.value));
      }

      if (notificationsRes.status === "fulfilled" && Array.isArray(notificationsRes.value)) {
        const mapped = notificationsRes.value.map(n => ({
          ...n,
          id: n.id ? String(n.id) : `N${Date.now()}`,
          title: n.title || "Notification",
          message: n.message || "",
          type: n.type || "info",
          forRole: n.forRole || "all",
          read: Boolean(n.read),
          time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
        }));
        setNotifications(mapped);
        localStorage.setItem("hostel_notifications", JSON.stringify(mapped));
      }

      if (dashMetricsRes.status === "fulfilled" && dashMetricsRes.value) {
        setDashboardMetrics(dashMetricsRes.value);
      }

      if (attendanceRes.status === "fulfilled" && Array.isArray(attendanceRes.value)) {
        const uniqueMap = new Map();
        attendanceRes.value.forEach((a) => {
          const dateStr = a.attendanceDate ? String(a.attendanceDate).slice(0, 10) : (a.date || getIndianDateStr());
          uniqueMap.set(dateStr, {
            ...a,
            id: a.id ? String(a.id) : `ATT_${dateStr}_${a.studentId || a.rollNo || "1"}`,
            date: dateStr,
            status: String(a.status || "PRESENT").toLowerCase(),
            time: a.remarks || a.time || "Logged",
            studentId: a.studentId || a.id,
            studentName: a.studentName || a.name || "Student",
            rollNo: a.rollNumber || a.rollNo || "",
            room: a.roomNumber || a.room || "",
          });
        });
        const mapped = Array.from(uniqueMap.values());
        setAttendance(mapped);
        localStorage.setItem("hostel_attendance", JSON.stringify(mapped));
      }

    } catch (err) {
      console.warn("Failed to fetch initial backend data into HostelContext:", err);
    } finally {
      setLoading(false);
    }
  }, []);


  // Fetch data on initial mount and poll periodically for real-time sync across tabs & roles
  useEffect(() => {
    refreshData();
    const timer = setInterval(() => {
      if (localStorage.getItem("token")) {
        refreshData();
      }
    }, 3000);

    const handleStorageChange = (e) => {
      if (e.key && (e.key.startsWith("hostel_") || e.key === "token")) {
        refreshData();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshData]);

  // Sync student profile info into existing DB attendance records without generating fake synthetic logs
  useEffect(() => {
    if (students.length > 0) {
      setAttendance((prev) => {
        if (!Array.isArray(prev) || prev.length === 0) return prev;
        const studentMap = new Map();
        students.forEach((s) => {
          if (s.id) studentMap.set(String(s.id), s);
          if (s.rollNo) studentMap.set(String(s.rollNo).toLowerCase(), s);
        });

        return prev.map((a) => {
          const matched = studentMap.get(String(a.studentId || a.id)) || (a.rollNo ? studentMap.get(String(a.rollNo).toLowerCase()) : null);
          if (matched) {
            return {
              ...a,
              studentName: matched.name || matched.fullName || a.studentName,
              rollNo: matched.rollNo || matched.rollNumber || a.rollNo,
              room: matched.room || matched.roomNumber || a.room,
            };
          }
          return a;
        });
      });
    }
  }, [students]);

  const addComplaint = useCallback(async (complaint) => {
    try {
      await studentService.createComplaint(complaint);
      await refreshData();
      showToast("Complaint submitted successfully.");
      addNotification({
        title: "New Complaint Raised",
        message: `${complaint.studentName || "Student"} filed a ${complaint.category || "Maintenance"} complaint: "${complaint.subject || complaint.title}"`,
        type: "warning",
        forRole: "warden",
      });
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to save complaint to database.", "error");
    }
  }, [addNotification, refreshData, showToast]);

  const updateComplaint = useCallback(async (id, updates) => {
    try {
      const targetRawId = updates.rawId || id;
      if (updates.status) {
        await wardenService.updateComplaintStatus(targetRawId, updates.status);
      }
      await refreshData();
      showToast("Complaint status updated.");
      if (updates.status) {
        addNotification({
          title: "Complaint Status Updated",
          message: `Complaint #${id} status changed to ${updates.status.toUpperCase()}`,
          type: updates.status.toLowerCase() === "resolved" ? "success" : "info",
          forRole: "student",
        });
      }
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update complaint status in database.", "error");
    }
  }, [addNotification, refreshData, showToast]);

  const submitComplaintFeedback = useCallback(async (complaintId, rating, comment) => {
    try {
      await studentService.submitComplaintFeedback(complaintId, rating, comment);
      await refreshData();
      showToast("Feedback submitted. Thank you!");
      addNotification({
        title: "Complaint Feedback Received",
        message: `Feedback rating of ${rating} stars submitted for Complaint #${complaintId}`,
        type: "info",
        forRole: "warden",
      });
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to submit feedback to database.", "error");
    }
  }, [addNotification, refreshData, showToast]);

  const addLeaveRequest = useCallback(async (req) => {
    try {
      await studentService.applyLeave(req);
      await refreshData();
      showToast("Leave request submitted successfully.");
      addNotification({
        title: "New Leave Application",
        message: `${req.studentName || "Student"} requested leave from ${req.fromDate} to ${req.toDate}`,
        type: "info",
        forRole: "warden",
      });
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to save leave request to database.", "error");
    }
  }, [addNotification, refreshData, showToast]);

  const updateLeaveRequest = useCallback(async (id, status, wardenNote = "") => {
    try {
      await wardenService.updateLeaveStatus(id, status, wardenNote);
      await refreshData();
      showToast(`Leave request ${status}.`);
      addNotification({
        title: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your leave request #${id} has been ${status}${wardenNote ? `: "${wardenNote}"` : "."}`,
        type: status.toLowerCase() === "approved" ? "success" : "error",
        forRole: "student",
      });
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update leave request status in database.", "error");
    }
  }, [addNotification, refreshData, showToast]);

  const updateAttendance = useCallback(async (updater) => {
    let nextAttendance = [];
    setAttendance((prev) => {
      const raw = typeof updater === "function" ? updater(prev) : updater;
      const map = new Map();
      raw.forEach((a) => {
        const key = String(a.studentId || a.id);
        map.set(key, a);
      });
      nextAttendance = Array.from(map.values());
      return nextAttendance;
    });
    try {
      const todayStr = getIndianDateStr();
      const bulkPayload = nextAttendance.map((a) => ({
        studentId: a.studentId || a.id || a.rawId || "1",
        studentName: a.studentName || a.name || "Student",
        rollNumber: a.rollNo || a.rollNumber || "22CS101",
        roomNumber: a.room || a.roomNumber || "A-101",
        attendanceDate: a.date || todayStr,
        status: String(a.status || "PRESENT").toUpperCase(),
        remarks: a.time || getIndianTimeStr(),
      }));
      await wardenService.markBulkAttendance(bulkPayload);
      await refreshData();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to persist attendance to database.", "error");
    }
  }, [refreshData, showToast]);

  const updateVisitorStatus = useCallback(async (id, newStatus) => {
    const targetV = visitors.find((v) => String(v.id) === String(id) || String(v.rawId) === String(id));
    const rawId = targetV?.rawId || targetV?.id || id;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formattedStatus = (newStatus || "").toLowerCase().replace(/_/g, "-");
    const backendStatus = formattedStatus === "approved" ? "APPROVED" : formattedStatus === "rejected" ? "REJECTED" : formattedStatus.toUpperCase().replace(/-/g, "_");

    setVisitors((prev) =>
      prev.map((v) => {
        const match = String(v.id) === String(id) || String(v.rawId) === String(id);
        if (!match) return v;
        return {
          ...v,
          status: formattedStatus,
          checkIn: formattedStatus === "checked-in" || formattedStatus === "in-campus" ? (v.checkIn === "—" ? now : v.checkIn) : v.checkIn,
          checkOut: formattedStatus === "checked-out" ? now : v.checkOut,
        };
      })
    );

    try {
      if (backendStatus === "CHECKED_OUT") {
        await wardenService.checkOutVisitor(rawId);
      } else {
        await wardenService.logVisitorEntry({
          id: String(rawId),
          visitorId: String(rawId),
          visitorName: targetV?.visitorName || "",
          studentName: targetV?.studentName || "",
          roomNumber: targetV?.room || "A-101",
          relation: targetV?.relation || "Parent",
          phone: targetV?.phone || "",
          purpose: targetV?.purpose || "Visit",
          status: backendStatus,
          checkInTime: targetV?.checkIn || "—",
          checkOutTime: targetV?.checkOut || "—",
          riskLevel: (targetV?.riskLevel || "LOW").toUpperCase(),
          idVerified: Boolean(targetV?.idVerified),
        });
      }
      await refreshData();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update visitor status in database.", "error");
    }
  }, [visitors, refreshData, showToast]);

  const updateVisitors = useCallback(async (updater) => {
    setVisitors((prev) => {
      return typeof updater === "function" ? updater(prev) : updater;
    });
    await refreshData();
  }, [refreshData]);

  const addVisitor = useCallback(async (visitor) => {
    try {
      const saved = await studentService.registerVisitor(visitor);
      const newVisitorItem = {
        id: saved?.id ? String(saved.id) : `V${Date.now()}`,
        rawId: saved?.id,
        visitorName: visitor.visitorName || saved?.visitorName || "Visitor",
        studentName: visitor.studentName || saved?.studentName || "SHIYAM M",
        relation: visitor.relationship || visitor.relation || "Parent",
        phone: visitor.phone || "",
        purpose: visitor.purpose || "Visit",
        status: (saved?.status || visitor.status || "pending").toLowerCase(),
        checkIn: "—",
        checkOut: "—",
        date: visitor.logDate || new Date().toISOString().slice(0, 10),
        riskLevel: (visitor.riskLevel || "low").toLowerCase(),
        idVerified: false,
      };

      setVisitors((prev) => {
        const next = [newVisitorItem, ...prev.filter((p) => String(p.id) !== String(newVisitorItem.id))];
        localStorage.setItem("hostel_visitors", JSON.stringify(next));
        return next;
      });

      showToast("Visitor request submitted successfully.");

      await addNotification({
        title: "New Visitor Request",
        message: `${visitor.studentName || 'Student'} requested visitor pass for ${visitor.visitorName || 'Visitor'} (${visitor.relationship || visitor.relation || 'Parent'})`,
        type: "info",
        forRole: "warden",
      });
      await refreshData();
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to register visitor in database.", "error");
    }
  }, [addNotification, refreshData, showToast]);

  const addRoom = useCallback(async (newRoom) => {
    try {
      await wardenService.createRoom({
        roomNumber: newRoom.number || newRoom.roomNumber || "A-101",
        hostelBlock: newRoom.block || "Block A",
        capacity: Number(newRoom.capacity) || 2,
        occupiedBeds: Number(newRoom.occupied) || 0,
        status: (newRoom.status || "vacant").toUpperCase(),
      });
      await refreshData();
      showToast(`Room ${newRoom.number || newRoom.roomNumber} added successfully.`);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to create room in database.", "error");
    }
  }, [refreshData, showToast]);

  const addStudent = useCallback(async (studentData) => {
    try {
      await wardenService.createStudent({
        fullName: studentData.name || studentData.fullName,
        rollNumber: studentData.rollNo || studentData.rollNumber,
        roomNumber: studentData.room || studentData.roomNumber || "Unassigned",
        hostelBlock: studentData.block || studentData.hostelBlock || "Block A",
        department: studentData.department || studentData.course || "CSE",
        status: (studentData.status || "active").toUpperCase(),
      });
      await refreshData();
      showToast(`Student ${studentData.name || studentData.fullName} added successfully.`);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to create student in database.", "error");
    }
  }, [refreshData, showToast]);

  const updateStudent = useCallback(async (id, data) => {
    try {
      const targetId = id || data?.id || data?.rawId;
      if (!targetId || targetId === "null") {
        showToast("Cannot update student: missing valid student ID.", "error");
        return;
      }
      const parsedYear = Number(String(data.year || data.yearOfStudy || "1").replace(/\D+/g, "")) || 1;
      const payload = {
        fullName: data.name || data.fullName,
        rollNumber: data.rollNo || data.rollNumber,
        department: data.course || data.department || "CSE",
        roomNumber: data.room || data.roomNumber,
        hostelBlock: data.block || data.hostelBlock || "Block A",
        yearOfStudy: parsedYear,
        phone: data.phone || "",
        email: data.email || "",
        status: (data.status || "active").toUpperCase(),
      };

      // Optimistically update React UI state immediately
      setStudents((prev) =>
        prev.map((s) => {
          if (String(s.id) === String(targetId) || String(s.rawId) === String(targetId) || String(s.rollNo) === String(payload.rollNumber)) {
            return {
              ...s,
              name: payload.fullName,
              fullName: payload.fullName,
              rollNo: payload.rollNumber,
              rollNumber: payload.rollNumber,
              room: payload.roomNumber,
              roomNumber: payload.roomNumber,
              block: payload.hostelBlock,
              department: payload.department,
              course: payload.department,
              year: `${parsedYear}`,
              yearOfStudy: parsedYear,
              phone: payload.phone,
              email: payload.email,
              status: payload.status.toLowerCase(),
            };
          }
          return s;
        })
      );

      await wardenService.updateStudent(targetId, payload);
      await refreshData();
      showToast("Student updated successfully.");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update student in database.", "error");
    }
  }, [refreshData, showToast]);

  const deleteStudent = useCallback(async (id) => {
    try {
      await wardenService.deleteStudent(id);
      await refreshData();
      showToast("Student deleted.", "warning");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to delete student from database.", "error");
    }
  }, [refreshData, showToast]);

  const createWarden = useCallback(async (wardenData) => {
    try {
      await adminService.createWarden(wardenData);
      await refreshData();
      showToast("Warden created successfully.");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to create warden in database.", "error");
    }
  }, [refreshData, showToast]);

  const updateWarden = useCallback(async (id, wardenData) => {
    try {
      await adminService.updateWarden(id, wardenData);
      await refreshData();
      showToast("Warden updated.");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update warden in database.", "error");
    }
  }, [refreshData, showToast]);

  const deleteWarden = useCallback(async (id) => {
    try {
      setWardens(prev => prev.filter(w => w.id !== id && w.rawId !== id));
      await adminService.deleteWarden(id);
      await refreshData();
      showToast("Warden deleted.", "warning");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to delete warden from database.", "error");
    }
  }, [refreshData, showToast]);

  const averageMessRatings = useMemo(() => {
    const meals = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];
    const res = { overall: "0.0", total: (messFeedback || []).length, breakfast: "0.0", lunch: "0.0", snacks: "0.0", dinner: "0.0" };
    if (!messFeedback || !messFeedback.length) return res;

    meals.forEach((m) => {
      const items = messFeedback.filter((f) => String(f.mealType || f.meal).toUpperCase() === m);
      if (items.length) {
        const avg = (items.reduce((acc, curr) => acc + Number(curr.rating || 0), 0) / items.length).toFixed(1);
        res[m.toLowerCase()] = avg;
      }
    });
    const validRatings = messFeedback.map(f => Number(f.rating || 0)).filter(r => r > 0);
    if (validRatings.length) {
      res.overall = (validRatings.reduce((acc, curr) => acc + curr, 0) / validRatings.length).toFixed(1);
    }
    return res;
  }, [messFeedback]);

  const updateMessData = useCallback(async (entry) => {
    try {
      const b = Number(entry.breakfastWastage) || 0;
      const l = Number(entry.lunchWastage) || 0;
      const d = Number(entry.dinnerWastage) || 0;
      const wastageVal = Number(entry.wastageKg) || (b + l + d);
      const rating = Number(entry.overallRating) || Number(averageMessRatings?.overall) || 4.5;
      
      await wardenService.recordFoodWastage({
        breakfastWastage: b,
        lunchWastage: l,
        dinnerWastage: d,
        wastageKg: wastageVal,
        overallRating: rating,
        logDate: entry.date || entry.logDate || getIndianDateStr(),
        remarks: entry.remarks || "",
      });
      await refreshData();
      showToast("Mess wastage record saved.");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to record food wastage in database.", "error");
    }
  }, [averageMessRatings, refreshData, showToast]);

  const addUtilityData = useCallback(async (entry) => {
    try {
      await wardenService.recordUtility({
        electricityUsage: Number(entry.electricity) || 0,
        waterUsage: Number(entry.water) || 0,
        internetUsage: Number(entry.internet) || 0,
        generatorUsage: Number(entry.generator) || 0,
        maintenanceCost: Number(entry.maintenanceCost) || 0,
        readingDate: entry.date || getIndianDateStr(),
        hostelBlock: entry.hostelBlock || "Block A",
        remarks: entry.remarks || "",
      });
      await refreshData();
      showToast("Utility record saved.");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to record utility in database.", "error");
    }
  }, [refreshData, showToast]);

  const updateResources = useCallback((updater) => {
    setResources((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }, []);

  const updateWeeklyMessMenu = useCallback(async (dayOfWeek, menuData) => {
    try {
      const saved = await wardenService.updateMessMenu({
        dayOfWeek,
        breakfast: menuData.breakfast,
        lunch: menuData.lunch,
        snacks: menuData.snacks,
        dinner: menuData.dinner,
        specialItem: menuData.specialItem,
        notes: menuData.notes,
      });
      setWeeklyMessMenu((prev) => {
        const next = (prev || []).map((m) =>
          m.dayOfWeek?.toLowerCase() === dayOfWeek?.toLowerCase() || m.day?.toLowerCase() === dayOfWeek?.toLowerCase()
            ? { ...m, ...menuData, ...(saved || {}), dayOfWeek }
            : m
        );
        const exists = next.some((m) => m.dayOfWeek?.toLowerCase() === dayOfWeek?.toLowerCase());
        const updatedList = exists ? next : [...next, { dayOfWeek, ...menuData, ...(saved || {}) }];
        localStorage.setItem("hostel_weekly_mess_menu", JSON.stringify(updatedList));
        return updatedList;
      });
      await refreshData();
      showToast(`Mess menu for ${dayOfWeek} saved & synced across application.`);
      addNotification({
        title: "Mess Menu Updated",
        message: `Warden published updated Mess Menu for ${dayOfWeek}!`,
        type: "info",
        forRole: "all",
      });
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update mess menu in database.", "error");
    }
  }, [addNotification, refreshData, showToast]);

  const submitMessRating = useCallback(async (mealType, rating, comment = "") => {
    try {
      const todayDate = getIndianDateStr();
      const newFeedbackItem = {
        mealType: mealType.toUpperCase(),
        meal: mealType,
        rating: Number(rating),
        remarks: comment.trim(),
        comments: comment.trim(),
        comment: comment.trim(),
        date: todayDate,
        createdAt: new Date().toISOString(),
      };
      await studentService.submitMessFeedback({
        mealType: mealType.toUpperCase(),
        rating: Number(rating),
        remarks: comment.trim(),
        comments: comment.trim(),
        date: todayDate,
      });
      setMessFeedback((prev) => {
        const updated = [...(prev || []), newFeedbackItem];
        localStorage.setItem("hostel_mess_feedback", JSON.stringify(updated));
        return updated;
      });
      await refreshData();
      showToast(`Submitted ${rating}-star rating for ${mealType}!`);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to submit mess rating to database.", "error");
    }
  }, [refreshData, showToast]);

  const addHostelBlock = useCallback(async (blockData) => {
    try {
      await adminService.createHostelBlock({
        name: blockData.name || blockData.blockName || "New Block",
        rooms: Number(blockData.rooms) || Number(blockData.capacity) || 30,
        type: blockData.type || "Boys",
        floors: Number(blockData.floors) || 3,
        occupied: Number(blockData.occupied) || 0,
        students: Number(blockData.students) || 0,
        warden: blockData.warden || "Unassigned",
      });
      await refreshData();
      showToast(`Hostel Block ${blockData.name || blockData.blockName} added successfully.`);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to create hostel block in database.", "error");
    }
  }, [refreshData, showToast]);

  const updateHostelBlock = useCallback(async (id, blockData) => {
    try {
      await adminService.updateHostelBlock(id, blockData);
      await refreshData();
      showToast("Hostel Block updated.");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update hostel block in database.", "error");
    }
  }, [refreshData, showToast]);

  const deleteHostelBlock = useCallback(async (id) => {
    try {
      await adminService.deleteHostelBlock(id);
      await refreshData();
      showToast("Hostel Block deleted.", "warning");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to delete hostel block from database.", "error");
    }
  }, [refreshData, showToast]);

  const value = useMemo(
    () => ({
      complaints, leaveRequests, attendance, visitors, notifications, messFeedback,
      students, wardens, rooms, resources, utilityData, messData, dashboardMetrics, toasts, loading, weeklyMessMenu, averageMessRatings, hostelBlocks,
      refreshData, setComplaints, setLeaveRequests, setStudents, setWardens, setNotifications, setMessFeedback,
      setLoading, showToast, removeToast, addComplaint, updateComplaint, submitComplaintFeedback,
      addLeaveRequest, updateLeaveRequest, updateAttendance, updateVisitors, updateVisitorStatus, addVisitor,
      updateMessData, addUtilityData, updateResources, addNotification, markAsRead, markAllAsRead, deleteNotification, clearNotifications, addRoom, addStudent,
      updateStudent, deleteStudent, createWarden, updateWarden, deleteWarden, updateWeeklyMessMenu, submitMessRating,
      addHostelBlock, updateHostelBlock, deleteHostelBlock,
    }),
    [
      complaints, leaveRequests, attendance, visitors, notifications, messFeedback,
      students, wardens, rooms, resources, utilityData, messData, dashboardMetrics, toasts, loading, weeklyMessMenu, averageMessRatings, hostelBlocks,
      refreshData, showToast, removeToast, addComplaint, updateComplaint, submitComplaintFeedback,
      addLeaveRequest, updateLeaveRequest, updateAttendance, updateVisitors, updateVisitorStatus, addVisitor,
      updateMessData, addUtilityData, updateResources, addNotification, markAsRead, markAllAsRead, deleteNotification, clearNotifications, addRoom, addStudent,
      updateStudent, deleteStudent, createWarden, updateWarden, deleteWarden, updateWeeklyMessMenu, submitMessRating,
      addHostelBlock, updateHostelBlock, deleteHostelBlock,
    ]
  );

  return <HostelContext.Provider value={value}>{children}</HostelContext.Provider>;
}

export function useHostel() {
  const ctx = useContext(HostelContext);
  if (!ctx) throw new Error("useHostel must be used within HostelProvider");
  return ctx;
}
