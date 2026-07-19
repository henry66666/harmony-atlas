import { createServerFn } from "@tanstack/react-start";

export const GEMINI_MODELS = [
  { id: "gemini-flash-latest", label: "Gemini Flash (latest)" },
  { id: "gemini-flash-lite-latest", label: "Gemini Flash Lite" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
] as const;

export const REASONING_LEVELS = [
  { id: "none", label: "Off", budget: 0 },
  { id: "low", label: "Low", budget: 1024 },
  { id: "medium", label: "Medium", budget: 8192 },
  { id: "high", label: "High", budget: 16384 },
  { id: "max", label: "Max", budget: 24576 },
] as const;

// Top 20 countries by population (2024) → primary language
export const TRANSLATION_LANGUAGES = [
  { id: "en", label: "English", country: "Default" },
  { id: "zh", label: "中文 (简体)", country: "China" },
  { id: "hi", label: "हिन्दी", country: "India" },
  { id: "en-US", label: "English (US)", country: "United States" },
  { id: "id", label: "Bahasa Indonesia", country: "Indonesia" },
  { id: "ur", label: "اردو", country: "Pakistan" },
  { id: "pt-BR", label: "Português (BR)", country: "Brazil" },
  { id: "en-NG", label: "English (Nigeria)", country: "Nigeria" },
  { id: "bn", label: "বাংলা", country: "Bangladesh" },
  { id: "ru", label: "Русский", country: "Russia" },
  { id: "es-MX", label: "Español (MX)", country: "Mexico" },
  { id: "ja", label: "日本語", country: "Japan" },
  { id: "am", label: "አማርኛ", country: "Ethiopia" },
  { id: "fil", label: "Filipino", country: "Philippines" },
  { id: "ar-EG", label: "العربية (مصر)", country: "Egypt" },
  { id: "vi", label: "Tiếng Việt", country: "Vietnam" },
  { id: "cd-fr", label: "Français (RDC)", country: "DR Congo" },
  { id: "tr", label: "Türkçe", country: "Turkey" },
  { id: "fa", label: "فارسی", country: "Iran" },
  { id: "de", label: "Deutsch", country: "Germany" },
  { id: "th", label: "ไทย", country: "Thailand" },
] as const;

type GeminiInput = {
  title: string;
  subtitle: string;
  moveName: string;
  moveDetail: string;
  goal: string;
  model?: string;
  reasoning?: string;
  language?: string;
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
      model: typeof d.model === "string" ? d.model : undefined,
      reasoning: typeof d.reasoning === "string" ? d.reasoning : undefined,
      language: typeof d.language === "string" ? d.language : undefined,
    } satisfies GeminiInput;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const model =
      GEMINI_MODELS.find((m) => m.id === data.model)?.id ??
      process.env.GEMINI_MODEL ??
      "gemini-flash-latest";

    const reasoning =
      REASONING_LEVELS.find((r) => r.id === data.reasoning) ?? REASONING_LEVELS[0];

    const language =
      TRANSLATION_LANGUAGES.find((l) => l.id === data.language) ?? TRANSLATION_LANGUAGES[0];

    const languageInstruction =
      language.id === "en"
        ? "Write the article in clear, natural English."
        : `Write the entire article — including all H2 headings and body text — in ${language.label} (${language.country}). Do not include the English version.`;

    const prompt = `You are a knowledgeable Traditional Chinese Medicine (TCM) wellness educator writing for an international audience. Produce a clear, well-structured educational article about the following practice movement.

CONTEXT
- Practice: ${data.title}
- Category: ${data.subtitle}
- Goal: ${data.goal}
- Current Movement: ${data.moveName}
- Movement Detail: ${data.moveDetail}

LANGUAGE
${languageInstruction}

REQUIREMENTS
Return a well-formatted Markdown document with the following sections (use H2 headings, translated to the target language):
1. Overview — 2-3 sentences introducing this movement and its TCM origin.
2. How It Works — the meridians, acupoints, or body systems involved, in accessible language.
3. Wellness Benefits — a bulleted list of 4-6 concrete benefits for body and mind.
4. How to Practice Well — 3-5 short practical tips (posture, breathing, frequency).
5. Who Should Be Careful — brief safety notes and contraindications.
6. A Gentle Note — 1-2 warm closing sentences.

STYLE
- Warm, calm, professional tone. No hype, no emojis in body text.
- Concise sentences. Prefer plain language over jargon; briefly explain any TCM term used.
- Do not invent medical claims. Frame benefits as traditional wellness support, not medical treatment.
- Output pure Markdown only. No preamble, no closing remarks outside the sections above.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const body: Record<string, unknown> = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    // Gemini 2.5+ supports thinkingConfig; older models ignore unknown fields.
    body.generationConfig = {
      thinkingConfig: { thinkingBudget: reasoning.budget },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Gemini request failed [${res.status}]: ${errBody}`);
    }

    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const text = json.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim();

    if (!text) throw new Error("Gemini returned an empty response");

    return { markdown: text, model, reasoning: reasoning.id, language: language.id };
  });

