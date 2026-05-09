import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { me } from "@/pages/login/model/authApi";
import type { AuthUser } from "@/shared/auth/types";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await me();
      setUser({
        ...response.user,
        role: response.user.role ?? "admin",
      }); // Для теста ролей, потом убрать
      //setUser(response.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    };

    void loadUser();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      refreshUser,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
