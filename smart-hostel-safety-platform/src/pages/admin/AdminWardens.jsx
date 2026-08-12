import { useState } from "react";
import {
  Edit2,
  Plus,
  Trash2,
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
import { ConfirmDialog } from "../../components/common/ConfirmDialog";

const EMPTY_WARDEN = { name: "", email: "", phone: "", block: "Block A", status: "active" };

export default function AdminWardens() {
  const { wardens, createWarden, updateWarden, deleteWarden } = useHostel();
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(EMPTY_WARDEN);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openCreate = () => {
    setEdit(null);
    setForm(EMPTY_WARDEN);
    setModal(true);
  };

  const openEdit = (w) => {
    setEdit(w);
    setForm({
      name: w.name || "",
      email: w.email || "",
      phone: w.phone || "",
      block: w.block || "Block A",
      status: w.status || "active",
    });
    setModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (edit) {
      updateWarden(edit.id, form);
    } else {
      createWarden(form);
    }
    setModal(false);
    setForm(EMPTY_WARDEN);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteWarden(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="grid grid-cols-3 gap-3">
          {[{label:"Total",value:wardens.length,c:"text-blue-700 bg-blue-50 border-blue-100"},{label:"Active",value:wardens.filter(w=>w.status==="active").length,c:"text-emerald-700 bg-emerald-50 border-emerald-100"},{label:"Inactive",value:wardens.filter(w=>w.status==="inactive").length,c:"text-gray-600 bg-gray-50 border-gray-100"}].map(s=>(
            <div key={s.label} className={cls("rounded-xl border p-4 text-center",s.c)}><div className="text-2xl font-extrabold">{s.value}</div><div className="text-sm font-semibold">{s.label}</div></div>
          ))}
        </div>
        <Button onClick={openCreate}><Plus size={17}/>Add Warden</Button>
      </div>
      <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead><tr className="bg-[#f4f8fc] border-b border-blue-100">{["Warden","Block","Email","Phone","Students","Joined","Status","Actions"].map(h=><th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {wardens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-gray-500 text-sm">
                    No warden records found in database.
                  </td>
                </tr>
              ) : (
                wardens.map(w=>(
              <tr key={w.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={w.name || w.fullName} size="sm"/><span className="font-semibold text-gray-900 text-base">{w.name || w.fullName}</span></div></td>
                <td className="px-5 py-4 font-semibold text-blue-700">{w.block || w.hostelBlock}</td>
                <td className="px-5 py-4 text-gray-500 text-sm">{w.email}</td>
                <td className="px-5 py-4 text-gray-500 text-sm">{w.phone}</td>
                <td className="px-5 py-4 font-bold text-gray-800">{w.studentsManaged}</td>
                <td className="px-5 py-4 text-gray-500 text-sm">{w.joined || w.joinedDate || "2024-01-15"}</td>
                <td className="px-5 py-4"><Badge status={w.status}/></td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button onClick={()=>openEdit(w)} className="p-2 rounded-lg bg-amber-50 text-amber-600" title="Edit"><Edit2 size={15}/></button>
                    <button onClick={()=>setDeleteTarget(w)} className="p-2 rounded-lg bg-red-50 text-red-600" title="Delete"><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
          </table>
        </div>
      </div>
      <Modal open={modal} onClose={()=>setModal(false)} title={edit?"Edit Warden":"Add Warden"}>
        <div className="space-y-4">
          <FormField label="Full Name" darkMode><Input value={form.name} onChange={(e)=>setForm((f)=>({...f, name:e.target.value}))} placeholder="Dr. Name" darkMode/></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email" darkMode><Input value={form.email} onChange={(e)=>setForm((f)=>({...f, email:e.target.value}))} placeholder="warden@hostel.edu" darkMode/></FormField>
            <FormField label="Phone" darkMode><Input value={form.phone} onChange={(e)=>setForm((f)=>({...f, phone:e.target.value}))} placeholder="9800000001" darkMode/></FormField>
          </div>
          <FormField label="Assigned Block" darkMode><Input value={form.block} onChange={(e)=>setForm((f)=>({...f, block:e.target.value}))} placeholder="Block A & B" darkMode/></FormField>
          <FormField label="Status" darkMode>
            <Select value={form.status} onChange={(e)=>setForm((f)=>({...f, status:e.target.value}))} darkMode>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FormField>
          <div className="flex gap-3"><Button variant="secondary" onClick={()=>setModal(false)} className="flex-1">Cancel</Button><Button onClick={handleSave} className="flex-1">{edit?"Save Changes":"Add Warden"}</Button></div>
        </div>
      </Modal>
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Warden"
        message={`Remove ${deleteTarget?.name}? This cannot be undone.`}
      />
    </div>
  );
}
