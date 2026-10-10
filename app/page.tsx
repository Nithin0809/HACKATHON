'use client';

import React, { useState, useEffect } from 'react';
import { ReelBriefForm, ProductionKit, HistoryItem, ScriptShot } from '@/types/reelforge';
import { normalizeResult } from '@/lib/normalizer';
import { loadHistoryFromStorage, saveHistoryToStorage, createHistoryItem } from '@/lib/historyStorage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { Hero } from '@/components/Hero';
import { BriefForm } from '@/components/BriefForm';
import { OutputWorkspace } from '@/components/OutputWorkspace';
import { HistoryView } from '@/components/HistoryView';

const MAX_HISTORY_ITEMS = 100;

const getInitialTheme = (): string => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem('reelforge_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch (e) {
    console.error(e);
  }
  return 'dark';
};

const initialForm: ReelBriefForm = {
  topic: '5 editing mistakes beginners make',
  platform: 'Instagram Reels',
  duration: '30',
  niche: 'Education',
  audience: 'Beginner creators',
  tone: 'Educational & clear',
  language: 'English',
  goal: 'Educate'
};

export default function Home() {
  const [theme, setTheme] = useState<string>('dark');
  const [currentView, setCurrentView] = useState<'studio' | 'history'>('studio');
  const [form, setForm] = useState<ReelBriefForm>(initialForm);
  const [result, setResult] = useState<ProductionKit | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [mode, setMode] = useState<'ai' | 'demo'>('demo');
  const [activeTab, setActiveTab] = useState<'visual-storyboard' | 'storyboard' | 'script' | 'captions'>('visual-storyboard');
  const [selectedHook, setSelectedHook] = useState<string>('');
  const [copied, setCopied] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [generatingAllImages, setGeneratingAllImages] = useState<boolean>(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyPlatform, setHistoryPlatform] = useState<string>('All');
  const [historySort, setHistorySort] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    setTheme(getInitialTheme());
    setHistory(loadHistoryFromStorage());
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('reelforge_theme', theme);
    } catch (e) {
      console.error(e);
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#09090e' : '#f7f8fc');
    }
  }, [theme]);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setMode(d.mode || 'demo'))
      .catch(() => setMode('demo'));
  }, []);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const generateSingleImage = async (shotIndex: number, currentShots: ScriptShot[]) => {
    const targetShot = currentShots[shotIndex];
    if (!targetShot) return;

    // Set loading state for target shot
    setResult(prev => {
      if (!prev) return prev;
      const updatedShots = [...prev.shots];
      updatedShots[shotIndex] = { ...updatedShots[shotIndex], imageLoading: true, imageError: undefined };
      return { ...prev, shots: updatedShots };
    });

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shot: targetShot,
          topic: form.topic,
          platform: form.platform,
          niche: form.niche,
          sceneIndex: shotIndex + 1,
          totalScenes: currentShots.length
        })
      });
      const data = await response.json();
      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error || 'Failed to generate frame image.');
      }

      setResult(prev => {
        if (!prev) return prev;
        const updatedShots = [...prev.shots];
        updatedShots[shotIndex] = {
          ...updatedShots[shotIndex],
          imageUrl: data.imageUrl,
          aspectRatio: data.aspectRatio,
          imageLoading: false,
          imageError: undefined
        };
        const updatedResult = { ...prev, shots: updatedShots };

        if (prev.id) {
          setHistory(prevHistory => {
            const updatedHistory = prevHistory.map(item => {
              if (item.id === prev.id || item.result?.id === prev.id) {
                return { ...item, result: updatedResult };
              }
              return item;
            });
            saveHistoryToStorage(updatedHistory);
            return updatedHistory;
          });
        }

        return updatedResult;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error rendering image.';
      setResult(prev => {
        if (!prev) return prev;
        const updatedShots = [...prev.shots];
        updatedShots[shotIndex] = {
          ...updatedShots[shotIndex],
          imageLoading: false,
          imageError: msg
        };
        return { ...prev, shots: updatedShots };
      });
    }
  };

  const handleGenerateAllImages = async () => {
    if (!result || !result.shots || result.shots.length === 0) return;
    setGeneratingAllImages(true);
    for (let i = 0; i < result.shots.length; i++) {
      await generateSingleImage(i, result.shots);
    }
    setGeneratingAllImages(false);
  };

  const handleRegenerateSingleImage = (index: number) => {
    if (!result || !result.shots) return;
    generateSingleImage(index, result.shots);
  };

  const generate = async (e?: React.FormEvent) => {
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
      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Generation failed. Please try again.');
      }

      const normalized = normalizeResult(data);
      if (!normalized) {
        throw new Error('Received invalid data from generator.');
      }

      setResult(normalized);
      setSelectedHook('');
      setActiveTab('visual-storyboard');

      const newItem = createHistoryItem(form, normalized);
      setHistory(prev => {
        const updated = [newItem, ...prev.filter(x => x.id !== newItem.id)].slice(0, MAX_HISTORY_ITEMS);
        saveHistoryToStorage(updated);
        return updated;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not reach the API.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (label: string, value: unknown) => {
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

  const handleOpenProject = (item: HistoryItem) => {
    if (!item || !item.result) return;
    if (item.form) {
      setForm({ ...item.form });
    }
    setResult({ ...item.result });
    setSelectedHook('');
    setActiveTab('storyboard');
    setCurrentView('studio');
    setMobileOpen(false);
  };

  const handleDeleteItem = (id: string) => {
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

  const handleDownloadItem = (item: HistoryItem) => {
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

  const handleCopyItem = async (item: HistoryItem) => {
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

  return (
    <ErrorBoundary>
      <div className="app-shell">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          historyCount={history.length}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          setActiveTab={setActiveTab}
        />

        {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}

        <main className="main">
          <Topbar
            currentView={currentView}
            theme={theme}
            toggleTheme={toggleTheme}
            mode={mode}
            setMobileOpen={setMobileOpen}
          />

          <div className="content">
            {currentView === 'history' ? (
              <HistoryView
                history={history}
                historySearch={historySearch}
                setHistorySearch={setHistorySearch}
                historyPlatform={historyPlatform}
                setHistoryPlatform={setHistoryPlatform}
                historySort={historySort}
                setHistorySort={setHistorySort}
                copied={copied}
                handleOpenProject={handleOpenProject}
                handleDeleteItem={handleDeleteItem}
                handleClearAllHistory={handleClearAllHistory}
                handleDownloadItem={handleDownloadItem}
                handleCopyItem={handleCopyItem}
                setCurrentView={setCurrentView}
              />
            ) : (
              <>
                <Hero />
                <section className="workspace-grid">
                  <BriefForm
                    form={form}
                    setForm={setForm}
                    loading={loading}
                    error={error}
                    generate={generate}
                  />

                  <OutputWorkspace
                    form={form}
                    result={result}
                    loading={loading}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    selectedHook={selectedHook}
                    setSelectedHook={setSelectedHook}
                    copied={copied}
                    copyText={copyText}
                    exportResult={exportResult}
                    generate={generate}
                    onGenerateAllImages={handleGenerateAllImages}
                    onRegenerateSingleImage={handleRegenerateSingleImage}
                    generatingAllImages={generatingAllImages}
                  />
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
    </ErrorBoundary>
  );
}
