// Grounding policy data and knowledge base rules for the AI Hostel Assistant.

export const HOSTEL_RULES = [
  "Room capacity, amenities, and allotments are fixed by the warden and cannot be self-changed.",
  "Ragging, smoking, alcohol, and unregistered electrical appliances are strictly prohibited.",
  "Visitors must be registered at the gate and are allowed only 9:00 AM – 8:00 PM.",
  "Maintain silence during study hours (7:00 PM – 9:00 PM) and after lights-out (11:00 PM).",
  "Report maintenance issues (electrical, plumbing, IT, etc.) via the Complaints page.",
  "Any planned absence of a night or more should be informed to the warden in advance as a leave request.",
];

export const HOSTEL_TIMINGS = {
  gateInTime: "10:30 PM (11:30 PM on weekends)",
  gateOutTime: "5:30 AM",
  breakfast: "7:30 AM – 9:00 AM",
  lunch: "12:30 PM – 2:00 PM",
  dinner: "7:30 PM – 9:00 PM",
  visitingHours: "9:00 AM – 8:00 PM",
  studyHours: "7:00 PM – 9:00 PM",
  attendanceMarking: "Daily, 9:30 PM – 11:00 PM at the block entrance",
};

export const HOSTEL_FEES = {
  roomRentSingleAC: "₹65,000 / year",
  roomRentDoubleSharing: "₹48,000 / year",
  roomRentTripleSharing: "₹38,000 / year",
  messFee: "₹4,500 / month (billed quarterly)",
  securityDeposit: "₹10,000 (refundable, one-time)",
  lateFeePenalty: "₹200/day after the due date",
  dueDate: "10th of every month for mess fees; start of semester for room rent",
};

export const HOSTEL_NOTICES = [
  "Hostel fee payment for the current semester closes on the 10th — pay via the college portal to avoid late fees.",
  "Mandatory fire safety drill scheduled — check the Notifications page for the exact date/time.",
  "Sunday special mess menu changes weekly; check Mess Menu page for today's items.",
  "Leave requests for more than 2 consecutive nights require written parental consent submitted to the warden.",
];

export const MESS_MENU = {
  today: {
    breakfast: ["Idli", "Sambar", "Coconut Chutney", "Tea / Coffee"],
    lunch: ["Steamed Rice", "Dal Tadka", "Sambar", "Curd", "Appalam"],
    dinner: ["Chapati", "Paneer Veg Kurma", "Jeera Rice", "Rasam", "Warm Milk"],
  },
};

/**
 * Builds a compact, role-aware context block that's injected into the
 * assistant's system instruction so answers stay grounded in real
 * (mock) hostel data instead of the model inventing details.
 */
export function buildAssistantContext({ role, userName }) {
  const lines = [];

  lines.push("=== HOSTEL RULES ===");
  lines.push(HOSTEL_RULES.map((r) => `- ${r}`).join("\n"));

  lines.push("\n=== TIMINGS ===");
  Object.entries(HOSTEL_TIMINGS).forEach(([k, v]) => lines.push(`- ${k}: ${v}`));

  lines.push("\n=== FEES ===");
  Object.entries(HOSTEL_FEES).forEach(([k, v]) => lines.push(`- ${k}: ${v}`));

  lines.push("\n=== NOTICES ===");
  HOSTEL_NOTICES.forEach((n) => lines.push(`- ${n}`));

  lines.push("\n=== TODAY'S MESS MENU ===");
  lines.push(`Breakfast: ${MESS_MENU.today.breakfast.join(", ")}`);
  lines.push(`Lunch: ${MESS_MENU.today.lunch.join(", ")}`);
  lines.push(`Dinner: ${MESS_MENU.today.dinner.join(", ")}`);

  if (role === "student") {
    const myAttendance = MY_ATTENDANCE_HISTORY.slice(0, 7);
    const pct = Math.round(
      (myAttendance.filter((r) => r.status === "present").length / myAttendance.length) * 100
    );
    lines.push(`\n=== ${userName || "STUDENT"}'S RECENT ATTENDANCE (last 7 records) ===`);
    lines.push(`Attendance rate: ${pct}%`);
    myAttendance.forEach((r) => lines.push(`- ${r.date}: ${r.status} (${r.time})`));

    const myComplaints = COMPLAINTS.filter((c) => c.studentId === "S001");
    lines.push(`\n=== ${userName || "STUDENT"}'S COMPLAINTS ===`);
    if (myComplaints.length === 0) lines.push("No complaints filed.");
    myComplaints.forEach((c) =>
      lines.push(`- [${c.status}] ${c.subject} (${c.category}, priority ${c.priority}), filed ${c.date}`)
    );

    const myVisitors = VISITORS.filter((v) => v.studentId === "S001");
    lines.push(`\n=== ${userName || "STUDENT"}'S VISITOR REQUESTS ===`);
    if (myVisitors.length === 0) lines.push("No visitor requests filed.");
    myVisitors.forEach((v) => lines.push(`- ${v.visitorName} — ${v.purpose}, ${v.date}, status: ${v.status}`));
  } else {
    lines.push(`\n=== OPEN COMPLAINTS (ALL STUDENTS) ===`);
    COMPLAINTS.filter((c) => c.status !== "resolved").forEach((c) =>
      lines.push(`- ${c.studentName} (${c.room}): ${c.subject} [${c.priority}]`)
    );
  }

  const myNotices = NOTIFICATIONS.filter((n) => n.forRole === "all" || n.forRole === role).slice(0, 5);
  lines.push("\n=== RECENT NOTIFICATIONS ===");
  myNotices.forEach((n) => lines.push(`- ${n.title}: ${n.message}`));

  return lines.join("\n");
}
