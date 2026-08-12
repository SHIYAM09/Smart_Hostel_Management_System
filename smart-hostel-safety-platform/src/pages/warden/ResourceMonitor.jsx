import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Download,
  Droplets,
  Flame,
  Plus,
  TrendingUp,
  Wifi,
  Wrench,
  Zap,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Modal } from "../../components/common/Modal";
import { FormField } from "../../components/common/FormField";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { exportToCSV } from "../../utils/exportUtils";

const EMPTY_UTILITY = {
  electricity: "",
  water: "",
  internet: "",
  generator: "",
  maintenanceCost: "",
  date: new Date().toISOString().slice(0, 10),
};

const UTILITY_FIELDS = [
  { key: "electricity", label: "Electricity Consumption", unit: "kWh", icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
  { key: "water", label: "Water Consumption", unit: "kL", icon: Droplets, color: "text-cyan-500", bg: "bg-cyan-50" },
  { key: "internet", label: "Internet Usage", unit: "GB", icon: Wifi, color: "text-indigo-500", bg: "bg-indigo-50" },
  { key: "generator", label: "Generator Usage", unit: "hrs", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
  { key: "maintenanceCost", label: "Maintenance Cost", unit: "₹", icon: Wrench, color: "text-amber-600", bg: "bg-amber-50" },
];

export default function ResourceMonitor() {
  const { utilityData, resources, addUtilityData, showToast } = useHostel();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_UTILITY);

  const displayUtilityData = utilityData;
  const latest = displayUtilityData[displayUtilityData.length - 1] || {};
  const chartData = useMemo(
    () =>
      displayUtilityData.map((entry) => ({
        date: String(entry.date || entry.readingDate || "").slice(-5) || "08-05",
        electricity: Number(entry.electricity ?? entry.electricityUsage ?? 0),
        water: Number(entry.water ?? entry.waterUsage ?? 0),
        internet: Number(entry.internet ?? entry.internetUsage ?? 0),
        generator: Number(entry.generator ?? entry.generatorUsage ?? 0),
        maintenanceCost: Number(entry.maintenanceCost ?? 0),
      })),
    [displayUtilityData]
  );

  const handleSave = (e) => {
    e.preventDefault();
    addUtilityData({
      electricity: Number(form.electricity) || 0,
      water: Number(form.water) || 0,
      internet: Number(form.internet) || 0,
      generator: Number(form.generator) || 0,
      maintenanceCost: Number(form.maintenanceCost) || 0,
      date: form.date,
    });
    setForm(EMPTY_UTILITY);
    setModal(false);
    showToast("Utility data saved.");
  };

  const handleExportCSV = () => {
    const rows = (displayUtilityData || []).map((u) => ({
      Database_ID: u.id || `UT${Date.now()}`,
      Reading_Date: u.date || u.readingDate || new Date().toISOString().slice(0, 10),
      Hostel_Block: u.hostelBlock || u.block || "Block A",
      Electricity_Usage_kWh: u.electricity ?? u.electricityUsage ?? 0,
      Water_Usage_kL: u.water ?? u.waterUsage ?? 0,
      Internet_Usage_GB: u.internet ?? u.internetUsage ?? 0,
      Generator_Usage_Hours: u.generator ?? u.generatorUsage ?? 0,
      Maintenance_Cost_INR: u.maintenanceCost ?? 0,
      Remarks: u.remarks || "Regular Monitoring",
    }));
    exportToCSV("Utility_Monitoring_Report", rows);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={handleExportCSV}>
          <Download size={16} />
          Export
        </Button>
        <Button onClick={() => setModal(true)}>
          <Plus size={17} />
          Add Utility Data
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {UTILITY_FIELDS.map(({ key, label, unit, icon: Icon, color, bg }) => {
          const rawVal = latest?.[key] ?? latest?.[key + "Usage"];
          const displayVal = key === "maintenanceCost"
            ? `₹${rawVal != null ? Number(rawVal).toLocaleString() : "0"}`
            : (rawVal != null ? rawVal : "—");

          return (
            <div key={key} className="bg-white rounded-2xl border border-blue-50 shadow-sm p-5">
              <div className={cls("w-11 h-11 rounded-xl flex items-center justify-center mb-3", bg)}>
                <Icon size={20} className={color} />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">
                {displayVal}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{unit}{key !== "maintenanceCost" ? "/day" : ""}</div>
              <div className="text-sm font-semibold text-gray-700 mt-1">{label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map((r) => {
          const pct = Math.round((r.current / r.max) * 100);
          const over = r.current > r.threshold;
          const Icon = r.name.includes("Water")
            ? Droplets
            : r.name.includes("Electricity")
              ? Zap
              : r.name.includes("Internet")
                ? Wifi
                : r.name.includes("Generator")
                  ? Flame
                  : Activity;
          return (
            <div
              key={r.id}
              className={cls("bg-white rounded-2xl border shadow-sm p-6", over ? "border-red-200" : "border-blue-50")}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cls("w-12 h-12 rounded-xl flex items-center justify-center", over ? "bg-red-50" : "bg-blue-50")}>
                  <Icon size={22} className={over ? "text-red-500" : "text-blue-500"} />
                </div>
                <div className="flex items-center gap-1">
                  {r.trend === "up" ? (
                    <TrendingUp size={14} className="text-red-500" />
                  ) : (
                    <Activity size={14} className="text-gray-400" />
                  )}
                  {r.anomaly && (
                    <span className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      !
                    </span>
                  )}
                </div>
              </div>
              <div className={cls("text-3xl font-extrabold", over ? "text-red-600" : "text-gray-900")}>{r.current}</div>
              <div className="text-sm text-gray-400">{r.unit}</div>
              <div className="text-base font-bold text-gray-800 mt-1">{r.name}</div>
              <div className="mt-4 w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={cls("h-full rounded-full", over ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-blue-500")}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0</span>
                <span className={over ? "text-red-600 font-bold" : ""}>Limit: {r.threshold}</span>
                <span>{r.max}</span>
              </div>
            </div>
          );
        })}
      </div>

      {resources.filter((r) => r.anomaly).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
          <div className="font-bold text-red-800 text-base flex items-center gap-2">
            <AlertTriangle size={16} />
            Utility Anomalies Detected
          </div>
          {resources.filter((r) => r.anomaly).map((r) => (
            <div key={r.id} className="text-sm text-red-700">
              • <strong>{r.name}:</strong> {r.current} {r.unit} —{" "}
              {Math.round(((r.current - r.threshold) / r.threshold) * 100)}% above threshold.
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-blue-50 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 text-base mb-4">Electricity & Water — Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Area type="monotone" dataKey="electricity" stroke="#1a56db" fill="#1a56db" fillOpacity={0.15} strokeWidth={2} name="Electricity (kWh)" />
              <Area type="monotone" dataKey="water" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2} name="Water (kL)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-blue-50 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 text-base mb-4">Internet & Generator — Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Bar dataKey="internet" fill="#6366f1" radius={[3, 3, 0, 0]} name="Internet (GB)" />
              <Bar dataKey="generator" fill="#f97316" radius={[3, 3, 0, 0]} name="Generator (hrs)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-blue-100">
          <h3 className="font-bold text-gray-900 text-base">Historical Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f4f8fc] border-b border-blue-100">
                {["Date", "Electricity (kWh)", "Water (kL)", "Internet (GB)", "Generator (hrs)", "Maintenance (₹)"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...utilityData].reverse().map((entry) => (
                <tr key={entry.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900">{entry.date || entry.readingDate || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{entry.electricity ?? entry.electricityUsage ?? 0}</td>
                  <td className="px-4 py-3 text-gray-700">{entry.water ?? entry.waterUsage ?? 0}</td>
                  <td className="px-4 py-3 text-gray-700">{entry.internet ?? 0}</td>
                  <td className="px-4 py-3 text-gray-700">{entry.generator ?? 0}</td>
                  <td className="px-4 py-3 font-bold text-blue-700">
                    ₹{entry.maintenanceCost != null ? Number(entry.maintenanceCost).toLocaleString() : "0"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Utility Data">
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Date" darkMode>
            <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} darkMode />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Electricity Consumption (kWh)" darkMode>
              <Input type="number" min="0" step="0.1" placeholder="142" value={form.electricity} onChange={(e) => setForm((f) => ({ ...f, electricity: e.target.value }))} darkMode />
            </FormField>
            <FormField label="Water Consumption (kL)" darkMode>
              <Input type="number" min="0" step="0.1" placeholder="8.4" value={form.water} onChange={(e) => setForm((f) => ({ ...f, water: e.target.value }))} darkMode />
            </FormField>
            <FormField label="Internet Usage (GB)" darkMode>
              <Input type="number" min="0" step="0.1" placeholder="89" value={form.internet} onChange={(e) => setForm((f) => ({ ...f, internet: e.target.value }))} darkMode />
            </FormField>
            <FormField label="Generator Usage (hrs)" darkMode>
              <Input type="number" min="0" step="0.1" placeholder="3.0" value={form.generator} onChange={(e) => setForm((f) => ({ ...f, generator: e.target.value }))} darkMode />
            </FormField>
          </div>
          <FormField label="Maintenance Cost (₹)" darkMode>
            <Input type="number" min="0" placeholder="1800" value={form.maintenanceCost} onChange={(e) => setForm((f) => ({ ...f, maintenanceCost: e.target.value }))} darkMode />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Save Data</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
