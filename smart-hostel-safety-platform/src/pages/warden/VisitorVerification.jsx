import { useState } from "react";
import {
  CheckCircle,
  Plus,
  XCircle,
} from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { Modal } from "../../components/common/Modal";
import { FormField } from "../../components/common/FormField";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { useTable } from "../../hooks/useTable";

const VISITOR_STATUSES = [
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const getNormalizedStatus = (rawStatus) => {
  if (!rawStatus) return "approved";
  const s = String(rawStatus).toLowerCase().replace(/_/g, "-");
  if (s === "rejected") return "rejected";
  return "approved";
};

const EMPTY_VISITOR_FORM = { visitorName: "", phone: "", relation: "Parent", purpose: "Family Visit", studentId: 1 };

export default function VisitorVerification() {
  const { visitors, students, updateVisitorStatus, addVisitor, addNotification, showToast } = useHostel();
  const [viewV, setViewV] = useState(null);
  const [modal, setModal] = useState(false);
  const [vForm, setVForm] = useState(EMPTY_VISITOR_FORM);

  const table = useTable(visitors, { searchKeys: ["visitorName", "studentName", "room", "purpose"], pageSize: 8 });

  const handleRegisterVisitor = () => {
    if (!vForm.visitorName.trim()) return;
    const selectedStudent = students.find((s) => String(s.id) === String(vForm.studentId)) || students[0];
    addVisitor({
      visitorName: vForm.visitorName.trim(),
      phone: vForm.phone.trim(),
      relation: vForm.relation,
      purpose: vForm.purpose,
      studentName: selectedStudent ? selectedStudent.name : "Student User",
      room: selectedStudent ? selectedStudent.room : "A-101",
      studentId: selectedStudent ? selectedStudent.id : 1,
    });
    setVForm(EMPTY_VISITOR_FORM);
    setModal(false);
  };

  const updateStatus = async (id, status) => {
    const targetV = visitors.find((v) => String(v.id) === String(id) || String(v.rawId) === String(id));
    await updateVisitorStatus(id, status);
    if (viewV?.id === id) setViewV((prev) => (prev ? { ...prev, status } : prev));
    const label = VISITOR_STATUSES.find((s) => s.value === status)?.label ?? status;
    showToast(`Visitor status updated to ${label}.`);

    if (targetV) {
      addNotification({
        title: `Visitor Request ${label}`,
        message: `Visitor pass request for ${targetV.visitorName || 'Visitor'} has been updated to ${label} by Warden.`,
        type: status === "approved" || status === "checked-in" || status === "in-campus" ? "success" : status === "rejected" ? "error" : "info",
        forRole: "student",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Input placeholder="Search visitors..." value={table.search} onChange={(e) => { table.setSearch(e.target.value); table.setPage(1); }} className="max-w-xs" />
        <Button onClick={() => setModal(true)}><Plus size={17} />Register Visitor</Button>
      </div>
      <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-blue-100">
          <h3 className="font-bold text-gray-900 text-base">Visitor Log</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage all visitors and update their status directly from this log.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-[#f4f8fc] border-b border-blue-100">
                {["Visitor", "Visiting", "Room", "Purpose", "ID Verified", "Risk", "Check In", "Status", "Update Status"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {table.paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-gray-500 text-sm">
                    No visitor logs recorded in database.
                  </td>
                </tr>
              ) : (
                table.paginated.map((v) => (
                <tr key={v.id} className={cls("hover:bg-blue-50/30 transition-colors", v.riskLevel === "high" ? "bg-red-50/40" : "")}>
                  <td className="px-5 py-4">
                    <button type="button" onClick={() => setViewV(v)} className="flex items-center gap-3 text-left">
                      <Avatar name={v.visitorName} size="sm" />
                      <div><div className="font-semibold text-gray-900 text-base">{v.visitorName}</div><div className="text-sm text-gray-400">{v.phone}</div></div>
                    </button>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-700 text-base">{v.studentName}</td>
                  <td className="px-5 py-4 font-bold text-blue-700">{v.room}</td>
                  <td className="px-5 py-4 text-gray-600 text-sm">{v.purpose}</td>
                  <td className="px-5 py-4">{v.idVerified ? <span className="flex items-center gap-1.5 text-sm text-emerald-700 font-semibold"><CheckCircle size={13} />Yes</span> : <span className="flex items-center gap-1.5 text-sm text-red-700 font-semibold"><XCircle size={13} />No</span>}</td>
                  <td className="px-5 py-4"><Badge status={v.riskLevel} /></td>
                  <td className="px-5 py-4 font-mono text-sm text-gray-700">{v.checkIn}</td>
                  <td className="px-5 py-4"><Badge status={v.status} /></td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateStatus(v.id, "approved")}
                        className={cls(
                          "px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors border shadow-sm",
                          v.status === "approved"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                        )}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(v.id, "rejected")}
                        className={cls(
                          "px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors border shadow-sm",
                          v.status === "rejected"
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        )}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
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
      <Modal open={!!viewV} onClose={() => setViewV(null)} title="Visitor Details">
        {viewV && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-5 bg-white/10 rounded-xl border border-white/20">
              <Avatar name={viewV.visitorName} size="lg" />
              <div>
                <div className="font-bold text-white text-base">{viewV.visitorName}</div>
                <div className="text-sm text-white/70">{viewV.phone}</div>
                <div className="flex gap-2 mt-1"><Badge status={viewV.riskLevel} /><Badge status={viewV.status} /></div>
              </div>
            </div>
            {[{ label: "Visiting", value: viewV.studentName }, { label: "Room", value: viewV.room }, { label: "Purpose", value: viewV.purpose }, { label: "Date", value: viewV.date }, { label: "Check In", value: viewV.checkIn }, { label: "Check Out", value: viewV.checkOut }].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-base py-2 border-b border-white/10 last:border-0">
                <span className="text-white/60">{label}</span><span className="font-semibold text-white">{value}</span>
              </div>
            ))}
            <FormField label="Update Status" darkMode>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => updateStatus(viewV.id, "approved")}
                  className={cls(
                    "flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition-colors border shadow-sm",
                    viewV.status === "approved"
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/30"
                  )}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(viewV.id, "rejected")}
                  className={cls(
                    "flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition-colors border shadow-sm",
                    viewV.status === "rejected"
                      ? "bg-red-600 text-white border-red-500"
                      : "bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-400/30"
                  )}
                >
                  Reject
                </button>
              </div>
            </FormField>
          </div>
        )}
      </Modal>
      <Modal open={modal} onClose={() => setModal(false)} title="Register Visitor">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Visitor Name" darkMode>
              <Input value={vForm.visitorName} onChange={(e) => setVForm((f) => ({ ...f, visitorName: e.target.value }))} placeholder="Full Name" darkMode />
            </FormField>
            <FormField label="Phone" darkMode>
              <Input value={vForm.phone} onChange={(e) => setVForm((f) => ({ ...f, phone: e.target.value }))} placeholder="9811234567" darkMode />
            </FormField>
          </div>
          <FormField label="Visiting Student" darkMode>
            <Select value={vForm.studentId} onChange={(e) => setVForm((f) => ({ ...f, studentId: e.target.value }))} darkMode>
              {students.map((s) => (<option key={s.id} value={s.id}>{s.name} — {s.room}</option>))}
            </Select>
          </FormField>
          <FormField label="Purpose" darkMode>
            <Select value={vForm.purpose} onChange={(e) => setVForm((f) => ({ ...f, purpose: e.target.value }))} darkMode>
              <option>Family Visit</option>
              <option>Document Delivery</option>
              <option>Pickup</option>
              <option>Other</option>
            </Select>
          </FormField>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleRegisterVisitor} className="flex-1">Check In</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
