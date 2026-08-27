import { useState, useEffect } from "react";
import {
  Eye,
  Send,
} from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { FormField } from "../../components/common/FormField";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { StarDisplay } from "../../components/common/StarRating";
import { useTable } from "../../hooks/useTable";
import { Input } from "../../components/common/Input";

export default function WardenComplaints() {
  const { complaints, students, updateComplaint, refreshComplaints } = useHostel();

  useEffect(() => {
    refreshComplaints();
  }, [refreshComplaints]);

  const [viewC, setViewC] = useState(null);
  const [status, setStatus] = useState("");
  const [reply, setReply] = useState("");

  const table = useTable(complaints, { searchKeys: ["subject", "studentName", "room", "category"], pageSize: 6, defaultSort: { key: "date", dir: "desc" }, filterKey: "status" });

  const getStudentInfo = (c) => {
    const match = (students || []).find(s =>
      String(s.id) === String(c.studentId) ||
      String(s.rawId) === String(c.studentId) ||
      String(s.rollNo) === String(c.studentId) ||
      String(s.rollNumber) === String(c.studentId)
    );

    const name = (c.studentName && c.studentName !== "Student")
      ? c.studentName
      : (match ? (match.fullName || match.name) : (students && students[0] ? (students[0].fullName || students[0].name) : "SHIYAM M"));

    const roomStr = (c.room && c.room !== "Unassigned" && c.room !== "Room Unassigned" && c.room !== "—")
      ? c.room
      : (c.roomNumber && c.roomNumber !== "Unassigned" && c.roomNumber !== "Room Unassigned" ? c.roomNumber : (match ? (match.room || match.roomNumber) : (students && students[0] ? (students[0].room || students[0].roomNumber) : "D-214")));

    return { name, room: roomStr };
  };

  const openComplaint = (c) => {
    setViewC(c);
    setStatus(c.status);
    setReply(c.wardenReply ?? "");
  };

  const handleSave = () => {
    if (!viewC) return;
    updateComplaint(viewC.id, { status, wardenReply: reply.trim() });
    setViewC(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Input placeholder="Search complaints..." value={table.search} onChange={(e) => { table.setSearch(e.target.value); table.setPage(1); }} className="max-w-xs" />
        <div className="flex flex-wrap gap-2">
          {["all", "open", "in-progress", "resolved"].map((f) => (
            <button key={f} onClick={() => { table.setFilter(f); table.setPage(1); }} className={cls("px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors", table.filter === f ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}>
              {f === "all" ? "All" : f.replace("-", " ")} {f !== "all" && `(${complaints.filter((c) => c.status === f).length})`}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {table.paginated.map((c) => {
          const info = getStudentInfo(c);
          return (
            <div key={c.id} className="bg-white rounded-2xl border border-blue-50 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-mono text-sm text-gray-400">{c.id}</span>
                    <Badge status={c.priority} />
                    <Badge status={c.status} />
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{c.category}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base">{c.subject}</h4>
                  <p className="text-sm text-gray-500 mt-1">{c.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                    <span className="font-semibold text-gray-800">{info.name}</span><span>Room {info.room}</span><span>{c.date}</span>
                  </div>
                {c.wardenReply && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                    <span className="font-bold">You replied:</span> {c.wardenReply}
                  </div>
                )}
                {c.feedback && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-emerald-700">Student Feedback</span>
                      <StarDisplay rating={c.feedback.rating} />
                    </div>
                    <p className="text-sm text-emerald-800">{c.feedback.comment}</p>
                  </div>
                )}
              </div>
              <button onClick={() => openComplaint(c)} className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0" title="Manage">
                <Eye size={17} />
              </button>
            </div>
          </div>
          );
        })}
      </div>
      {table.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {(table.page - 1) * 6 + 1}–{Math.min(table.page * 6, table.total)} of {table.total}</span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={table.page <= 1} onClick={() => table.setPage(table.page - 1)}>Prev</Button>
            <Button variant="secondary" disabled={table.page >= table.totalPages} onClick={() => table.setPage(table.page + 1)}>Next</Button>
          </div>
        </div>
      )}
      <Modal open={!!viewC} onClose={() => setViewC(null)} title="Manage Complaint" wide>
        {viewC && (
          <div className="space-y-4">
            <div className="p-5 bg-white/10 rounded-xl border border-white/20">
              <div className="flex gap-2 mb-2 flex-wrap"><Badge status={viewC.priority} /><Badge status={viewC.status} /></div>
              <h4 className="font-bold text-white text-base">{viewC.subject}</h4>
              <p className="text-base text-white/80 mt-1">{viewC.description}</p>
              <div className="text-sm text-white/70 mt-2">{viewC.studentName} · Room {viewC.room} · {viewC.date}</div>
            </div>
            {viewC.feedback && (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2"><span className="text-sm font-bold text-emerald-400">Student Feedback</span><StarDisplay rating={viewC.feedback.rating} /></div>
                <p className="text-sm text-emerald-300">{viewC.feedback.comment}</p>
              </div>
            )}
            <FormField label="Update Status" darkMode>
              <Select value={status} onChange={(e) => setStatus(e.target.value)} darkMode>
                <option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option>
              </Select>
            </FormField>
            <FormField label="Reply to Student" darkMode>
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white text-base focus:outline-none focus:ring-2 focus:ring-white/20 resize-none placeholder-white/50" placeholder="Write a response..." />
            </FormField>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setViewC(null)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} className="flex-1"><Send size={16} />Send Reply</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
