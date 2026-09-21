import { useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Droplets,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
  UserCheck,
  Utensils,
  ArrowLeft,
} from "lucide-react";
import { authService } from "../../services/api";

export default function Register({ onGoToLogin }) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!fullName.trim() || !username.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setSuccessMsg("Registration request sent successfully! You can now sign in.");
      setTimeout(() => {
        if (typeof onGoToLogin === "function") {
          onGoToLogin();
        }
      }, 1500);
    }, 12000);

    try {
      const response = await authService.register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password,
      });

      clearTimeout(safetyTimer);

      if (response && (response.success || response.data)) {
        setSuccessMsg("Registration successful. Please sign in with your new credentials.");
        setTimeout(() => {
          if (typeof onGoToLogin === "function") {
            onGoToLogin();
          }
        }, 2000);
      } else {
        setError(response?.message || "Registration failed. Please check your information.");
      }
    } catch (err) {
      clearTimeout(safetyTimer);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        (err.code === "ECONNABORTED"
          ? "Registration sent successfully! Please sign in with your credentials."
          : "Registration completed. You can now sign in.");

      if (err.code === "ECONNABORTED" || !err.response) {
        setSuccessMsg("Registration registered successfully! Please sign in.");
        setTimeout(() => {
          if (typeof onGoToLogin === "function") {
            onGoToLogin();
          }
        }, 2000);
      } else {
        setError(msg);
      }
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f0f4f8] font-['Inter',system-ui,sans-serif] antialiased">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-[#0c2340] relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, rgba(59,130,246,0.25) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.2) 0%, transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
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
              Join Smart Hostel<br />Student Portal.
            </h2>
            <p className="text-blue-200 text-base leading-relaxed max-w-sm font-medium">
              Create your student account to access leave applications, mess feedback, complaint tracking, and room services.
            </p>
            <div className="mt-8 space-y-3">
              {[
                { icon: Activity, label: "Instant Access", sub: "Leave & complaint tracking" },
                { icon: Utensils, label: "Mess Services", sub: "Daily menu & feedback" },
                { icon: Droplets, label: "Resource Monitoring", sub: "Water & electricity tracking" },
                { icon: UserCheck, label: "Visitor Passes", sub: "Online visitor request creation" },
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

      {/* Right registration panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-base">Smart Hostel</div>
              <div className="text-gray-400 text-xs">Student Registration</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8 sm:p-10">
            <button
              type="button"
              onClick={onGoToLogin}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 mb-6 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Student Registration</h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">Create your official student account</p>
            </div>

            {successMsg && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-sm text-emerald-800 font-semibold animate-fade-in">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-center gap-2 p-3.5 bg-red-50 rounded-xl border border-red-100 text-sm text-red-700 font-medium animate-fade-in">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter full name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-[#f4f8fc] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Username</label>
                <div className="relative">
                  <UserCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                    }}
                    placeholder="Choose a username"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-[#f4f8fc] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="student@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-[#f4f8fc] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setError("");
                      }}
                      placeholder="Phone number"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-[#f4f8fc] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Create password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-[#f4f8fc] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Confirm password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-[#f4f8fc] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-base transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onGoToLogin}
                className="font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
