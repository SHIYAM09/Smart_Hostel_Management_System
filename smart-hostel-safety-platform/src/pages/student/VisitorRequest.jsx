import { useState } from "react";
import {
  CheckCircle,
  Plus,
  Send,
} from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { Modal } from "../../components/common/Modal";
import { FormField } from "../../components/common/FormField";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";

import { useAuth } from "../../hooks/useAuth";

const STUDENT_ID = "S001";

export default function VisitorRequest() {
  const { visitors, addVisitor, setLoading, loading } = useHostel();
  const { userName } = useAuth();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ visitorName: "", phone: "", relation: "Parent", purpose: "Family Visit", date: "" });
  const [errors, setErrors] = useState({});

  const myV = visitors;

  const validate = () => {
    const e = {};
    if (!form.visitorName.trim()) e.visitorName = "Visitor name required";
    if (!form.phone.trim()) e.phone = "Phone required";
    if (!form.date) e.date = "Date required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await addVisitor({
        visitorName: form.visitorName.trim(),
        studentName: userName || "SHIYAM M",
        phone: form.phone.trim(),
        relationship: form.relation,
        purpose: form.purpose,
        logDate: form.date,
        riskLevel: "low",
        idVerified: false,
      });
      setForm({ visitorName: "", phone: "", relation: "Parent", purpose: "Family Visit", date: "" });
      setModal(false);
    } catch (err) {
      console.warn("Failed to add visitor:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800"><strong>Policy:</strong> Carry valid govt ID. Hours: 9 AM–8 PM. Max 2 visitors. Subject to warden approval.</div>
      <div className="flex items-center justify-between"><h3 className="font-semibold text-gray-700 text-base">My Visitor Requests</h3><Button onClick={() => setModal(true)}><Plus size={17} />Request Visitor</Button></div>
      <div className="space-y-4">
        {myV.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center space-y-2">
            <div className="text-gray-600 font-semibold text-base">No Visitor Requests Found</div>
            <p className="text-sm text-gray-500 max-w-md mx-auto">You have not submitted any visitor pass requests yet. Click "+ Request Visitor" above to register a visitor.</p>
          </div>
        ) : (
          myV.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-blue-50 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <Avatar name={v.visitorName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-base">{v.visitorName}</div>
                  <div className="text-sm text-gray-500">{v.purpose} · {v.date} · {v.phone}</div>
                </div>
                <Badge status={v.status} />
              </div>
              {(v.status === "checked-in" || v.status === "in-campus") && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <CheckCircle size={15} className="text-blue-600" />
                  <span className="text-sm text-blue-800 font-medium">Visitor {v.status === "in-campus" ? "in campus" : "checked in"} · {v.checkIn}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Request Visitor Pass">
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl text-sm text-amber-300"><strong>Note:</strong> Request reviewed by warden. Visitor must carry valid ID.</div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Visitor Name" darkMode><Input placeholder="Full Name" value={form.visitorName} onChange={(e) => setForm((f) => ({ ...f, visitorName: e.target.value }))} darkMode />{errors.visitorName && <p className="text-xs text-red-400 mt-1">{errors.visitorName}</p>}</FormField>
            <FormField label="Phone" darkMode><Input placeholder="9811234567" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} darkMode />{errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}</FormField>
          </div>
          <FormField label="Relation" darkMode><Select value={form.relation} onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value }))} darkMode><option>Parent</option><option>Sibling</option><option>Relative</option><option>Friend</option><option>Other</option></Select></FormField>
          <FormField label="Purpose" darkMode><Select value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} darkMode><option>Family Visit</option><option>Document Delivery</option><option>Pickup</option><option>Other</option></Select></FormField>
          <FormField label="Expected Date" darkMode><Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} darkMode />{errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}</FormField>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={loading}>{loading ? "Submitting..." : <><Send size={16} />Submit</>}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
