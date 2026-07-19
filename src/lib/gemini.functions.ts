import { createServerFn } from "@tanstack/react-start";

type GeminiInput = {
  title: string;
  subtitle: string;
  moveName: string;
  moveDetail: string;
  goal: string;
};

export const fetchWellnessKnowledge = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const d = input as Partial<GeminiInput>;
    if (!d || typeof d.moveName !== "string") {
      throw new Error("Invalid input");
    }
    return {
      title: String(d.title ?? ""),
      subtitle: String(d.subtitle ?? ""),
      moveName: String(d.moveName ?? ""),
      moveDetail: String(d.moveDetail ?? ""),
      goal: String(d.goal ?? ""),
    } satisfies GeminiInput;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const prompt = `You are a knowledgeable Traditional Chinese Medicine (TCM) wellness educator writing for an international audience. Produce a clear, well-structured educational article in English about the following practice movement.

CONTEXT
- Practice: ${data.title}
- Category: ${data.subtitle}
- Goal: ${data.goal}
- Current Movement: ${data.moveName}
- Movement Detail: ${data.moveDetail}

REQUIREMENTS
Return a well-formatted Markdown document with the following sections (use H2 headings):
1. ## Overview — 2-3 sentences introducing this movement and its TCM origin.
2. ## How It Works — the meridians, acupoints, or body systems involved, explained in accessible language.
3. ## Wellness Benefits — a bulleted list of 4-6 concrete benefits for body and mind.
4. ## How to Practice Well — 3-5 short practical tips (posture, breathing, frequency).
5. ## Who Should Be Careful — brief safety notes and contraindications.
6. ## A Gentle Note — 1-2 warm closing sentences.

STYLE
- Warm, calm, professional tone. No hype, no emojis in body text.
- Concise sentences. Prefer plain language over jargon; briefly explain any TCM term used.
- Do not invent medical claims. Frame benefits as traditional wellness support, not medical treatment.
- Output pure Markdown only. No preamble, no closing remarks outside the sections above.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gemini request failed [${res.status}]: ${body}`);
    }

    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const text = json.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim();

    if (!text) throw new Error("Gemini returned an empty response");

    return { markdown: text };
  });
