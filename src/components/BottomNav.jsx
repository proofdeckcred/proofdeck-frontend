import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Folder,
  Plus,
  LayoutTemplate,
  Menu,
  FilePlus,
  Users,
} from "lucide-react";
import "../styles/BottomNav.css";

function BottomNav({ onOpenMenu }) {
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
          <LayoutGrid size={20} />
          <span className="mt-1">Overview</span>
        </NavLink>
        <NavLink to="/dashboard/groups" className="bottom-nav-link">
          <Folder size={20} />
          <span className="mt-1">Batches</span>
        </NavLink>

        {/* Center Create Action Button */}
        <div className="bottom-nav-create-wrapper">
          <button 
            type="button" 
            className="bottom-nav-create-btn" 
            onClick={toggleCreateOptions}
            aria-label="Create Document"
          >
            <Plus size={24} />
          </button>
        </div>

        <NavLink to="/dashboard/templates" className="bottom-nav-link">
          <LayoutTemplate size={20} />
          <span className="mt-1">Templates</span>
        </NavLink>
        <button 
          type="button" 
          onClick={() => {
            setShowCreateOptions(false);
            if (onOpenMenu) onOpenMenu();
          }} 
          className="bottom-nav-btn"
          aria-label="Open Navigation Menu"
        >
          <Menu size={20} />
          <span className="mt-1">Menu</span>
        </button>
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
