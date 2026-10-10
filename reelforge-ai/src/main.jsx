import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Sparkles,
  Clapperboard,
  Zap,
  Captions,
  Download,
  Copy,
  Check,
  Film,
  WandSparkles,
  Play,
  ChevronRight,
  Clock3,
  Instagram,
  Youtube,
  Smartphone,
  AudioLines,
  Camera,
  LayoutDashboard,
  Menu,
  X,
  RefreshCw,
  CircleHelp,
  LoaderCircle,
  Sun,
  Moon,
  History,
  Trash2,
  Search,
  ArrowUpDown,
  Calendar,
  FolderOpen
} from 'lucide-react';
import './styles.css';

// ==========================================================================
// RESILIENT DATA NORMALIZATION & ERROR SAFETY
// ==========================================================================

const HISTORY_STORAGE_KEY = 'reelforge_history_v1';
const MAX_HISTORY_ITEMS = 100;

const ensureString = (val, fallback = '') => {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (!val) return fallback;
  if (typeof val === 'object') {
    return val.text || val.note || val.description || val.value || val.title || JSON.stringify(val);
  }
  return String(val);
};

const ensureArray = (val) => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  if (typeof val === 'string') {
    return val.split('\n').map(s => s.trim()).filter(Boolean);
  }
  if (typeof val === 'object') {
    return Object.values(val);
  }
  return [val];
};

const normalizeResult = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const title = ensureString(raw.title, 'Production Kit');
  const creative_direction = ensureString(raw.creative_direction, 'Creator video plan');

  const rawHooks = ensureArray(raw.hooks);
  const hooks = rawHooks.map((h, i) => {
    if (typeof h === 'string') return { text: h, angle: `Angle ${i + 1}` };
    return {
      text: ensureString(h?.text || h?.hook, `Hook angle ${i + 1}`),
      angle: ensureString(h?.angle, `Angle ${i + 1}`)
    };
  });

  const rawScript = ensureArray(raw.script);
  const script = rawScript.map((s, i) => {
    if (typeof s === 'string') return { time: `00:0${i * 5}`, voiceover: s, delivery: '' };
    return {
      time: ensureString(s?.time, `Scene ${i + 1}`),
      voiceover: ensureString(s?.voiceover || s?.text || s?.script, ''),
      delivery: ensureString(s?.delivery, '')
    };
  });

  const rawShots = ensureArray(raw.shots);
  const shots = rawShots.map((s, i) => {
    return {
      time: ensureString(s?.time, `${i * 5}s`),
      title: ensureString(s?.title, `Shot ${i + 1}`),
      voiceover: ensureString(s?.voiceover, ''),
      visual: ensureString(s?.visual || s?.scene || s?.video, 'Visual description'),
      camera: ensureString(s?.camera || s?.framing, 'Medium shot'),
      overlay: ensureString(s?.overlay || s?.onScreenText || s?.text, ''),
      edit: ensureString(s?.edit || s?.pacing, 'Cut on beat'),
      audio: ensureString(s?.audio || s?.sound || s?.sfx, 'Background audio')
    };
  });

  let captions = { short: '', engaging: '', hashtags: [] };
  if (typeof raw.captions === 'string') {
    captions.engaging = raw.captions;
    captions.short = raw.captions.slice(0, 100);
  } else if (raw.captions && typeof raw.captions === 'object') {
    captions.short = ensureString(raw.captions.short, '');
    captions.engaging = ensureString(raw.captions.engaging || raw.captions.long || raw.captions.caption, captions.short);

    if (Array.isArray(raw.captions.hashtags)) {
      captions.hashtags = raw.captions.hashtags.map(t => ensureString(t)).filter(Boolean);
    } else if (typeof raw.captions.hashtags === 'string') {
      captions.hashtags = raw.captions.hashtags.split(/\s+/).filter(Boolean);
    }
  }

  const rawNotes = ensureArray(raw.production_notes);
  const production_notes = rawNotes.map(n => ensureString(n)).filter(Boolean);

  return {
    ...raw,
    title,
    creative_direction,
    hooks,
    script,
    shots,
    captions,
    production_notes
  };
};

