// Floating AI chatbot available on every page. Mounted once in App.jsx so
// it persists (and keeps its conversation) across admin/warden/student
// screens without touching any existing routing or page components.
import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Loader2, Bot, MessageCircleWarning } from "lucide-react";
import { cls } from "../../utils/classNames";
import { askHostelAssistant } from "../../services/aiService";
import { isGeminiConfigured } from "../../services/geminiClient";

const SUGGESTIONS = [
  "What are the mess timings today?",
  "What's the hostel fee due date?",
  "How do I file a complaint?",
  "What are the gate in/out timings?",
];

export function HostelAssistantWidget({ role, userName }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "model", text: "Hi! I'm your AI Hostel Assistant. Ask me about attendance, fees, leave, complaints, the mess menu, hostel rules, timings, or notices." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  async function send(text) {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;
    setError("");
    setInput("");
    const nextMessages = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setLoading(true);
    try {
      // Only the last few turns are sent for lightweight, cheap context.
      const history = nextMessages.slice(-9, -1).map((m) => ({ role: m.role, text: m.text }));
      const reply = await askHostelAssistant(trimmed, history, { role, userName });
      setMessages((cur) => [...cur, { role: "model", text: reply }]);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating launcher button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cls(
          "fixed bottom-5 right-5 z-[70] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all",
          "bg-gradient-to-br from-blue-600 to-[#0c2340] hover:scale-105 text-white"
        )}
        aria-label="Open AI Hostel Assistant"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[70] w-[92vw] max-w-sm bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden animate-modal" style={{ height: "min(70vh, 560px)" }}>
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#0c2340] to-[#1a56db] text-white shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center"><Bot size={18} /></div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm leading-tight">AI Hostel Assistant</div>
              <div className="text-xs text-blue-200 leading-tight">Attendance · Fees · Leave · Complaints · More</div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10"><X size={18} /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#f4f8fc]">
            {!isGeminiConfigured() && (
              <div className="flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3">
                <MessageCircleWarning size={15} className="mt-0.5 shrink-0" />
                <span>Add <code className="font-mono">VITE_GEMINI_API_KEY</code> to a .env file and restart the dev server to enable AI replies.</span>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cls("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cls(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white border border-blue-50 text-gray-800 rounded-bl-sm shadow-sm"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-blue-50 rounded-2xl rounded-bl-sm shadow-sm px-4 py-2.5 flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 size={14} className="animate-spin" /> Thinking...
                </div>
              </div>
            )}
            {error && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</div>}

            {messages.length <= 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-xs bg-white border border-blue-100 text-blue-700 rounded-full px-3 py-1.5 hover:bg-blue-50 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Ask about fees, leave, complaints..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-[#f4f8fc] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="w-10 h-10 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-all"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
