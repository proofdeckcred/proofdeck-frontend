import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { getCurrentUser, getDesktopBootstrap } from "../api";
import { IS_DESKTOP_APP } from "../config";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(() => localStorage.getItem("workspaceContext") || "personal");
  const [isDesktopMode, setIsDesktopMode] = useState(IS_DESKTOP_APP);
  const [desktopConfig, setDesktopConfig] = useState(null);
  const [desktopStorage, setDesktopStorage] = useState(null);

  const fetchUser = useCallback(async () => {
      const wantDesktop =
        IS_DESKTOP_APP ||
        window.location.search.includes("desktop=1") ||
        localStorage.getItem("pd_desktop_mode") === "1";

      if (wantDesktop) {
        try {
          localStorage.setItem("pd_desktop_mode", "1");
          setIsDesktopMode(true);
          const bootRes = await getDesktopBootstrap();
          if (bootRes?.data?.token) {
            localStorage.setItem("token", bootRes.data.token);
          }
          const wsId =
            bootRes?.data?.active_workspace_id ||
            (bootRes?.data?.user?.company?.id ? String(bootRes.data.user.company.id) : "personal");
          localStorage.setItem("workspaceContext", wsId);
          setWorkspace(wsId);

          if (bootRes?.data?.user) {
            setUser(bootRes.data.user);
          }
          if (bootRes?.data?.config) {
            setDesktopConfig(bootRes.data.config);
          }
          if (bootRes?.data?.storage) {
            setDesktopStorage(bootRes.data.storage);
          }
          setLoading(false);
          return;
        } catch (err) {
          console.warn("Desktop bootstrap fallback to standard user fetch:", err);
        }
      }

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await getCurrentUser();
          const newUser = res.data;
          setUser((prevUser) => {
            const activeWS = localStorage.getItem("workspaceContext") || "personal";
            if (activeWS === "personal" && newUser.role?.toLowerCase() === "enterprise" && newUser.company?.id) {
              const entWsId = String(newUser.company.id);
              localStorage.setItem("workspaceContext", entWsId);
              setWorkspace(entWsId);
            } else if (activeWS !== "personal" && newUser.workspaces) {
              const isStillMember = newUser.workspaces.some(ws => String(ws.id) === String(activeWS));
              if (!isStillMember) {
                alert("Your access to this organization has been revoked.");
                localStorage.setItem("workspaceContext", "personal");
                window.location.reload();
                return null;
              }
            }
            return newUser;
          });
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

  const switchWorkspace = useCallback((newWorkspace) => {
    localStorage.setItem("workspaceContext", newWorkspace);
    setWorkspace(newWorkspace);
    window.location.reload();
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Wrapper to allow manual refresh and set loading state if needed
  const refreshUser = async () => {
      await fetchUser();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        workspace,
        switchWorkspace,
        isDesktopMode,
        desktopConfig,
        setDesktopConfig,
        desktopStorage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
