import { useState } from "react";
import {
  AlertTriangle,
  Edit2,
  Eye,
  Search,
  Trash2,
  Upload,
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
import { StudentImportModal } from "../../components/warden/StudentImportModal";

const EMPTY_FORM = {
  name: "",
  rollNo: "",
  room: "",
  course: "",
  year: "1st",
  phone: "",
  email: "",
  status: "active",
};

export default function WardenStudents() {
  const { students, setStudents, addStudent, updateStudent, deleteStudent } = useHostel();
  const [search, setSearch] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewS, setViewS] = useState(null);
  const [editS, setEditS] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = (students || []).filter(
    (s) =>
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.room || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleImport = (imported) => {
    setStudents((prev) => [...prev, ...imported]);
  };

  const openAddModal = () => {
    setForm(EMPTY_FORM);
    setAddModalOpen(true);
  };

  const handleCreate = () => {
    if (!form.name || !form.rollNo) return;
    addStudent(form);
    setAddModalOpen(false);
  };

  const openEdit = (student) => {
    setEditS(student);
    setForm({
      name: student.name,
      rollNo: student.rollNo,
      room: student.room,
      course: student.course,
      year: student.year,
      phone: student.phone,
      email: student.email,
      status: student.status,
    });
  };

  const handleUpdate = () => {
    if (!editS || !form.name || !form.rollNo) return;
    updateStudent(editS.id, form);
    setEditS(null);
  };

  const handleDelete = (id) => {
    deleteStudent(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll no, room..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setImportOpen(true)}>
            <Upload size={15} />
            Import CSV
          </Button>
          <Button onClick={openAddModal}>
            + Add Student
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f4f8fc] border-b border-blue-100">
                {["Student", "Roll No", "Room", "Course", "Phone", "Streak", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">
                    No student records found in database.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size="sm" />
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{s.name}</div>
                        <div className="text-xs text-gray-400">{s.year} Year</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700">{s.rollNo}</td>
                  <td className="px-4 py-3 font-bold text-blue-700">{s.room}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.course}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.phone}</td>
                  <td className="px-4 py-3">
                    {s.absenceStreak > 0 ? (
                      <span
                        className={cls(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
                          s.absenceStreak >= 3
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        )}
                      >
                        <AlertTriangle size={10} />
                        {s.absenceStreak}d
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={s.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewS(s)}
                        className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"
                        title="View"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600"
                        title="Update"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 text-sm text-gray-500">
          Showing {filtered.length} of {students.length} students
        </div>
      </div>

      <StudentImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />

      <Modal open={!!viewS} onClose={() => setViewS(null)} title="Student Details">
        {viewS && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl border border-white/20">
              <Avatar name={viewS.name} size="lg" />
              <div>
                <div className="font-bold text-white">{viewS.name}</div>
                <div className="text-sm text-white/70">
                  {viewS.rollNo} · {viewS.course}
                </div>
                <Badge status={viewS.status} />
              </div>
            </div>
            {viewS.absenceStreak > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                <AlertTriangle size={15} className="text-red-400 shrink-0" />
                <div className="text-xs text-red-300 font-semibold">
                  Absence anomaly: {viewS.absenceStreak} consecutive nights absent.
                </div>
              </div>
            )}
            {[
              { label: "Room", value: viewS.room },
              { label: "Phone", value: viewS.phone },
              { label: "Email", value: viewS.email },
              { label: "Year", value: `${viewS.year} Year` },
              { label: "Joined", value: viewS.joinDate },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm py-1.5 border-b border-white/10 last:border-0">
                <span className="text-white/60">{label}</span>
                <span className="font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={!!editS} onClose={() => setEditS(null)} title="Update Student">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Full Name" darkMode>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} darkMode />
            </FormField>
            <FormField label="Roll Number" darkMode>
              <Input value={form.rollNo} onChange={(e) => setForm((f) => ({ ...f, rollNo: e.target.value }))} darkMode />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Room" darkMode>
              <Input value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} darkMode />
            </FormField>
            <FormField label="Year" darkMode>
              <Select value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} darkMode>
                <option>1st</option>
                <option>2nd</option>
                <option>3rd</option>
                <option>4th</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Course" darkMode>
            <Input value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))} darkMode />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Phone" darkMode>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} darkMode />
            </FormField>
            <FormField label="Email" darkMode>
              <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} darkMode />
            </FormField>
          </div>
          <FormField label="Status" darkMode>
            <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} darkMode>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </Select>
          </FormField>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={() => setEditS(null)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="flex-1">
              Update Student
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Student">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Full Name" darkMode>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Rahul Sharma" darkMode />
            </FormField>
            <FormField label="Roll Number" darkMode>
              <Input value={form.rollNo} onChange={(e) => setForm((f) => ({ ...f, rollNo: e.target.value }))} placeholder="e.g. 22CS099" darkMode />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Room Number" darkMode>
              <Input value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} placeholder="e.g. A-101" darkMode />
            </FormField>
            <FormField label="Year" darkMode>
              <Select value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} darkMode>
                <option>1st</option>
                <option>2nd</option>
                <option>3rd</option>
                <option>4th</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Course / Department" darkMode>
            <Input value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))} placeholder="e.g. B.Tech CSE" darkMode />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Phone" darkMode>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="9876543210" darkMode />
            </FormField>
            <FormField label="Email" darkMode>
              <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="student@hostel.com" darkMode />
            </FormField>
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreate} className="flex-1">
              Create Student
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
