import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { translateBatch } from "@/lib/gemini.functions";

export type LangCode =
  | "en"
  | "zh"
  | "hi"
  | "es"
  | "fr"
  | "ar"
  | "pt"
  | "ru"
  | "ja"
  | "de"
  | "ko"
  | "tr"
  | "it"
  | "id"
  | "vi"
  | "th"
  | "pl"
  | "nl"
  | "fa"
  | "uk";

export type LangDef = {
  code: LangCode;
  label: string;
  english: string;
  country: string;
  rtl?: boolean;
};

// Top 20 by population / speakers, covering primary language of major markets.
export const LANGUAGES: LangDef[] = [
  { code: "en", label: "English", english: "English", country: "Global" },
  { code: "zh", label: "中文 (简体)", english: "Simplified Chinese", country: "China" },
  { code: "hi", label: "हिन्दी", english: "Hindi", country: "India" },
  { code: "es", label: "Español", english: "Spanish", country: "Spain / LATAM" },
  { code: "fr", label: "Français", english: "French", country: "France" },
  { code: "ar", label: "العربية", english: "Arabic", country: "Middle East", rtl: true },
  { code: "pt", label: "Português", english: "Portuguese", country: "Brazil / Portugal" },
  { code: "ru", label: "Русский", english: "Russian", country: "Russia" },
  { code: "ja", label: "日本語", english: "Japanese", country: "Japan" },
  { code: "de", label: "Deutsch", english: "German", country: "Germany" },
  { code: "ko", label: "한국어", english: "Korean", country: "South Korea" },
  { code: "tr", label: "Türkçe", english: "Turkish", country: "Türkiye" },
  { code: "it", label: "Italiano", english: "Italian", country: "Italy" },
  { code: "id", label: "Bahasa Indonesia", english: "Indonesian", country: "Indonesia" },
  { code: "vi", label: "Tiếng Việt", english: "Vietnamese", country: "Vietnam" },
  { code: "th", label: "ไทย", english: "Thai", country: "Thailand" },
  { code: "pl", label: "Polski", english: "Polish", country: "Poland" },
  { code: "nl", label: "Nederlands", english: "Dutch", country: "Netherlands" },
  { code: "fa", label: "فارسی", english: "Persian", country: "Iran", rtl: true },
  { code: "uk", label: "Українська", english: "Ukrainian", country: "Ukraine" },
];

const STORAGE_KEY = "qiwell.lang";
const cachePrefix = "qiwell.tr.";

function loadCache(lang: LangCode): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(cachePrefix + lang);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}
function saveCache(lang: LangCode, cache: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(cachePrefix + lang, JSON.stringify(cache));
  } catch {
    // storage full — silently ignore
  }
}

type Ctx = {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  langDef: LangDef;
  translating: boolean;
};

const LanguageContext = createContext<Ctx | null>(null);

// Data marker so we don't retranslate nodes we already own.
const ORIG_KEY = "__qiwellOrig";

// Elements whose text should NEVER be translated.
const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "TEXTAREA",
  "INPUT",
]);

function shouldSkip(el: Element | null): boolean {
  let cur: Element | null = el;
  while (cur) {
    if (SKIP_TAGS.has(cur.tagName)) return true;
    if (cur.getAttribute?.("data-no-translate") !== null) return true;
    cur = cur.parentElement;
  }
  return false;
}

const MIN_CHARS = 1;

function collectTextNodes(root: Node): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const text = n.nodeValue?.trim() ?? "";
      if (text.length < MIN_CHARS) return NodeFilter.FILTER_REJECT;
      // Skip pure numbers / punctuation only strings
      if (!/[a-zA-Z\u00C0-\u024F]/.test(text)) return NodeFilter.FILTER_REJECT;
      if (shouldSkip(n.parentElement)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let cur = walker.nextNode();
  while (cur) {
    nodes.push(cur as Text);
    cur = walker.nextNode();
  }
  return nodes;
}

// Store originals on text-node parents so we can restore & re-translate.
type Tracked = Text & { [ORIG_KEY]?: string };

