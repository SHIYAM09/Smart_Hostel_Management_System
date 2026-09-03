import { useState, useEffect } from "react";
import {
  CheckCircle,
  Plus,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Eye,
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

const EMPTY_VISITOR_FORM = {
  visitorName: "",
  phone: "",
  relation: "Parent",
  purpose: "Family Visit",
  studentId: 1,
  idProofType: "Aadhaar Card",
  idVerified: false,
};

export default function VisitorVerification() {
  const {
    visitors,
    students,
    updateVisitorStatus,
    toggleVisitorIdVerification,
    addVisitor,
    addNotification,
    showToast,
    refreshVisitors,
  } = useHostel();

  useEffect(() => {
    refreshVisitors();
  }, [refreshVisitors]);

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
      idProofType: vForm.idProofType,
      idVerified: Boolean(vForm.idVerified),
      studentName: selectedStudent ? selectedStudent.name || selectedStudent.fullName : "Student User",
      room: selectedStudent ? selectedStudent.room || selectedStudent.roomNumber : "D-214",
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
        <div className="px-5 py-4 border-b border-blue-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Visitor Log & ID Verification</h3>
            <p className="text-sm text-gray-500 mt-0.5">Verify visitor government IDs, monitor AI risk scores, and manage entry passes.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-[#f4f8fc] border-b border-blue-100">
                {["Visitor", "Visiting", "Room", "Purpose", "ID Verified", "Risk Score", "Check In", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {table.paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-gray-500 text-sm">
                    No visitor logs recorded.
                  </td>
                </tr>
              ) : (
                table.paginated.map((v) => {
                const sMatch = (students || []).find((s) => s.name === v.studentName || String(s.id) === String(v.studentId) || (s.fullName && s.fullName === v.studentName));
                const roomDisplay = sMatch?.room && sMatch.room !== "Unassigned" ? sMatch.room : v.room;
                const computedRisk = !v.idVerified ? (v.riskLevel === "high" ? "high" : "medium") : (v.riskLevel || "low");
                return (
                <tr key={v.id} className={cls("hover:bg-blue-50/30 transition-colors", computedRisk === "high" ? "bg-red-50/40" : "")}>
                  <td className="px-5 py-4">
                    <button type="button" onClick={() => setViewV(v)} className="flex items-center gap-3 text-left">
                      <Avatar name={v.visitorName} size="sm" />
                      <div>
                        <div className="font-semibold text-gray-900 text-base">{v.visitorName}</div>
                        <div className="text-sm text-gray-400">{v.phone}</div>
                      </div>
                    </button>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-700 text-base">{v.studentName}</td>
                  <td className="px-5 py-4 font-bold text-blue-700">{roomDisplay}</td>
                  <td className="px-5 py-4 text-gray-600 text-sm">{v.purpose}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => toggleVisitorIdVerification(v.id)}
                      title={v.idVerified ? "Click to mark as Unverified" : "Click to Verify Visitor ID"}
                      className={cls(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all shadow-xs cursor-pointer",
                        v.idVerified
                          ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300"
                          : "bg-red-50 hover:bg-red-100 text-red-700 border-red-300 animate-pulse"
                      )}
                    >
                      {v.idVerified ? (
                        <>
                          <CheckCircle size={13} className="text-emerald-600" /> Yes (Verified)
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={13} className="text-red-600" /> Verify ID
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <Badge status={computedRisk} />
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-gray-700">{v.checkIn}</td>
                  <td className="px-5 py-4"><Badge status={v.status} /></td>
                  <td className="px-5 py-4 whitespace-nowrap text-left">
                    <button
                      type="button"
                      onClick={() => setViewV(v)}
                      className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 font-semibold text-xs"
                      title="View Details & Security Actions"
                    >
                      <Eye size={16} />
                      <span>View & Act</span>
                    </button>
                  </td>
                </tr>
              );
              }))}
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
      <Modal open={!!viewV} onClose={() => setViewV(null)} title="Visitor Details & Security Clearance">
        {viewV && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-5 bg-white/10 rounded-xl border border-white/20">
              <Avatar name={viewV.visitorName} size="lg" />
              <div>
                <div className="font-bold text-white text-base">{viewV.visitorName}</div>
                <div className="text-sm text-white/70">{viewV.phone}</div>
                <div className="flex gap-2 mt-1">
                  <Badge status={!viewV.idVerified && viewV.riskLevel === "low" ? "medium" : viewV.riskLevel} />
                  <Badge status={viewV.status} />
                </div>
              </div>
            </div>
            {[
              { label: "Visiting Student", value: viewV.studentName },
              { label: "Hostel Room", value: viewV.room },
              { label: "Purpose", value: viewV.purpose },
              { label: "Date", value: viewV.date },
              { label: "Check In Time", value: viewV.checkIn },
              { label: "Check Out Time", value: viewV.checkOut },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-base py-2 border-b border-white/10">
                <span className="text-white/60">{label}</span><span className="font-semibold text-white">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-base py-2 border-b border-white/10">
              <span className="text-white/60 font-medium">ID Proof Type</span>
              <select
                value={viewV.idProofType || "Aadhaar Card"}
                onChange={async (e) => {
                  const newType = e.target.value;
                  await toggleVisitorIdVerification(viewV.id, viewV.idVerified, newType);
                  setViewV((prev) => (prev ? { ...prev, idProofType: newType } : prev));
                }}
                className="bg-[#1e293b] text-white font-semibold text-xs rounded-xl px-3 py-1.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer transition-all shadow-sm"
              >
                <option value="Aadhaar Card" className="text-gray-900 bg-white">Aadhaar Card</option>
                <option value="Driving License" className="text-gray-900 bg-white">Driving License</option>
                <option value="Passport" className="text-gray-900 bg-white">Passport</option>
                <option value="Voter ID" className="text-gray-900 bg-white">Voter ID</option>
                <option value="PAN Card" className="text-gray-900 bg-white">PAN Card</option>
                <option value="Student ID / Other" className="text-gray-900 bg-white">Student ID / Other</option>
              </select>
            </div>
            <div className="flex items-center justify-between text-base py-2.5 border-b border-white/10">
              <span className="text-white/70 font-medium">ID Verification Status</span>
              <button
                type="button"
                onClick={async () => {
                  await toggleVisitorIdVerification(viewV.id);
                  setViewV((prev) => (prev ? { ...prev, idVerified: !prev.idVerified, riskLevel: !prev.idVerified ? "low" : "medium" } : prev));
                }}
                className={cls(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer shadow-sm",
                  viewV.idVerified
                    ? "bg-emerald-500/25 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/35"
                    : "bg-red-500/25 text-red-200 border-red-400/40 hover:bg-red-500/35 animate-pulse"
                )}
              >
                {viewV.idVerified ? (
                  <>
                    <CheckCircle size={14} className="text-emerald-400" /> ID Verified
                  </>
                ) : (
                  <>
                    <ShieldAlert size={14} className="text-red-400" /> Verify ID
                  </>
                )}
              </button>
            </div>
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">
                Visitor Security Actions
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await toggleVisitorIdVerification(viewV.id);
                    setViewV((prev) => (prev ? { ...prev, idVerified: !prev.idVerified, riskLevel: !prev.idVerified ? "low" : "medium" } : prev));
                  }}
                  className={cls(
                    "py-2.5 px-3 rounded-xl font-bold text-xs transition-all border shadow-sm flex items-center justify-center gap-1.5 cursor-pointer",
                    viewV.idVerified
                      ? "bg-blue-500/30 text-blue-200 border-blue-400/40 hover:bg-blue-500/40"
                      : "bg-amber-500/30 text-amber-200 border-amber-400/40 hover:bg-amber-500/40"
                  )}
                >
                  <ShieldCheck size={14} />
                  {viewV.idVerified ? "Re-verify ID" : "Verify ID"}
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(viewV.id, "approved")}
                  className={cls(
                    "py-2.5 px-3 rounded-xl font-bold text-xs transition-all border shadow-sm flex items-center justify-center gap-1.5 cursor-pointer",
                    viewV.status === "approved"
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/30"
                  )}
                >
                  <CheckCircle size={14} />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(viewV.id, "rejected")}
                  className={cls(
                    "py-2.5 px-3 rounded-xl font-bold text-xs transition-all border shadow-sm flex items-center justify-center gap-1.5 cursor-pointer",
                    viewV.status === "rejected"
                      ? "bg-red-600 text-white border-red-500"
                      : "bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-400/30"
                  )}
                >
                  <XCircle size={14} />
                  Reject
                </button>
              </div>
            </div>
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
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Purpose" darkMode>
              <Select value={vForm.purpose} onChange={(e) => setVForm((f) => ({ ...f, purpose: e.target.value }))} darkMode>
                <option>Family Visit</option>
                <option>Document Delivery</option>
                <option>Pickup</option>
                <option>Other</option>
              </Select>
            </FormField>
            <FormField label="ID Proof Type" darkMode>
              <Select value={vForm.idProofType} onChange={(e) => setVForm((f) => ({ ...f, idProofType: e.target.value }))} darkMode>
                <option>Aadhaar Card</option>
                <option>Driving License</option>
                <option>Passport</option>
                <option>Voter ID</option>
                <option>Student ID / Other</option>
              </Select>
            </FormField>
          </div>
          <div className="flex items-center gap-2 pt-1 pb-1">
            <input
              type="checkbox"
              id="idVerifiedGate"
              checked={vForm.idVerified}
              onChange={(e) => setVForm((f) => ({ ...f, idVerified: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-800 cursor-pointer"
            />
            <label htmlFor="idVerifiedGate" className="text-sm font-medium text-white/90 cursor-pointer">
              Mark ID Verified at Gate Check-in
            </label>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleRegisterVisitor} className="flex-1">Check In Visitor</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

