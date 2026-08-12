import { useState } from "react";
import {
  Activity,
  AlertCircle,
  Droplets,
  Lock,
  Mail,
  Shield,
  UserCheck,
  Utensils,
} from "lucide-react";
import { authService } from "../../services/api";

export default function Login({ onLogin }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!usernameOrEmail.trim() || !password) {
      setError("Please enter both username/email and password.");
      return;
    }
    setLoading(true);

    try {
      const response = await authService.login(usernameOrEmail.trim(), password);
      if (response && response.success && response.data) {
        const authData = response.data;
        const rawRole = (authData.roles && authData.roles.length > 0) ? authData.roles[0] : "student";
        const role = rawRole.toLowerCase().replace("role_", "");
        const name = authData.fullName || authData.username || usernameOrEmail.split("@")[0];

        // Store tokens & user details in localStorage
        localStorage.setItem("token", authData.accessToken);
        if (authData.refreshToken) {
          localStorage.setItem("refreshToken", authData.refreshToken);
        }
        localStorage.setItem("user", JSON.stringify({ ...authData, role, fullName: name }));

        onLogin(role, name, authData.accessToken, authData.refreshToken, authData);
        setLoading(false);
        return;
      } else {
        setError(response?.message || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || "Invalid username/email or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f0f4f8] font-['Inter',system-ui,sans-serif] antialiased">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-[#0c2340] relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, rgba(59,130,246,0.25) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.2) 0%, transparent 50%)" }} />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col h-full p-12 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <div className="text-white font-extrabold text-xl">Smart Hostel</div>
              <div className="text-blue-300 text-sm">Safety & Resource Platform</div>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-5 tracking-tight">
              Safety. Attendance.<br />Resource Intelligence.
            </h2>
            <p className="text-blue-200 text-base leading-relaxed max-w-sm font-medium">
              An AI-assisted hostel platform with anomaly detection for student absences, visitor risk scoring, mess analytics, and resource monitoring.
            </p>
            <div className="mt-10 space-y-3">
              {[
                { icon: Activity, label: "Safety Anomaly Detection", sub: "Absence & visitor risk alerts" },
                { icon: Utensils, label: "Mess Analytics", sub: "Wastage tracking & ratings" },
                { icon: Droplets, label: "Resource Monitoring", sub: "Water, electricity & waste" },
                { icon: UserCheck, label: "Visitor Verification", sub: "ID checks & risk profiling" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-5 py-3">
                  <Icon size={17} className="text-blue-200 shrink-0" />
                  <div>
                    <div className="text-white text-sm font-semibold">{label}</div>
                    <div className="text-blue-300 text-xs">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-blue-400 text-sm">© 2026 Smart Hostel Safety & Resource Platform</div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">Smart Hostel</div>
              <div className="text-gray-400 text-sm">Safety & Resource Platform</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sign In</h1>
              <p className="text-gray-500 text-sm mt-2 font-medium">Enter your registered username or email</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Username or Email</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => {
                      setUsernameOrEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter username or email"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-[#f4f8fc] text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    autoComplete="username"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Password</label>
                <div className="relative">
                  <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter password"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-[#f4f8fc] text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl border border-red-100 text-base text-red-700">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-base transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
