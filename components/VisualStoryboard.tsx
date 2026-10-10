'use client';

import React from 'react';
import { ScriptShot, ReelBriefForm } from '@/types/reelforge';
import {
  WandSparkles,
  Download,
  RefreshCw,
  LoaderCircle,
  Camera,
  Smartphone,
  Sparkles,
  AlertCircle,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { downloadSingleImage, downloadAllImagesZip } from '@/lib/imageDownloader';

interface VisualStoryboardProps {
  shots: ScriptShot[];
  form: ReelBriefForm;
  projectTitle: string;
  onGenerateAll: () => void;
  onRegenerateSingle: (index: number) => void;
  generatingAll: boolean;
}

export const VisualStoryboard: React.FC<VisualStoryboardProps> = ({
  shots,
  form,
  projectTitle,
  onGenerateAll,
  onRegenerateSingle,
  generatingAll
}) => {
  const platformName = (form.platform || 'Instagram Reels').toLowerCase();
  let aspectRatioTag = '9:16 Vertical';
  let aspectStyle = '9 / 16';

  if (platformName.includes('youtube') && !platformName.includes('shorts')) {
    aspectRatioTag = '16:9 Landscape';
    aspectStyle = '16 / 9';
  } else if (platformName.includes('linkedin') || platformName.includes('square')) {
    aspectRatioTag = '1:1 Square';
    aspectStyle = '1 / 1';
  }

  const hasGeneratedImages = shots.some(s => s.imageUrl);

  return (
    <div className="tab-content visual-storyboard-tab" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* Header Controls Bar */}
      <div className="storyboard-header-bar" style={{ marginBottom: '24px', width: '100%', maxWidth: '100%', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <span className="aspect-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--input-bg)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
            <Layers size={14} /> Video Shape: {aspectRatioTag}
          </span>
          <h4 style={{ fontSize: '20px', margin: '8px 0 4px', color: 'var(--text-main)' }}>
            See My Scenes ({shots.length} Pictures)
          </h4>
          <p className="storyboard-subtitle" style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            Every picture accurately depicts the specific action described for that scene.
          </p>
        </div>

        <div className="storyboard-header-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', maxWidth: '100%' }}>
          <button
            type="button"
            className="primary-step-btn"
            disabled={generatingAll}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onGenerateAll();
            }}
            style={{ minHeight: '44px', fontSize: '15px' }}
          >
            {generatingAll ? (
              <><LoaderCircle className="spin" size={18} /> Creating All Pictures…</>
            ) : (
              <><WandSparkles size={18} /> {hasGeneratedImages ? 'Create All Pictures Again' : 'Create All Pictures'}</>
            )}
          </button>

          {hasGeneratedImages && (
            <button
              type="button"
              className="secondary-step-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                downloadAllImagesZip(shots, projectTitle);
              }}
              style={{ minHeight: '44px', fontSize: '15px' }}
            >
              <Download size={18} /> Download All Pictures
            </button>
          )}
        </div>
      </div>

      {/* Grid of Storyboard Cards */}
      <div className="storyboard-grid">
        {shots.map((s, index) => (
          <article className="storyboard-card" key={s.id || `shot-${index}`}>
            {/* Visual Frame Image Box */}
            <div className="frame-container" style={{ aspectRatio: aspectStyle }}>
              {s.imageLoading ? (
                <div className="frame-loading frame-skeleton shimmer">
                  <LoaderCircle className="spin" size={32} />
                  <span>Creating Picture {index + 1}…</span>
                </div>
              ) : s.imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.imageUrl}
                    alt={s.title || `Scene ${index + 1}`}
                    className="frame-img"
                    loading="lazy"
                  />
                  <div className="frame-overlay-actions">
                    <button
                      type="button"
                      className="tiny-frame-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRegenerateSingle(index);
                      }}
                      title="Try another picture for this scene"
                    >
                      <RefreshCw size={14} /> Try Another Picture
                    </button>
                    <button
                      type="button"
                      className="tiny-frame-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        downloadSingleImage(s.imageUrl!, `scene-${index + 1}-${s.title || 'picture'}.png`);
                      }}
                      title="Download this picture"
                    >
                      <Download size={14} /> Download Picture
                    </button>
                  </div>
                </>
              ) : (
                <div className="frame-placeholder">
                  <Camera size={36} className="placeholder-icon" />
                  <span>Scene {index + 1} Picture</span>
                  <button
                    type="button"
                    className="generate-single-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRegenerateSingle(index);
                    }}
                    disabled={s.imageLoading || generatingAll}
                    style={{ marginTop: '8px' }}
                  >
                    <Sparkles size={16} /> Create Picture
                  </button>
                </div>
              )}

              {s.imageError && (
                <div className="frame-error-badge">
                  <span><AlertCircle size={13} /> We couldn&apos;t create this picture. Please try again.</span>
                  <button
                    type="button"
                    className="retry-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRegenerateSingle(index);
                    }}
                  >
                    <RefreshCw size={12} /> Try Again
                  </button>
                </div>
              )}
            </div>

            {/* Scene Info Breakdown */}
            <div className="storyboard-details">
              <div className="storyboard-top-row">
                <span className="frame-badge">SCENE {String(index + 1).padStart(2, '0')}</span>
                <span className="frame-time">{s.time}</span>
              </div>

              <h4 className="storyboard-title">{s.title}</h4>

              {s.voiceover && (
                <div className="storyboard-voiceover">
                  <small style={{ fontSize: '11px', display: 'block', textTransform: 'uppercase', opacity: 0.75, marginBottom: '2px' }}>WORDS TO SAY:</small>
                  “{s.voiceover}”
                </div>
              )}

              <div className="storyboard-meta-item">
                <span className="meta-label"><ImageIcon size={13} /> WHAT HAPPENS IN THIS SCENE</span>
                <p>{s.visual}</p>
              </div>

              <div className="storyboard-meta-item">
                <span className="meta-label"><Smartphone size={13} /> CAMERA ANGLE</span>
                <p>{s.camera}</p>
              </div>

              {s.overlay && (
                <div className="storyboard-bottom-row" style={{ marginTop: '10px' }}>
                  <div>
                    <small>TEXT ON SCREEN</small>
                    <b>{s.overlay}</b>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
