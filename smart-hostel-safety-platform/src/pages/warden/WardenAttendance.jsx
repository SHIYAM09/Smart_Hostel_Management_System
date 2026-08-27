import { useState, useEffect, useMemo } from "react";
import {
  AlertCircle,
  Download,
  Send,
  CheckCircle,
} from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { getIndianDateStr, getIndianTimeStr } from "../../utils/dateUtils";
import { exportToCSV } from "../../utils/exportUtils";

export default function WardenAttendance() {
  const { attendance, students, updateAttendance, showToast, refreshAttendance, refreshStudents } = useHostel();

  useEffect(() => {
    refreshAttendance();
  }, []);

  const [selectedDate, setSelectedDate] = useState(getIndianDateStr());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isUserEdited, setIsUserEdited] = useState(false);

  const mergedAttendance = useMemo(() => {
    if (!students || students.length === 0) {
      return attendance || [];
    }

    return students.map((s) => {
      const existing = (attendance || []).find((a) => {
        const aDate = a.date || a.attendanceDate;
        const matchDate = !aDate || String(aDate).slice(0, 10) === String(selectedDate).slice(0, 10);
        const matchStudent = String(a.studentId || a.id) === String(s.id) ||
                             (a.rollNo && String(a.rollNo).toLowerCase() === String(s.rollNo || s.rollNumber).toLowerCase()) ||
                             (a.studentName && String(a.studentName).toLowerCase() === String(s.name || s.fullName).toLowerCase());
        return matchStudent && matchDate;
      });

      return {
        id: existing?.id || s.id,
        studentId: s.id,
        studentName: s.name || s.fullName || "Student",
        rollNo: s.rollNo || s.rollNumber || "—",
        room: s.room || s.roomNumber || "Unassigned",
        block: s.block || s.hostelBlock || "Block A",
        date: selectedDate,
        time: existing?.time || existing?.remarks || (existing?.status === "present" ? "09:00 AM" : "—"),
        status: existing?.status ? String(existing.status).toLowerCase() : "present",
        absenceStreak: s.absenceStreak || 0,
      };
    });
  }, [students, attendance, selectedDate]);

  const [localAttendance, setLocalAttendance] = useState(mergedAttendance);

  useEffect(() => {
    if (!isUserEdited) {
      setLocalAttendance(mergedAttendance);
    }
  }, [mergedAttendance, isUserEdited]);

  const present = useMemo(() => localAttendance.filter((a) => String(a.status).toLowerCase() === "present").length, [localAttendance]);
  const absent = useMemo(() => localAttendance.filter((a) => String(a.status).toLowerCase() === "absent").length, [localAttendance]);
  const late = useMemo(() => localAttendance.filter((a) => String(a.status).toLowerCase() === "late").length, [localAttendance]);
  const allPresent = useMemo(() => localAttendance.length > 0 && localAttendance.every((a) => String(a.status).toLowerCase() === "present"), [localAttendance]);

  const toggleStudent = (targetId, checked) => {
    setSubmitted(false);
    setIsUserEdited(true);
    setLocalAttendance((prev) =>
      prev.map((a) => {
        if (a.id === targetId || String(a.id) === String(targetId) || String(a.studentId) === String(targetId)) {
          return {
            ...a,
            status: checked ? "present" : "absent",
            time: checked ? getIndianTimeStr() : "—",
            date: selectedDate,
          };
        }
        return a;
      })
    );
  };

  const toggleAll = (checked) => {
    setSubmitted(false);
    setIsUserEdited(true);
    setLocalAttendance((prev) =>
      prev.map((a) => ({
        ...a,
        status: checked ? "present" : "absent",
        time: checked ? getIndianTimeStr() : "—",
        date: selectedDate,
      }))
    );
  };

  const handleSubmitAttendance = async () => {
    setIsSubmitting(true);
    try {
      await updateAttendance(localAttendance);
      setSubmitted(true);
      setIsUserEdited(false);
      showToast("Attendance recorded successfully.", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Failed to save attendance to database.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const rows = (localAttendance || []).map((a) => {
      const roomStr = a.room || a.roomNumber || "";
      let derivedBlock = a.block || a.hostelBlock;
      if (roomStr && roomStr.includes("-")) {
        const prefix = roomStr.split("-")[0].trim().toUpperCase();
        if (prefix.length === 1) derivedBlock = `Block ${prefix}`;
      }
      if (!derivedBlock || derivedBlock === "Block A") {
        if (roomStr.startsWith("D")) derivedBlock = "Block D";
        else if (roomStr.startsWith("B")) derivedBlock = "Block B";
        else if (roomStr.startsWith("C")) derivedBlock = "Block C";
      }

      return {
        Student_Name: a.name || a.studentName || "Student",
        Roll_Number: a.rollNo || a.rollNumber || "—",
        Hostel_Block: derivedBlock || "Block A",
        Room_Number: roomStr || "Unassigned",
        Attendance_Date: selectedDate || a.date || new Date().toISOString().slice(0, 10),
        Time_Logged: a.time || "09:00 AM",
        Phone: a.phone || "—",
        Attendance_Status: (a.status || "PRESENT").toUpperCase(),
        Absence_Streak: a.absenceStreak || 0,
      };
    });
    exportToCSV(`Attendance_Log_${selectedDate}`, rows);
  };

  const anomalyText = useMemo(() => {
    const streaks = students.filter((s) => s.absenceStreak >= 2);
    if (!streaks.length) return null;
    return streaks.map((s) => `${s.name} (${s.room}) absent ${s.absenceStreak} nights`).join(". ");
  }, [students]);

  return (
    <div className="space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: localAttendance.length, c: "bg-blue-500" },
          { label: "Present", value: present, c: "bg-emerald-500" },
          { label: "Absent", value: absent, c: "bg-red-500" },
          { label: "Late", value: late, c: "bg-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-blue-50 shadow-sm text-center">
            <div className={cls("w-12 h-12 rounded-xl text-white text-2xl font-extrabold flex items-center justify-center mx-auto mb-2", s.c)}>{s.value}</div>
            <div className="text-sm font-semibold text-gray-600">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Date & Action Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-xl border border-blue-50 shadow-sm">
        <div className="flex items-center gap-3">
          <Input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSubmitted(false);
              setIsUserEdited(false);
            }} 
            className="w-auto font-medium" 
          />
          <span className="text-xs text-gray-500 font-medium">Select attendance date to submit</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleExportCSV}><Download size={16} />Export</Button>
          <Button 
            onClick={handleSubmitAttendance} 
            disabled={isSubmitting || submitted} 
            className={cls(
              "font-bold px-5 transition-all",
              submitted 
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none" 
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            )}
          >
            {isSubmitting ? (
              "Saving to Database..."
            ) : submitted ? (
              <><CheckCircle size={16} className="text-emerald-500" />Attendance Submitted</>
            ) : (
              <><Send size={16} />Submit Attendance</>
            )}
          </Button>
        </div>
      </div>

      {anomalyText && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center gap-4">
          <AlertCircle size={17} className="text-amber-600 shrink-0" />
          <div className="text-sm text-amber-800 font-medium"><strong>Anomaly:</strong> {anomalyText}.</div>
          <button onClick={() => showToast("Alert sent to concerned students.", "warning")} className="ml-auto text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-semibold shrink-0 transition-colors">Send Alert</button>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-[#f4f8fc]">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
              <input type="checkbox" checked={allPresent} onChange={(e) => toggleAll(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Mark All Present
            </label>
            <span className="text-xs text-gray-400">Unchecked = Absent</span>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Click checkboxes to mark Present/Absent, then click <strong className="text-emerald-700">Submit Attendance</strong> to save.
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-[#f4f8fc] border-b border-blue-100">
                {["Student", "Roll No", "Room", "Date", "Time", "Status", "Streak", "Present"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {localAttendance.map((a) => {
                const s = students.find((x) => x.id === a.studentId || String(x.id) === String(a.studentId));
                const isPresent = String(a.status).toLowerCase() === "present";
                return (
                  <tr key={a.id} className={cls("hover:bg-blue-50/30 transition-colors", !isPresent ? "bg-red-50/30" : "")}>
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={a.studentName} size="sm" /><span className="font-semibold text-gray-900 text-base">{a.studentName}</span></div></td>
                    <td className="px-5 py-4 font-mono text-sm font-medium text-gray-700">{a.rollNo}</td>
                    <td className="px-5 py-4 font-bold text-blue-700">{a.room}</td>
                    <td className="px-5 py-4 text-gray-600 text-sm">{selectedDate}</td>
                    <td className="px-5 py-4 font-mono text-sm text-gray-600">{a.time}</td>
                    <td className="px-5 py-4"><Badge status={a.status} /></td>
                    <td className="px-5 py-4">
                      {(s?.absenceStreak ?? 0) > 0 ? (
                        <span className={cls("text-sm font-bold px-2.5 py-1 rounded-full", (s?.absenceStreak ?? 0) >= 3 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700")}>{s?.absenceStreak}d</span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <input 
                        type="checkbox" 
                        checked={isPresent} 
                        onChange={(e) => toggleStudent(a.id, e.target.checked)} 
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                        title={isPresent ? "Present" : "Absent"} 
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Bar */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total: <strong>{localAttendance.length}</strong> | Present: <strong className="text-emerald-600">{present}</strong> | Absent: <strong className="text-red-600">{absent}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
