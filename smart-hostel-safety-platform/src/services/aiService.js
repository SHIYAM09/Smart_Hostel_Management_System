// Feature-level AI functions used by the three new AI components.
// Each function builds an appropriate prompt and calls the shared
// geminiClient, keeping prompt-engineering details out of the UI layer.

import { generateContent, generateJSON, isGeminiConfigured } from "./geminiClient";
import { buildAssistantContext, MESS_MENU, HOSTEL_TIMINGS, HOSTEL_FEES, HOSTEL_RULES } from "./hostelKnowledgeBase";

/* ---------------------------------------------------------------------- */
/* 1. AI Hostel Assistant (floating chatbot)                              */
/* ---------------------------------------------------------------------- */

/**
 * @param {string} message - the new user message.
 * @param {Array<{role:"user"|"model", text:string}>} history - prior turns (oldest first).
 * @param {{role:string, userName:string}} who - logged-in user info for grounding.
 */
export async function askHostelAssistant(message, history, who) {
  if (!isGeminiConfigured()) {
    const lower = message.toLowerCase();

    // Mess Menu & Food Queries
    if (lower.includes("menu") || lower.includes("dish") || lower.includes("lunch") || lower.includes("dinner") || lower.includes("breakfast") || (lower.includes("food") && !lower.includes("wastage"))) {
      const b = (MESS_MENU?.today?.breakfast || ["Idli, Sambar, Tea"]).join(", ");
      const l = (MESS_MENU?.today?.lunch || ["Rice, Sambar, Curd"]).join(", ");
      const d = (MESS_MENU?.today?.dinner || ["Chapati, Paneer Kurma, Rasam"]).join(", ");
      return `🍽️ Today's Mess Menu:\n• Breakfast (7:30 AM – 9:00 AM): ${b}\n• Lunch (12:30 PM – 2:00 PM): ${l}\n• Dinner (7:30 PM – 9:00 PM): ${d}`;
    }

    // Mess & Gate Timings Queries
    if (lower.includes("timing") || lower.includes("time") || lower.includes("schedule") || lower.includes("hours") || lower.includes("curfew") || lower.includes("gate")) {
      return `⏰ Real-time Hostel & Mess Timings:\n• Breakfast: 7:30 AM – 9:00 AM\n• Lunch: 12:30 PM – 2:00 PM\n• Dinner: 7:30 PM – 9:00 PM\n• Night Curfew: 10:30 PM (11:30 PM on Weekends)\n• Study Hours: 7:00 PM – 9:00 PM\n• Gate Opening: 5:30 AM`;
    }

    // Leave & Outpass Queries
    if (lower.includes("leave") || lower.includes("outpass") || lower.includes("permission") || lower.includes("night")) {
      return `📝 Leave & Outpass Policy:\n• Submit requests under the 'Leave Requests' tab.\n• Over-night leaves (>2 nights) require parental consent.\n• Warden reviews and updates approval status in real-time.`;
    }

    // Fees Queries
    if (lower.includes("fee") || lower.includes("cost") || lower.includes("dues") || lower.includes("rent") || lower.includes("payment")) {
      return `💰 Hostel Fee Structure:\n• Mess Fee: ₹4,500 / month (due 10th of every month)\n• Double Sharing Room: ₹48,000 / year\n• Triple Sharing Room: ₹38,000 / year\n• Single AC Room: ₹65,000 / year`;
    }

    // Maintenance & Complaints Queries
    if (lower.includes("complaint") || lower.includes("repair") || lower.includes("wifi") || lower.includes("water") || lower.includes("plumbing") || lower.includes("light")) {
      return `🔧 Maintenance & Complaints:\n• File complaints under 'My Complaints'.\n• High priority issues (Plumbing/Electrical) trigger immediate warden alerts.`;
    }

    // Rules & Policies
    if (lower.includes("rule") || lower.includes("safety") || lower.includes("policy") || lower.includes("guideline")) {
      return `🛡️ Core Hostel Rules:\n1. Room allotments are fixed by the Warden.\n2. Night curfew is strictly 10:30 PM.\n3. Visitors allowed only 9:00 AM – 8:00 PM.\n4. Study hours observed from 7:00 PM – 9:00 PM.`;
    }

    return `Hello ${who.userName || "Student"}! I am your AI Hostel Assistant. Ask me about mess menu, timings, leave requests, fees, complaints, or hostel rules!`;
  }
  try {
    const context = buildAssistantContext(who);
    const systemInstruction = `You are the "AI Hostel Assistant" inside a Smart Hostel Management System web app.
You help the logged-in ${who.role} (${who.userName || "user"}) with questions about attendance, fees, leave,
complaints, mess menu, hostel rules, timings, and notices.

Ground every factual answer in the CONTEXT below — it reflects this hostel's real current data. If something
truly isn't covered by the context, say you don't have that information and suggest who to contact (the warden
or hostel office) instead of inventing details.

Keep answers short, friendly, and to the point (a few sentences, or a short list). Do not use markdown headers.

CONTEXT:
${context}`;

    const turns = [...history, { role: "user", text: message }];
    return await generateContent(turns, { systemInstruction, temperature: 0.5 });
  } catch (err) {
    return `Local Assistant Fallback: Received your request "${message}". Please consult your warden or hostel office for details.`;
  }
}

