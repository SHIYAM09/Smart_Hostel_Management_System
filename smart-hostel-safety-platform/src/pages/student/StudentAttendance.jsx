import {
  Bell,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Badge } from "../../components/common/Badge";

export default function StudentAttendance() {
  const { attendance } = useHostel();
  const list = attendance;
  const present = list.filter(r=>r.status==="present").length;
  const pct = list.length ? Math.round((present / list.length) * 100) : 0;
  const pd = [
    { name: "Present", value: present, fill: "#10b981" },
    { name: "Late", value: list.filter(r=>r.status==="late").length, fill: "#f59e0b" },
    { name: "Absent", value: list.filter(r=>r.status==="absent").length, fill: "#ef4444" },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">{pd.map(d=><div key={d.name} className="bg-[#f4f8fc] rounded-xl border border-blue-50 shadow-sm p-5 text-center"><div className="text-2xl font-extrabold" style={{color:d.fill}}>{d.value}</div><div className="text-sm font-semibold text-gray-600">{d.name}</div></div>)}</div>
      <div className="bg-[#f4f8fc] rounded-2xl border border-blue-50 shadow-sm p-6"><div className="flex items-center justify-between mb-5"><h3 className="font-bold text-gray-900 text-base">Attendance Overview</h3><div className="text-2xl font-extrabold text-blue-600">{pct}%</div></div><div className="flex items-center gap-5"><div className="relative w-36 h-36"><PieChart width={144} height={144}><Pie data={pd} cx={72} cy={72} innerRadius={45} outerRadius={65} dataKey="value" stroke="none">{pd.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Pie></PieChart><div className="absolute inset-0 flex items-center justify-center"><div className="text-center"><div className="text-lg font-extrabold text-gray-900">{pct}%</div><div className="text-xs text-gray-400">present</div></div></div></div><div className="flex-1 space-y-3">{pd.map(d=><div key={d.name} className="flex items-center gap-3"><div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor:d.fill}}/><span className="text-sm text-gray-600 flex-1">{d.name}</span><span className="text-sm font-bold text-gray-800">{d.value}/{list.length}</span></div>)}</div></div></div>
      <div className="bg-[#f4f8fc] rounded-2xl border border-blue-50 shadow-sm overflow-hidden"><div className="px-6 py-5 border-b border-gray-100"><h3 className="font-bold text-gray-900 text-base">Attendance History</h3></div><div className="divide-y divide-gray-50">{list.map(r=>(<div key={r.date} className={cls("flex items-center gap-4 px-6 py-4",r.status==="absent"?"bg-red-50/30":"")}><div className={cls("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",r.status==="present"?"bg-emerald-50":r.status==="late"?"bg-amber-50":"bg-red-50")}>{r.status==="present"?<CheckCircle size={16} className="text-emerald-600"/>:r.status==="late"?<Bell size={16} className="text-amber-600"/>:<XCircle size={16} className="text-red-600"/>}</div><div className="flex-1"><div className="text-base font-semibold text-gray-800">{r.date}</div><div className="text-sm text-gray-400">{r.time || "Logged"}</div></div><Badge status={r.status}/></div>))}</div></div>
    </div>
  );
}
