import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { Modal } from "../../components/common/Modal";
import { FormField } from "../../components/common/FormField";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { useTable } from "../../hooks/useTable";

export default function WardenLeave() {
  const { leaveRequests, students, updateLeaveRequest, refreshLeaveRequests } = useHostel();

  useEffect(() => {
    refreshLeaveRequests();
  }, [refreshLeaveRequests]);

  const [viewL, setViewL] = useState(null);
  const [note, setNote] = useState("");

  const table = useTable(leaveRequests, { searchKeys: ["studentName", "room", "reason"], pageSize: 8, defaultSort: { key: "submittedAt", dir: "desc" }, filterKey: "status" });

  const handleAction = (status) => {
    if (!viewL) return;
    updateLeaveRequest(viewL.id, status, note.trim());
    setViewL(null);
    setNote("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button key={f} onClick={() => { table.setFilter(f); table.setPage(1); }} className={cls("px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors", table.filter === f ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}>
            {f} {f !== "all" && `(${leaveRequests.filter((l) => l.status === f).length})`}
          </button>
        ))}
      </div>
      <Input placeholder="Search leave requests..." value={table.search} onChange={(e) => { table.setSearch(e.target.value); table.setPage(1); }} className="max-w-xs" />
      <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-[#f4f8fc] border-b border-blue-100">
                {["Student", "Room", "From", "To", "Reason", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {table.paginated.map((l) => {
                const sMatch = (students || []).find((s) => s.name === l.studentName || String(s.id) === String(l.studentId) || (s.fullName && s.fullName === l.studentName));
                const roomDisplay = sMatch?.room && sMatch.room !== "Unassigned" ? sMatch.room : l.room;
                return (
                <tr key={l.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={l.studentName} size="sm" /><span className="font-semibold text-gray-900">{l.studentName}</span></div></td>
                  <td className="px-5 py-4 font-bold text-blue-700">{roomDisplay}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{l.fromDate}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{l.toDate}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 max-w-[180px] truncate">{l.reason}</td>
                  <td className="px-5 py-4"><Badge status={l.status} /></td>
                  <td className="px-5 py-4">
                    {l.status === "pending" ? (
                      <div className="flex gap-2">
                        <button onClick={() => { setViewL(l); setNote(""); }} className="p-2 rounded-lg bg-emerald-50 text-emerald-600" title="Review"><CheckCircle size={15} /></button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Reviewed</span>
                    )}
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
        {table.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
            <Button variant="secondary" disabled={table.page <= 1} onClick={() => table.setPage(table.page - 1)}>Prev</Button>
            <Button variant="secondary" disabled={table.page >= table.totalPages} onClick={() => table.setPage(table.page + 1)}>Next</Button>
          </div>
        )}
      </div>
      <Modal open={!!viewL} onClose={() => setViewL(null)} title="Review Leave Request">
        {viewL && (
          <div className="space-y-4">
            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
              <div className="font-bold text-white">{viewL.studentName} · Room {viewL.room}</div>
              <div className="text-sm text-white/70 mt-1">{viewL.fromDate} → {viewL.toDate}</div>
              <p className="text-sm text-white/80 mt-2">{viewL.reason}</p>
            </div>
            <FormField label="Warden Note (optional)" darkMode>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white text-base focus:outline-none focus:ring-2 focus:ring-white/20 resize-none placeholder-white/50" placeholder="Add a note for the student..." />
            </FormField>
            <div className="flex gap-3">
              <Button onClick={() => handleAction("rejected")} className="flex-1 bg-red-600 hover:bg-red-700"><XCircle size={16} />Reject</Button>
              <Button onClick={() => handleAction("approved")} className="flex-1"><CheckCircle size={16} />Approve</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