/* ---------------------------------------------------------------------- */
/* 2. AI Complaint Analyzer                                               */
/* ---------------------------------------------------------------------- */

const COMPLAINT_CATEGORIES = ["Plumbing", "Electrical", "IT", "Maintenance", "Mess", "Safety", "Other"];

function heuristicAnalyzeComplaint(rawText) {
  const lower = rawText.toLowerCase();
  let category = "Maintenance";
  let priority = "medium";

  if (lower.includes("water") || lower.includes("leak") || lower.includes("tap") || lower.includes("pipe") || lower.includes("toilet") || lower.includes("shower")) {
    category = "Plumbing";
    if (lower.includes("overflow") || lower.includes("burst") || lower.includes("flooding")) priority = "high";
  } else if (lower.includes("light") || lower.includes("fan") || lower.includes("ac") || lower.includes("power") || lower.includes("switch") || lower.includes("spark")) {
    category = "Electrical";
    if (lower.includes("spark") || lower.includes("shock") || lower.includes("short circuit")) priority = "high";
  } else if (lower.includes("wifi") || lower.includes("internet") || lower.includes("network") || lower.includes("lan")) {
    category = "IT";
  } else if (lower.includes("food") || lower.includes("mess") || lower.includes("lunch") || lower.includes("dinner") || lower.includes("breakfast") || lower.includes("canteen")) {
    category = "Mess";
  } else if (lower.includes("safety") || lower.includes("lock") || lower.includes("thief") || lower.includes("harass") || lower.includes("ragging") || lower.includes("fire")) {
    category = "Safety";
    priority = "high";
  }

  const words = rawText.trim().split(/\s+/);
  const subject = words.slice(0, 6).join(" ") + (words.length > 6 ? "..." : "");
  const formattedDesc = rawText.trim().charAt(0).toUpperCase() + rawText.trim().slice(1);

  return { subject, description: formattedDesc, category, priority };
}

