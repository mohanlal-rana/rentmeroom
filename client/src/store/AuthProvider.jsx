import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.jsx";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const API = import.meta.env.VITE_API;

  const userAuthentication = async () => {
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: "GET",
        credentials: "include", 
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };
  const logoutUser = async () => {
    await fetch(`${API}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    userAuthentication();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};