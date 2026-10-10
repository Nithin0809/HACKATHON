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
        <span className="breadcrumb-muted">Workspace</span>
        <ChevronRight size={14}/>
        <b>{currentView === 'studio' ? 'Creative studio' : 'Generation history'}</b>
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
          <span/> {mode === 'ai' ? 'AI engine connected' : 'Demo engine'}
        </span>

        <button
          type="button"
          className="help-btn"
          title="Enter a topic and generate a production kit"
        >
          <CircleHelp size={17}/>
          <span>Help</span>
        </button>

        <div className="top-avatar">N</div>
      </div>
    </header>
  );
};