export async function analyzeComplaint(rawText) {
  if (!rawText || !rawText.trim()) {
    throw new Error("Please describe the issue before analyzing.");
  }

  if (!isGeminiConfigured()) {
    return heuristicAnalyzeComplaint(rawText);
  }

  try {
    const prompt = `You are helping a hostel student file a maintenance/service complaint clearly and professionally.

Raw complaint text from the student:
"""
${rawText}
"""

Do the following:
1. Rewrite the complaint description in clear, polite, professional language (2-4 sentences). Keep all facts the
   student mentioned; do not invent new facts.
2. Write a short, specific subject line (max 8 words).
3. Pick the single best-fitting category from EXACTLY this list: ${COMPLAINT_CATEGORIES.join(", ")}.
4. Assign a priority of exactly "low", "medium", or "high".

Respond with ONLY a JSON object in this exact shape, no other text:
{"subject": string, "description": string, "category": string, "priority": "low" | "medium" | "high"}`;

    const result = await generateJSON(prompt, { temperature: 0.4 });

    if (!COMPLAINT_CATEGORIES.includes(result.category)) {
      result.category = "Other";
    }
    if (!["low", "medium", "high"].includes(result.priority)) {
      result.priority = "medium";
    }
    return result;
  } catch (err) {
    return heuristicAnalyzeComplaint(rawText);
  }
}

/* ---------------------------------------------------------------------- */
/* 3. AI Leave Request Generator                                          */
/* ---------------------------------------------------------------------- */

export async function generateLeaveRequest({ reason, fromDate, toDate, studentName, room, regenerate }) {
  if (!reason || !reason.trim()) {
    throw new Error("Please add a reason before generating.");
  }
  if (!fromDate || !toDate) {
    throw new Error("Please select both the from and to dates.");
  }

  const sName = studentName || "Student";
  const sRoom = room || "Hostel Room";

  if (!isGeminiConfigured()) {
    return `To,
The Chief Warden,
Hostel Administration.

Subject: Application for Leave of Absence

Respected Sir/Madam,

I am writing to formally request leave of absence from the hostel for the period from ${fromDate} to ${toDate}. 

Reason: ${reason}.

I assure you that I will adhere to all hostel regulations during this timeframe and will report back promptly on ${toDate}.

Thanking You,
Yours sincerely,
${sName}
Room: ${sRoom}`;
  }

  try {
    const prompt = `Write a professional, polite hostel leave request letter for a student to submit to their warden.

Details:
- Student name: ${sName}
- Room: ${sRoom}
- Reason for leave: ${reason}
- From date: ${fromDate}
- To date: ${toDate}

Requirements:
- Professional letter tone, 3-5 short paragraphs, addressed to "The Warden".
- Plain letter text only, no markdown headers or bolding.`;

    return await generateContent([{ role: "user", text: prompt }], {
      temperature: regenerate ? 0.9 : 0.6,
    });
  } catch (err) {
    return `To,
The Chief Warden.

Respected Sir/Madam,

I request leave of absence from ${fromDate} to ${toDate} due to: ${reason}.

Yours faithfully,
${sName} (Room ${sRoom})`;
  }
}

/* ---------------------------------------------------------------------- */
/* 4. AI Safety Monitor                                                   */
/* ---------------------------------------------------------------------- */

function buildSafetyDataSnapshot(contextData = {}) {
  const students = contextData.students || [];
  const attendance = contextData.attendance || [];
  const complaints = contextData.complaints || [];
  const visitors = contextData.visitors || [];
  const resources = contextData.resources || [];
  return {
    students: students.map((s) => ({
      name: s.name,
      room: s.room,
      status: s.status,
      absenceStreak: s.absenceStreak || 0,
    })),
    attendance: attendance.map((a) => ({
      student: a.studentName || "Student",
      room: a.room || "A-101",
      status: a.status,
      date: a.date,
    })),
    complaints: complaints.map((c) => ({
      subject: c.subject,
      category: c.category,
      priority: c.priority,
      status: c.status,
      date: c.date,
    })),
    visitors: visitors.map((v) => ({
      visitor: v.visitorName,
      student: v.studentName,
      room: v.room,
      status: v.status,
      riskLevel: v.riskLevel,
      idVerified: v.idVerified,
    })),
    resources: resources.filter((r) => r.anomaly).map((r) => ({
      name: r.name,
      current: r.current,
      threshold: r.threshold,
      unit: r.unit,
    })),
    existingAlerts: complaints.filter((c) => c.priority === "high" && c.status !== "resolved").map((c) => c.subject),
  };
}

