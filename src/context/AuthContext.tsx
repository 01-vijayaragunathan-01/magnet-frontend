import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// Removed unused import: import axios from "axios";

type User = {
  _id: string;
  username?: string;
  email: string;
  token: string;
};

type AuthContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  // getToken now pulls directly from state, which is the safest method.
  getToken: () => string | null; 
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State holds the full user object including the token
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        
        // CRITICAL FIX: Only set the user if the token exists and is non-empty
        if (parsedUser._id && parsedUser.token) {
             setUser(parsedUser);
        } else {
             // If data is corrupt, clear local storage
             localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = (userData: any) => {
    // CRITICAL FIX: Ensure both ID and token exist before logging in
    if (!userData.token || !(userData._id || userData.id)) {
        console.error("Login failed: Missing token or user ID in payload.");
        // We should not proceed if the essential data is missing
        return;
    }

    const normalizedUser: User = {
      _id: userData._id || userData.id,
      username: userData.username,
      email: userData.email,
      token: userData.token, 
    };

    setUser(normalizedUser);
    // Store the complete, verified user object
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Gold Standard: Get token directly from the user state
  const getToken = () => {
    // If user exists, return their token, otherwise null.
    return user ? user.token : null;
  };

  const value = { user, login, logout, getToken };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
