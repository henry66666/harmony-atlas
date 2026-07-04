import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type User = {
  name: string;
  email: string;
};

type Store = {
  user: User | null;
  streak: number;
  totalMinutes: number;
  totalSessions: number;
  completedCourseIds: string[];
  isPro: boolean;
};

const STORAGE_KEY = "qiwell.store.v1";

const defaultStore: Store = {
  user: null,
  streak: 0,
  totalMinutes: 0,
  totalSessions: 0,
  completedCourseIds: [],
  isPro: false,
};

type AuthContextValue = Store & {
  isReady: boolean;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (user: User) => void;
  logout: () => void;
  setPro: (value: boolean) => void;
  recordSession: (courseId: string, minutes: number) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStore(): Store {
  if (typeof window === "undefined") return defaultStore;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStore;
    return { ...defaultStore, ...JSON.parse(raw) };
  } catch {
    return defaultStore;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(defaultStore);
  const [isReady, setIsReady] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    setStore(loadStore());
    setIsReady(true);
  }, []);

  const persist = useCallback((next: Store) => {
    setStore(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...store,
      isReady,
      loginOpen,
      openLogin: () => setLoginOpen(true),
      closeLogin: () => setLoginOpen(false),
      login: (user) => {
        persist({
          ...store,
          user,
          streak: store.streak || 1,
        });
        setLoginOpen(false);
      },
      logout: () => persist({ ...defaultStore }),
      setPro: (isPro) => persist({ ...store, isPro }),
      recordSession: (courseId, minutes) => {
        const completedCourseIds = store.completedCourseIds.includes(courseId)
          ? store.completedCourseIds
          : [...store.completedCourseIds, courseId];
        persist({
          ...store,
          streak: store.streak + 1,
          totalMinutes: store.totalMinutes + minutes,
          totalSessions: store.totalSessions + 1,
          completedCourseIds,
        });
      },
    }),
    [store, isReady, loginOpen, persist],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