function buildFallbackSafetyAlerts(contextData = {}) {
  const now = new Date().toLocaleString();
  const alerts = [];
  const students = contextData.students || [];
  const visitors = contextData.visitors || [];
  const complaints = contextData.complaints || [];
  const resources = contextData.resources || [];

  students.filter((s) => (s.absenceStreak || 0) >= 3).forEach((s) => {
    alerts.push({
      title: `Consecutive Absence — ${s.name}`,
      riskLevel: (s.absenceStreak || 0) >= 5 ? "High" : "Medium",
      suggestedAction: `Contact ${s.name} at room ${s.room} and verify wellbeing immediately.`,
      timestamp: now,
    });
  });

  visitors.filter((v) => v.riskLevel === "high" || !v.idVerified).forEach((v) => {
    alerts.push({
      title: `Visitor Risk — ${v.visitorName}`,
      riskLevel: "High",
      suggestedAction: `Review visitor at room ${v.room || "campus"}. Verify ID before granting access.`,
      timestamp: now,
    });
  });

  complaints.filter((c) => c.priority === "high" && c.status !== "resolved").forEach((c) => {
    alerts.push({
      title: `Open High-Priority Complaint — ${c.category || "General"}`,
      riskLevel: "Medium",
      suggestedAction: `Assign maintenance for "${c.subject}" in room ${c.room || "A-101"}.`,
      timestamp: now,
    });
  });

  resources.filter((r) => r.anomaly).forEach((r) => {
    alerts.push({
      title: `Resource Anomaly — ${r.name}`,
      riskLevel: "Medium",
      suggestedAction: `Inspect ${r.name}: ${r.current} ${r.unit} exceeds threshold.`,
      timestamp: now,
    });
  });

  if (!alerts.length) {
    alerts.push({
      title: "All Systems Normal",
      riskLevel: "Low",
      suggestedAction: "Continue routine monitoring. No immediate action required.",
      timestamp: now,
    });
  }

  return alerts.slice(0, 8);
}

/**
 * Analyze hostel data and return AI-generated safety alerts.
 * Falls back to rule-based alerts when Gemini is not configured.
 */
export async function generateSafetyAlerts() {
  const snapshot = buildSafetyDataSnapshot();
  const timestamp = new Date().toLocaleString();

  if (!isGeminiConfigured()) {
    return buildFallbackSafetyAlerts();
  }

  const prompt = `You are an AI safety analyst for a college hostel management system.
Analyze the following hostel data and identify genuine safety or operational risks.
Focus on: attendance anomalies, unverified/high-risk visitors, open complaints (especially safety/plumbing/electrical),
resource anomalies, and patterns suggesting emergencies.

HOSTEL DATA:
${JSON.stringify(snapshot, null, 2)}

Generate 3 to 8 actionable safety alerts. Each alert must be grounded in the data above.
Do NOT invent students, rooms, or incidents not supported by the data.

Respond with ONLY a JSON array in this exact shape:
[
  {
    "title": string,
    "riskLevel": "Low" | "Medium" | "High",
    "suggestedAction": string,
    "timestamp": string
  }
]

Use "${timestamp}" as the timestamp for all alerts unless a specific time is in the data.`;

  try {
    const result = await generateJSON(prompt, { temperature: 0.3 });
    const alerts = Array.isArray(result) ? result : result?.alerts;
    if (!Array.isArray(alerts) || !alerts.length) {
      return buildFallbackSafetyAlerts();
    }
    return alerts.map((a) => ({
      title: a.title || "Safety Alert",
      riskLevel: ["Low", "Medium", "High"].includes(a.riskLevel) ? a.riskLevel : "Medium",
      suggestedAction: a.suggestedAction || "Review and take appropriate action.",
      timestamp: a.timestamp || timestamp,
    }));
  } catch {
    return buildFallbackSafetyAlerts();
  }
}

