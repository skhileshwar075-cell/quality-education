import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe } from "@workspace/api-client-react";
import type { UserResponse } from "@workspace/api-client-react";

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("edubridge_token"));
  const [user, setUser] = useState<UserResponse | null>(null);
  
  // We use enabled: !!token so it only fetches if we have a token
  const { data: meData, isLoading: isMeLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (meData) {
      setUser(meData);
    }
    if (isError) {
      // Token might be invalid/expired
      logout();
    }
  }, [meData, isError]);

  const login = (newToken: string, newUser: UserResponse) => {
    localStorage.setItem("edubridge_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("edubridge_token");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const isLoading = token ? isMeLoading : false;

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
