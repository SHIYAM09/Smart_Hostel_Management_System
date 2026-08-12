// Thin, reusable wrapper around the Google Gemini REST API.
// Every AI feature (assistant chat, complaint analyzer, leave generator)
// goes through this single module so there is one place that owns the
// API key, endpoint, error handling, and JSON-response parsing.

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export class GeminiConfigError extends Error {}

function assertConfigured() {
  if (!API_KEY) {
    throw new GeminiConfigError(
      "Gemini API key is missing. Add VITE_GEMINI_API_KEY to a .env file at the project root and restart the dev server."
    );
  }
}

/**
 * Low-level call to the Gemini generateContent endpoint.
 * @param {Array<{role:"user"|"model", text:string}>} turns - conversation turns, oldest first.
 * @param {object} [opts]
 * @param {string} [opts.systemInstruction] - optional system/grounding instruction.
 * @param {number} [opts.temperature]
 * @param {boolean} [opts.json] - if true, asks Gemini to return raw JSON.
 */
export async function generateContent(turns, opts = {}) {
  assertConfigured();
  const { systemInstruction, temperature = 0.6, json = false } = opts;

  const body = {
    contents: turns.map((t) => ({
      role: t.role === "model" ? "model" : "user",
      parts: [{ text: t.text }],
    })),
    generationConfig: {
      temperature,
      maxOutputTokens: 500,
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { role: "system", parts: [{ text: systemInstruction }] };
  }

  let res;
  try {
    res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    throw new Error("Could not reach the Gemini API. Check your internet connection.");
  }

  if (!res.ok) {
    let detail = "";
    try {
      const errJson = await res.json();
      detail = errJson?.error?.message || "";
    } catch {
      /* ignore parse failure */
    }
    throw new Error(`Gemini API error (${res.status}): ${detail || res.statusText}`);
  }

  const data = await res.json();

  const blockReason = data?.promptFeedback?.blockReason;
  if (blockReason) {
    throw new Error(`Request was blocked by Gemini safety filters (${blockReason}).`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ?? "";

  if (!text) {
    throw new Error("Gemini returned an empty response. Please try again.");
  }
  return text.trim();
}

/** Convenience helper for a single-turn prompt (no chat history). */
export async function generateText(prompt, opts = {}) {
  return generateContent([{ role: "user", text: prompt }], opts);
}

/**
 * Calls Gemini expecting JSON back and safely parses it, stripping any
 * ```json fences the model may add even when responseMimeType is set.
 */
export async function generateJSON(prompt, opts = {}) {
  const raw = await generateText(prompt, { ...opts, json: true });
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fall back to grabbing the first {...} block in case of stray text.
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        /* fall through */
      }
    }
    throw new Error("Could not parse the AI response. Please try again.");
  }
}

export const isGeminiConfigured = () => Boolean(API_KEY);
