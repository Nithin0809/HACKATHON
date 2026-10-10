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
  Check,
  Sparkles,
  AlertCircle,
  Layers
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
    <div className="tab-content visual-storyboard-tab">
      {/* Header Controls Bar */}
      <div className="storyboard-header-bar">
        <div>
          <span className="aspect-pill">
            <Layers size={13}/> {aspectRatioTag}
          </span>
          <h4>Visual Storyboard ({shots.length} Scenes)</h4>
          <p className="storyboard-subtitle">
            AI-rendered visual frames matching your script timing, camera framing, and color grade.
          </p>
        </div>

        <div className="storyboard-header-actions">
          <button
            type="button"
            className="generate-btn storyboard-gen-btn"
            disabled={generatingAll}
            onClick={onGenerateAll}
          >
            {generatingAll ? (
              <><LoaderCircle className="spin" size={16}/> Rendering Frames…</>
            ) : (
              <><WandSparkles size={16}/> {hasGeneratedImages ? 'Regenerate All Images' : 'Generate Storyboard Images'}</>
            )}
          </button>

          <button
            type="button"
            className="export-btn"
            disabled={!hasGeneratedImages}
            onClick={() => downloadAllImagesZip(shots, projectTitle)}
            title="Download all generated storyboard frames"
          >
            <Download size={15}/> Download All Images
          </button>
        </div>
      </div>

      {/* Grid of Storyboard Cards */}
      <div className="storyboard-grid">
        {shots.map((s, index) => (
          <article className="storyboard-card" key={index}>
            {/* Visual Frame Image Box */}
            <div className="frame-container" style={{ aspectRatio: aspectStyle }}>
              {s.imageLoading ? (
                <div className="frame-loading">
                  <LoaderCircle className="spin" size={32}/>
                  <span>Rendering Shot {index + 1}…</span>
                </div>
              ) : s.imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.imageUrl}
                    alt={s.title || `Shot ${index + 1}`}
                    className="frame-img"
                  />
                  <div className="frame-overlay-actions">
                    <button
                      type="button"
                      className="tiny-frame-btn"
                      onClick={() => onRegenerateSingle(index)}
                      title="Regenerate this frame"
                    >
                      <RefreshCw size={14}/> Regenerate
                    </button>
                    <button
                      type="button"
                      className="tiny-frame-btn"
                      onClick={() => downloadSingleImage(s.imageUrl!, `shot-${index + 1}-${s.title || 'frame'}.png`)}
                      title="Download image"
                    >
                      <Download size={14}/> Download
                    </button>
                  </div>
                </>
              ) : (
                <div className="frame-placeholder">
                  <Camera size={32} className="placeholder-icon"/>
                  <span>Frame {index + 1}</span>
                  <button
                    type="button"
                    className="generate-single-btn"
                    onClick={() => onRegenerateSingle(index)}
                    disabled={s.imageLoading}
                  >
                    <Sparkles size={14}/> Generate Image
                  </button>
                </div>
              )}

              {s.imageError && (
                <div className="frame-error-badge">
                  <AlertCircle size={14}/> {s.imageError}
                </div>
              )}
            </div>

            {/* Scene Info Breakdown */}
            <div className="storyboard-details">
              <div className="storyboard-top-row">
                <span className="frame-badge">FRAME {String(index + 1).padStart(2, '0')}</span>
                <span className="frame-time">{s.time}</span>
              </div>

              <h4 className="storyboard-title">{s.title}</h4>

              {s.voiceover && (
                <div className="storyboard-voiceover">“{s.voiceover}”</div>
              )}

              <div className="storyboard-meta-item">
                <span className="meta-label"><Camera size={13}/> VISUAL ACTION</span>
                <p>{s.visual}</p>
              </div>

              <div className="storyboard-meta-item">
                <span className="meta-label"><Smartphone size={13}/> CAMERA FRAMING</span>
                <p>{s.camera}</p>
              </div>

              <div className="storyboard-bottom-row">
                {s.overlay && (
                  <div>
                    <small>ON-SCREEN TEXT</small>
                    <b>{s.overlay}</b>
                  </div>
                )}
                <div>
                  <small>EDIT & AUDIO</small>
                  <b>{s.edit || 'Cut on beat'}</b>
                  <span>{s.audio || 'Background track'}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
