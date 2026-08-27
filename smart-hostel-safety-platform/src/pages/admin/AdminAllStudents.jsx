import { useEffect } from "react";
import { Search } from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { useTable } from "../../hooks/useTable";
import { Button } from "../../components/common/Button";

export default function AdminAllStudents() {
  const { students, refreshStudents } = useHostel();

  useEffect(() => {
    refreshStudents();
  }, []);
  const table = useTable(students, { searchKeys: ["name", "rollNo", "room", "course"], pageSize: 8 });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={table.search} onChange={(e) => { table.setSearch(e.target.value); table.setPage(1); }} placeholder="Search students..." className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead><tr className="bg-[#f4f8fc] border-b border-blue-100">{["Student","Roll No","Room","Course","Block","Streak","Status"].map(h=><th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">{table.paginated.map(s=>(
              <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={s.name} size="sm"/><div><div className="font-semibold text-gray-900 text-base">{s.name}</div><div className="text-sm text-gray-400">{s.year} Year</div></div></div></td>
                <td className="px-5 py-4 font-mono text-sm font-medium text-gray-700">{s.rollNo}</td>
                <td className="px-5 py-4 font-bold text-blue-700">{s.room}</td>
                <td className="px-5 py-4 text-gray-600 text-sm">{s.course}</td>
                <td className="px-5 py-4 text-gray-600 text-sm">Block {s.room[0]}</td>
                <td className="px-5 py-4">{s.absenceStreak>0?<span className={cls("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold",s.absenceStreak>=3?"bg-red-50 text-red-700 border border-red-200":"bg-amber-50 text-amber-700 border border-amber-200")}>{s.absenceStreak}d</span>:<span className="text-gray-300 text-sm">—</span>}</td>
                <td className="px-5 py-4"><Badge status={s.status}/></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {table.paginated.length} of {table.total} students</span>
          {table.totalPages > 1 && (
            <div className="flex gap-2">
              <Button variant="secondary" disabled={table.page <= 1} onClick={() => table.setPage(table.page - 1)}>Prev</Button>
              <Button variant="secondary" disabled={table.page >= table.totalPages} onClick={() => table.setPage(table.page + 1)}>Next</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
