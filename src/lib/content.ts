import heroQigong from "@/assets/hero-qigong.jpg";
import emptyMeditate from "@/assets/empty-meditate.jpg";
import shopOil from "@/assets/shop-oil.jpg";
import shopGuasha from "@/assets/shop-guasha.jpg";
import shopBianstone from "@/assets/shop-bianstone.jpg";
import yintangPress from "@/assets/yintang-press.gif.asset.json";
import oilApplyGif from "@/assets/oil-apply.gif.asset.json";
import yintangGif from "@/assets/yintang.gif.asset.json";
import kaitianmenGif from "@/assets/kaitianmen.gif.asset.json";
import yangbaiGif from "@/assets/yangbai.gif.asset.json";
void yintangPress;

export const images = {
  heroQigong,
  emptyMeditate,
  shopOil,
  shopGuasha,
  shopBianstone,
};

export type Category = "all" | "beginner" | "tuina" | "guasha" | "baduanjin" | "yijinjing";

export const categories: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "beginner", label: "For beginners" },
  { id: "tuina", label: "Tui Na" },
  { id: "guasha", label: "Gua Sha" },
  { id: "baduanjin", label: "Baduanjin" },
  { id: "yijinjing", label: "Yijinjing" },
];

export type Step = {
  name: string;
  detail: string;
  seconds: number;
  cue: string;
};

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<Category, "all">;
  level: "Beginner" | "Gentle" | "Focused";
  minutes: number;
  goal: string;
  bestFor: string;
  hot?: boolean;
  accent: "sage" | "gold" | "clay";
  steps: Step[];
  relatedProductId?: string;
  sessionImage?: string;
};

export const courses: Course[] = [
  {
    id: "evening-calm",
    title: "Evening Calm",
    subtitle: "Baduanjin · 8 forms",
    category: "baduanjin",
    level: "Gentle",
    minutes: 12,
    goal: "Wind down & sleep",
    bestFor: "Restless minds before bed",
    hot: true,
    accent: "sage",
    relatedProductId: "sleep-oil",
    sessionImage: yintangPress.url,
    steps: [
      { name: "Press Yintang point", detail: "Between the eyebrows", seconds: 60, cue: "Breathe slow, sink the shoulders." },
      { name: "Rub the Yongquan", detail: "Center of the sole", seconds: 90, cue: "Warm the feet, calm the mind." },
      { name: "Raise hands to sky", detail: "Regulate the triple burner", seconds: 80, cue: "Inhale up, exhale release." },
      { name: "Draw the bow left & right", detail: "Open the chest", seconds: 90, cue: "Keep the gaze soft and level." },
    ],
  },
  {
    id: "double-lift",
    title: "Two Hands Hold the Heavens",
    subtitle: "Baduanjin · Form 1",
    category: "baduanjin",
    level: "Beginner",
    minutes: 6,
    goal: "Loosen shoulders",
    bestFor: "Desk-bound stiffness",
    accent: "gold",
    relatedProductId: "meridian-oil",
    steps: [
      { name: "Root the stance", detail: "Feet shoulder-width", seconds: 40, cue: "Weight even through both feet." },
      { name: "Interlace & lift", detail: "Palms turn to the sky", seconds: 90, cue: "Lengthen the spine gently." },
      { name: "Hold & breathe", detail: "Gaze follows the hands", seconds: 60, cue: "Three calm breaths at the top." },
    ],
  },
  {
    id: "neck-release",
    title: "Neck & Shoulder Release",
    subtitle: "Tui Na · self-massage",
    category: "tuina",
    level: "Gentle",
    minutes: 9,
    goal: "Ease tech neck",
    bestFor: "Long hours at a screen",
    hot: true,
    accent: "clay",
    relatedProductId: "meridian-oil",
    steps: [
      { name: "Warm the palms", detail: "Rub until warm", seconds: 40, cue: "Build a little heat first." },
      { name: "Knead Fengchi", detail: "Base of the skull", seconds: 80, cue: "Small circles, gentle pressure." },
      { name: "Sweep the shoulders", detail: "Jianjing line", seconds: 90, cue: "Long, slow strokes outward." },
      { name: "Stretch side neck", detail: "Ear toward shoulder", seconds: 60, cue: "Never force — ease into it." },
    ],
  },
  {
    id: "guasha-face",
    title: "Facial Gua Sha Glow",
    subtitle: "Gua Sha · lymphatic",
    category: "guasha",
    level: "Gentle",
    minutes: 8,
    goal: "De-puff & lift",
    bestFor: "Morning freshness",
    accent: "sage",
    relatedProductId: "guasha-jade",
    steps: [
      { name: "Apply facial oil", detail: "A few drops, warm", seconds: 30, cue: "Enough glide, never dragging." },
      { name: "Jawline sweep", detail: "Chin to ear", seconds: 70, cue: "Light, upward strokes only." },
      { name: "Cheek lift", detail: "Nose to temple", seconds: 70, cue: "Follow the cheekbone up." },
      { name: "Neck drainage", detail: "Down toward collarbone", seconds: 60, cue: "Finish downward to drain." },
    ],
  },
  {
    id: "sinew-basics",
    title: "Yijinjing Foundations",
    subtitle: "Yijinjing · sinew change",
    category: "yijinjing",
    level: "Focused",
    minutes: 15,
    goal: "Build gentle strength",
    bestFor: "Grounding morning energy",
    accent: "gold",
    relatedProductId: "bian-stone",
    steps: [
      { name: "Wei Tuo presents pestle", detail: "Palms at chest", seconds: 90, cue: "Steady breath, calm gaze." },
      { name: "Pluck stars, turn stalk", detail: "Reach and rotate", seconds: 90, cue: "Move from the waist." },
      { name: "Nine ghosts draw sabre", detail: "Wrap and open", seconds: 90, cue: "Keep the neck long." },
      { name: "Close & settle Qi", detail: "Hands to lower belly", seconds: 60, cue: "Let the energy sink." },
    ],
  },
  {
    id: "wrist-reset",
    title: "Wrist & Hand Reset",
    subtitle: "Tui Na · self-massage",
    category: "tuina",
    level: "Beginner",
    minutes: 5,
    goal: "Relieve typing strain",
    bestFor: "Wrist fatigue",
    accent: "clay",
    relatedProductId: "meridian-oil",
    steps: [
      { name: "Press Neiguan", detail: "Three fingers above wrist", seconds: 60, cue: "Firm but comfortable." },
      { name: "Fan the fingers", detail: "Stretch each digit", seconds: 60, cue: "Slow and deliberate." },
      { name: "Circle the wrists", detail: "Both directions", seconds: 60, cue: "Loosen the joints." },
    ],
  },
];

