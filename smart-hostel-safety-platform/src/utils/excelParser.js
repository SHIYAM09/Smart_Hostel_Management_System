import * as XLSX from "xlsx";

const HEADER_MAP = {
  name: ["name", "full name", "student name", "fullname"],
  rollNo: ["roll no", "rollno", "roll number", "roll", "roll no."],
  room: ["room", "room no", "room number", "room no."],
  course: ["course", "branch", "department"],
  year: ["year", "class year"],
  phone: ["phone", "mobile", "contact", "phone number"],
  email: ["email", "email id", "e-mail"],
};

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\./g, "");
}

function mapRow(row) {
  const keys = Object.keys(row);
  const mapped = {};

  for (const [field, aliases] of Object.entries(HEADER_MAP)) {
    const matchKey = keys.find((key) => aliases.includes(normalizeHeader(key)));
    if (matchKey) mapped[field] = String(row[matchKey] ?? "").trim();
  }

  return mapped;
}

/**
 * Parse an Excel workbook buffer into student records.
 * @param {ArrayBuffer} buffer
 * @returns {{ students: object[], errors: string[] }}
 */
export function parseStudentsFromExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return { students: [], errors: ["The Excel file has no worksheets."] };

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  if (!rows.length) return { students: [], errors: ["The Excel file is empty."] };

  const students = [];
  const errors = [];

  rows.forEach((row, index) => {
    const data = mapRow(row);
    if (!data.name && !data.rollNo) return;

    if (!data.name || !data.rollNo) {
      errors.push(`Row ${index + 2}: missing required Name or Roll Number.`);
      return;
    }

    students.push({
      id: `S${Date.now()}${index}`,
      name: data.name,
      rollNo: data.rollNo,
      room: data.room || "—",
      course: data.course || "—",
      year: data.year || "1st",
      phone: data.phone || "—",
      email: data.email || `${data.rollNo.toLowerCase()}@college.edu`,
      joinDate: new Date().toISOString().slice(0, 10),
      status: "active",
      absenceStreak: 0,
    });
  });

  if (!students.length && !errors.length) {
    errors.push("No valid student rows found. Use columns: Name, Roll No, Room, Course, Year, Phone, Email.");
  }

  return { students, errors };
}
