import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
   employeeId: string;
   email: string;
   name: string;
   role: 'Employee' | 'Manager' | 'Admin';
   department?: string | null;
   managerId: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
  const initAuth = async () => {
    try {
            const res = await fetch("http://localhost:5000/auth/get", {
        method: "GET",
        credentials: "include", // send session cookie
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
         setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        // Session/JWT invalid → clear everything
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error("Auth init error:", err);
    }
  };

  initAuth();
}, []);


  const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // 👈 needed for session cookie
    }); 
    
    if (!res.ok) return false;

    const data = await res.json();
 
    // Save user in state & localStorage
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Save JWT separately
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return true;
  } catch (err) {
    console.error("Login error:", err);
    return false;
  }
};


  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};