import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { getCurrentUser } from "../api";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
      // Don't set loading to true here to avoid flickering on silent refresh
      // setLoading(true); 
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await getCurrentUser();
          setUser(res.data);
        } catch (error) {
          console.error("Failed to fetch user", error);
          if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            setUser(null);
          }
        }
      } else {
          setUser(null);
      }
      setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Wrapper to allow manual refresh and set loading state if needed
  const refreshUser = async () => {
      await fetchUser();
  };

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