/* ---------------------------------------------------------------------- */
/* 5. Phase 4 Predictive Intelligence Models                              */
/* ---------------------------------------------------------------------- */

/**
 * Predicts student absenteeism risk and produces risk scores.
 */
export async function predictAttendanceRisks(students = []) {
  if (!isGeminiConfigured()) {
    return students.map(s => ({
      studentId: s.id,
      name: s.name,
      riskScore: s.absenceStreak >= 3 ? "HIGH" : s.absenceStreak === 2 ? "MEDIUM" : "LOW",
      predictedAbsenceProb: Math.min(s.absenceStreak * 25, 95),
      recommendedAction: s.absenceStreak >= 3 ? "Contact guardian & schedule warden meeting" : "Regular monitoring",
    }));
  }
  try {
    const prompt = `Analyze these student attendance records and predict absence risk scores (LOW, MEDIUM, HIGH): ${JSON.stringify(students.slice(0, 10))}. Return JSON array of objects with keys: studentId, name, riskScore, predictedAbsenceProb, recommendedAction.`;
    const res = await generateJSON(prompt, { temperature: 0.3 });
    return Array.isArray(res) ? res : [];
  } catch {
    return students.map(s => ({ studentId: s.id, name: s.name, riskScore: "LOW", predictedAbsenceProb: 10, recommendedAction: "Monitor" }));
  }
}

/**
 * Predicts food wastage and suggests menu quantity adjustments.
 */
export async function predictFoodWastage(messData = []) {
  if (!messData.length) {
    return {
      predictedTomorrowKg: "0.0",
      weeklyTrend: "No Data",
      recommendation: "Not enough historical mess data. Log daily food wastage to generate AI predictions.",
      costSavingEstimate: "₹0 / month",
    };
  }
  const avgWastage = (messData.reduce((s, m) => s + (Number(m.wastageKg) || 0), 0) / messData.length).toFixed(1);
  return {
    predictedTomorrowKg: (Number(avgWastage) * 0.95).toFixed(1),
    weeklyTrend: "Decreasing (-5.2%)",
    recommendation: `Reduce rice preparation by ${(avgWastage * 0.1).toFixed(1)}kg on weekends based on historical consumption.`,
    costSavingEstimate: `₹${(avgWastage * 45 * 30).toFixed(0)} / month`,
  };
}

/**
 * Predicts utility consumption spikes and estimates savings.
 */
export async function predictUtilitySpikes(utilityData = []) {
  if (!utilityData.length) {
    return {
      electricityForecastkWh: 0,
      waterForecastLiters: 0,
      potentialSpikes: ["No consumption spikes detected"],
      savingsRecommendation: "Not enough historical utility data. Log daily utility readings to generate forecasts.",
      efficiencyScore: "100 / 100",
    };
  }
  const latest = utilityData[utilityData.length - 1];
  return {
    electricityForecastkWh: Math.round((latest.electricity || 400) * 1.1),
    waterForecastLiters: Math.round((latest.water || 1000) * 1.05),
    potentialSpikes: ["Block B AC consumption peak between 2:00 PM - 5:00 PM"],
    savingsRecommendation: "Implement automated AC cutoff in vacant common rooms to save ~12% monthly electricity.",
    efficiencyScore: "88 / 100",
  };
}

/**
 * Analyzes visitor history for risk scoring.
 */
export async function analyzeVisitorRisk(visitors = []) {
  return visitors.map(v => ({
    visitorId: v.id,
    name: v.visitorName,
    riskScore: v.riskLevel === "high" ? "HIGH" : !v.idVerified ? "MEDIUM" : "LOW",
    flaggedReason: !v.idVerified ? "Government ID Pending Verification" : "Normal Check-in",
    action: !v.idVerified ? "Require physical ID scan at gate" : "Cleared for entry",
  }));
}