// ==========================================================================
// HISTORY PERSISTENCE HELPERS
// ==========================================================================

const loadHistoryFromStorage = () => {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && item.id && item.result);
  } catch (err) {
    console.error('Failed to load history from localStorage:', err);
    return [];
  }
};

const saveHistoryToStorage = (items) => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS)));
  } catch (err) {
    console.error('Failed to save history to localStorage:', err);
  }
};

const createHistoryItem = (formData, resultData) => {
  const now = new Date();
  return {
    id: 'rf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    createdAt: now.toISOString(),
    formattedDate: now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }),
    form: { ...formData },
    result: { ...resultData }
  };
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ReelForge UI error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '36px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '14px', margin: '20px' }}>
          <h3 style={{ fontSize: '18px', color: '#ef4444', margin: '0 0 8px' }}>Something went wrong rendering the results</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px' }}>{this.state.error?.message || 'Unexpected display error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #ef4444', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            Reset Workspace
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==========================================================================
// MAIN COMPONENT
// ==========================================================================

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('reelforge_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch (e) {}
  return 'dark';
};

const initialForm = {
  topic: 'Why beginner video editors struggle to get clients',
  platform: 'Instagram Reels',
  duration: '30',
  niche: 'Video editing & filmmaking',
  audience: 'Beginner creators',
  tone: 'Bold & conversational',
  language: 'English',
  goal: 'Educate'
};

