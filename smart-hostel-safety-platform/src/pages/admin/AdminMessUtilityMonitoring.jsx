import { useState, useEffect, useMemo } from "react";
import {
  Utensils,
  Activity,
  Zap,
  Droplets,
  Wifi,
  Flame,
  Wrench,
  Star,
  TrendingDown,
  Search,
  Database,
  Calendar,
  Filter,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Download,
  Building2,
  Package,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useHostel } from "../../context/HostelContext";
import { cls } from "../../utils/classNames";
import { Button } from "../../components/common/Button";
import { exportToCSV } from "../../utils/exportUtils";

export default function AdminMessUtilityMonitoring() {
  const {
    messFeedback,
    messData,
    utilityData,
    averageMessRatings,
    refreshMess,
    refreshUtilities,
    loading,
  } = useHostel();

  const [activeTab, setActiveTab] = useState("all"); // "all" | "mess" | "wastage" | "utilities"
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mealFilter, setMealFilter] = useState("ALL");

  // On mount, perform direct live DB sync
  useEffect(() => {
    handleRefreshDB();
  }, []);

  const handleRefreshDB = async () => {
    setRefreshing(true);
    await Promise.allSettled([refreshMess(), refreshUtilities()]);
    setRefreshing(false);
  };

  // Process Real-Time Mess Feedback Records from DB
  const filteredFeedback = useMemo(() => {
    return (messFeedback || []).filter((f) => {
      const meal = String(f.mealType || f.meal || "").toUpperCase();
      const matchMeal = mealFilter === "ALL" || meal === mealFilter;
      const student = String(f.studentName || f.studentId || "").toLowerCase();
      const comment = String(f.comments || f.comment || f.remarks || "").toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchQuery = !q || student.includes(q) || comment.includes(q) || meal.includes(q);
      return matchMeal && matchQuery;
    });
  }, [messFeedback, mealFilter, searchQuery]);

  // Food Wastage Chart & Metrics (Database-Driven)
  const wastageChartData = useMemo(() => {
    return (messData || []).map((m) => {
      const bw = Number(m.breakfastWastage) || 0;
      const lw = Number(m.lunchWastage) || 0;
      const dw = Number(m.dinnerWastage) || 0;
      const totalW = Number(m.wastageKg) || (bw + lw + dw);
      const rawDate = m.date || m.logDate || new Date().toISOString().slice(0, 10);
      return {
        id: m.id || m._id,
        date: String(rawDate).slice(0, 10),
        breakfastWastage: parseFloat(bw.toFixed(1)),
        lunchWastage: parseFloat(lw.toFixed(1)),
        dinnerWastage: parseFloat(dw.toFixed(1)),
        wastageKg: parseFloat(totalW.toFixed(1)),
        remarks: m.remarks || "System Log",
      };
    });
  }, [messData]);

  const totalWastageKg = useMemo(() => {
    return wastageChartData.reduce((acc, curr) => acc + curr.wastageKg, 0).toFixed(1);
  }, [wastageChartData]);

  // Utility Monitoring Metrics (Database-Driven)
  const latestUtility = useMemo(() => {
    return (utilityData || [])[(utilityData || []).length - 1] || {};
  }, [utilityData]);

  const utilityChartData = useMemo(() => {
    return (utilityData || []).map((u) => ({
      date: String(u.date || u.readingDate || "").slice(-5) || "08-05",
      electricity: Number(u.electricity ?? u.electricityUsage ?? 0),
      water: Number(u.water ?? u.waterUsage ?? 0),
      internet: Number(u.internet ?? u.internetUsage ?? 0),
      generator: Number(u.generator ?? u.generatorUsage ?? 0),
      maintenanceCost: Number(u.maintenanceCost ?? 0),
      block: u.hostelBlock || "Block D",
    }));
  }, [utilityData]);

  const totalUtilityCost = useMemo(() => {
    return (utilityData || []).reduce((acc, curr) => acc + Number(curr.maintenanceCost || 0), 0);
  }, [utilityData]);

  // Export Combined Real-Time DB Data to CSV
  const handleExportData = () => {
    const feedbackRows = (messFeedback || []).map((f) => ({
      Category: "Mess Feedback",
      Date: f.date || f.createdAt || "N/A",
      Student: f.studentName || "Student",
      MealType: f.mealType || f.meal || "N/A",
      Rating: f.rating || "N/A",
      Comments: f.comments || f.comment || f.remarks || "",
    }));

    const wastageRows = wastageChartData.map((w) => ({
      Category: "Food Wastage",
      Date: w.date,
      Student: "N/A",
      MealType: "Daily Total",
      Rating: "N/A",
      Comments: `Total: ${w.wastageKg}kg (B: ${w.breakfastWastage}kg, L: ${w.lunchWastage}kg, D: ${w.dinnerWastage}kg) - ${w.remarks}`,
    }));

    const utilityRows = (utilityData || []).map((u) => ({
      Category: "Utility Log",
      Date: u.date || u.readingDate || "N/A",
      Student: "N/A",
      MealType: u.hostelBlock || "Block D",
      Rating: "N/A",
      Comments: `Elec: ${u.electricity ?? 0}kWh, Water: ${u.water ?? 0}kL, Net: ${u.internet ?? 0}GB, Gen: ${u.generator ?? 0}hrs, Maint: ₹${u.maintenanceCost ?? 0}`,
    }));

    exportToCSV("Admin_Mess_and_Utility_Report", [...feedbackRows, ...wastageRows, ...utilityRows]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Real-Time Sync
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Utensils className="text-indigo-400" size={24} />
              Mess Feedback & Utility Monitoring
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Live administrator dashboard monitoring real-time values for student mess ratings, food wastage metrics, and hostel utility consumption.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 shadow-md transition-all active:scale-95"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Quick Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/10">
          {[
            { id: "all", label: "Overview & All Logs", icon: Database },
            { id: "mess", label: `Mess Feedback (${(messFeedback || []).length})`, icon: Utensils },
            { id: "wastage", label: `Food Wastage (${(messData || []).length})`, icon: Package },
            { id: "utilities", label: `Utility Logs (${(utilityData || []).length})`, icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cls(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
                activeTab === tab.id
                  ? "bg-white text-indigo-950 border-white shadow-md scale-105"
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
              )}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Real-Time Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-blue-50 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center border border-yellow-100">
              <Star size={20} className="fill-yellow-500 text-yellow-500" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Live
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900">{averageMessRatings?.overall ?? "0.0"} <span className="text-sm font-semibold text-gray-400">/ 5</span></div>
          <div className="text-xs font-semibold text-gray-500 mt-0.5">Overall Mess Satisfaction</div>
          <div className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-100 flex justify-between">
            <span>Breakfast: <strong>{averageMessRatings?.breakfast ?? "0.0"}★</strong></span>
            <span>Lunch: <strong>{averageMessRatings?.lunch ?? "0.0"}★</strong></span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-blue-50 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <TrendingDown size={20} />
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {(messData || []).length} Entries
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900">{totalWastageKg} <span className="text-sm font-semibold text-gray-400">kg</span></div>
          <div className="text-xs font-semibold text-gray-500 mt-0.5">Total Logged Food Wastage</div>
          <div className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
            Monitored daily via warden logs
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-blue-50 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Zap size={20} />
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {latestUtility?.hostelBlock || "Block D"}
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900">{latestUtility?.electricity ?? latestUtility?.electricityUsage ?? 0} <span className="text-sm font-semibold text-gray-400">kWh</span></div>
          <div className="text-xs font-semibold text-gray-500 mt-0.5">Latest Daily Electricity Usage</div>
          <div className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-100 flex justify-between">
            <span>Water: <strong>{latestUtility?.water ?? 0} kL</strong></span>
            <span>Internet: <strong>{latestUtility?.internet ?? 0} GB</strong></span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-blue-50 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Wrench size={20} />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Cumulative Cost
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900">₹{totalUtilityCost.toLocaleString()}</div>
          <div className="text-xs font-semibold text-gray-500 mt-0.5">Total Maintenance Spend</div>
          <div className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
            Generator: <strong>{latestUtility?.generator ?? 0} hrs</strong> logged
          </div>
        </div>
      </div>

      {/* TAB 1: SECTION - MESS MENU FEEDBACK */}
      {(activeTab === "all" || activeTab === "mess") && (
        <div className="bg-white rounded-3xl border border-blue-50 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Utensils size={18} className="text-indigo-600" />
                Real-Time Student Mess Menu Feedback
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Live feedbacks submitted by students per meal (Breakfast, Lunch, Snacks, Dinner).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student or comments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-52"
                />
              </div>

              {/* Meal Filter Pills */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold border border-gray-200">
                {["ALL", "BREAKFAST", "LUNCH", "SNACKS", "DINNER"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMealFilter(m)}
                    className={cls(
                      "px-2.5 py-1 rounded-lg transition-all capitalize",
                      mealFilter === m ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
                    )}
                  >
                    {m.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Rating Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["breakfast", "lunch", "snacks", "dinner"].map((m) => (
              <div key={m} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{m}</div>
                <div className="flex items-center justify-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xl font-extrabold text-slate-900">{averageMessRatings[m] ?? "0.0"}</span>
                  <span className="text-xs text-slate-400">/5</span>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Feedback List Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Meal Type</th>
                  <th className="px-5 py-3.5">Rating</th>
                  <th className="px-5 py-3.5">Comments / Feedback</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredFeedback.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-xs">
                      <MessageSquare className="mx-auto mb-2 opacity-40" size={28} />
                      No mess feedback records found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredFeedback.map((f, idx) => {
                    const mealName = String(f.mealType || f.meal || "BREAKFAST").toUpperCase();
                    const ratingNum = Number(f.rating || 5);
                    const commentText = f.comments || f.comment || f.remarks || "No comments provided.";
                    const dateStr = f.date ? String(f.date).slice(0, 10) : (f.createdAt ? String(f.createdAt).slice(0, 10) : "Today");

                    return (
                      <tr key={f.id || idx} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-gray-600 text-xs whitespace-nowrap">
                          {dateStr}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-gray-900 text-xs">
                          {f.studentName || "Student"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={cls(
                            "px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize inline-block",
                            mealName === "BREAKFAST" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            mealName === "LUNCH" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            mealName === "SNACKS" ? "bg-purple-50 text-purple-700 border-purple-200" :
                            "bg-emerald-50 text-emerald-700 border-emerald-200"
                          )}>
                            {mealName.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={13}
                                className={cls(
                                  s <= ratingNum ? "text-yellow-500 fill-yellow-500" : "text-gray-200"
                                )}
                              />
                            ))}
                            <span className="text-xs font-bold text-gray-700 ml-1">{ratingNum}.0</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-700 max-w-xs truncate italic">
                          "{commentText}"
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            <CheckCircle2 size={11} /> Saved
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SECTION - FOOD WASTAGE TRACKING */}
      {(activeTab === "all" || activeTab === "wastage") && (
        <div className="bg-white rounded-3xl border border-blue-50 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package size={18} className="text-amber-600" />
                Real-Time Food Wastage Monitoring
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Daily food wastage logs recorded by mess wardens.
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl">
              Target Threshold: &lt; 15.0 kg/day
            </div>
          </div>

          {/* Chart Section */}
          <div className="h-[260px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wastageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: 12 }}
                />
                <Bar dataKey="breakfastWastage" fill="#fcd34d" stackId="a" name="Breakfast Waste (kg)" />
                <Bar dataKey="lunchWastage" fill="#f59e0b" stackId="a" name="Lunch Waste (kg)" />
                <Bar dataKey="dinnerWastage" fill="#d97706" stackId="a" radius={[6, 6, 0, 0]} name="Dinner Waste (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Food Wastage Logs Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Log Date</th>
                  <th className="px-5 py-3.5">Breakfast (kg)</th>
                  <th className="px-5 py-3.5">Lunch (kg)</th>
                  <th className="px-5 py-3.5">Dinner (kg)</th>
                  <th className="px-5 py-3.5">Total Wastage</th>
                  <th className="px-5 py-3.5">Warden Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {wastageChartData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-xs">
                      No food wastage logs found.
                    </td>
                  </tr>
                ) : (
                  wastageChartData.map((w, idx) => (
                    <tr key={w.id || idx} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-gray-900 text-xs">{w.date}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-700">{w.breakfastWastage} kg</td>
                      <td className="px-5 py-3.5 text-xs text-gray-700">{w.lunchWastage} kg</td>
                      <td className="px-5 py-3.5 text-xs text-gray-700">{w.dinnerWastage} kg</td>
                      <td className="px-5 py-3.5">
                        <span className={cls(
                          "px-2.5 py-1 rounded-full text-xs font-black border",
                          w.wastageKg > 15 ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        )}>
                          {w.wastageKg} kg
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 italic">
                        {w.remarks}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SECTION - UTILITY MONITORING */}
      {(activeTab === "all" || activeTab === "utilities") && (
        <div className="bg-white rounded-3xl border border-blue-50 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-blue-600" />
                Real-Time Hostel Utility Monitoring
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Electricity, water, internet, generator usage, and maintenance expense logs.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
              <Building2 size={13} /> {latestUtility?.hostelBlock || "Block D"}
            </div>
          </div>

          {/* Utility Chart */}
          <div className="h-[250px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminElec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="adminWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="electricity" stroke="#3b82f6" strokeWidth={3} fill="url(#adminElec)" name="Electricity (kWh)" />
                <Area type="monotone" dataKey="water" stroke="#06b6d4" strokeWidth={3} fill="url(#adminWater)" name="Water (kL)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Utility Records Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Reading Date</th>
                  <th className="px-5 py-3.5">Hostel Block</th>
                  <th className="px-5 py-3.5">Electricity (kWh)</th>
                  <th className="px-5 py-3.5">Water (kL)</th>
                  <th className="px-5 py-3.5">Internet (GB)</th>
                  <th className="px-5 py-3.5">Generator (hrs)</th>
                  <th className="px-5 py-3.5">Maintenance Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {(utilityData || []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-xs">
                      No utility logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  [...(utilityData || [])].reverse().map((u, idx) => (
                    <tr key={u.id || idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-gray-900 text-xs">
                        {u.date || u.readingDate || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-indigo-700">
                        {u.hostelBlock || u.block || "Block D"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-800 font-medium">
                        {u.electricity ?? u.electricityUsage ?? 0} kWh
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-800 font-medium">
                        {u.water ?? u.waterUsage ?? 0} kL
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-800 font-medium">
                        {u.internet ?? u.internetUsage ?? 0} GB
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-800 font-medium">
                        {u.generator ?? u.generatorUsage ?? 0} hrs
                      </td>
                      <td className="px-5 py-3.5 font-black text-emerald-700 text-xs">
                        ₹{u.maintenanceCost != null ? Number(u.maintenanceCost).toLocaleString() : "0"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