type GenerateMoveMediaInput = {
  routineName: string;
  goal: string | null;
  moveName: string;
  moveDetail: string;
  durationLabel: string;
  index: number;
  total: number;
  siblings: { name: string; detail: string }[];
};

export const generateMoveMedia = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const d = input as Partial<GenerateMoveMediaInput>;
    return {
      routineName: String(d?.routineName ?? "").slice(0, 120),
      goal: d?.goal ? String(d.goal).slice(0, 40) : null,
      moveName: String(d?.moveName ?? "").slice(0, 120),
      moveDetail: String(d?.moveDetail ?? "").slice(0, 200),
      durationLabel: String(d?.durationLabel ?? "").slice(0, 40),
      index: Number(d?.index ?? 0),
      total: Number(d?.total ?? 1),
      siblings: Array.isArray(d?.siblings)
        ? d!.siblings!.slice(0, 8).map((s) => ({
            name: String(s?.name ?? "").slice(0, 80),
            detail: String(s?.detail ?? "").slice(0, 120),
          }))
        : [],
    } satisfies GenerateMoveMediaInput;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    // Use Lovable AI Gateway image models instead of Google's direct v1beta
    // preview IDs. The old direct models can return 404 even when Gemini image
    // generation is available through the Gateway catalog.
    const envModel = process.env.GEMINI_IMAGE_MODEL;
    const modelCandidates = [
      envModel,
      "google/gemini-3.1-flash-image",
      "google/gemini-3-pro-image",
      "google/gemini-2.5-flash-image",
      "openai/gpt-image-2",
    ]
      .filter((m): m is string => typeof m === "string" && m.length > 0)
      .map((m) => {
        if (m.startsWith("google/") || m.startsWith("openai/")) return m;
        if (m.includes("gemini") && m.includes("image")) return `google/${m}`;
        return m;
      });

    const siblingLines = data.siblings.length
      ? data.siblings
          .map((s, i) => `  ${i + 1}. ${s.name}${s.detail ? ` — ${s.detail}` : ""}`)
          .join("\n")
      : "  (none)";

    const prompt = `Create a single high-quality illustration for a Chinese wellness (TCM) mobile app.

ROUTINE CONTEXT
- Routine name: ${data.routineName || "(untitled routine)"}
- Wellness goal: ${data.goal ?? "general wellbeing"}
- Step ${data.index + 1} of ${data.total}
- All steps in this routine:
${siblingLines}

CURRENT MOVEMENT TO DEPICT
- Name: ${data.moveName || "Movement"}
- Body area / detail: ${data.moveDetail || "unspecified"}
- Duration: ${data.durationLabel}

VISUAL STYLE (must follow strictly)
- Minimalist textured flat-watercolor illustration with subtle paper grain and light noise.
- Muted Morandi palette: warm off-white background (#FDFBF7), sage green, muted mustard, soft clay, dusty rose. Low saturation, warm tones, no gradients, no strong contrast.
- Human figure (if shown): extremely simple vector cartoon, minimal facial features, clean line body, calm posture that clearly demonstrates the movement on the correct body area.
- Composition: single centered subject, generous whitespace, gentle and healing feeling, matte paper texture.
- Absolutely no text, no letters, no numbers, no watermark, no UI, no logos in the image.
- Square 1:1 framing suitable for a mobile card.

Return one image only.`;

    const buildGatewayBody = (model: string) => {
      if (model === "google/gemini-3.1-flash-lite-image") {
        return {
          model,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        };
      }

      if (model.startsWith("google/")) {
        return {
          model,
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        };
      }

      return {
        model,
        prompt,
        quality: "low",
        size: "1024x1024",
        n: 1,
      };
    };

    let lastError = "";
    let lastStatus = 0;
    const url = "https://ai.gateway.lovable.dev/v1/images/generations";
    for (const model of [...new Set(modelCandidates)]) {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(buildGatewayBody(model)),
      });

      if (res.ok) {
        const json = (await res.json()) as {
          data?: { b64_json?: string }[];
        };
        const b64 = json.data?.find((item) => item.b64_json)?.b64_json;
        if (!b64) {
          lastError = "Image model returned no image data";
          continue;
        }
        const mimeType = "image/png";
        const dataUrl = `data:${mimeType};base64,${b64}`;
        const suggestedName = await suggestNameFromImage(apiKey, dataUrl, data).catch(
          () => "",
        );
        return { dataUrl, mimeType, model, suggestedName };
      }

      lastStatus = res.status;
      lastError = await res.text();
      // Only fall through on quota / not-found; other errors are terminal.
      if (res.status !== 429 && res.status !== 404) break;
    }

    if (lastStatus === 429) {
      throw new Error(
        "Image generation quota was exhausted. Please retry later, add credits, or set GEMINI_IMAGE_MODEL to another supported Gateway image model.",
      );
    }
    throw new Error(`Gemini image request failed [${lastStatus}]: ${lastError}`);
  });
