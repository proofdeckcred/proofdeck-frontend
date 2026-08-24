import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 
        ADMIN SIDEBAR 
        flex-shrink-0 prevents it from being squashed.
      */}
      <div className="flex-shrink-0 h-full hidden md:block">
        <AdminSidebar />
      </div>

      {/* 
        MAIN CONTENT AREA
        flex-1: Takes up all remaining space.
        min-w-0: Prevents flexbox overflow issues.
        flex-col: Stacks content vertically.
      */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 
            SCROLLABLE REGION
            overflow-y-auto: Only this part scrolls, keeping sidebar fixed.
          */}
        <main className="flex-1 overflow-y-auto focus:outline-none scroll-smooth relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 pb-24 md:pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
