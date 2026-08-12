import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Badge } from "../../components/common/Badge";
import { StarDisplay } from "../../components/common/StarRating";
import { useTable } from "../../hooks/useTable";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

export default function AdminComplaints() {
  const { complaints, students } = useHostel();
  const table = useTable(complaints, { searchKeys: ["subject", "studentName", "room", "category"], pageSize: 8, defaultSort: { key: "date", dir: "desc" }, filterKey: "status" });

  const withFeedback = complaints.filter((c) => c.feedback).length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;

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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: complaints.length, c: "text-blue-700 bg-blue-50 border-blue-100" },
          { label: "Resolved", value: resolved, c: "text-emerald-700 bg-emerald-50 border-emerald-100" },
          { label: "With Feedback", value: withFeedback, c: "text-amber-700 bg-amber-50 border-amber-100" },
        ].map((s) => (
          <div key={s.label} className={cls("rounded-xl border p-4 text-center", s.c)}>
            <div className="text-2xl font-extrabold">{s.value}</div>
            <div className="text-sm font-semibold">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <Input placeholder="Search complaints..." value={table.search} onChange={(e) => { table.setSearch(e.target.value); table.setPage(1); }} className="max-w-xs" />
        <div className="flex flex-wrap gap-2">
          {["all", "open", "in-progress", "resolved"].map((f) => (
            <button key={f} onClick={() => { table.setFilter(f); table.setPage(1); }} className={cls("px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors", table.filter === f ? "bg-violet-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}>
              {f === "all" ? "All" : f.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-[#f4f8fc] border-b border-blue-100">
                {["ID", "Student", "Subject", "Category", "Priority", "Status", "Feedback", "Date"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {table.paginated.map((c) => {
                const info = getStudentInfo(c);
                return (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4 font-mono text-sm text-gray-500">{c.id}</td>
                    <td className="px-5 py-4"><div className="font-semibold text-gray-900">{info.name}</div><div className="text-xs text-gray-400">Room {info.room}</div></td>
                  <td className="px-5 py-4 text-gray-700 text-sm max-w-[200px] truncate">{c.subject}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{c.category}</td>
                  <td className="px-5 py-4"><Badge status={c.priority} /></td>
                  <td className="px-5 py-4"><Badge status={c.status} /></td>
                  <td className="px-5 py-4">
                    {c.feedback ? (
                      <div><StarDisplay rating={c.feedback.rating} /><p className="text-xs text-gray-500 mt-1 max-w-[150px] truncate">{c.feedback.comment}</p></div>
                    ) : c.status === "resolved" ? (
                      <span className="text-xs text-amber-600 font-semibold">Awaiting</span>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{c.date}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {table.paginated.length} of {table.total}</span>
          {table.totalPages > 1 && (
            <div className="flex gap-2">
              <Button variant="secondary" disabled={table.page <= 1} onClick={() => table.setPage(table.page - 1)}>Prev</Button>
              <Button variant="secondary" disabled={table.page >= table.totalPages} onClick={() => table.setPage(table.page + 1)}>Next</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
