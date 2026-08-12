import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { FormField } from "../../components/common/FormField";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";

const EMPTY_ROOM = { number: "", floor: 1, type: "double", capacity: 2 };

export default function WardenRooms() {
  const { rooms, students, addRoom } = useHostel();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_ROOM);

  const displayRooms = useMemo(() => {
    return rooms.map((r) => {
      const roomNum = String(r.number || r.roomNumber || "").trim().toLowerCase();
      const assignedStudents = (students || []).filter((s) => {
        const studentRoom = String(s.room || s.roomNumber || "").trim().toLowerCase();
        return studentRoom === roomNum && String(s.status).toLowerCase() !== "inactive";
      });
      const occupiedCount = assignedStudents.length;
      const cap = Number(r.capacity) || 2;
      let computedStatus = (r.status || "vacant").toLowerCase();
      if (computedStatus !== "maintenance") {
        if (occupiedCount >= cap) {
          computedStatus = "occupied";
        } else if (occupiedCount > 0) {
          computedStatus = "occupied";
        } else {
          computedStatus = "vacant";
        }
      }
      return {
        ...r,
        number: r.number || r.roomNumber,
        occupied: occupiedCount,
        capacity: cap,
        status: computedStatus,
        assignedStudents,
      };
    });
  }, [rooms, students]);

  const handleAddRoom = () => {
    if (!form.number.trim()) return;
    addRoom({
      number: form.number.trim(),
      floor: Number(form.floor) || 1,
      type: form.type,
      capacity: Number(form.capacity) || 2,
      occupied: 0,
      status: "vacant",
      amenities: ["Standard"],
    });
    setForm(EMPTY_ROOM);
    setModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">{[{label:"Total",value:displayRooms.length,c:"bg-blue-500"},{label:"Occupied",value:displayRooms.filter(r=>r.status==="occupied").length,c:"bg-indigo-500"},{label:"Available",value:displayRooms.filter(r=>r.status==="vacant" || r.status==="available").length,c:"bg-emerald-500"},{label:"Maintenance",value:displayRooms.filter(r=>r.status==="maintenance").length,c:"bg-amber-500"}].map(s=>(
        <div key={s.label} className="bg-white rounded-xl p-5 border border-blue-50 shadow-sm text-center"><div className={cls("w-12 h-12 rounded-xl text-white text-2xl font-extrabold flex items-center justify-center mx-auto mb-2",s.c)}>{s.value}</div><div className="text-sm font-semibold text-gray-600">{s.label}</div></div>
      ))}</div>
      <div className="flex justify-end"><Button onClick={()=>setModal(true)}><Plus size={17}/>Add Room</Button></div>
      {displayRooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-blue-50 p-8 text-center text-gray-500">
          <p className="font-semibold text-base">No room records found in database.</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Room" above to register hostel rooms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{displayRooms.map((r, idx)=>(
          <div key={r.id || r.number || idx} className="bg-white rounded-2xl border border-blue-50 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-gray-900 text-base">{r.number}</div>
                {r.assignedStudents?.length > 0 && (
                  <div className="text-[11px] text-gray-500 font-medium">
                    Students: {r.assignedStudents.map((s) => s.name || s.fullName).join(", ")}
                  </div>
                )}
              </div>
              <Badge status={r.status}/>
            </div>
            <div className="space-y-2 text-sm text-gray-600"><div className="flex justify-between"><span>Type</span><span className="font-semibold capitalize">{r.type || "Double"}</span></div><div className="flex justify-between"><span>Floor</span><span className="font-semibold">{r.floor}</span></div><div className="flex justify-between"><span>Occupancy</span><span className="font-semibold">{r.occupied}/{r.capacity}</span></div></div>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-2"><div className={cls("h-full rounded-full",r.occupied===r.capacity?"bg-blue-500":"bg-emerald-500")} style={{width:`${Math.min(100, ((r.occupied || 0)/r.capacity)*100)}%`}}/></div>
            <div className="mt-3 flex flex-wrap gap-2">{(r.amenities || ["Standard"]).slice(0,2).map(a=><span key={a} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{a}</span>)}</div>
          </div>
        ))}</div>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title="Add Room">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Room Number" darkMode><Input value={form.number} onChange={(e)=>setForm({...form, number:e.target.value})} placeholder="A-201" darkMode/></FormField>
            <FormField label="Floor" darkMode><Input type="number" value={form.floor} onChange={(e)=>setForm({...form, floor:e.target.value})} placeholder="2" darkMode/></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Type" darkMode><Select value={form.type} onChange={(e)=>setForm({...form, type:e.target.value})}><option value="single">single</option><option value="double">double</option><option value="triple">triple</option></Select></FormField>
            <FormField label="Capacity" darkMode><Input type="number" value={form.capacity} onChange={(e)=>setForm({...form, capacity:e.target.value})} placeholder="2" darkMode/></FormField>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={()=>setModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleAddRoom} className="flex-1">Add Room</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
