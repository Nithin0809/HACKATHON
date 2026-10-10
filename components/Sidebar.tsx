'use client';

import React from 'react';
import {
  Clapperboard,
  LayoutDashboard,
  History,
  Captions,
  Film,
  Instagram,
  WandSparkles,
  Sparkles,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: 'studio' | 'history';
  setCurrentView: (view: 'studio' | 'history') => void;
  historyCount: number;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  setActiveTab: (tab: 'storyboard' | 'script' | 'captions') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  historyCount,
  mobileOpen,
  setMobileOpen,
  setActiveTab
}) => {
  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><Clapperboard size={22}/></div>
        <div>
          <div className="brand-name">reelforge<span>ai</span></div>
          <div className="brand-sub">VIDEO WORKFLOW STUDIO</div>
        </div>
        <button
          className="mobile-close icon-btn"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation sidebar"
        >
          <X size={18}/>
        </button>
      </div>

      <div className="workspace-label">WORKSPACE</div>
      <button
        type="button"
        className={`nav-item ${currentView === 'studio' ? 'selected' : ''}`}
        onClick={() => { setCurrentView('studio'); setMobileOpen(false); }}
      >
        <LayoutDashboard size={17}/> Studio <span className="nav-pill">NEXT.JS</span>
      </button>

      <button
        type="button"
        className={`nav-item ${currentView === 'history' ? 'selected' : ''}`}
        onClick={() => { setCurrentView('history'); setMobileOpen(false); }}
      >
        <History size={17}/> History
        {historyCount > 0 && <span className="nav-count">{historyCount}</span>}
      </button>

      <button
        type="button"
        className="nav-item"
        onClick={() => { setCurrentView('studio'); setActiveTab('script'); setMobileOpen(false); }}
      >
        <Captions size={17}/> Script & hooks
      </button>

      <button
        type="button"
        className="nav-item"
        onClick={() => { setCurrentView('studio'); setActiveTab('storyboard'); setMobileOpen(false); }}
      >
        <Film size={17}/> Shot storyboard
      </button>

      <button
        type="button"
        className="nav-item"
        onClick={() => { setCurrentView('studio'); setActiveTab('captions'); setMobileOpen(false); }}
      >
        <Instagram size={17}/> Captions & tags
      </button>

      <div className="sidebar-bottom">
        <div className="upgrade-card">
          <div className="upgrade-icon"><WandSparkles size={18}/></div>
          <div className="upgrade-title">From idea to impact.</div>
          <p>One brief. A complete video production kit.</p>
          <div className="mini-progress"><span/></div>
          <div className="upgrade-foot"><span>YOUR CREATIVE COPILOT</span><Sparkles size={14}/></div>
        </div>

        <div className="user-row">
          <div className="avatar">RF</div>
          <div className="user-info">
            <b>Creator workspace</b>
            <span>Vercel App Router</span>
          </div>
          <span className="status-dot"/>
        </div>
      </div>
    </aside>
  );
};
