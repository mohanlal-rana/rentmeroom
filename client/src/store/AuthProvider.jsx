import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.jsx";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(false);
  const [isLogedIn, setIsLogedIn] = useState(false);

  const API = import.meta.env.VITE_API;
  const authorizationToken = token ? `Bearer ${token}` : "";

  // Store Token
  const storeTokenInLS = (serverToken) => {
    localStorage.setItem("token", serverToken);
    setToken(serverToken);
  };

  // Logout
  const LogoutUser = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsLogedIn(false);
  };

  const userAuthentication = async () => {
    if (!token) {
      setUser(null);
      setIsLogedIn(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: authorizationToken,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setIsLogedIn(true);
      } else {
        // expired or invalid token
        alert("token authentication failed. Please login again.");

        LogoutUser();
      }
    } catch (err) {
      console.log("Auth Error:", err);
      LogoutUser();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    userAuthentication();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLogedIn,
        isLoading,
        storeTokenInLS,
        LogoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};