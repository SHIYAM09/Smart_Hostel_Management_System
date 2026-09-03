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

  const DEFAULT_RESOURCES = [];

  const DEFAULT_UTILITY_DATA = [];

  const [wardens, setWardens] = useState([]);
  const [resources, setResources] = useState(() => {
    const saved = localStorage.getItem("hostel_resources");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
  });

  const [utilityData, setUtilityData] = useState(() => {
    const saved = localStorage.getItem("hostel_utility_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
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

  // Helpers to get current role
  const getUserRole = () => {
    const savedUserStr = localStorage.getItem("user");
    if (savedUserStr) {
      try { return JSON.parse(savedUserStr).role || "student"; } catch {}
    }
    return "student";
  };

  // --- Granular Resource Fetchers (On-Demand) ---

  const refreshComplaints = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const userRole = getUserRole();
      const res = userRole === "student" ? await studentService.getComplaints() : await wardenService.getAllComplaints();
      if (Array.isArray(res)) {
        const fetched = res.map((c) => {
          const match = (students || []).find(
            (s) =>
              String(s.id) === String(c.studentId) ||
              String(s.rawId) === String(c.studentId) ||
              String(s.rollNo) === String(c.studentId) ||
              String(s.rollNumber) === String(c.studentId) ||
              String(s.id) === String(c.student?.id) ||
              String(s.rawId) === String(c.student?.id)
          );
          const studentName =
            c.studentName && c.studentName !== "Student"
              ? c.studentName
              : c.student?.fullName || c.student?.name || (match ? match.fullName || match.name : students && students[0] ? students[0].fullName || students[0].name : "SHIYAM M");

          const room =
            c.roomNumber && c.roomNumber !== "Unassigned" && c.roomNumber !== "Room Unassigned" && c.roomNumber !== "—" && c.roomNumber !== ""
              ? c.roomNumber
              : c.room && c.room !== "Unassigned" && c.room !== "Room Unassigned" && c.room !== "—"
              ? c.room
              : match
              ? match.room || match.roomNumber
              : students && students[0]
              ? students[0].room || students[0].roomNumber
              : "D-214";

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
            date: c.createdAt ? String(c.createdAt).slice(0, 19).replace("T", " ") : c.date || new Date().toISOString().slice(0, 10),
            wardenReply: c.wardenRemarks || c.wardenReply || null,
            description: c.description || "",
            feedback: c.feedback || null,
          };
        });
        setComplaints(fetched);
        localStorage.setItem("hostel_complaints", JSON.stringify(fetched));
      }
    } catch (err) {
      console.warn("Failed to fetch complaints:", err);
    }
  }, [students]);

  const refreshLeaveRequests = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const userRole = getUserRole();
      const res = userRole === "student" ? await studentService.getLeaveRequests() : await wardenService.getAllLeaveRequests();
      if (Array.isArray(res)) {
        const fetched = res.map((l) => {
          const match = (students || []).find(
            (s) =>
              String(s.id) === String(l.studentId) ||
              String(s.rawId) === String(l.studentId) ||
              (s.rollNo && String(s.rollNo).toLowerCase() === String(l.studentId).toLowerCase()) ||
              (s.name && String(s.name).toLowerCase() === String(l.studentName).toLowerCase())
          );
          let name = l.studentName;
          if (!name || name === "Student") {
            name = match ? match.name || match.fullName : students && students[0]?.name ? students[0].name : "SHIYAM M";
          }
          let room = match ? match.room || match.roomNumber : null;
          if (!room || room === "Unassigned") {
            room = l.roomNumber || l.room;
          }
          if (!room || room === "Unassigned" || room === "A-101") {
            room = students && students[0]?.room ? students[0].room : "D-214";
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
    } catch (err) {
      console.warn("Failed to fetch leave requests:", err);
    }
  }, [students]);

  const refreshRooms = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await wardenService.getRooms();
      if (Array.isArray(res)) {
        const fetchedRooms = res.map((r) => ({
          id: r.id,
          number: r.roomNumber || r.number || `${r.id}`,
          block: r.block || "Block D",
          floor: r.floor || 1,
          capacity: r.capacity || 2,
          occupied: r.occupiedBeds || r.occupied || 0,
          status: r.occupiedBeds >= r.capacity ? "occupied" : r.occupiedBeds > 0 ? "partial" : "vacant",
          condition: r.condition || "good",
        }));
        setRooms(fetchedRooms);
        localStorage.setItem("hostel_rooms", JSON.stringify(fetchedRooms));
      }
    } catch (err) {
      console.warn("Failed to fetch rooms:", err);
    }
  }, []);

  const refreshStudents = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await wardenService.getAllStudents();
      if (Array.isArray(res)) {
        const fetched = res.map((s) => ({
          id: s.id,
          rawId: s.id,
          name: s.fullName || s.name || "Student",
          fullName: s.fullName || s.name || "Student",
          rollNo: s.rollNumber || s.rollNo || `22CS${s.id}`,
          rollNumber: s.rollNumber || s.rollNo || `22CS${s.id}`,
          room: s.roomNumber || s.room || "Unassigned",
          roomNumber: s.roomNumber || s.room || "Unassigned",
          block: s.hostelBlock || s.block || "Block D",
          department: s.department || "CSE",
          course: s.department || s.course || "CSE",
          year: s.yearOfStudy ? `${s.yearOfStudy}` : s.year || "1",
          yearOfStudy: s.yearOfStudy || 1,
          phone: s.phone || "",
          email: s.email || "",
          status: s.status?.toLowerCase() || "active",
          absenceStreak: s.absenceStreak || 0,
        }));
        setStudents(fetched);
        localStorage.setItem("hostel_students", JSON.stringify(fetched));
      }
    } catch (err) {
      console.warn("Failed to fetch students:", err);
    }
  }, []);

  const refreshWardens = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await adminService.getAllWardens();
      if (Array.isArray(res)) {
        const fetched = res.map((w) => {
          const blockName = w.hostelBlock || w.block || "Block D";
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
            studentsManaged: w.studentsManaged || 0,
            joined: w.joinedDate || w.joined || "2024-01-15",
          };
        });
        setWardens(fetched);
        localStorage.setItem("hostel_wardens", JSON.stringify(fetched));
      }
    } catch (err) {
      console.warn("Failed to fetch wardens:", err);
    }
  }, []);

  const refreshVisitors = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const userRole = getUserRole();
      const res = userRole === "student" ? await studentService.getVisitors() : await wardenService.getVisitorLogs();
      if (Array.isArray(res)) {
        const fetched = res.map((v) => {
          const match = (students || []).find(
            (s) =>
              String(s.id) === String(v.studentId) ||
              String(s.rawId) === String(v.studentId) ||
              (s.rollNo && String(s.rollNo).toLowerCase() === String(v.studentId).toLowerCase()) ||
              (s.name && String(s.name).toLowerCase() === String(v.studentName).toLowerCase())
          );
          let studentName = v.studentName;
          if (!studentName || studentName === "Student") {
            studentName = match ? match.name || match.fullName : students && students[0]?.name ? students[0].name : "SHIYAM M";
          }
          let room = match ? match.room || match.roomNumber : null;
          if (!room || room === "Unassigned") {
            room = v.roomNumber || v.room;
          }
          if (!room || room === "Unassigned" || room === "A-101") {
            room = students && students[0]?.room ? students[0].room : "D-214";
          }
          return {
            id: v.id ? String(v.id) : `V${Date.now()}`,
            rawId: v.id || v.visitorId,
            visitorName: v.visitorName || "Visitor",
            studentName: studentName,
            room: room,
            relation: v.relation || v.relationship || "Parent",
            phone: v.phone || "",
            purpose: v.purpose || "",
            status: (v.status || "pending").toLowerCase().replace(/_/g, "-"),
            checkIn: v.checkInTime || v.checkIn || "—",
            checkOut: v.checkOutTime || v.checkOut || "—",
            date: v.logDate || v.date || new Date().toISOString().slice(0, 10),
            riskLevel: v.riskLevel?.toLowerCase() || "low",
            idVerified: v.idVerified ?? false,
          };
        });
        setVisitors(fetched);
        localStorage.setItem("hostel_visitors", JSON.stringify(fetched));
      }
    } catch (err) {
      console.warn("Failed to fetch visitors:", err);
    }
  }, [students]);

  const refreshAttendance = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const userRole = getUserRole();
      const res = userRole === "student" ? await studentService.getAttendance() : await wardenService.getAttendanceByDate(getIndianDateStr());
      if (Array.isArray(res)) {
        const uniqueMap = new Map();
        res.forEach((a) => {
          const dateStr = a.attendanceDate ? String(a.attendanceDate).slice(0, 10) : a.date || getIndianDateStr();
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
      console.warn("Failed to fetch attendance:", err);
    }
  }, []);

  const refreshMessMenu = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const menuData = await wardenService.getWeeklyMessMenu();
      if (Array.isArray(menuData)) {
        setWeeklyMessMenu(menuData);
        localStorage.setItem("hostel_weekly_mess_menu", JSON.stringify(menuData));
      }
    } catch (err) {
      console.warn("Failed to fetch weekly mess menu:", err);
    }
  }, []);

  const refreshMess = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const [wastageRes, feedbackRes] = await Promise.allSettled([
        wardenService.getFoodWastage(),
        wardenService.getMessFeedback(),
      ]);

      if (wastageRes.status === "fulfilled" && Array.isArray(wastageRes.value)) {
        const mapped = wastageRes.value.map((m) => ({
          ...m,
          id: m.id ? String(m.id) : `W${Date.now()}`,
          date: m.logDate || m.date || new Date().toISOString().slice(0, 10),
          breakfastWastage: Number(m.breakfastWastage) || 0,
          lunchWastage: Number(m.lunchWastage) || 0,
          dinnerWastage: Number(m.dinnerWastage) || 0,
          wastageKg: Number(m.wastageKg) || 0,
          overallRating: Number(m.overallRating) || 4.5,
          remarks: m.remarks || "",
        }));
        setMessData(mapped);
        localStorage.setItem("hostel_mess_data", JSON.stringify(mapped));
      }

      if (feedbackRes.status === "fulfilled" && Array.isArray(feedbackRes.value)) {
        const mapped = feedbackRes.value.map((f) => ({
          ...f,
          mealType: f.mealType || f.meal || "BREAKFAST",
          meal: f.mealType || f.meal || "breakfast",
          rating: Number(f.rating) || 5,
          comment: f.comments || f.comment || f.remarks || "",
          remarks: f.comments || f.comment || f.remarks || "",
          date: f.date ? String(f.date).slice(0, 10) : "",
          createdAt: f.createdAt || new Date().toISOString(),
        }));
        setMessFeedback(mapped);
        localStorage.setItem("hostel_mess_feedback", JSON.stringify(mapped));
      }

      if (menuRes.status === "fulfilled" && Array.isArray(menuRes.value)) {
        setWeeklyMessMenu(menuRes.value);
        localStorage.setItem("hostel_weekly_mess_menu", JSON.stringify(menuRes.value));
      }
    } catch (err) {
      console.warn("Failed to fetch mess data:", err);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await wardenService.getAllNotifications();
      if (Array.isArray(res)) {
        const mapped = res.map((n) => ({
          ...n,
          id: n.id ? String(n.id) : `N${Date.now()}`,
          title: n.title || "Notification",
          message: n.message || "",
          type: n.type || "info",
          forRole: n.forRole || "all",
          read: Boolean(n.read),
          time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
        }));
        setNotifications(mapped);
        localStorage.setItem("hostel_notifications", JSON.stringify(mapped));
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const userRole = getUserRole();
      const res =
        userRole === "admin"
          ? await adminService.getDashboard()
          : userRole === "warden"
          ? await wardenService.getDashboard()
          : await studentService.getDashboard();
      if (res) {
        setDashboardMetrics(res);
      }
    } catch (err) {
      console.warn("Failed to fetch dashboard metrics:", err);
    }
  }, []);

  const refreshResources = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await wardenService.getResources();
      if (Array.isArray(res)) {
        setResources(res);
        localStorage.setItem("hostel_resources", JSON.stringify(res));
      }
    } catch (err) {
      console.warn("Failed to fetch resources:", err);
    }
  }, []);

  const refreshUtilities = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await wardenService.getUtilities();
      if (Array.isArray(res)) {
        const mapped = res.map((u) => ({
          ...u,
          id: u.id ? String(u.id) : `UT${Date.now()}`,
          date: u.readingDate || u.date || new Date().toISOString().slice(0, 10),
          electricity: Number(u.electricityUsage ?? u.electricity ?? 0),
          water: Number(u.waterUsage ?? u.water ?? 0),
          internet: Number(u.internetUsage ?? u.internet ?? 0),
          generator: Number(u.generatorUsage ?? u.generator ?? 0),
          maintenanceCost: Number(u.maintenanceCost ?? 0),
          hostelBlock: u.hostelBlock || "Block D",
          remarks: u.remarks || "",
        }));
        setUtilityData(mapped);
        localStorage.setItem("hostel_utility_data", JSON.stringify(mapped));
      }
    } catch (err) {
      console.warn("Failed to fetch utilities:", err);
    }
  }, []);

  const refreshHostelBlocks = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await adminService.getHostelBlocks();
      if (Array.isArray(res)) {
        setHostelBlocks(res);
        localStorage.setItem("hostel_blocks", JSON.stringify(res));
      }
    } catch (err) {
      console.warn("Failed to fetch hostel blocks:", err);
    }
  }, []);

  const refreshAISafetyData = useCallback(async () => {
    const savedUserStr = localStorage.getItem("user");
    let role = "student";
    try {
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        role = (u.role || u.roles?.[0] || "student").toLowerCase();
      }
    } catch {}

    setLoading(true);
    const tasks = [
      refreshAttendance(),
      refreshVisitors(),
      refreshComplaints(),
    ];
    if (role.includes("warden") || role.includes("admin")) {
      tasks.push(refreshUtilities());
    }
    await Promise.allSettled(tasks);
    setLoading(false);
  }, [refreshAttendance, refreshVisitors, refreshComplaints, refreshUtilities]);

  // Global manual refresh if user clicks a refresh button
  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([
      refreshNotifications(),
      refreshDashboard(),
    ]);
    setLoading(false);
  }, [refreshNotifications, refreshDashboard]);

  // No initial mount background fetches. APIs execute strictly on-demand per page or UI action!

  // Sync student profile info into existing DB attendance records
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

  // --- Actions & Mutations (Triggering ONLY relevant resource refresh) ---

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

  const addComplaint = useCallback(async (complaint) => {
    try {
      const created = await studentService.createComplaint(complaint);
      if (created) {
        const mapped = {
          ...created,
          id: created.id ? String(created.id) : `C${Date.now()}`,
          subject: created.title || created.subject || complaint.subject || complaint.title || "Complaint",
          description: created.description || complaint.description || "",
          status: (created.status || "OPEN").toLowerCase(),
          priority: (created.priority || "MEDIUM").toLowerCase(),
          date: created.createdAt ? String(created.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
          wardenReply: created.wardenRemarks || created.wardenReply || null,
        };
        setComplaints((prev) => {
          const next = [mapped, ...(prev || [])];
          localStorage.setItem("hostel_complaints", JSON.stringify(next));
          return next;
        });
      }
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
  }, [addNotification, showToast]);

  const updateComplaint = useCallback(async (id, updates) => {
    try {
      const targetRawId = updates.rawId || id;
      if (updates.status) {
        await wardenService.updateComplaintStatus(targetRawId, updates.status);
      }
      setComplaints((prev) => {
        const next = (prev || []).map((c) =>
          String(c.id) === String(id) || String(c.rawId) === String(id)
            ? { ...c, ...updates, status: (updates.status || c.status).toLowerCase() }
            : c
        );
        localStorage.setItem("hostel_complaints", JSON.stringify(next));
        return next;
      });
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
  }, [addNotification, showToast]);

  const submitComplaintFeedback = useCallback(async (complaintId, rating, comment) => {
    try {
      await studentService.submitComplaintFeedback(complaintId, rating, comment);
      setComplaints((prev) => {
        const next = (prev || []).map((c) =>
          String(c.id) === String(complaintId) || String(c.rawId) === String(complaintId)
            ? { ...c, feedbackRating: rating, feedbackComment: comment }
            : c
        );
        localStorage.setItem("hostel_complaints", JSON.stringify(next));
        return next;
      });
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
  }, [addNotification, showToast]);

  const addLeaveRequest = useCallback(async (req) => {
    try {
      const created = await studentService.applyLeave(req);
      if (created) {
        const mapped = {
          ...created,
          id: created.id ? String(created.id) : `LR${Date.now()}`,
          fromDate: created.startDate ? String(created.startDate).slice(0, 10) : (req.fromDate || req.startDate || ""),
          toDate: created.endDate ? String(created.endDate).slice(0, 10) : (req.toDate || req.endDate || ""),
          submittedAt: created.createdAt ? String(created.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
          wardenNote: created.wardenRemarks || created.wardenNote || null,
          status: (created.status || "PENDING").toLowerCase(),
        };
        setLeaveRequests((prev) => {
          const next = [mapped, ...(prev || [])];
          localStorage.setItem("hostel_leave_requests", JSON.stringify(next));
          return next;
        });
      }
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
  }, [addNotification, showToast]);

  const updateLeaveRequest = useCallback(async (id, status, wardenNote = "") => {
    try {
      await wardenService.updateLeaveStatus(id, status, wardenNote);
      setLeaveRequests((prev) => {
        const next = (prev || []).map((l) =>
          String(l.id) === String(id) || String(l.rawId) === String(id)
            ? { ...l, status: String(status).toLowerCase(), wardenNote: wardenNote || l.wardenNote }
            : l
        );
        localStorage.setItem("hostel_leave_requests", JSON.stringify(next));
        return next;
      });
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
  }, [addNotification, showToast]);

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
      const res = await wardenService.markBulkAttendance(bulkPayload);
      if (Array.isArray(res) && res.length > 0) {
        setAttendance((prev) =>
          prev.map((item) => {
            const match = res.find((r) => String(r.studentId) === String(item.studentId || item.id));
            if (match) {
              return {
                ...item,
                id: match.id || item.id,
                status: (match.status || item.status || "PRESENT").toUpperCase(),
              };
            }
            return item;
          })
        );
      }
      showToast("Attendance submitted successfully.");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to persist attendance to database.", "error");
    }
  }, [showToast]);

  const updateVisitorStatus = useCallback(async (id, newStatus) => {
    const targetV = visitors.find((v) => String(v.id) === String(id) || String(v.rawId) === String(id));
    const rawId = targetV?.rawId || targetV?.id || id;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formattedStatus = (newStatus || "").toLowerCase().replace(/_/g, "-");
    const backendStatus = formattedStatus === "approved" ? "APPROVED" : formattedStatus === "rejected" ? "REJECTED" : formattedStatus.toUpperCase().replace(/-/g, "_");

    setVisitors((prev) => {
      const next = prev.map((v) => {
        const match = String(v.id) === String(id) || String(v.rawId) === String(id);
        if (!match) return v;
        return {
          ...v,
          status: formattedStatus,
          checkIn: formattedStatus === "checked-in" || formattedStatus === "in-campus" ? (v.checkIn === "—" ? now : v.checkIn) : v.checkIn,
          checkOut: formattedStatus === "checked-out" ? now : v.checkOut,
        };
      });
      localStorage.setItem("hostel_visitors", JSON.stringify(next));
      return next;
    });

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
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update visitor status in database.", "error");
    }
  }, [visitors, showToast]);

  const toggleVisitorIdVerification = useCallback(async (id, overrideVerified, idProofType) => {
    let updatedTarget = null;
    setVisitors((prev) => {
      const next = prev.map((v) => {
        const match = String(v.id) === String(id) || String(v.rawId) === String(id);
        if (!match) return v;
        const newVerified = overrideVerified !== undefined ? Boolean(overrideVerified) : !v.idVerified;
        const newRisk = newVerified ? "low" : (v.riskLevel === "high" ? "high" : "medium");
        const proof = idProofType || v.idProofType || "Aadhaar Card";
        updatedTarget = {
          ...v,
          idVerified: newVerified,
          riskLevel: newRisk,
          idProofType: proof,
        };
        return updatedTarget;
      });
      localStorage.setItem("hostel_visitors", JSON.stringify(next));
      return next;
    });

    if (updatedTarget) {
      showToast(
        `Visitor ID for ${updatedTarget.visitorName} ${updatedTarget.idVerified ? "verified successfully" : "marked as unverified"}.`
      );
      try {
        const rawId = updatedTarget.rawId || updatedTarget.id;
        await wardenService.logVisitorEntry({
          id: String(rawId),
          visitorId: String(rawId),
          visitorName: updatedTarget.visitorName || "",
          studentName: updatedTarget.studentName || "",
          roomNumber: updatedTarget.room || "A-101",
          relation: updatedTarget.relation || "Parent",
          phone: updatedTarget.phone || "",
          purpose: updatedTarget.purpose || "Visit",
          status: (updatedTarget.status || "APPROVED").toUpperCase().replace(/-/g, "_"),
          checkInTime: updatedTarget.checkIn || "—",
          checkOutTime: updatedTarget.checkOut || "—",
          riskLevel: (updatedTarget.riskLevel || "LOW").toUpperCase(),
          idVerified: Boolean(updatedTarget.idVerified),
        });
      } catch (err) {
        // Silently handle backend sync if offline
      }
    }
  }, [showToast]);

  const updateVisitors = useCallback(async (updater) => {
    setVisitors((prev) => {
      return typeof updater === "function" ? updater(prev) : updater;
    });
    await refreshVisitors();
  }, [refreshVisitors]);

  const addVisitor = useCallback(async (visitor) => {
    try {
      const saved = await studentService.registerVisitor(visitor);
      const isVerified = Boolean(visitor.idVerified);
      const newVisitorItem = {
        id: saved?.id ? String(saved.id) : `V${Date.now()}`,
        rawId: saved?.id,
        visitorName: visitor.visitorName || saved?.visitorName || "Visitor",
        studentName: visitor.studentName || saved?.studentName || "SHIYAM M",
        relation: visitor.relationship || visitor.relation || "Parent",
        phone: visitor.phone || "",
        purpose: visitor.purpose || "Visit",
        status: (saved?.status || visitor.status || "pending").toLowerCase(),
        checkIn: isVerified ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
        checkOut: "—",
        date: visitor.logDate || new Date().toISOString().slice(0, 10),
        riskLevel: isVerified ? "low" : (visitor.riskLevel || "medium").toLowerCase(),
        idVerified: isVerified,
        idProofType: visitor.idProofType || "Aadhaar Card",
      };

      setVisitors((prev) => {
        const next = [newVisitorItem, ...prev.filter((p) => String(p.id) !== String(newVisitorItem.id))];
        localStorage.setItem("hostel_visitors", JSON.stringify(next));
        return next;
      });

      showToast("Visitor request submitted successfully.");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to register visitor in database.", "error");
    }
  }, [showToast]);

  const addRoom = useCallback(async (newRoom) => {
    try {
      const created = await wardenService.createRoom({
        roomNumber: newRoom.number || newRoom.roomNumber || "D-214",
        hostelBlock: newRoom.block || "Block D",
        capacity: Number(newRoom.capacity) || 2,
        occupiedBeds: Number(newRoom.occupied) || 0,
        status: (newRoom.status || "vacant").toUpperCase(),
        floor: Number(newRoom.floor) || 1,
        roomType: newRoom.type || "Double",
      });

      const r = created?.data || created || {};
      const newRoomObj = {
        id: r.id || r._id || `R_${Date.now()}`,
        rawId: r.id || r._id,
        number: r.roomNumber || newRoom.number || newRoom.roomNumber,
        roomNumber: r.roomNumber || newRoom.number || newRoom.roomNumber,
        block: r.hostelBlock || newRoom.block || "Block D",
        hostelBlock: r.hostelBlock || newRoom.block || "Block D",
        floor: Number(r.floor) || Number(newRoom.floor) || 1,
        type: r.roomType || newRoom.type || "Double",
        capacity: Number(r.capacity) || Number(newRoom.capacity) || 2,
        occupied: Number(r.occupiedBeds) || Number(newRoom.occupied) || 0,
        status: (r.status || newRoom.status || "available").toLowerCase(),
        students: r.students || [],
      };

      setRooms((prev) => [...prev, newRoomObj]);
      showToast(`Room ${newRoom.number || newRoom.roomNumber} added successfully.`);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to create room in database.", "error");
    }
  }, [showToast]);

  const addStudent = useCallback(async (studentData) => {
    try {
      const created = await wardenService.createStudent({
        fullName: studentData.name || studentData.fullName,
        rollNumber: studentData.rollNo || studentData.rollNumber,
        roomNumber: studentData.room || studentData.roomNumber || "Unassigned",
        hostelBlock: studentData.block || studentData.hostelBlock || "Block D",
        department: studentData.department || studentData.course || "CSE",
        status: (studentData.status || "active").toUpperCase(),
        yearOfStudy: Number(studentData.year) || 1,
        phone: studentData.phone || "",
        email: studentData.email || "",
      });

      const newStudentObj = {
        id: created?.id || created?._id || `STU_${Date.now()}`,
        rawId: created?.id || created?._id,
        name: created?.fullName || studentData.name || studentData.fullName,
        fullName: created?.fullName || studentData.name || studentData.fullName,
        rollNo: created?.rollNumber || studentData.rollNo || studentData.rollNumber,
        rollNumber: created?.rollNumber || studentData.rollNo || studentData.rollNumber,
        room: created?.roomNumber || studentData.room || studentData.roomNumber || "Unassigned",
        roomNumber: created?.roomNumber || studentData.room || studentData.roomNumber || "Unassigned",
        block: created?.hostelBlock || studentData.block || studentData.hostelBlock || "Block D",
        hostelBlock: created?.hostelBlock || studentData.block || studentData.hostelBlock || "Block D",
        course: created?.department || studentData.course || studentData.department || "B.Tech IT",
        department: created?.department || studentData.course || studentData.department || "B.Tech IT",
        year: created?.yearOfStudy ? `${created.yearOfStudy} Year` : (studentData.year || "1 Year"),
        phone: created?.phone || studentData.phone || "",
        email: created?.email || studentData.email || "",
        status: (created?.status || studentData.status || "active").toLowerCase(),
        streak: "—",
      };

      setStudents((prev) => [...prev, newStudentObj]);
      showToast(`Student ${studentData.name || studentData.fullName} added successfully.`);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to create student in database.", "error");
    }
  }, [showToast]);

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
        hostelBlock: data.block || data.hostelBlock || "Block D",
        yearOfStudy: parsedYear,
        phone: data.phone || "",
        email: data.email || "",
        status: (data.status || "active").toUpperCase(),
      };

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
              year: `${parsedYear} Year`,
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
      showToast("Student updated successfully.");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update student in database.", "error");
    }
  }, [showToast]);

  const deleteStudent = useCallback(async (id) => {
    try {
      setStudents((prev) => prev.filter((s) => String(s.id) !== String(id) && String(s.rawId) !== String(id)));
      await wardenService.deleteStudent(id);
      showToast("Student deleted.", "warning");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to delete student from database.", "error");
    }
  }, [showToast]);

  const createWarden = useCallback(async (wardenData) => {
    try {
      const res = await adminService.createWarden(wardenData);
      const w = res?.data || res || {};
      const mapped = {
        id: w.id || `W${Date.now()}`,
        rawId: w.id || `W${Date.now()}`,
        name: w.fullName || w.name || wardenData.name || "Warden",
        fullName: w.fullName || w.name || wardenData.name || "Warden",
        email: w.email || wardenData.email || "",
        phone: w.phone || wardenData.phone || "",
        block: w.hostelBlock || w.block || wardenData.block || "Block D",
        hostelBlock: w.hostelBlock || w.block || wardenData.block || "Block D",
        studentsManaged: w.studentsManaged || 0,
        joinedDate: w.joinedDate || new Date().toISOString().slice(0, 10),
        status: (w.status || wardenData.status || "active").toLowerCase(),
      };
      setWardens((prev) => [mapped, ...prev]);
      showToast("Warden created successfully.");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to create warden in database.", "error");
    }
  }, [showToast]);

  const updateWarden = useCallback(async (id, wardenData) => {
    try {
      const targetId = id || wardenData?.id || wardenData?.rawId;
      setWardens((prev) =>
        prev.map((w) => {
          if (String(w.id) === String(targetId) || String(w.rawId) === String(targetId)) {
            return {
              ...w,
              name: wardenData.name || wardenData.fullName || w.name,
              fullName: wardenData.name || wardenData.fullName || w.fullName,
              email: wardenData.email || w.email,
              phone: wardenData.phone || w.phone,
              block: wardenData.block || wardenData.hostelBlock || w.block,
              hostelBlock: wardenData.block || wardenData.hostelBlock || w.hostelBlock,
              status: (wardenData.status || w.status).toLowerCase(),
            };
          }
          return w;
        })
      );
      await adminService.updateWarden(targetId, wardenData);
      showToast("Warden updated.");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update warden in database.", "error");
    }
  }, [showToast]);

  const deleteWarden = useCallback(async (id) => {
    try {
      setWardens((prev) => prev.filter((w) => String(w.id) !== String(id) && String(w.rawId) !== String(id)));
      await adminService.deleteWarden(id);
      showToast("Warden deleted.", "warning");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to delete warden from database.", "error");
    }
  }, [showToast]);

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
    const validRatings = messFeedback.map((f) => Number(f.rating || 0)).filter((r) => r > 0);
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
      const rating = Number(entry.overallRating) || 0;

      const saved = await wardenService.recordFoodWastage({
        breakfastWastage: b,
        lunchWastage: l,
        dinnerWastage: d,
        wastageKg: wastageVal,
        overallRating: rating,
        logDate: entry.date || entry.logDate || getIndianDateStr(),
        remarks: entry.remarks || "",
      });

      const newRecord = {
        id: saved?.id || saved?._id || `W${Date.now()}`,
        date: saved?.logDate || saved?.date || entry.date || entry.logDate || getIndianDateStr(),
        breakfastWastage: b,
        lunchWastage: l,
        dinnerWastage: d,
        wastageKg: wastageVal,
        overallRating: rating,
        remarks: entry.remarks || "",
      };

      setMessData((prev) => [...(prev || []), newRecord]);
      showToast("Mess wastage record saved.");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to record food wastage in database.", "error");
    }
  }, [showToast]);

  const addUtilityData = useCallback(async (entry) => {
    try {
      const saved = await wardenService.recordUtility({
        electricityUsage: Number(entry.electricity) || 0,
        waterUsage: Number(entry.water) || 0,
        internetUsage: Number(entry.internet) || 0,
        generatorUsage: Number(entry.generator) || 0,
        maintenanceCost: Number(entry.maintenanceCost) || 0,
        readingDate: entry.date || getIndianDateStr(),
        hostelBlock: entry.hostelBlock || "Block D",
        remarks: entry.remarks || "",
      });

      const newRecord = {
        id: saved?.id || saved?._id || `UT${Date.now()}`,
        date: saved?.readingDate || saved?.date || entry.date || getIndianDateStr(),
        electricity: Number(entry.electricity) || 0,
        water: Number(entry.water) || 0,
        internet: Number(entry.internet) || 0,
        generator: Number(entry.generator) || 0,
        maintenanceCost: Number(entry.maintenanceCost) || 0,
        hostelBlock: entry.hostelBlock || "Block D",
        remarks: entry.remarks || "",
      };

      setUtilityData((prev) => [...(prev || []), newRecord]);
      showToast("Utility data saved.");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to record utility data in database.", "error");
    }
  }, [showToast]);

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
      showToast(`Mess menu for ${dayOfWeek} saved & synced across application.`);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update mess menu in database.", "error");
    }
  }, [showToast]);

  const submitMessRating = useCallback(async (mealTypeOrData, rating, comment = "") => {
    try {
      const todayDate = getIndianDateStr();
      let payload = {};

      if (typeof mealTypeOrData === "object" && mealTypeOrData !== null) {
        payload = {
          ...mealTypeOrData,
          date: todayDate,
        };
      } else {
        const mealType = String(mealTypeOrData).toUpperCase();
        payload = {
          mealType,
          rating: Number(rating),
          remarks: comment.trim(),
          comments: comment.trim(),
          date: todayDate,
        };
      }

      const saved = await studentService.submitMessFeedback(payload);

      setMessFeedback((prev) => {
        const nextList = [...(prev || [])];
        const meals = ["breakfast", "lunch", "snacks", "dinner"];
        meals.forEach((m) => {
          const mRating = saved?.[`${m}Rating`] || payload[`${m}Rating`];
          if (mRating) {
            nextList.push({
              mealType: m.toUpperCase(),
              meal: m,
              rating: Number(mRating),
              remarks: saved?.[`${m}Comment`] || payload[`${m}Comment`] || "",
              comments: saved?.[`${m}Comment`] || payload[`${m}Comment`] || "",
              date: todayDate,
              createdAt: new Date().toISOString(),
            });
          }
        });

        if (!meals.some((m) => saved?.[`${m}Rating`] || payload[`${m}Rating`])) {
          nextList.push({
            mealType: String(mealTypeOrData).toUpperCase(),
            meal: String(mealTypeOrData).toLowerCase(),
            rating: Number(rating),
            remarks: comment.trim(),
            comments: comment.trim(),
            date: todayDate,
            createdAt: new Date().toISOString(),
          });
        }

        localStorage.setItem("hostel_mess_feedback", JSON.stringify(nextList));
        return nextList;
      });

      showToast("Submitted today's mess feedback successfully!");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to submit mess rating to database.", "error");
    }
  }, [showToast]);

  const addHostelBlock = useCallback(async (blockData) => {
    try {
      const res = await adminService.createHostelBlock({
        name: blockData.name || blockData.blockName || "New Block",
        rooms: Number(blockData.rooms) || Number(blockData.capacity) || 30,
        type: blockData.type || "Boys",
        floors: Number(blockData.floors) || 3,
        occupied: Number(blockData.occupied) || 0,
        students: Number(blockData.students) || 0,
        warden: blockData.warden || "Unassigned",
      });
      const b = res?.data || res || {};
      const mapped = {
        id: b.id || `HB${Date.now()}`,
        name: b.name || blockData.name || "New Block",
        type: b.type || blockData.type || "Boys",
        floors: Number(b.floors) || Number(blockData.floors) || 3,
        rooms: Number(b.rooms) || Number(blockData.rooms) || 30,
        occupied: Number(b.occupied) || 0,
        students: Number(b.students) || 0,
        warden: b.warden || blockData.warden || "Unassigned",
      };
      setHostelBlocks((prev) => [mapped, ...prev]);
      showToast(`Hostel Block ${blockData.name || blockData.blockName} added successfully.`);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to create hostel block in database.", "error");
    }
  }, [showToast]);

  const updateHostelBlock = useCallback(async (id, blockData) => {
    try {
      setHostelBlocks((prev) =>
        prev.map((b) => {
          if (String(b.id) === String(id)) {
            return {
              ...b,
              name: blockData.name || b.name,
              type: blockData.type || b.type,
              floors: blockData.floors ? Number(blockData.floors) : b.floors,
              rooms: blockData.rooms ? Number(blockData.rooms) : b.rooms,
              warden: blockData.warden || b.warden,
            };
          }
          return b;
        })
      );
      await adminService.updateHostelBlock(id, blockData);
      showToast("Hostel Block updated.");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to update hostel block in database.", "error");
    }
  }, [showToast]);

  const deleteHostelBlock = useCallback(async (id) => {
    try {
      setHostelBlocks((prev) => prev.filter((b) => String(b.id) !== String(id)));
      await adminService.deleteHostelBlock(id);
      showToast("Hostel Block deleted.", "warning");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to delete hostel block from database.", "error");
    }
  }, [showToast]);

  const value = useMemo(
    () => ({
      complaints, leaveRequests, attendance, visitors, notifications, messFeedback,
      students, wardens, rooms, resources, utilityData, messData, dashboardMetrics, toasts, loading, weeklyMessMenu, averageMessRatings, hostelBlocks,
      refreshData, refreshAISafetyData, refreshComplaints, refreshLeaveRequests, refreshRooms, refreshStudents, refreshWardens, refreshVisitors,
      refreshAttendance, refreshMess, refreshMessMenu, refreshNotifications, refreshDashboard, refreshResources, refreshUtilities, refreshHostelBlocks,
      setComplaints, setLeaveRequests, setStudents, setWardens, setNotifications, setMessFeedback,
      setLoading, showToast, removeToast, addComplaint, updateComplaint, submitComplaintFeedback,
      addLeaveRequest, updateLeaveRequest, updateAttendance, updateVisitors, updateVisitorStatus, toggleVisitorIdVerification, addVisitor,
      updateMessData, addUtilityData, updateResources, addNotification, markAsRead, markAllAsRead, deleteNotification, clearNotifications, addRoom, addStudent,
      updateStudent, deleteStudent, createWarden, updateWarden, deleteWarden, updateWeeklyMessMenu, submitMessRating,
      addHostelBlock, updateHostelBlock, deleteHostelBlock,
    }),
    [
      complaints, leaveRequests, attendance, visitors, notifications, messFeedback,
      students, wardens, rooms, resources, utilityData, messData, dashboardMetrics, toasts, loading, weeklyMessMenu, averageMessRatings, hostelBlocks,
      refreshData, refreshAISafetyData, refreshComplaints, refreshLeaveRequests, refreshRooms, refreshStudents, refreshWardens, refreshVisitors,
      refreshAttendance, refreshMess, refreshMessMenu, refreshNotifications, refreshDashboard, refreshResources, refreshUtilities, refreshHostelBlocks,
      showToast, removeToast, addComplaint, updateComplaint, submitComplaintFeedback,
      addLeaveRequest, updateLeaveRequest, updateAttendance, updateVisitors, updateVisitorStatus, toggleVisitorIdVerification, addVisitor,
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
