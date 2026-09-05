import React from "react";
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[var(--background-white)] transition-colors duration-300 overflow-hidden">
      <MobileWarning />
      {/*  
        DESKTOP SIDEBAR 
        flex-shrink-0 prevents it from being squashed.
        The width is defined inside the Sidebar component itself (w-64).
      */}
      {!isMobile && (
        <div className="flex-shrink-0 h-full">
          <Sidebar />
        </div>
      )}

      {/* 
        MAIN CONTENT AREA
        flex-1: Takes up all remaining space.
        min-w-0: Prevents flexbox overflow issues.
        flex-col: Stacks content vertically.
      */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 dark:bg-[var(--background-white)]">
        {!isEditorPage && <DashboardTopbar />}
        {/* 
          SCROLLABLE REGION
          overflow-y-auto: Only this part scrolls, keeping sidebar fixed.
          relative: For positioning modals/toasts relative to view.
        */}
        <main className={`flex-1 focus:outline-none scroll-smooth relative ${isEditorPage ? "overflow-hidden" : "overflow-y-auto"}`}>
          {isEditorPage ? (
            <Outlet />
          ) : (
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-6 pb-20 md:pb-6">
              <Outlet />
            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      {isMobile && <BottomNav />}

      {/* GLOBAL BACKGROUND TASK INDICATOR */}
      <BackgroundJobIndicator />
    </div>
  );

}

export default DashboardLayout;
