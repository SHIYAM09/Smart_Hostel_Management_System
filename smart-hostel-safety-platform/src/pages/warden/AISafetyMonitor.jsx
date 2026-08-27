import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Brain,
  Loader2,
  RefreshCw,
  Shield,
  Zap,
  UserCheck,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { studentService } from "../../services/studentService";
import { isGeminiConfigured } from "../../services/geminiClient";
import { cls } from "../../utils/classNames";
import { Button } from "../../components/common/Button";

const REFRESH_MS = 60000;

export default function AISafetyMonitor() {
  const [alerts, setAlerts] = useState([]);
  const [attendanceRisks, setAttendanceRisks] = useState([]);
  const [utilitySpikes, setUtilitySpikes] = useState(null);
  const [visitorRisks, setVisitorRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await studentService.getAISafetyAnalytics();
      if (data) {
        setAlerts(data.alerts || []);
        setAttendanceRisks(data.attendanceRisks || []);
        setUtilitySpikes(data.utilitySpikes || null);
        setVisitorRisks(data.visitorRisks || []);
      }
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Failed to generate safety alerts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const counts = {
    High: alerts.filter((a) => a.riskLevel === "High").length,
    Medium: alerts.filter((a) => a.riskLevel === "Medium").length,
    Low: alerts.filter((a) => a.riskLevel === "Low").length,
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0c2340] to-[#1a56db] rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center gap-4 shadow-md">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
            <Brain size={24} className="text-cyan-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              AI Safety & Anomaly Engine
              <span className="text-xs bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-medium">
                Live Monitoring
              </span>
            </h3>
            <p className="text-blue-200 text-sm mt-0.5">
              Analyzes complaints, attendance streaks, visitor verifications, and resource spikes
              {isGeminiConfigured() ? " via Google Gemini AI" : " (Predictive AI & Heuristic Rules Active)"}.
            </p>
          </div>
        </div>
        <Button
          onClick={refresh}
          disabled={loading}
          className="bg-white/15 hover:bg-white/25 border border-white/20 shrink-0 text-white"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh AI Models
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "High Risk Alerts", value: counts.High, c: "bg-red-50 border-red-200 text-red-700" },
          { label: "Medium Risk Warnings", value: counts.Medium, c: "bg-amber-50 border-amber-200 text-amber-700" },
          { label: "Low Risk Monitored", value: counts.Low, c: "bg-emerald-50 border-emerald-200 text-emerald-700" },
        ].map((s) => (
          <div key={s.label} className={cls("rounded-2xl p-4 border text-center shadow-sm", s.c)}>
            <div className="text-3xl font-extrabold">{s.value}</div>
            <div className="text-xs font-semibold mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Predictive Anomaly Models Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Attendance Anomaly Model Card */}
        <div className="bg-white rounded-2xl border border-blue-50 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
              <Activity size={18} className="text-indigo-600" />
              <span>Predictive Attendance Anomaly Model</span>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full">
              Streak Analytics
            </span>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {attendanceRisks.length > 0 ? (
              attendanceRisks.slice(0, 4).map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                  <div>
                    <div className="font-semibold text-gray-800">{r.name || `Student ${r.studentId}`}</div>
                    <div className="text-xs text-gray-500">{r.recommendedAction}</div>
                  </div>
                  <div className="text-right">
                    <span className={cls(
                      "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                      r.riskScore === "HIGH" ? "bg-red-100 text-red-700 border-red-200" : (r.riskScore === "MEDIUM" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-emerald-100 text-emerald-700 border-emerald-200")
                    )}>
                      {r.riskScore} RISK ({r.predictedAbsenceProb}%)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 py-4 text-center">No attendance anomalies detected across enrolled students.</div>
            )}
          </div>
        </div>

        {/* Resource Consumption Spike Anomaly Model Card */}
        <div className="bg-white rounded-2xl border border-blue-50 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
              <Zap size={18} className="text-amber-500" />
              <span>Resource & Utility Spike Anomaly Model</span>
            </div>
            <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
              Consumption Forecast
            </span>
          </div>

          {utilitySpikes ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                  <div className="text-xs text-gray-500">Forecasted Electricity</div>
                  <div className="text-base font-extrabold text-amber-800">{utilitySpikes.electricityForecastkWh} kWh</div>
                </div>
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <div className="text-xs text-gray-500">Forecasted Water</div>
                  <div className="text-base font-extrabold text-blue-800">{utilitySpikes.waterForecastLiters} L</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-xs font-bold text-gray-700 mb-1">Potential Spike Warning</div>
                <p className="text-xs text-gray-600">{utilitySpikes.potentialSpikes?.[0] || "Normal threshold level"}</p>
                <div className="text-xs font-semibold text-emerald-700 mt-1">Recommendation: {utilitySpikes.savingsRecommendation}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400 py-4 text-center">Loading utility anomaly models…</div>
          )}
        </div>
      </div>

      {/* Live AI Safety Alert Stream */}
      <div className="bg-white rounded-2xl border border-blue-50 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
            <Shield size={18} className="text-blue-600" />
            <span>Live AI Safety Alert Stream</span>
          </div>
          {lastRefresh && (
            <span className="text-xs text-gray-400">Refreshed: {lastRefresh}</span>
          )}
        </div>

        {loading && !alerts.length ? (
          <div className="flex items-center justify-center py-10 text-gray-500 gap-3">
            <Loader2 size={20} className="animate-spin text-blue-600" />
            <span className="text-sm font-medium">Running AI models across hostel datasets…</span>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={`${alert.title}-${index}`}
                className={cls(
                  "p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                  alert.riskLevel === "High" ? "bg-red-50/70 border-red-200" : (alert.riskLevel === "Medium" ? "bg-amber-50/70 border-amber-200" : "bg-blue-50/70 border-blue-200")
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cls(
                      "text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border",
                      alert.riskLevel === "High" ? "bg-red-100 text-red-800 border-red-300" : (alert.riskLevel === "Medium" ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-blue-100 text-blue-800 border-blue-300")
                    )}>
                      {alert.riskLevel} RISK
                    </span>
                    <span className="font-bold text-gray-900 text-sm">{alert.title}</span>
                  </div>
                  <p className="text-xs text-gray-600">{alert.suggestedAction}</p>
                </div>
                <div className="text-xs text-gray-400 shrink-0 font-medium">{alert.timestamp}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
