'use client';

import React from 'react';
import { HistoryItem } from '@/types/reelforge';
import {
  Trash2,
  Search,
  X,
  Smartphone,
  ChevronRight,
  ArrowUpDown,
  History as HistoryIcon,
  Sparkles,
  Clock3,
  Youtube,
  Instagram,
  Calendar,
  FolderOpen,
  Check,
  Copy,
  Download
} from 'lucide-react';

interface HistoryViewProps {
  history: HistoryItem[];
  historySearch: string;
  setHistorySearch: (q: string) => void;
  historyPlatform: string;
  setHistoryPlatform: (p: string) => void;
  historySort: 'newest' | 'oldest';
  setHistorySort: (s: 'newest' | 'oldest') => void;
  copied: string;
  handleOpenProject: (item: HistoryItem) => void;
  handleDeleteItem: (id: string) => void;
  handleClearAllHistory: () => void;
  handleDownloadItem: (item: HistoryItem) => void;
  handleCopyItem: (item: HistoryItem) => void;
  setCurrentView: (view: 'studio' | 'history') => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  historySearch,
  setHistorySearch,
  historyPlatform,
  setHistoryPlatform,
  historySort,
  setHistorySort,
  copied,
  handleOpenProject,
  handleDeleteItem,
  handleClearAllHistory,
  handleDownloadItem,
  handleCopyItem,
  setCurrentView
}) => {
  const filteredHistory = history
    .filter(item => {
      if (historyPlatform !== 'All' && item.form?.platform !== historyPlatform) {
        return false;
      }
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const title = (item.result?.title || '').toLowerCase();
        const topic = (item.form?.topic || '').toLowerCase();
        const niche = (item.form?.niche || '').toLowerCase();
        const direction = (item.result?.creative_direction || '').toLowerCase();
        return title.includes(q) || topic.includes(q) || niche.includes(q) || direction.includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return historySort === 'oldest' ? timeA - timeB : timeB - timeA;
    });

  return (
    <section className="history-view">
      <div className="history-header">
        <div>
          <div className="eyebrow"><span className="eyebrow-line"/> YOUR CREATIVE REPOSITORY</div>
          <h1>Your creative history</h1>
          <p>Pick up where your next great reel began. View, restore, export, and manage your generated production kits.</p>
        </div>
        <div className="history-header-actions">
          <span className="history-count-badge">
            <b>{history.length}</b> {history.length === 1 ? 'kit saved' : 'kits saved'}
          </span>
          {history.length > 0 && (
            <button className="clear-all-btn" onClick={handleClearAllHistory} title="Clear all saved history">
              <Trash2 size={15}/> Clear all
            </button>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="history-toolbar">
          <div className="history-search-wrap">
            <Search size={16} className="search-icon"/>
            <input
              type="text"
              className="history-search-input"
              placeholder="Search by title, topic, or niche…"
              value={historySearch}
              onChange={e => setHistorySearch(e.target.value)}
            />
            {historySearch && (
              <button className="search-clear-btn" onClick={() => setHistorySearch('')}>
                <X size={14}/>
              </button>
            )}
          </div>

          <div className="history-filters">
            <div className="history-select-wrap">
              <Smartphone size={15}/>
              <select value={historyPlatform} onChange={e => setHistoryPlatform(e.target.value)}>
                <option value="All">All platforms</option>
                <option value="Instagram Reels">Instagram Reels</option>
                <option value="YouTube Shorts">YouTube Shorts</option>
                <option value="TikTok">TikTok</option>
                <option value="LinkedIn Video">LinkedIn Video</option>
              </select>
              <ChevronRight size={14}/>
            </div>

            <div className="history-select-wrap">
              <ArrowUpDown size={15}/>
              <select
                value={historySort}
                onChange={e => setHistorySort(e.target.value as 'newest' | 'oldest')}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <ChevronRight size={14}/>
            </div>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="panel history-empty-panel">
          <div className="empty-visual">
            <div className="empty-ring ring-a"/>
            <div className="empty-ring ring-b"/>
            <div className="empty-icon"><HistoryIcon size={38}/></div>
            <div className="empty-spark spark-a"><Sparkles size={16}/></div>
            <div className="empty-spark spark-b"><Clock3 size={16}/></div>
          </div>
          <h3>No saved production kits yet</h3>
          <p>Every time you generate a video in the Studio, your complete kit (hooks, script, storyboard, and captions) will automatically be saved here.</p>
          <button className="generate-btn" onClick={() => setCurrentView('studio')}>
            <Sparkles size={17}/> Go to Studio <ChevronRight size={16}/>
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="panel history-no-match-panel">
          <Search size={34} className="no-match-icon"/>
          <h3>No projects match your filter</h3>
          <p>Try adjusting your search query or platform filter to see your saved kits.</p>
          <button className="export-btn" onClick={() => { setHistorySearch(''); setHistoryPlatform('All'); }}>
            Reset filters
          </button>
        </div>
      ) : (
        <div className="history-grid">
          {filteredHistory.map(item => (
            <article className="history-card" key={item.id}>
              <div className="history-card-header">
                <div className="history-card-tags">
                  <span className="history-tag platform-tag">
                    {item.form?.platform === 'YouTube Shorts' ? <Youtube size={12}/> : <Instagram size={12}/>}
                    {item.form?.platform || 'Shorts'}
                  </span>
                  <span className="history-tag duration-tag">
                    <Clock3 size={12}/> {item.form?.duration || 30}s
                  </span>
                  <span className="history-tag date-tag">
                    <Calendar size={12}/> {item.formattedDate}
                  </span>
                </div>
                <button
                  className="delete-item-btn"
                  onClick={() => handleDeleteItem(item.id)}
                  title="Delete this project from history"
                >
                  <Trash2 size={15}/>
                </button>
              </div>

              <div className="history-card-body">
                <h4>{item.result?.title || item.form?.topic}</h4>
                <p className="history-card-prompt"><b>Idea:</b> {item.form?.topic}</p>
                {item.result?.creative_direction && (
                  <p className="history-card-desc">{item.result.creative_direction}</p>
                )}
              </div>

              <div className="history-card-stats">
                <span><b>{(item.result?.hooks || []).length}</b> hooks</span>
                <span>•</span>
                <span><b>{(item.result?.shots || []).length}</b> shots</span>
                <span>•</span>
                <span><b>{item.form?.tone || 'Conversational'}</b></span>
              </div>

              <div className="history-card-footer">
                <button
                  className="history-open-btn"
                  onClick={() => handleOpenProject(item)}
                  title="Restore and edit in Studio"
                >
                  <FolderOpen size={15}/> Open in Studio
                </button>
                <div className="history-card-subactions">
                  <button
                    className="icon-action-btn"
                    onClick={() => handleCopyItem(item)}
                    title="Copy complete kit as text"
                  >
                    {copied === 'history_' + item.id ? <Check size={15}/> : <Copy size={15}/>}
                  </button>
                  <button
                    className="icon-action-btn"
                    onClick={() => handleDownloadItem(item)}
                    title="Export kit as JSON"
                  >
                    <Download size={15}/>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
