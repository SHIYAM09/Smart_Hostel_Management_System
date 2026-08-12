// Reusable "Analyze with AI" control. Drop it into any complaint form:
// pass the raw description text and an onResult callback that receives
// { subject, description, category, priority } to auto-fill the form.
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { analyzeComplaint } from "../../services/aiService";

export function ComplaintAnalyzerButton({ description, onResult, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");
    try {
      setLoading(true);
      const result = await analyzeComplaint(description);
      onResult(result);
    } catch (e) {
      setError(e.message || "Could not analyze the complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || !description?.trim()}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40 transition-all w-full sm:w-auto"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {loading ? "Analyzing..." : "Analyze with AI"}
      </button>
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
    </div>
  );
}
