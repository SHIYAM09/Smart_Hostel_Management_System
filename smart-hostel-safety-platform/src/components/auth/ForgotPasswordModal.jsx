import { useState } from "react";
import { AlertCircle, CheckCircle2, KeyRound, Lock, Mail, X } from "lucide-react";
import { authService } from "../../services/api";

export default function ForgotPasswordModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [receivedToken, setReceivedToken] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setEmail("");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
    setReceivedToken("");
    onClose();
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await authService.forgotPassword(email.trim());
      if (response && (response.success || response.data)) {
        // Capture OTP token if returned in response data (e.g. for development/email flow)
        const token = response.data || response.message || "";
        if (token && typeof token === "string" && token.length === 6) {
          setReceivedToken(token);
        }
        setMessage("Password reset OTP generated. Please enter the 6-digit OTP code.");
        setStep(2);
      } else {
        setError(response?.message || "Failed to generate password reset OTP. Please verify your email.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || "User not found with this email address.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await authService.verifyOtp(email.trim(), otpCode.trim());
      if (response && (response.success || response.status === 200)) {
        setMessage("OTP verified successfully. Please set your new password.");
        setStep(3);
      } else {
        setError(response?.message || "Invalid or expired OTP code.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || "Invalid or expired OTP code.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const resetTokenToUse = otpCode.trim() || receivedToken;
      const response = await authService.resetPassword(resetTokenToUse, newPassword);
      if (response && (response.success || response.status === 200)) {
        setMessage("Password reset successfully! You can now sign in with your new password.");
        setStep(4);
      } else {
        setError(response?.message || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || "Failed to reset password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-8 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <KeyRound size={20} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Forgot Password</h3>
            <p className="text-xs text-gray-500 font-medium">Account Security & Verification</p>
          </div>
        </div>

        {/* Status Error / Info Messages */}
        {error && (
          <div className="mb-5 flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700 font-medium">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && !error && step !== 4 && (
          <div className="mb-5 flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700 font-medium">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wider">
                Registered Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="name@smart-hostel.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-[#f4f8fc] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generating OTP...
                </>
              ) : (
                "Send OTP Code"
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wider">
                6-Digit OTP Code
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => { setOtpCode(e.target.value); setError(""); }}
                  placeholder="Enter 6-digit OTP"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-[#f4f8fc] text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
              {receivedToken && (
                <p className="text-[11px] text-blue-600 font-semibold mt-1.5 text-center">
                  Demo OTP Code: <span className="font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{receivedToken}</span>
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                  placeholder="Enter new password"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-[#f4f8fc] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  placeholder="Confirm new password"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-[#f4f8fc] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}

        {/* STEP 4: Reset Success */}
        {step === 4 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={26} />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-gray-900">Password Reset Complete</h4>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Your password has been successfully updated in the database. Please sign in with your new credentials.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { handleClose(); if (onSuccess) onSuccess(); }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-200"
            >
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
