import { useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  BedDouble,
  MessageSquareWarning,
  Shield,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { Card, CardHeader, CardBody } from "../../components/common/Card";
import { AnimatedCounter } from "../../components/common/AnimatedCounter";

export default function AdminDashboard({ onNav }) {
  const { students, wardens, rooms, complaints, resources, hostelBlocks, dashboardMetrics, refreshDashboard, refreshStudents, refreshWardens, refreshRooms, refreshComplaints } = useHostel();

  useEffect(() => {
    refreshDashboard();
  }, []);

  const totalStudentsCount = dashboardMetrics?.totalStudents ?? students.length;
  const totalWardensCount = dashboardMetrics?.totalWardens ?? wardens.length;
  const totalRoomsCount = dashboardMetrics?.totalRooms ?? rooms.length;
  const occupiedRoomsCount = dashboardMetrics?.occupiedRooms ?? rooms.filter(r=>r.status==="occupied").length;
  const pendingComplaintsCount = dashboardMetrics?.pendingComplaints ?? complaints.filter(c=>c.status!=="resolved").length;

  const kpis = [
    { label:"Total Students",  value:totalStudentsCount, sub:`${students.filter(s=>s.status==="active").length || totalStudentsCount} active`, icon:Users, bg:"bg-blue-50 text-blue-600", nav:"all-students" },
    { label:"Active Wardens",  value:wardens.filter(w=>w.status==="active").length || totalWardensCount, sub:`${totalWardensCount} total`, icon:Shield, bg:"bg-violet-50 text-violet-600", nav:"wardens" },
    { label:"Total Rooms",     value:totalRoomsCount, sub:`${occupiedRoomsCount} occupied`, icon:BedDouble, bg:"bg-indigo-50 text-indigo-600", nav:"hostels" },
    { label:"Open Complaints", value:pendingComplaintsCount, sub:"need resolution", icon:MessageSquareWarning, bg:"bg-amber-50 text-amber-600", nav:"complaints" },
    { label:"Safety Alerts",   value:complaints.filter(c=>c.priority==="high" && c.status!=="resolved").length, sub:"high priority", icon:AlertTriangle, bg:"bg-red-50 text-red-600", nav:"reports" },
    { label:"Resource Anomalies", value:resources.filter(r=>r.anomaly).length, sub:"today", icon:Activity, bg:"bg-cyan-50 text-cyan-600", nav:"reports" },
  ];

  const displayBlocks = (hostelBlocks && hostelBlocks.length) ? hostelBlocks.slice(0, 4) : [];

  const getBlockOccupancy = (b) => {
    const norm = (b.name || b.block || "").replace(/block\s*/i, "").trim().toLowerCase();

    // 1. Students in this block
    const matchingStudents = (students || []).filter((s) => {
      const sBlock = (s.hostelBlock || s.block || "").replace(/block\s*/i, "").trim().toLowerCase();
      if (!norm) return true;
      return sBlock === norm || sBlock.includes(norm) || norm.includes(sBlock);
    });

    const activeStudents = matchingStudents.length > 0
      ? matchingStudents
      : (((hostelBlocks || []).length <= 1 && (students || []).length > 0) ? (students || []) : []);

    // 2. Unique occupied room count
    const uniqueStudentRooms = new Set(
      activeStudents
        .map((s) => s.room || s.roomNumber)
        .filter((r) => r && r !== "Unassigned" && String(r).trim() !== "")
    );

    // 3. Matching DB rooms
    const matchingRooms = (rooms || []).filter((r) => {
      const rBlock = (r.block || r.hostelBlock || "").replace(/block\s*/i, "").trim().toLowerCase();
      return norm ? (rBlock === norm || rBlock.includes(norm) || norm.includes(rBlock)) : true;
    });

    const dbOccupied = matchingRooms.filter(
      (r) => (r.occupied && r.occupied > 0) || String(r.status || "").toLowerCase() === "occupied" || String(r.status || "").toLowerCase() === "partial"
    ).length;

    let occupied = b.occupied > 0 ? b.occupied : (dbOccupied > 0 ? dbOccupied : (uniqueStudentRooms.size > 0 ? uniqueStudentRooms.size : (activeStudents.length > 0 ? 1 : 0)));
    let totalRooms = b.rooms > 0 ? b.rooms : (matchingRooms.length > 0 ? matchingRooms.length : 30);
    let totalStudents = b.students > 0 ? b.students : activeStudents.length;

    const rawPct = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;
    const pct = rawPct > 0 ? rawPct : (activeStudents.length > 0 ? Math.round((activeStudents.length / Math.max(totalRooms, 1)) * 100) || 5 : 0);

    return {
      occupied,
      totalRooms,
      totalStudents,
      pct,
    };
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(k=>(
          <Card
            key={k.label}
            clickable
            onClick={() => onNav(k.nav)}
            className="p-6"
          >
            <div className={cls("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform hover:scale-110",k.bg)}><k.icon size={22}/></div>
            <div className="text-3xl font-extrabold text-gray-900">
              {typeof k.value === 'number' ? (
                <AnimatedCounter value={k.value} />
              ) : (
                k.value
              )}
            </div>
            <div className="text-base font-semibold text-gray-700 mt-1">{k.label}</div>
            <div className="text-sm text-gray-400">{k.sub}</div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-6">
          <CardHeader className="px-0 pb-4 border-0">
            <h3 className="font-bold text-gray-900 text-base">Monthly Overview — Students & Complaints</h3>
          </CardHeader>
          <CardBody className="px-0 py-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { month: "Jan", students: Math.max(students.length - 15, 0), complaints: Math.max(complaints.length - 2, 0), incidents: 1 },
                { month: "Feb", students: Math.max(students.length - 10, 0), complaints: Math.max(complaints.length - 1, 0), incidents: 0 },
                { month: "Mar", students: Math.max(students.length - 5, 0), complaints: Math.max(complaints.length - 3, 0), incidents: 0 },
                { month: "Apr", students: students.length, complaints: complaints.length, incidents: 0 },
              ]}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="month" tick={{fontSize:12,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:12,fill:"#9ca3af"}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{borderRadius:12,border:"1px solid #e5e7eb",fontSize:14}}/>
                <Bar dataKey="students"   fill="#1a56db" radius={[4,4,0,0]} name="Students"/>
                <Bar dataKey="complaints" fill="#f59e0b" radius={[4,4,0,0]} name="Complaints"/>
                <Bar dataKey="incidents"  fill="#ef4444" radius={[4,4,0,0]} name="Incidents"/>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold text-gray-900 text-base mb-4">Hostel Blocks</h3>
          <div className="space-y-4">
            {displayBlocks.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-4">No hostel blocks registered.</div>
            ) : (
              displayBlocks.map(b => {
                const { occupied, totalRooms, totalStudents, pct } = getBlockOccupancy(b);
                return (
                  <div key={b.id || b.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-800">{b.name}</span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{pct}% ({occupied}/{totalRooms} rooms)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500 bg-blue-600" style={{ width: `${Math.max(pct, 5)}%` }} />
                    </div>
                    <div className="text-[11px] text-gray-400 flex justify-between pt-0.5">
                      <span>{b.type || "Boys Hostel"}</span>
                      <span>{totalStudents} students</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <button onClick={()=>onNav("hostels")} className="mt-5 w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors">Manage Blocks</button>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100"><h3 className="font-bold text-gray-900 text-base">Active Wardens</h3><button onClick={()=>onNav("wardens")} className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">View all</button></div>
          <div className="divide-y divide-gray-50">{wardens.filter(w=>w.status==="active").map(w=>(
            <div key={w.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50"><Avatar name={w.name} size="sm"/><div className="flex-1 min-w-0"><div className="text-base font-semibold text-gray-900 truncate">{w.name}</div><div className="text-sm text-gray-400">{w.block} · {w.studentsManaged} students</div></div><Badge status={w.status}/></div>
          ))}</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100"><h3 className="font-bold text-gray-900 text-base">Recent Complaints & Safety Alerts</h3><span className="text-sm text-red-600 font-semibold">{complaints.filter(c=>c.priority==="high").length} priority</span></div>
          <div className="divide-y divide-gray-50">{complaints.slice(0,4).map(c=>(
            <div key={c.id} className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-gray-50">
              <div className={cls("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",c.priority==="high"?"bg-red-100":"bg-amber-100")}><AlertTriangle size={16} className={c.priority==="high"?"text-red-600":"text-amber-600"}/></div>
              <div className="flex-1 min-w-0"><div className="text-sm font-bold text-gray-800 truncate">{c.subject}</div><div className="text-xs text-gray-400 mt-0.5">{c.date} · {c.studentName}</div></div>
              <Badge status={c.priority}/>
            </div>
          ))}</div>
        </Card>
      </div>
    </div>
  );
}
