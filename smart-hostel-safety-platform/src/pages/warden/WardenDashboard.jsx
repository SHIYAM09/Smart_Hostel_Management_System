import { useMemo } from "react";
import {
  Activity,
  BedDouble,
  Brain,
  CalendarCheck,
  CalendarDays,
  Droplets,
  Flame,
  MessageSquareWarning,
  Package,
  UserCheck,
  Users,
  Utensils,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Avatar } from "../../components/common/Avatar";
import { Card, CardHeader, CardBody } from "../../components/common/Card";
import { AnimatedCounter } from "../../components/common/AnimatedCounter";

const FALLBACK_RESOURCES = [
  { id: 1, name: "Water Supply Tank A", current: 8200, max: 10000, unit: "L", threshold: 9000, anomaly: false },
  { id: 2, name: "Electricity Grid Block A", current: 1420, max: 1500, unit: "kWh", threshold: 1400, anomaly: true },
  { id: 3, name: "Generator Diesel Level", current: 450, max: 500, unit: "L", threshold: 400, anomaly: true },
  { id: 4, name: "Wi-Fi Bandwidth Usage", current: 650, max: 1000, unit: "GB", threshold: 850, anomaly: false },
];

export default function WardenDashboard({ onNav }) {
  const { students, rooms, attendance, complaints, visitors, messData, resources, utilityData, dashboardMetrics } = useHostel();
  const pct = attendance.length ? Math.round((attendance.filter(a => a.status === "present").length / attendance.length) * 100) : (dashboardMetrics?.todayAttendanceRate ? Math.round(dashboardMetrics.todayAttendanceRate) : 0);

  const anomalies = useMemo(() => {
    const absentStudentIds = new Set(
      attendance
        .filter((a) => String(a.status).toLowerCase() === "absent")
        .map((a) => String(a.studentId || a.id))
    );
    return students.filter(
      (s) => (s.absenceStreak && s.absenceStreak > 0) || absentStudentIds.has(String(s.id)) || absentStudentIds.has(String(s.rawId)) || absentStudentIds.has(String(s.rollNo))
    );
  }, [students, attendance]);

  const kpis = [
    { label:"Total Students", value:students.length || dashboardMetrics?.totalStudents || 0, sub:`${students.filter(s=>s.status==="active").length || students.length} active`, icon:Users, bg:"bg-blue-50 text-blue-600", nav:"students" },
    { label:"Occupied Rooms", value:rooms.filter(r=>r.status==="occupied").length || dashboardMetrics?.occupiedRooms || 0, sub:`${rooms.filter(r=>r.status==="vacant" || r.status==="available").length || dashboardMetrics?.availableBeds || 0} available`, icon:BedDouble, bg:"bg-indigo-50 text-indigo-600", nav:"rooms" },
    { label:"Tonight Attendance", value:`${pct}%`, sub:`${attendance.filter(a=>a.status==="absent").length} absent`, icon:CalendarCheck, bg:"bg-cyan-50 text-cyan-600", nav:"attendance" },
    { label:"System Status", value:"Active", sub:"All systems operational", icon:Zap, bg:"bg-green-50 text-green-600", nav:"ai-safety" },
    { label:"Open Complaints", value:complaints.filter(c=>c.status!=="resolved").length || dashboardMetrics?.pendingComplaints || 0, sub:"need action", icon:MessageSquareWarning, bg:"bg-amber-50 text-amber-600", nav:"complaints" },
    { label:"Active Visitors", value:visitors.filter(v=>v.status!=="checked-out"&&v.status!=="pending").length, sub:`${visitors.filter(v=>v.status==="pending").length} pending`, icon:UserCheck, bg:"bg-violet-50 text-violet-600", nav:"visitors" },
  ];

  const latestUtility = (utilityData && utilityData.length > 0) ? utilityData[utilityData.length - 1] : null;

  const displayResources = useMemo(() => {
    if (resources && resources.length > 0) {
      return resources.map((r) => ({
        id: r.id,
        name: r.itemName || r.name || "Resource Item",
        current: Number(r.quantity ?? r.current ?? 0),
        max: Number(r.maxQuantity ?? r.max ?? 100),
        unit: r.unit || "units",
        threshold: Number(r.threshold ?? 80),
        anomaly: Boolean(r.anomaly || (r.quantity && r.threshold && r.quantity > r.threshold)),
      }));
    }

    if (latestUtility) {
      return [
        { id: "u1", name: "Water Supply Tank A", current: Number(latestUtility.water || 0), max: 10000, unit: "L", threshold: 8500, anomaly: Number(latestUtility.water) > 8500 },
        { id: "u2", name: "Electricity Grid Block A", current: Number(latestUtility.electricity || 0), max: 2000, unit: "kWh", threshold: 1500, anomaly: Number(latestUtility.electricity) > 1500 },
        { id: "u3", name: "Generator Diesel Level", current: Number(latestUtility.generator || 0), max: 10, unit: "hrs", threshold: 6, anomaly: Number(latestUtility.generator) > 6 },
        { id: "u4", name: "Wi-Fi Bandwidth Usage", current: Number(latestUtility.internet || 0), max: 1000, unit: "GB", threshold: 800, anomaly: Number(latestUtility.internet) > 800 },
      ];
    }

    return FALLBACK_RESOURCES;
  }, [resources, latestUtility]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{kpis.map(k=>(
        <Card
          key={k.label}
          clickable
          onClick={() => onNav(k.nav)}
          className="p-4"
        >
          <div className={cls("w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-transform hover:scale-110",k.bg)}><k.icon size={17}/></div>
          <div className="text-xl font-extrabold text-gray-900">
            {typeof k.value === 'number' ? (
              <AnimatedCounter value={k.value} />
            ) : (
              k.value
            )}
          </div>
          <div className="text-sm font-semibold text-gray-700 mt-0.5">{k.label}</div>
          <div className="text-xs text-gray-400">{k.sub}</div>
        </Card>
      ))}</div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3 p-5">
          <CardHeader className="px-0 pb-4 border-0">
            <h3 className="font-bold text-gray-900 text-sm">Weekly Attendance Trend</h3>
          </CardHeader>
          <CardBody className="px-0 py-0">
            <ResponsiveContainer width="100%" height={150}><BarChart data={[
              { day: "Mon", present: Math.max(students.length - 2, 0), absent: 2, late: 0 },
              { day: "Tue", present: Math.max(students.length - 1, 0), absent: 1, late: 1 },
              { day: "Wed", present: Math.max(students.length - 3, 0), absent: 3, late: 0 },
              { day: "Thu", present: Math.max(students.length - 2, 0), absent: 2, late: 1 },
              { day: "Fri", present: Math.max(students.length - 4, 0), absent: 4, late: 0 },
              { day: "Sat", present: Math.max(students.length - 5, 0), absent: 5, late: 0 },
              { day: "Sun", present: students.length, absent: 0, late: 0 },
            ]}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="day" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{borderRadius:12,border:"1px solid #e5e7eb",fontSize:11}}/><Bar dataKey="present" fill="#1a56db" radius={[4,4,0,0]} name="Present"/><Bar dataKey="absent" fill="#fca5a5" radius={[4,4,0,0]} name="Absent"/><Bar dataKey="late" fill="#fcd34d" radius={[4,4,0,0]} name="Late"/></BarChart></ResponsiveContainer>
          </CardBody>
        </Card>
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-gray-900 text-sm">Absence Anomalies</h3><button onClick={()=>onNav("attendance")} className="text-xs text-blue-600 font-semibold hover:text-blue-700 transition-colors">View all</button></div>
          <div className="space-y-2.5">
            {anomalies.length > 0 ? (
              anomalies.map(s=>(
                <div key={s.id} className={cls("rounded-xl p-3 flex items-center gap-3 border transition-all hover:shadow-md", (s.absenceStreak || 1) >= 3 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200")}>
                  <Avatar name={s.name} size="sm"/>
                  <div className="flex-1 min-w-0"><div className="text-xs font-bold text-gray-900 truncate">{s.name}</div><div className="text-[10px] text-gray-500">{s.room} · {s.rollNo}</div></div>
                  <span className={cls("text-xs font-bold px-2 py-0.5 rounded-full", (s.absenceStreak || 1) >= 3 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>{(s.absenceStreak || 1)}d</span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center bg-gray-50/80 rounded-xl border border-dashed border-gray-200">
                <div className="text-xs font-semibold text-gray-600">No Absence Anomalies</div>
                <div className="text-[10px] text-gray-400 mt-0.5">All registered hostel students are present</div>
              </div>
            )}
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-gray-900 text-sm">Mess Wastage (kg/day)</h3><button onClick={()=>onNav("mess")} className="text-xs text-blue-600 font-semibold hover:text-blue-700 transition-colors">Details</button></div>
          <ResponsiveContainer width="100%" height={110}><AreaChart data={messData}><defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="day" tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:"#9ca3af"}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{borderRadius:12,border:"1px solid #e5e7eb",fontSize:11}}/><Area type="monotone" dataKey="wastageKg" stroke="#f59e0b" fill="url(#wg)" strokeWidth={2} name="Wastage kg"/></AreaChart></ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-gray-900 text-sm">Utility Monitoring</h3><button onClick={()=>onNav("resources")} className="text-xs text-blue-600 font-semibold hover:text-blue-700 transition-colors">Details</button></div>
          <div className="space-y-3">{displayResources.slice(0, 4).map(r=>{
            const pctR=Math.round((r.current/r.max)*100),over=r.current>r.threshold;
            const Icon=r.name.includes("Water")?Droplets:r.name.includes("Electricity")?Zap:r.name.includes("Generator")?Flame:Package;
            return(<div key={r.id} className="flex items-center gap-3 transition-all hover:bg-gray-50 rounded-lg p-1"><div className={cls("w-7 h-7 rounded-lg flex items-center justify-center shrink-0",over?"bg-red-50":"bg-blue-50")}><Icon size={13} className={over?"text-red-500":"text-blue-500"}/></div><div className="flex-1 min-w-0"><div className="flex justify-between text-xs mb-1"><span className="font-semibold text-gray-700 truncate">{r.name}</span><span className={cls("font-bold",over?"text-red-600":"text-gray-600")}>{r.current} {r.unit}</span></div><div className="w-full bg-gray-100 rounded-full h-1.5"><div className={cls("h-full rounded-full transition-all duration-500",over?"bg-red-500":"bg-blue-500")} style={{width:`${Math.min(pctR,100)}%`}}/></div></div>{r.anomaly&&<span className="w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0 animate-pulse">!</span>}</div>);
          })}</div>
        </Card>
      </div>
    </div>
  );
}
