'use client';

import React from 'react';
import { ProductionKit, ReelBriefForm } from '@/types/reelforge';
import {
  Download,
  Clapperboard,
  Sparkles,
  Zap,
  Play,
  Check,
  Copy,
  Clock3,
  Smartphone,
  AudioLines,
  Camera,
  LoaderCircle,
  WandSparkles,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

import { VisualStoryboard } from '@/components/VisualStoryboard';

interface OutputWorkspaceProps {
  form: ReelBriefForm;
  result: ProductionKit | null;
  loading: boolean;
  activeTab: 'visual-storyboard' | 'storyboard' | 'script' | 'captions';
  setActiveTab: (tab: 'visual-storyboard' | 'storyboard' | 'script' | 'captions') => void;
  selectedHook: string;
  setSelectedHook: (hook: string) => void;
  copied: string;
  copyText: (label: string, value: unknown) => void;
  exportResult: () => void;
  generate: (e?: React.FormEvent) => void;
  onGenerateAllImages: () => void;
  onRegenerateSingleImage: (index: number) => void;
  generatingAllImages: boolean;
}

export const OutputWorkspace: React.FC<OutputWorkspaceProps> = ({
  form,
  result,
  loading,
  activeTab,
  setActiveTab,
  selectedHook,
  setSelectedHook,
  copied,
  copyText,
  exportResult,
  generate,
  onGenerateAllImages,
  onRegenerateSingleImage,
  generatingAllImages
}) => {
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
    <div className="panel output-panel">
      <div className="panel-heading output-heading">
        <div>
          <div className="section-kicker">02 / THE OUTPUT</div>
          <h2>Your creative workspace</h2>
          <p>Every detail, ready for the shoot and edit.</p>
        </div>
        <button className="export-btn" onClick={exportResult} disabled={!result}>
          <Download size={16}/> Export
        </button>
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
          <button className="try-demo" type="button" onClick={() => generate()} disabled={loading}>
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
            <button
              className="copy-icon-btn"
              title="Copy complete kit"
              onClick={() => copyText('all', allText)}
            >
              {copied === 'all' ? <Check size={18}/> : <Copy size={18}/>}
            </button>
          </div>

          <div className="result-stats">
            <span><Clock3 size={15}/>{form.duration}s target</span>
            <span><Smartphone size={15}/>{form.platform}</span>
            <span><AudioLines size={15}/>{(result.shots || []).length} shots</span>
          </div>

          <div className="tabs">
            {(['visual-storyboard', 'storyboard', 'script', 'captions'] as const).map(id => (
              <button
                key={id}
                className={activeTab === id ? 'active' : ''}
                onClick={() => setActiveTab(id)}
              >
                {id === 'visual-storyboard' ? '🎨 Visual Storyboard' : id === 'storyboard' ? 'Shot Details' : id === 'script' ? 'Script & hooks' : 'Captions'}
              </button>
            ))}
          </div>

          {activeTab === 'visual-storyboard' && (
            <VisualStoryboard
              shots={result.shots || []}
              form={form}
              projectTitle={result.title}
              onGenerateAll={onGenerateAllImages}
              onRegenerateSingle={onRegenerateSingleImage}
              generatingAll={generatingAllImages}
            />
          )}

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
                      <button
                        className="tiny-copy"
                        title="Copy shot JSON"
                        onClick={() => copyText('shot' + i, JSON.stringify(s, null, 2))}
                      >
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
                <button
                  className="text-action"
                  onClick={() => copyText('hooks', (result.hooks || []).map(h => h.text).join('\n'))}
                >
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
                    <span
                      className="hook-copy-button"
                      role="button"
                      tabIndex={0}
                      onClick={() => copyText('hook' + i, h.text)}
                    >
                      {copied === 'hook' + i ? <Check size={14}/> : <Copy size={14}/>}
                    </span>
                  </span>
                </button>
              ))}

              <div className="hook-lab-action">
                <span>{selectedHook ? 'Selected hook will anchor the next version.' : 'Choose a hook to anchor the whole video.'}</span>
                <button
                  className="generate-btn hook-regenerate"
                  type="button"
                  disabled={loading || !selectedHook}
                  onClick={() => generate()}
                >
                  {loading ? <LoaderCircle className="spin" size={17}/> : <WandSparkles size={17}/>} Build around this hook <ChevronRight size={16}/>
                </button>
              </div>

              <div className="subhead script-subhead">
                <h4>Voiceover script</h4>
                <button
                  className="text-action"
                  onClick={() => copyText('script', (result.script || []).map(s => `${s.time} ${s.voiceover}`).join('\n'))}
                >
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
                <button
                  className="text-action"
                  onClick={() => copyText('caption', result.captions?.engaging || result.captions?.short || '')}
                >
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
            <button onClick={() => generate()} disabled={loading}>
              <RefreshCw size={14}/> Regenerate kit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
