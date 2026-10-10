'use client';

import React from 'react';
import { Menu, ChevronRight, Sun, Moon, CircleHelp } from 'lucide-react';

interface TopbarProps {
  currentView: 'studio' | 'history';
  theme: string;
  toggleTheme: () => void;
  mode: 'ai' | 'demo';
  setMobileOpen: (open: boolean) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentView,
  theme,
  toggleTheme,
  mode,
  setMobileOpen
}) => {
  return (
    <header className="topbar">
      <div className="top-left">
        <button
          type="button"
          className="icon-btn menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20}/>
        </button>
        <span className="breadcrumb-muted">ReelForge</span>
        <ChevronRight size={14}/>
        <b>{currentView === 'studio' ? 'Video Planner' : 'My Saved Plans'}</b>
      </div>

      <div className="top-right">
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} className="theme-icon" />
              <span className="theme-toggle-text">Light</span>
            </>
          ) : (
            <>
              <Moon size={15} className="theme-icon" />
              <span className="theme-toggle-text">Dark</span>
            </>
          )}
        </button>

        <span className={`mode-indicator ${mode}`}>
          <span/> {mode === 'ai' ? 'AI Ready' : 'Demo Mode'}
        </span>

        <button
          type="button"
          className="help-btn"
          title="Type your idea and click Create My Video Plan"
        >
          <CircleHelp size={17}/>
          <span>Help</span>
        </button>

        <div className="top-avatar">N</div>
      </div>
    </header>
  );
};
