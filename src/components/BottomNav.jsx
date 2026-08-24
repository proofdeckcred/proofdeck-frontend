import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Folder,
  Plus,
  LayoutTemplate,
  Settings,
  FilePlus,
  Users,
} from "lucide-react";
import "../styles/BottomNav.css";

function BottomNav() {
  const [showCreateOptions, setShowCreateOptions] = useState(false);

  const toggleCreateOptions = () => {
    setShowCreateOptions(!showCreateOptions);
  };

  // Close modal when navigating
  const handleNavClick = () => {
    setShowCreateOptions(false);
  };

  return (
    <>
      <nav className="bottom-nav">
        <NavLink to="/dashboard" className="bottom-nav-link" end>
          <LayoutGrid size={24} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/dashboard/groups" className="bottom-nav-link">
          <Folder size={24} />
          <span>Groups</span>
        </NavLink>

        {/* This is now a button to toggle the modal */}
        <div className="bottom-nav-create-btn" onClick={toggleCreateOptions}>
          <Plus size={32} />
        </div>

        <NavLink to="/dashboard/templates" className="bottom-nav-link">
          <LayoutTemplate size={24} />
          <span>Templates</span>
        </NavLink>
        <NavLink to="/dashboard/settings" className="bottom-nav-link">
          <Settings size={24} />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Create Options Modal */}
      {showCreateOptions && (
        <>
          <div
            className="create-options-overlay"
            onClick={toggleCreateOptions}
          ></div>
          <div className="create-options-modal">
            <NavLink
              to="/dashboard/bulk-create"
              className="create-option-link"
              onClick={handleNavClick}
            >
              <Users size={22} className="create-option-icon" />
              <div className="create-option-text">
                <strong>Bulk Create</strong>
                <small>Upload a CSV file</small>
              </div>
            </NavLink>
            <NavLink
              to="/dashboard/create"
              className="create-option-link"
              onClick={handleNavClick}
            >
              <FilePlus size={22} className="create-option-icon" />
              <div className="create-option-text">
                <strong>Single Create</strong>
                <small>Generate one certificate</small>
              </div>
            </NavLink>
          </div>
        </>
      )}
    </>
  );
}

export default BottomNav;
