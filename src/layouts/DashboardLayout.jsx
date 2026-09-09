import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import useWindowSize from "../hooks/useWindowSize";
import { UserProvider } from "../context/UserContext";
import MobileWarning from "../components/MobileWarning";
import DashboardTopbar from "../components/DashboardTopbar";
import BackgroundJobIndicator from "../components/BackgroundJobIndicator";

function DashboardLayout() {
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const location = useLocation();
  const isEditorPage = location.pathname.includes("/upload-template");

  // Persistent sidebar collapse state (Bachs style)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved !== null ? JSON.parse(saved) : false;
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", JSON.stringify(next));
      return next;
    });
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((prev) => !prev);
  };

  // Close mobile sidebar whenever the route changes
  React.useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Lock body overflow in dashboard so hover tooltips/portals never flash a second scrollbar or shake
  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[var(--background-white)] transition-colors duration-300 overflow-hidden w-full max-w-full">
      <MobileWarning />
      {/*  
        DESKTOP SIDEBAR 
        flex-shrink-0 prevents it from being squashed.
      */}
      {!isMobile && (
        <div className="flex-shrink-0 h-full">
          <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        </div>
      )}

      {/* 
        MOBILE SIDEBAR OVERLAY / DRAWER 
      */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-white z-50 shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 
        MAIN CONTENT AREA
        flex-1: Takes up all remaining space.
        min-w-0: Prevents flexbox overflow issues.
        flex-col: Stacks content vertically.
      */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 dark:bg-[var(--background-white)]">
        {!isEditorPage && (
          <DashboardTopbar 
            isCollapsed={isCollapsed} 
            toggleSidebar={toggleSidebar} 
            toggleMobileSidebar={toggleMobileSidebar}
          />
        )}
        {/* 
          SCROLLABLE REGION
          overflow-y-auto overflow-x-hidden: Prevents horizontal shake/scrollbar.
          relative: For positioning modals/toasts relative to view.
        */}
        <main className={`flex-1 focus:outline-none scroll-smooth relative overflow-x-hidden ${isEditorPage ? "overflow-hidden" : "overflow-y-auto"}`}>
          {isEditorPage ? (
            <Outlet />
          ) : (
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-6 pb-28 sm:pb-24 md:pb-8 w-full overflow-x-hidden">
              <Outlet />
            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      {isMobile && <BottomNav onOpenMenu={() => setMobileSidebarOpen(true)} />}

      {/* GLOBAL BACKGROUND TASK INDICATOR */}
      <BackgroundJobIndicator />
    </div>
  );

}

export default DashboardLayout;
