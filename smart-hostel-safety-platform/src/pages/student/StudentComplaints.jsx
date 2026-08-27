import { useState, useEffect } from "react";
import {
  Plus,
  Send,
  MessageSquare,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useHostel } from "../../context/HostelContext";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { FormField } from "../../components/common/FormField";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { StarRating, StarDisplay } from "../../components/common/StarRating";
import { useAuth } from "../../hooks/useAuth";
import { analyzeComplaint } from "../../services/aiService";

const STUDENT_ID = "S001";

export default function StudentComplaints() {
  const { complaints, addComplaint, submitComplaintFeedback, refreshComplaints } = useHostel();
  const { userName } = useAuth();

  useEffect(() => {
    refreshComplaints();
  }, [refreshComplaints]);

  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [form, setForm] = useState({ subject: "", category: "Plumbing", priority: "medium", description: "" });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: "" });
  const [errors, setErrors] = useState({});
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState("");

  const myC = complaints;

  const handleAIAnalyze = async () => {
    const textToAnalyze = form.description.trim() || form.subject.trim();
    if (!textToAnalyze) {
      setErrors({ description: "Please enter a subject or description to analyze with AI." });
      return;
    }
    setAiAnalyzing(true);
    setErrors({});
    setAiSuccessMsg("");
    try {
      const res = await analyzeComplaint(textToAnalyze);
      setForm((f) => ({
        ...f,
        subject: res.subject || f.subject,
        description: res.description || f.description,
        category: res.category || f.category,
        priority: (res.priority || f.priority).toLowerCase(),
      }));
      setAiSuccessMsg(`✨ AI Analyzed: Category set to ${res.category}, Priority set to ${res.priority.toUpperCase()}`);
    } catch (err) {
      setErrors({ description: err.message || "AI Analysis failed." });
    } finally {
      setAiAnalyzing(false);
    }
  };

  const validateComplaint = () => {
    const e = {};
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = () => {
    if (!validateComplaint()) return;
    setLoading(true);
    setTimeout(() => {
      addComplaint({
        studentId: STUDENT_ID,
        studentName: userName || "Student User",
        room: "D-214",
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
      });
      setForm({ subject: "", category: "Plumbing", priority: "medium", description: "" });
      setAiSuccessMsg("");
      setModal(false);
      setLoading(false);
    }, 400);
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackForm.rating) { setErrors({ rating: "Please select a rating" }); return; }
    if (!feedbackForm.comment.trim()) { setErrors({ comment: "Comment is required" }); return; }
    submitComplaintFeedback(feedbackModal.id, feedbackForm.rating, feedbackForm.comment.trim());
    setFeedbackModal(null);
    setFeedbackForm({ rating: 0, comment: "" });
    setErrors({});
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-base text-gray-600">{myC.length} complaints filed</div>
        <Button onClick={() => setModal(true)}><Plus size={17} />New Complaint</Button>
      </div>
      <div className="space-y-4">
        {myC.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-blue-50 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge status={c.status} />
              <Badge status={c.priority} />
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{c.category}</span>
            </div>
            <h4 className="font-bold text-gray-900 text-base">{c.subject}</h4>
            <p className="text-sm text-gray-500 mt-1">{c.description}</p>
            <div className="text-sm text-gray-400 mt-2">{c.date}</div>
            {c.wardenReply && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="text-xs font-bold text-blue-700 mb-1">Warden Reply</div>
                <p className="text-sm text-blue-800">{c.wardenReply}</p>
              </div>
            )}
            {c.status === "resolved" && !c.feedback && (
              <div className="mt-4">
                <Button variant="secondary" onClick={() => { setFeedbackModal(c); setFeedbackForm({ rating: 0, comment: "" }); setErrors({}); }}>
                  <MessageSquare size={16} />Give Feedback
                </Button>
              </div>
            )}
            {c.feedback && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-700">Feedback Submitted</span>
                  <StarDisplay rating={c.feedback.rating} />
                </div>
                <p className="text-sm text-emerald-800">{c.feedback.comment}</p>
                <div className="text-xs text-emerald-600 mt-1">{c.feedback.submittedAt}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="File New Complaint">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-950 to-indigo-900 border border-violet-700/50 rounded-xl text-white">
            <div className="text-xs">
              <span className="font-bold text-violet-300 block">AI Complaint Assistant</span>
              Type issue details & click AI Analyze to auto-classify category and urgency priority.
            </div>
            <button
              type="button"
              onClick={handleAIAnalyze}
              disabled={aiAnalyzing}
              className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
            >
              {aiAnalyzing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {aiAnalyzing ? "Analyzing..." : "Analyze with AI"}
            </button>
          </div>

          {aiSuccessMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-semibold">
              {aiSuccessMsg}
            </div>
          )}

          <FormField label="Subject" darkMode>
            <Input placeholder="Describe the issue briefly" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} darkMode />
            {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject}</p>}
          </FormField>
          <FormField label="Category" darkMode>
            <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} darkMode>
              <option>Plumbing</option><option>Electrical</option><option>IT</option><option>Maintenance</option><option>Mess</option><option>Safety</option><option>Other</option>
            </Select>
          </FormField>
          <FormField label="Priority" darkMode>
            <Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} darkMode>
              <option>low</option><option>medium</option><option>high</option>
            </Select>
          </FormField>
          <FormField label="Description" darkMode>
            <textarea className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white text-base focus:outline-none focus:ring-2 focus:ring-white/20 resize-none placeholder-white/50" rows={4} placeholder="Describe in detail..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
          </FormField>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={loading}>{loading ? "Submitting..." : <><Send size={16} />Submit</>}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!feedbackModal} onClose={() => setFeedbackModal(null)} title="Complaint Feedback">
        <div className="space-y-4">
          <p className="text-sm text-white/70">Rate your experience with the resolution of: <strong className="text-white">{feedbackModal?.subject}</strong></p>
          <FormField label="Rating (1–5 stars)" darkMode>
            <StarRating value={feedbackForm.rating} onChange={(r) => setFeedbackForm((f) => ({ ...f, rating: r }))} />
            {errors.rating && <p className="text-xs text-red-400 mt-1">{errors.rating}</p>}
          </FormField>
          <FormField label="Comment" darkMode>
            <textarea className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white text-base focus:outline-none focus:ring-2 focus:ring-white/20 resize-none placeholder-white/50" rows={3} placeholder="Share your feedback..." value={feedbackForm.comment} onChange={(e) => setFeedbackForm((f) => ({ ...f, comment: e.target.value }))} />
            {errors.comment && <p className="text-xs text-red-400 mt-1">{errors.comment}</p>}
          </FormField>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setFeedbackModal(null)} className="flex-1">Cancel</Button>
            <Button onClick={handleFeedbackSubmit} className="flex-1"><Send size={16} />Submit Feedback</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
