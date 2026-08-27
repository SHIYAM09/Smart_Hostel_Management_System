import { useState, useEffect } from "react";
import { Plus, Send } from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { FormField } from "../../components/common/FormField";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

import { useAuth } from "../../hooks/useAuth";

const STUDENT_ID = "S001";

export default function StudentLeave() {
  const { leaveRequests, addLeaveRequest, refreshLeaveRequests } = useHostel();

  useEffect(() => {
    refreshLeaveRequests();
  }, [refreshLeaveRequests]);

  const { userName } = useAuth();
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fromDate: "", toDate: "", reason: "" });
  const [errors, setErrors] = useState({});

  const myLeaves = leaveRequests;

  const validate = () => {
    const e = {};
    if (!form.fromDate) e.fromDate = "Start date required";
    if (!form.toDate) e.toDate = "End date required";
    if (form.fromDate && form.toDate && form.fromDate > form.toDate) e.toDate = "End date must be after start";
    if (!form.reason.trim()) e.reason = "Reason is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      addLeaveRequest({
        studentId: STUDENT_ID,
        studentName: userName || "Student User",
        room: "A-101",
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason.trim(),
      });
      setForm({ fromDate: "", toDate: "", reason: "" });
      setModal(false);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Policy:</strong> Leave requests must be submitted at least 24 hours in advance. Warden approval required.
      </div>
      <div className="flex items-center justify-between">
        <div className="text-base text-gray-600">{myLeaves.length} leave request(s)</div>
        <Button onClick={() => setModal(true)}><Plus size={17} />Request Leave</Button>
      </div>
      <div className="space-y-4">
        {myLeaves.map((l) => (
          <div key={l.id} className="bg-white rounded-2xl border border-blue-50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <Badge status={l.status} />
              <span className="text-xs text-gray-400">Submitted {l.submittedAt}</span>
            </div>
            <div className="font-bold text-gray-900">{l.fromDate} → {l.toDate}</div>
            <p className="text-sm text-gray-600 mt-1">{l.reason}</p>
            {l.wardenNote && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                <span className="font-bold">Warden Note:</span> {l.wardenNote}
              </div>
            )}
          </div>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Request Leave">
        <div className="space-y-4">
          <FormField label="From Date" darkMode>
            <Input type="date" value={form.fromDate} onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))} darkMode />
            {errors.fromDate && <p className="text-xs text-red-400 mt-1">{errors.fromDate}</p>}
          </FormField>
          <FormField label="To Date" darkMode>
            <Input type="date" value={form.toDate} onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))} darkMode />
            {errors.toDate && <p className="text-xs text-red-400 mt-1">{errors.toDate}</p>}
          </FormField>
          <FormField label="Reason" darkMode>
            <textarea className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white text-base focus:outline-none focus:ring-2 focus:ring-white/20 resize-none placeholder-white/50" rows={3} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Explain reason for leave..." />
            {errors.reason && <p className="text-xs text-red-400 mt-1">{errors.reason}</p>}
          </FormField>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={loading}>{loading ? "Submitting..." : <><Send size={16} />Submit</>}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
