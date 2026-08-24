import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import useWindowSize from "../hooks/useWindowSize";
import { UserProvider } from "../context/UserContext";
import MobileWarning from "../components/MobileWarning";

function DashboardLayout() {
  const { width } = useWindowSize();
  const isMobile = width <= 768;

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
        {/* 
          SCROLLABLE REGION
          overflow-y-auto: Only this part scrolls, keeping sidebar fixed.
          relative: For positioning modals/toasts relative to view.
        */}
        <main className="flex-1 overflow-y-auto focus:outline-none scroll-smooth relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 pb-24 md:pb-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      {isMobile && <BottomNav />}
    </div>
  );

}

export default DashboardLayout;
