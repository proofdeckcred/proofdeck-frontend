import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";

function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden w-full max-w-full font-sans antialiased text-slate-800">
      {/* 
        DESKTOP ADMIN SIDEBAR 
        flex-shrink-0 prevents it from being squashed.
      */}
      <div className="flex-shrink-0 h-full hidden md:block">
        <AdminSidebar />
      </div>

      {/* 
        MOBILE SIDEBAR OVERLAY / DRAWER 
      */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50">
            <AdminSidebar onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 
        MAIN CONTENT AREA
        flex-1: Takes up all remaining space.
        min-w-0: Prevents flexbox overflow issues.
        flex-col: Stacks content vertically.
      */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        {/* Dedicated Admin Topbar */}
        <AdminTopbar toggleMobileSidebar={toggleMobileSidebar} />

        {/* 
          SCROLLABLE REGION
          overflow-y-auto: Only this part scrolls, keeping sidebar fixed.
        */}
        <main className="flex-1 overflow-y-auto focus:outline-none scroll-smooth relative">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-6 pb-24 md:pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