function getOriginal(node: Tracked): string {
  if (node[ORIG_KEY] === undefined) {
    node[ORIG_KEY] = node.nodeValue ?? "";
  }
  return node[ORIG_KEY] ?? "";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");
  const [translating, setTranslating] = useState(false);
  const cacheRef = useRef<Record<string, string>>({});
  const observerRef = useRef<MutationObserver | null>(null);
  const scheduledRef = useRef<number | null>(null);

  // Load persisted choice
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (stored && LANGUAGES.some((l) => l.code === stored)) {
      setLangState(stored);
    }
  }, []);

  const langDef = useMemo(
    () => LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0],
    [lang],
  );

  // Translate all currently collected text nodes to current lang.
  const applyTranslations = useCallback(
    async (targetLang: LangCode, nodes: Tracked[]) => {
      if (nodes.length === 0) return;

      if (targetLang === "en") {
        // Restore originals
        for (const n of nodes) {
          const orig = n[ORIG_KEY];
          if (orig !== undefined && n.nodeValue !== orig) {
            n.nodeValue = orig;
          }
        }
        return;
      }

      const cache = cacheRef.current;
      // Group nodes by original English text
      const missing = new Set<string>();
      const pending: Array<[Tracked, string]> = [];
      for (const n of nodes) {
        const orig = getOriginal(n).trim();
        if (!orig) continue;
        pending.push([n, orig]);
        const cached = cache[orig];
        if (cached) {
          if (n.nodeValue !== padded(n, cached)) n.nodeValue = padded(n, cached);
        } else {
          missing.add(orig);
        }
      }

      if (missing.size === 0) return;

      setTranslating(true);
      try {
        // Batch in chunks to keep prompts bounded
        const list = Array.from(missing);
        const chunks: string[][] = [];
        for (let i = 0; i < list.length; i += 40) chunks.push(list.slice(i, i + 40));
        for (const chunk of chunks) {
          try {
            const res = await translateBatch({
              data: {
                targetLang: targetLang,
                targetLabel: langDefFor(targetLang).english,
                texts: chunk,
              },
            });
            const arr = res.translations;
            for (let i = 0; i < chunk.length; i++) {
              const src = chunk[i];
              const t = (arr?.[i] ?? "").trim();
              if (t) cache[src] = t;
            }
            saveCache(targetLang, cache);
            // Apply to any pending nodes now that we have results
            for (const [n, orig] of pending) {
              const t = cache[orig];
              if (t && n.nodeValue !== padded(n, t)) n.nodeValue = padded(n, t);
            }
          } catch (err) {
            console.warn("translateBatch failed", err);
          }
        }
      } finally {
        setTranslating(false);
      }
    },
    [],
  );

  // Preserve original leading/trailing whitespace so inline layouts don't break.
  function padded(n: Tracked, translated: string): string {
    const orig = n[ORIG_KEY] ?? "";
    const leading = orig.match(/^\s*/)?.[0] ?? "";
    const trailing = orig.match(/\s*$/)?.[0] ?? "";
    return `${leading}${translated}${trailing}`;
  }

  function langDefFor(code: LangCode): LangDef {
    return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
  }

  // Debounced full-page sweep
  const scheduleSweep = useCallback(
    (targetLang: LangCode) => {
      if (scheduledRef.current !== null) {
        window.clearTimeout(scheduledRef.current);
      }
      scheduledRef.current = window.setTimeout(() => {
        scheduledRef.current = null;
        const nodes = collectTextNodes(document.body) as Tracked[];
        void applyTranslations(targetLang, nodes);
      }, 120);
    },
    [applyTranslations],
  );

  // React to lang changes: update html attrs, load cache, sweep.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const def = langDefFor(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = def.rtl ? "rtl" : "ltr";
    cacheRef.current = loadCache(lang);
    scheduleSweep(lang);
  }, [lang, scheduleSweep]);

  // Observe DOM mutations to translate new content.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const observer = new MutationObserver((mutations) => {
      if (lang === "en") {
        // Nothing to do for added nodes; but we may need to restore any mutated originals
        return;
      }
      let hasNew = false;
      for (const m of mutations) {
        if (m.type === "characterData") {
          hasNew = true;
        } else if (m.type === "childList" && m.addedNodes.length) {
          hasNew = true;
        }
      }
      if (hasNew) scheduleSweep(lang);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [lang, scheduleSweep]);

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, l);
      } catch {
        // ignore
      }
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, langDef, translating }),
    [lang, setLang, langDef, translating],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
