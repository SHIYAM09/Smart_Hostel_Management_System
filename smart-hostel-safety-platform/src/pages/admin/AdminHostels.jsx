import { useState } from "react";
import { Plus, Edit2, Trash2, Building2 } from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Modal } from "../../components/common/Modal";
import { FormField } from "../../components/common/FormField";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";

const EMPTY_BLOCK = {
  name: "",
  type: "Boys",
  floors: 3,
  rooms: 30,
  occupied: 0,
  students: 0,
  warden: "Unassigned",
};

export default function AdminHostels() {
  const { hostelBlocks, addHostelBlock, updateHostelBlock, deleteHostelBlock, wardens, students, rooms } = useHostel();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [form, setForm] = useState(EMPTY_BLOCK);
  const [errors, setErrors] = useState({});

  const wardenOptions = [
    { value: "Unassigned", label: "Unassigned" },
    ...(wardens || []).map((w) => {
      const wName = w.name || w.fullName || "Warden";
      return { value: wName, label: `${wName} (${w.block || w.hostelBlock || "Block A"})` };
    }),
  ];

  const getBlockStats = (blockName, existingBlock = null) => {
    const norm = (blockName || "").replace(/block\s*/i, "").trim().toLowerCase();

    // 1. Find matching students for this block
    const matchingStudents = (students || []).filter((s) => {
      const sBlock = (s.hostelBlock || s.block || "").replace(/block\s*/i, "").trim().toLowerCase();
      if (!norm) return true;
      return sBlock === norm || sBlock.includes(norm) || norm.includes(sBlock);
    });

    const activeStudentList = (matchingStudents.length > 0)
      ? matchingStudents
      : (((hostelBlocks || []).length <= 1 && (students || []).length > 0) ? (students || []) : []);

    const calcStudents = activeStudentList.length > 0
      ? activeStudentList.length
      : (existingBlock?.students ? Number(existingBlock.students) : 0);

    // 2. Count UNIQUE room numbers assigned to these students
    const uniqueStudentRooms = new Set(
      activeStudentList
        .map((s) => s.room || s.roomNumber)
        .filter((r) => r && r !== "Unassigned" && String(r).trim() !== "")
    );

    // 3. Count occupied rooms from DB rooms list if available
    const matchingRooms = (rooms || []).filter((r) => {
      const rBlock = (r.block || r.hostelBlock || "").replace(/block\s*/i, "").trim().toLowerCase();
      return norm ? (rBlock === norm || rBlock.includes(norm) || norm.includes(rBlock)) : true;
    });

    const dbOccupied = matchingRooms.filter(
      (r) => (r.occupied && r.occupied > 0) || String(r.status || "").toLowerCase() === "occupied" || String(r.status || "").toLowerCase() === "partial"
    ).length;

    let calcOccupied = 0;
    if (dbOccupied > 0) {
      calcOccupied = dbOccupied;
    } else if (uniqueStudentRooms.size > 0) {
      calcOccupied = uniqueStudentRooms.size;
    } else if (existingBlock?.occupied) {
      calcOccupied = Number(existingBlock.occupied);
    } else if (calcStudents > 0) {
      calcOccupied = 1;
    }

    const calcTotalRooms = matchingRooms.length > 0 ? matchingRooms.length : (existingBlock?.rooms || 60);

    // 4. Find assigned warden
    const matchedWarden = (wardens || []).find((w) => {
      const wBlock = (w.block || w.hostelBlock || "").replace(/block\s*/i, "").trim().toLowerCase();
      return norm && (wBlock === norm || wBlock.includes(norm) || norm.includes(wBlock));
    });

    const wardenName = matchedWarden
      ? (matchedWarden.name || matchedWarden.fullName)
      : (existingBlock?.warden || (wardens && wardens[0] ? (wardens[0].name || wardens[0].fullName) : "Unassigned"));

    return {
      students: calcStudents,
      occupied: calcOccupied,
      rooms: calcTotalRooms,
      warden: wardenName,
    };
  };

  const handleNameChange = (val) => {
    const stats = getBlockStats(val);
    setForm((f) => ({
      ...f,
      name: val,
      students: stats.students,
      occupied: stats.occupied,
      rooms: stats.rooms,
      warden: stats.warden,
    }));
  };

  const openAddModal = () => {
    setEditingBlock(null);
    setForm(EMPTY_BLOCK);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBlock(b);
    const stats = getBlockStats(b.name, b);
    setForm({
      name: b.name || "",
      type: b.type || "Boys",
      floors: b.floors || 4,
      rooms: b.rooms || stats.rooms || 60,
      occupied: b.occupied > 0 ? b.occupied : stats.occupied,
      students: b.students > 0 ? b.students : stats.students,
      warden: (b.warden && b.warden !== "Unassigned") ? b.warden : stats.warden,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Block name is required";
    if (Number(form.rooms) <= 0) e.rooms = "Total rooms must be greater than 0";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingBlock) {
      updateHostelBlock(editingBlock.id || editingBlock.name, form);
    } else {
      addHostelBlock(form);
    }
    setModalOpen(false);
  };

  const handleDelete = (b) => {
    if (window.confirm(`Are you sure you want to delete ${b.name}?`)) {
      deleteHostelBlock(b.id || b.name);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hostel Blocks</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage block allocations, capacity, and wardens.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus size={17} />
          Add Hostel Block
        </Button>
      </div>

      {/* Block Cards Grid */}
      {(!hostelBlocks || hostelBlocks.length === 0) ? (
        <div className="bg-white rounded-2xl border border-blue-50 p-8 text-center text-gray-500">
          <p className="font-semibold text-base">No hostel blocks found in database.</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Hostel Block" above to register block structures.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hostelBlocks.map((b) => {
            const stats = getBlockStats(b.name, b);
            const displayStudents = b.students > 0 ? b.students : stats.students;
            const displayOccupied = b.occupied > 0 ? b.occupied : stats.occupied;
            const displayWarden = (b.warden && b.warden !== "Unassigned") ? b.warden : stats.warden;
            const displayRooms = b.rooms || stats.rooms || 60;
            const pct = displayRooms > 0 ? Math.round((displayOccupied / displayRooms) * 100) : 0;

            return (
              <div key={b.id || b.name} className="bg-white rounded-2xl border border-blue-50 shadow-sm p-6 hover:shadow-md transition-shadow relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                      <Building2 size={18} className="text-blue-600" />
                      {b.name}
                    </div>
                    <div className="text-sm text-gray-400 mt-0.5">{b.type} · {b.floors} Floors</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cls(
                        "text-xs font-bold px-2.5 py-1 rounded-full border",
                        displayOccupied === 0
                          ? "bg-gray-50 text-gray-500 border-gray-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                    >
                      {pct}% full
                    </span>
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit Block"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Block"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
                  <div
                    className={cls(
                      "h-full rounded-full transition-all duration-500",
                      pct > 80 ? "bg-red-500" : pct > 50 ? "bg-blue-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Details table */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Rooms</span>
                    <span className="font-semibold">{displayOccupied}/{displayRooms}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Students</span>
                    <span className="font-semibold">{displayStudents}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Warden</span>
                    <span className="font-semibold truncate max-w-[140px] text-right">{displayWarden}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Block Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBlock ? `Edit ${editingBlock.name}` : "Add New Hostel Block"}
      >
        <div className="space-y-4">
          <FormField label="Block Name" darkMode>
            <Input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Block D"
              darkMode
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </FormField>

          <FormField label="Block Type" darkMode>
            <Select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              options={[
                { value: "Boys", label: "Boys Hostel" },
                { value: "Girls", label: "Girls Hostel" },
                { value: "Mixed", label: "Mixed / General Hostel" },
              ]}
              darkMode
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Total Floors" darkMode>
              <Input
                type="number"
                value={form.floors}
                onChange={(e) => setForm((f) => ({ ...f, floors: e.target.value }))}
                placeholder="3"
                darkMode
              />
            </FormField>
            <FormField label="Total Rooms" darkMode>
              <Input
                type="number"
                value={form.rooms}
                onChange={(e) => setForm((f) => ({ ...f, rooms: e.target.value }))}
                placeholder="30"
                darkMode
              />
              {errors.rooms && <p className="text-xs text-red-400 mt-1">{errors.rooms}</p>}
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Occupied Rooms" darkMode>
              <Input
                type="number"
                value={form.occupied}
                onChange={(e) => setForm((f) => ({ ...f, occupied: e.target.value }))}
                placeholder="0"
                darkMode
              />
            </FormField>
            <FormField label="Total Students" darkMode>
              <Input
                type="number"
                value={form.students}
                onChange={(e) => setForm((f) => ({ ...f, students: e.target.value }))}
                placeholder="0"
                darkMode
              />
            </FormField>
          </div>

          <FormField label="Assigned Warden" darkMode>
            <Select
              value={form.warden}
              onChange={(e) => setForm((f) => ({ ...f, warden: e.target.value }))}
              options={wardenOptions}
              darkMode
            />
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              {editingBlock ? "Save Changes" : "Create Block"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