export type Product = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  image: keyof typeof images;
  tags: string[];
  featured?: boolean;
};

export const products: Product[] = [
  {
    id: "sleep-oil",
    name: "Night Calm Blend",
    tagline: "Companion to Evening Calm · roll-on",
    price: 24,
    image: "shopOil",
    tags: ["Sleep", "Meridian"],
    featured: true,
  },
  {
    id: "meridian-oil",
    name: "Meridian Soothing Oil",
    tagline: "Warms shoulders, neck & wrists",
    price: 19,
    image: "shopOil",
    tags: ["Massage", "Warming"],
  },
  {
    id: "guasha-jade",
    name: "Jade Gua Sha Board",
    tagline: "Hand-finished, contoured for the face",
    price: 28,
    image: "shopGuasha",
    tags: ["Gua Sha", "Facial"],
  },
  {
    id: "bian-stone",
    name: "Bian Stone Tool",
    tagline: "Traditional stone for deep body work",
    price: 42,
    image: "shopBianstone",
    tags: ["Body", "Classic"],
  },
];

export type Badge = {
  id: string;
  name: string;
  hint: string;
  emoji: string;
  unlockedAtStreak: number;
};

export const badges: Badge[] = [
  { id: "first-step", name: "First Step", hint: "Complete your first session", emoji: "🌱", unlockedAtStreak: 0 },
  { id: "streak-3", name: "Three Days", hint: "Practice 3 days in a row", emoji: "🍃", unlockedAtStreak: 3 },
  { id: "streak-7", name: "Seven Days", hint: "A full week of care", emoji: "🌿", unlockedAtStreak: 7 },
  { id: "morning", name: "Early Bird", hint: "Practice before 9am", emoji: "🌅", unlockedAtStreak: 5 },
  { id: "night-owl", name: "Calm Night", hint: "Practice after 9pm", emoji: "🌙", unlockedAtStreak: 4 },
  { id: "streak-21", name: "New Habit", hint: "21 days of practice", emoji: "🏵️", unlockedAtStreak: 21 },
  { id: "explorer", name: "Explorer", hint: "Try all four practices", emoji: "🧭", unlockedAtStreak: 10 },
  { id: "streak-100", name: "Centenary", hint: "100 days of devotion", emoji: "🏆", unlockedAtStreak: 100 },
];

export type Tip = {
  id: string;
  title: string;
  excerpt: string;
  accent: "sage" | "gold" | "clay";
  minutes: number;
  body: string[];
};

export const tips: Tip[] = [
  {
    id: "phone-neck",
    title: "How to rescue your “text neck”",
    excerpt: "Looking down at 60° loads your neck like 27kg. Here's the fix.",
    accent: "gold",
    minutes: 3,
    body: [
      "When you tilt your head forward to look at a phone, the effective weight on your cervical spine can climb to roughly 27kg — like carrying a small child on your neck.",
      "Bring the screen up to eye level, keep your gaze level, and take a micro-break every 30 minutes.",
      "Pair this habit with the Neck & Shoulder Release session to unwind accumulated tension.",
    ],
  },
  {
    id: "sleep-posture",
    title: "Don't let sleep posture wreck your neck",
    excerpt: "Your pillow height matters more than you think.",
    accent: "sage",
    minutes: 4,
    body: [
      "Sleeping face-down twists the neck for hours. Favour side or back sleeping.",
      "Choose a pillow that keeps the neck aligned with the spine — not too high, not too flat.",
      "A short evening wind-down routine helps the shoulders release before rest.",
    ],
  },
  {
    id: "cautious-sports",
    title: "Neck troubles? Be careful with these 4 sports",
    excerpt: "Some movements add load exactly where you don't want it.",
    accent: "clay",
    minutes: 5,
    body: [
      "High-impact and sudden-rotation activities can aggravate a sensitive neck.",
      "Ease in gradually, warm up thoroughly, and stop if you feel sharp discomfort.",
      "Gentle guided practice like Baduanjin builds resilience without strain.",
    ],
  },
];

export function getCourse(id: string) {
  return courses.find((c) => c.id === id);
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}
