// Reusable "Generate with AI" leave request modal. Triggered from wherever
// it's mounted (currently a card on the Student Home dashboard); doesn't
// depend on any specific page's layout so it can be dropped in elsewhere too.
import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, RefreshCw, ClipboardCheck } from "lucide-react";
import { Modal } from "../common/Modal";
import { FormField } from "../common/FormField";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { generateLeaveRequest } from "../../services/aiService";

const EMPTY = { reason: "", fromDate: "", toDate: "" };

export function LeaveRequestGeneratorModal({ open, onClose, studentName, room }) {
  const [form, setForm] = useState(EMPTY);
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [used, setUsed] = useState(false);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleClose = () => {
    onClose();
    setForm(EMPTY);
    setLetter("");
    setError("");
    setCopied(false);
    setUsed(false);
  };

  async function handleGenerate(regenerate = false) {
    setError("");
    setUsed(false);
    setCopied(false);
    try {
      setLoading(true);
      const text = await generateLeaveRequest({ ...form, studentName, room, regenerate });
      setLetter(text);
    } catch (e) {
      setError(e.message || "Could not generate the leave request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard. Please select and copy the text manually.");
    }
  }

  async function handleUseThis() {
    await handleCopy();
    setUsed(true);
  }

  return (
    <Modal open={open} onClose={handleClose} title="AI Leave Request Generator" wide>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="From Date" darkMode><Input type="date" value={form.fromDate} onChange={setField("fromDate")} darkMode /></FormField>
          <FormField label="To Date" darkMode><Input type="date" value={form.toDate} onChange={setField("toDate")} darkMode /></FormField>
        </div>
        <FormField label="Reason for Leave" darkMode>
          <textarea
            value={form.reason}
            onChange={setField("reason")}
            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white text-base focus:outline-none focus:ring-2 focus:ring-white/20 resize-none placeholder-white/50"
            rows={3}
            placeholder="e.g. Going home for a family function"
          />
        </FormField>

        <Button onClick={() => handleGenerate(false)} disabled={loading} className="w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? "Generating..." : "Generate with AI"}
        </Button>

        {error && <div className="text-sm text-red-400 bg-red-500/20 border border-red-500/30 rounded-xl p-3">{error}</div>}

        {letter && (
          <div className="space-y-3">
            <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-sm text-white whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {letter}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleUseThis} className="flex-1">
                {used ? <Check size={16} /> : <ClipboardCheck size={16} />}
                {used ? "Ready to submit" : "Use This"}
              </Button>
              <Button variant="secondary" onClick={handleCopy} className="flex-1">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="secondary" onClick={() => handleGenerate(true)} disabled={loading} className="flex-1">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Regenerate
              </Button>
            </div>
            {used && (
              <div className="text-xs text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3">
                Copied to your clipboard — paste it into your leave application email or hand it to the warden.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