function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [currentView, setCurrentView] = useState('studio'); // 'studio' | 'history'
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('demo');
  const [activeTab, setActiveTab] = useState('storyboard');
  const [selectedHook, setSelectedHook] = useState('');
  const [copied, setCopied] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // History state
  const [history, setHistory] = useState(loadHistoryFromStorage);
  const [historySearch, setHistorySearch] = useState('');
  const [historyPlatform, setHistoryPlatform] = useState('All');
  const [historySort, setHistorySort] = useState('newest');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('reelforge_theme', theme);
    } catch (e) {}
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#09090e' : '#f7f8fc');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setMode(d.mode))
      .catch(() => setMode('demo'));
  }, []);

  const update = (key, value) => setForm(p => ({ ...p, [key]: value }));

  const generate = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, selectedHook: selectedHook || undefined })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || 'Generation failed. Please try again.');

      const normalized = normalizeResult(data);
      if (!normalized) throw new Error('Received invalid data from generator.');

      setResult(normalized);
      setSelectedHook('');
      setActiveTab('storyboard');

      // Auto-save successful generation into history
      const newItem = createHistoryItem(form, normalized);
      setHistory(prev => {
        const updated = [newItem, ...prev.filter(x => x.id !== newItem.id)].slice(0, MAX_HISTORY_ITEMS);
        saveHistoryToStorage(updated);
        return updated;
      });
    } catch (err) {
      setError(err.message || 'Could not reach the API. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (label, value) => {
    const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      setError('Clipboard permission was blocked by your browser.');
    }
  };

  const exportResult = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reelforge-production-kit.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // History actions
  const handleOpenProject = (item) => {
    if (!item || !item.result) return;
    if (item.form) {
      setForm({ ...item.form });
    }
    setResult({ ...item.result });
    setSelectedHook('');
    setActiveTab('storyboard');
    setCurrentView('studio');
    setMobileOpen(false);
    // Note: restoring does NOT save a new history entry!
  };

  const handleDeleteItem = (id) => {
    if (!window.confirm('Delete this project from your history?')) return;
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveHistoryToStorage(updated);
      return updated;
    });
  };

  const handleClearAllHistory = () => {
    if (history.length === 0) return;
    if (!window.confirm(`Permanently clear all ${history.length} saved projects? This action cannot be undone.`)) return;
    setHistory([]);
    saveHistoryToStorage([]);
  };

  const handleDownloadItem = (item) => {
    if (!item || !item.result) return;
    const slug = (item.result.title || item.form?.topic || 'reelforge-project')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40);
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-kit.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyItem = async (item) => {
    if (!item || !item.result) return;
    const res = item.result;
    const summary = [
      res.title || item.form?.topic,
      `Platform: ${item.form?.platform} | Duration: ${item.form?.duration}s | Date: ${item.formattedDate}`,
      '',
      'CREATIVE DIRECTION:',
      res.creative_direction,
      '',
      'HOOKS:',
      ...(res.hooks || []).map((h, i) => `${i + 1}. ${h.text} (${h.angle})`),
      '',
      'SCRIPT:',
      ...(res.script || []).map(s => `${s.time} — ${s.voiceover}`),
      '',
      'SHOT BREAKDOWN:',
      ...(res.shots || []).map(s => `${s.time} | ${s.title}\nVoiceover: ${s.voiceover || ''}\nVisual: ${s.visual}\nCamera: ${s.camera}\nOn-screen text: ${s.overlay}\nEdit: ${s.edit}\nAudio: ${s.audio}`),
      '',
      'CAPTIONS:',
      res.captions?.engaging || res.captions?.short || '',
      (Array.isArray(res.captions?.hashtags) ? res.captions.hashtags.join(' ') : ''),
      '',
      'PRODUCTION NOTES:',
      ...(res.production_notes || [])
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopied('history_' + item.id);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      setError('Clipboard permission was blocked by your browser.');
    }
  };

  // Filtered and sorted history items
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

  const allText = result ? [
    result.title, '', 'CREATIVE DIRECTION', result.creative_direction, '', 'HOOKS',
    ...(result.hooks || []).map((h, i) => `${i + 1}. ${h.text} (${h.angle})`), '', 'SCRIPT',
    ...(result.script || []).map(s => `${s.time} — ${s.voiceover}`), '', 'SHOT BREAKDOWN',
    ...(result.shots || []).map(s => `${s.time} | ${s.title}\nVoiceover: ${s.voiceover || ''}\nVisual: ${s.visual}\nCamera: ${s.camera}\nOn-screen text: ${s.overlay}\nEdit: ${s.edit}\nAudio: ${s.audio}`),
    '', 'CAPTION', result.captions?.engaging || result.captions?.short || '',
    (Array.isArray(result.captions?.hashtags) ? result.captions.hashtags.join(' ') : ''),
    '', 'PRODUCTION NOTES',
    ...(result.production_notes || [])
  ].join('\n') : '';

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Clapperboard size={22}/></div>
          <div>
            <div className="brand-name">reelforge<span>ai</span></div>
            <div className="brand-sub">VIDEO WORKFLOW STUDIO</div>
          </div>
          <button className="mobile-close icon-btn" onClick={() => setMobileOpen(false)}><X size={18}/></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <button
          className={`nav-item ${currentView === 'studio' ? 'selected' : ''}`}
          onClick={() => { setCurrentView('studio'); setMobileOpen(false); }}
        >
          <LayoutDashboard size={17}/> Studio <span className="nav-pill">NEW</span>
        </button>
        <button
          className={`nav-item ${currentView === 'history' ? 'selected' : ''}`}
          onClick={() => { setCurrentView('history'); setMobileOpen(false); }}
        >
          <History size={17}/> History
          {history.length > 0 && <span className="nav-count">{history.length}</span>}
        </button>
        <button
          className="nav-item"
          onClick={() => { setCurrentView('studio'); setActiveTab('script'); setMobileOpen(false); }}
        >
          <Captions size={17}/> Script & hooks
        </button>
        <button
          className="nav-item"
          onClick={() => { setCurrentView('studio'); setActiveTab('storyboard'); setMobileOpen(false); }}
        >
          <Film size={17}/> Shot storyboard
        </button>
        <button
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
            <div className="user-info"><b>Creator workspace</b><span>Hackathon MVP</span></div>
            <span className="status-dot"/>
          </div>
        </div>
      </aside>

      {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}

      <main className="main">
        <header className="topbar">
          <div className="top-left">
            <button className="icon-btn menu-btn" onClick={() => setMobileOpen(true)}><Menu size={20}/></button>
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
            <span className={`mode-indicator ${mode}`}><span/> {mode === 'ai' ? 'AI engine connected' : 'Demo engine'}</span>
            <button className="help-btn" title="Enter a topic and generate a production kit"><CircleHelp size={17}/><span>Help</span></button>
            <div className="top-avatar">N</div>
          </div>
        </header>

        <div className="content">
          {currentView === 'history' ? (
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
                      <select value={historySort} onChange={e => setHistorySort(e.target.value)}>
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
                    <div className="empty-icon"><History size={38}/></div>
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
          ) : (
            /* Studio Workspace View */
            <>
              <section className="hero">
                <div className="hero-copy">
                  <div className="eyebrow"><span className="eyebrow-line"/> CREATOR WORKFLOW, REIMAGINED</div>
                  <h1>Ideas in.<br/><span>Reels that hit.</span></h1>
                  <p>Turn a rough idea into a complete short-form video plan — hooks, script, shot list, captions and edit notes, all in one place.</p>
                  <div className="hero-meta">
                    <div><Zap size={16}/> Built for speed</div>
                    <div><Clapperboard size={16}/> Production-ready</div>
                    <div><Sparkles size={16}/> AI-assisted</div>
                  </div>
                </div>
                <div className="hero-art">
                  <div className="orbit orbit-one"/>
                  <div className="orbit orbit-two"/>
                  <div className="hero-phone">
                    <div className="phone-top"><span/><span/><span/></div>
                    <div className="phone-scene">
                      <div className="scene-glow"/>
                      <div className="scene-person">
                        <div className="person-head"/>
                        <div className="person-body"/>
                      </div>
                      <div className="scene-caption">MAKE IT<br/><em>MATTER.</em></div>
                      <div className="scene-tag">00:03 / 00:30</div>
                    </div>
                    <div className="phone-timeline"><div/><div/><div/><div/><div/></div>
                  </div>
                  <div className="floating-chip chip-top">
                    <span className="chip-icon violet"><Zap size={17}/></span>
                    <div><b>Hook ready</b><small>3 angles generated</small></div>
                    <Check size={16} className="check-green"/>
                  </div>
                  <div className="floating-chip chip-bottom">
                    <span className="chip-icon orange"><Camera size={17}/></span>
                    <div><b>Shot list</b><small>Scene-by-scene plan</small></div>
                    <span className="tiny-bars"><i/><i/><i/><i/></span>
                  </div>
                </div>
              </section>

              <section className="workspace-grid">
                <div className="panel brief-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">01 / THE BRIEF</div>
                      <h2>What are we making?</h2>
                      <p>Give us the context. We'll handle the creative heavy lifting.</p>
                    </div>
                    <div className="heading-icon"><WandSparkles size={22}/></div>
                  </div>
                  <form onSubmit={generate}>
                    <label className="field-label" htmlFor="topic">Video idea <span className="required">*</span></label>
                    <textarea
                      id="topic"
                      rows="4"
                      value={form.topic}
                      onChange={e => update('topic', e.target.value)}
                      placeholder="e.g. Why most startups fail at marketing"
                      required
                    />
                    <div className="idea-chips">
                      <span>Try an idea:</span>
                      {['AI tools for students', '3 camera tricks for reels', 'Personal branding mistakes'].map(x => (
                        <button type="button" key={x} onClick={() => update('topic', x)}>{x}</button>
                      ))}
                    </div>
                    <div className="field-grid">
                      <div>
                        <label className="field-label">Platform</label>
                        <div className="select-wrap">
                          <select value={form.platform} onChange={e => update('platform', e.target.value)}>
                            <option>Instagram Reels</option>
                            <option>YouTube Shorts</option>
                            <option>TikTok</option>
                            <option>LinkedIn Video</option>
                          </select>
                          <ChevronRight size={17}/>
                        </div>
                      </div>
                      <div>
                        <label className="field-label">Duration</label>
                        <div className="select-wrap">
                          <select value={form.duration} onChange={e => update('duration', e.target.value)}>
                            <option value="15">15 seconds</option>
                            <option value="30">30 seconds</option>
                            <option value="45">45 seconds</option>
                            <option value="60">60 seconds</option>
                            <option value="90">90 seconds</option>
                          </select>
                          <ChevronRight size={17}/>
                        </div>
                      </div>
                      <div>
                        <label className="field-label">Niche</label>
                        <div className="select-wrap">
                          <select value={form.niche} onChange={e => update('niche', e.target.value)}>
                            <option>Video editing & filmmaking</option>
                            <option>Education</option>
                            <option>Technology & AI</option>
                            <option>Business & startups</option>
                            <option>Fitness & wellness</option>
                            <option>Food & lifestyle</option>
                            <option>Personal brand</option>
                            <option>Travel</option>
                          </select>
                          <ChevronRight size={17}/>
                        </div>
                      </div>
                      <div>
                        <label className="field-label">Target audience</label>
                        <div className="select-wrap">
                          <select value={form.audience} onChange={e => update('audience', e.target.value)}>
                            <option>Beginner creators</option>
                            <option>Students</option>
                            <option>Founders & professionals</option>
                            <option>Freelancers</option>
                            <option>General audience</option>
                            <option>Marketing teams</option>
                          </select>
                          <ChevronRight size={17}/>
                        </div>
                      </div>
                      <div>
                        <label className="field-label">Voice & tone</label>
                        <div className="select-wrap">
                          <select value={form.tone} onChange={e => update('tone', e.target.value)}>
                            <option>Bold & conversational</option>
                            <option>Educational & clear</option>
                            <option>Funny & energetic</option>
                            <option>Cinematic & emotional</option>
                            <option>Professional & authoritative</option>
                            <option>Storytelling</option>
                          </select>
                          <ChevronRight size={17}/>
                        </div>
                      </div>
                      <div>
                        <label className="field-label">Primary goal</label>
                        <div className="select-wrap">
                          <select value={form.goal} onChange={e => update('goal', e.target.value)}>
                            <option>Educate</option>
                            <option>Grow followers</option>
                            <option>Drive engagement</option>
                            <option>Generate leads</option>
                            <option>Sell a product</option>
                            <option>Tell a story</option>
                          </select>
                          <ChevronRight size={17}/>
                        </div>
                      </div>
                    </div>
                    <div className="field-bottom">
                      <div className="privacy-note"><span className="privacy-dot"/> Your brief stays in this session</div>
                      <button className="generate-btn" type="submit" disabled={loading || !form.topic.trim()}>
                        {loading ? (
                          <><LoaderCircle className="spin" size={19}/> Building your kit…</>
                        ) : (
                          <><Sparkles size={19}/> Generate production kit <ChevronRight size={18}/></>
                        )}
                      </button>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                  </form>
                </div>

                <div className="panel output-panel">
                  <div className="panel-heading output-heading">
                    <div>
                      <div className="section-kicker">02 / THE OUTPUT</div>
                      <h2>Your creative workspace</h2>
                      <p>Every detail, ready for the shoot and edit.</p>
                    </div>
                    <button className="export-btn" onClick={exportResult} disabled={!result}><Download size={16}/> Export</button>
                  </div>

                  {!result ? (
                    <div className="empty-state">
                      <div className="empty-visual">
                        <div className="empty-ring ring-a"/>
                        <div className="empty-ring ring-b"/>
                        <div className="empty-icon"><Clapperboard size={38}/></div>
                        <div className="empty-spark spark-a"><Sparkles size={16}/></div>
                        <div className="empty-spark spark-b"><Zap size={16}/></div>
                      </div>
                      <h3>Your next great reel starts here.</h3>
                      <p>Fill in your brief on the left or generate a sample kit to see instant hook angles, beat-by-beat storyboard, script, and captions.</p>
                      <div className="empty-features">
                        <span><Check size={14}/> 3 hook angles</span>
                        <span><Check size={14}/> Shot-by-shot plan</span>
                        <span><Check size={14}/> Ready-to-post copy</span>
                      </div>
                      <button className="try-demo" type="button" onClick={generate} disabled={loading}>
                        <Play size={15} fill="currentColor"/> Generate sample kit
                      </button>
                    </div>
                  ) : (
                    <div className="results">
                      <div className="result-title-row">
                        <div>
                          <span className="result-tag"><span/> PRODUCTION KIT READY</span>
                          <h3>{result.title}</h3>
                          <p>{result.creative_direction}</p>
                        </div>
                        <button className="copy-icon-btn" title="Copy complete kit" onClick={() => copyText('all', allText)}>
                          {copied === 'all' ? <Check size={18}/> : <Copy size={18}/>}
                        </button>
                      </div>

                      <div className="result-stats">
                        <span><Clock3 size={15}/>{form.duration}s target</span>
                        <span><Smartphone size={15}/>{form.platform}</span>
                        <span><AudioLines size={15}/>{(result.shots || []).length} shots</span>
                      </div>

                      <div className="tabs">
                        {[['storyboard', 'Storyboard'], ['script', 'Script & hooks'], ['captions', 'Captions']].map(([id, label]) => (
                          <button key={id} className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}>
                            {label}
                          </button>
                        ))}
                      </div>

                      {activeTab === 'storyboard' && (
                        <div className="shot-list">
                          {(result.shots || []).map((s, i) => (
                            <article className="shot-card" key={i}>
                              <div className="shot-rail">
                                <span className="shot-number">{String(i + 1).padStart(2, '0')}</span>
                                <span className="shot-line"/>
                              </div>
                              <div className="shot-content">
                                <div className="shot-top">
                                  <div>
                                    <span className="shot-time">{s.time}</span>
                                    <h4>{s.title}</h4>
                                  </div>
                                  <button className="tiny-copy" title="Copy shot JSON" onClick={() => copyText('shot' + i, JSON.stringify(s, null, 2))}>
                                    {copied === 'shot' + i ? <Check size={14}/> : <Copy size={14}/>}
                                  </button>
                                </div>
                                {s.voiceover && <div className="voiceover">“{s.voiceover}”</div>}
                                <div className="shot-detail">
                                  <span className="detail-label"><Camera size={13}/> VISUAL</span>
                                  <p>{s.visual}</p>
                                </div>
                                <div className="shot-detail">
                                  <span className="detail-label"><Smartphone size={13}/> CAMERA</span>
                                  <p>{s.camera}</p>
                                </div>
                                <div className="shot-bottom">
                                  <div>
                                    <small>ON-SCREEN TEXT</small>
                                    <b>{s.overlay || '—'}</b>
                                  </div>
                                  <div>
                                    <small>EDIT + AUDIO</small>
                                    <b>{s.edit || '—'}</b>
                                    <span>{s.audio || '—'}</span>
                                  </div>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}

                      {activeTab === 'script' && (
                        <div className="tab-content">
                          <div className="subhead">
                            <h4>Hook options</h4>
                            <button className="text-action" onClick={() => copyText('hooks', (result.hooks || []).map(h => h.text).join('\n'))}>
                              <Copy size={14}/> Copy hooks
                            </button>
                          </div>
                          {(result.hooks || []).map((h, i) => (
                            <button
                              type="button"
                              className={`hook-card hook-select-card ${selectedHook === h.text ? 'hook-selected' : ''}`}
                              key={i}
                              onClick={() => setSelectedHook(h.text)}
                            >
                              <span className="hook-index">0{i + 1}</span>
                              <div>
                                <span className="hook-angle">{h.angle}</span>
                                <p>{h.text}</p>
                              </div>
                              <span className="hook-select-indicator">
                                {selectedHook === h.text ? <Check size={16}/> : <span className="radio-empty"/>}
                              </span>
                              <span className="hook-copy-wrap" onClick={e => e.stopPropagation()}>
                                <span className="hook-copy-button" role="button" tabIndex={0} onClick={() => copyText('hook' + i, h.text)}>
                                  {copied === 'hook' + i ? <Check size={14}/> : <Copy size={14}/>}
                                </span>
                              </span>
                            </button>
                          ))}

                          <div className="hook-lab-action">
                            <span>{selectedHook ? 'Selected hook will anchor the next version.' : 'Choose a hook to anchor the whole video.'}</span>
                            <button className="generate-btn hook-regenerate" type="button" disabled={loading || !selectedHook} onClick={() => generate()}>
                              {loading ? <LoaderCircle className="spin" size={17}/> : <WandSparkles size={17}/>} Build around this hook <ChevronRight size={16}/>
                            </button>
                          </div>

                          <div className="subhead script-subhead">
                            <h4>Voiceover script</h4>
                            <button className="text-action" onClick={() => copyText('script', (result.script || []).map(s => `${s.time} ${s.voiceover}`).join('\n'))}>
                              <Copy size={14}/> Copy script
                            </button>
                          </div>
                          {(result.script || []).map((s, i) => (
                            <div className="script-row" key={i}>
                              <span>{s.time}</span>
                              <p>{s.voiceover}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'captions' && (
                        <div className="tab-content caption-content">
                          <div className="subhead">
                            <h4>Caption options</h4>
                            <button className="text-action" onClick={() => copyText('caption', result.captions?.engaging || result.captions?.short || '')}>
                              <Copy size={14}/> Copy caption
                            </button>
                          </div>
                          {result.captions?.short && (
                            <div className="caption-card">
                              <span className="caption-type">SHORT & DIRECT</span>
                              <p>{result.captions.short}</p>
                              <button className="text-action" onClick={() => copyText('shortcap', result.captions.short)}>
                                <Copy size={14}/> Copy
                              </button>
                            </div>
                          )}
                          {result.captions?.engaging && (
                            <div className="caption-card">
                              <span className="caption-type">ENGAGEMENT-LED</span>
                              <p>{result.captions.engaging}</p>
                              <button className="text-action" onClick={() => copyText('engagecap', result.captions.engaging)}>
                                <Copy size={14}/> Copy
                              </button>
                            </div>
                          )}

                          {Array.isArray(result.captions?.hashtags) && result.captions.hashtags.length > 0 && (
                            <>
                              <div className="hashtags">
                                {result.captions.hashtags.map(tag => <span key={tag}>{tag}</span>)}
                              </div>
                              <button className="text-action" onClick={() => copyText('tags', result.captions.hashtags.join(' '))}>
                                <Copy size={14}/> Copy hashtags
                              </button>
                            </>
                          )}

                          {Array.isArray(result.production_notes) && result.production_notes.length > 0 && (
                            <div className="production-notes">
                              <h4>Production checklist</h4>
                              {result.production_notes.map((n, i) => (
                                <p key={i}><Check size={15}/>{n}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="result-footer">
                        <span><Check size={14}/> Editable creative direction</span>
                        <button onClick={() => generate()} disabled={loading}><RefreshCw size={14}/> Regenerate kit</button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          <footer className="footer">
            <span>© 2026 ReelForge AI</span>
            <span>Built for creators, not content mills.</span>
            <span className="footer-status"><span/> All systems operational</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
