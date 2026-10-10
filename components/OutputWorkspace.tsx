'use client';

import React, { useState, useEffect } from 'react';
import { ProductionKit, ReelBriefForm } from '@/types/reelforge';
import {
  Download,
  Sparkles,
  Check,
  Copy,
  Clock,
  Smartphone,
  LoaderCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Film,
  PartyPopper,
  Zap
} from 'lucide-react';

import { VisualStoryboard } from '@/components/VisualStoryboard';
import { StepTracker } from '@/components/StepTracker';

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
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxStepReached, setMaxStepReached] = useState<number>(1);

  useEffect(() => {
    if (result) {
      setCurrentStep(1);
      setMaxStepReached(6);
    }
  }, [result]);

  const goToNextStep = () => {
    setCurrentStep(prev => {
      const next = Math.min(prev + 1, 6);
      setMaxStepReached(m => Math.max(m, next));
      return next;
    });
  };

  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const fullPlanText = result ? [
    `VIDEO TITLE: ${result.title}`,
    `Platform: ${form.platform} | Duration: ${form.duration}s`,
    '',
    'OPENING LINES (HOOKS):',
    ...(result.hooks || []).map((h, i) => `${i + 1}. "${h.text}"`),
    '',
    'VIDEO SCRIPT:',
    ...(result.script || []).map(s => `${s.time} — What to say: "${s.voiceover}"`),
    '',
    'SCENE BY SCENE STORYBOARD:',
    ...(result.shots || []).map((s, i) => `Scene ${i + 1} (${s.time})\n- What happens: ${s.visual}\n- Camera: ${s.camera}\n- Words to say: "${s.voiceover}"\n- Text on screen: ${s.overlay || 'None'}`),
    '',
    'CAPTION & HASHTAGS:',
    result.captions?.engaging || result.captions?.short || '',
    (Array.isArray(result.captions?.hashtags) ? result.captions.hashtags.join(' ') : ''),
    '',
    'TIPS FOR FILMING:',
    ...(result.production_notes || [])
  ].join('\n') : '';

  return (
    <div className="panel output-panel">
      <div className="panel-heading output-heading">
        <div>
          <h2>Your Complete Video Plan</h2>
          <p>Follow the simple steps below to see and download your plan.</p>
        </div>
        {result && (
          <button className="secondary-step-btn" onClick={exportResult} title="Download complete JSON plan">
            <Download size={18} /> Download My Plan
          </button>
        )}
      </div>

      {!result ? (
        <div className="empty-state">
          <div className="empty-visual">
            <div className="empty-ring ring-a" />
            <div className="empty-ring ring-b" />
            <div className="empty-icon"><Film size={42} /></div>
          </div>
          <h3>Ready to plan your video?</h3>
          <p>Fill in what your video is about on the left and click <strong>&quot;Create My Video Plan&quot;</strong>.</p>
          <div className="empty-features">
            <span><Check size={16} /> Opening Lines</span>
            <span><Check size={16} /> Scene-by-Scene Pictures</span>
            <span><Check size={16} /> Ready Captions</span>
          </div>
          <button className="main-submit-btn" type="button" onClick={() => generate()} disabled={loading} style={{ maxWidth: '340px', margin: '20px auto 0' }}>
            {loading ? <LoaderCircle className="spin" size={20} /> : <Zap size={20} />} Create Sample Video Plan
          </button>
        </div>
      ) : (
        <div className="results">
          {/* Multi-Step Stepper Header */}
          <StepTracker
            currentStep={currentStep}
            onSelectStep={(s) => setCurrentStep(s)}
            maxStepReached={maxStepReached}
          />

          {/* STEP 1: YOUR VIDEO IDEA */}
          {currentStep === 1 && (
            <div className="step-view-card">
              <div className="help-box">
                <HelpCircle size={20} />
                <div>
                  <strong>STEP 1: YOUR VIDEO IDEA</strong>
                  <p>Here is a summary of what you are creating. Click next to choose your favorite opening line!</p>
                </div>
              </div>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
                <span className="result-tag" style={{ background: 'var(--violet-glow)', color: 'var(--violet-light)', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}>
                  PROJECT SUMMARY
                </span>
                <h3 style={{ fontSize: '24px', margin: '12px 0 8px', color: 'var(--text-main)' }}>{result.title}</h3>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '20px' }}>{result.creative_direction}</p>

                <div className="result-stats" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '8px 14px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '14.5px' }}>
                    <Smartphone size={16} /> <strong>Platform:</strong> {form.platform}
                  </span>
                  <span style={{ padding: '8px 14px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '14.5px' }}>
                    <Clock size={16} /> <strong>Length:</strong> {form.duration} seconds
                  </span>
                  <span style={{ padding: '8px 14px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '14.5px' }}>
                    <Film size={16} /> <strong>Total Scenes:</strong> {(result.shots || []).length} scenes
                  </span>
                </div>
              </div>

              <div className="step-action-bar">
                <span />
                <button className="primary-step-btn" onClick={goToNextStep}>
                  Next: Choose Opening Line <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: YOUR OPENING LINE */}
          {currentStep === 2 && (
            <div className="step-view-card">
              <div className="help-box">
                <HelpCircle size={20} />
                <div>
                  <strong>Opening Line</strong>: The first sentence people hear in your video.
                  <p style={{ margin: '4px 0 0', fontSize: '13.5px' }}>Choose the line that makes people want to keep watching.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(result.hooks || []).map((h, i) => {
                  const isSelected = selectedHook === h.text;
                  return (
                    <div
                      key={i}
                      className={`hook-card ${isSelected ? 'hook-selected' : ''}`}
                      style={{
                        padding: '18px 22px',
                        borderRadius: '16px',
                        border: isSelected ? '2px solid var(--violet)' : '1.5px solid var(--border)',
                        background: isSelected ? 'var(--hook-selected-bg)' : 'var(--card-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--violet)', display: 'block', marginBottom: '4px' }}>
                          OPTION 0{i + 1} • {h.angle}
                        </span>
                        <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                          &ldquo;{h.text}&rdquo;
                        </p>
                      </div>

                      <button
                        type="button"
                        className={isSelected ? 'primary-step-btn' : 'secondary-step-btn'}
                        onClick={() => setSelectedHook(h.text)}
                        style={{ minHeight: '44px' }}
                      >
                        {isSelected ? <><Check size={18} /> Selected</> : 'Choose This'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {selectedHook && (
                <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '12px', border: '1px solid var(--violet)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: 'var(--violet-light)' }}>
                    Want to rebuild the full video plan around this opening line?
                  </span>
                  <button
                    className="secondary-step-btn"
                    onClick={() => generate()}
                    disabled={loading}
                    style={{ minHeight: '40px', fontSize: '14px' }}
                  >
                    {loading ? <LoaderCircle className="spin" size={16} /> : <RotateCcw size={16} />} Rebuild Around Line
                  </button>
                </div>
              )}

              <div className="step-action-bar">
                <button className="secondary-step-btn" onClick={goToPrevStep}>
                  <ArrowLeft size={18} /> Back to Idea
                </button>
                <button className="primary-step-btn" onClick={goToNextStep}>
                  Next: Write My Video Script <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: YOUR VIDEO SCRIPT */}
          {currentStep === 3 && (
            <div className="step-view-card">
              <div className="help-box">
                <HelpCircle size={20} />
                <div>
                  <strong>STEP 3: YOUR VIDEO SCRIPT</strong>
                  <p>Here is what you will say and do during your video, broken into simple parts.</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '20px', margin: 0 }}>Words to Say &amp; Film</h3>
                <button
                  className="secondary-step-btn"
                  onClick={() => copyText('script', (result.script || []).map(s => `${s.time}: ${s.voiceover}`).join('\n'))}
                >
                  {copied === 'script' ? <><Check size={16} /> Copied Script!</> : <><Copy size={16} /> Copy My Script</>}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(result.shots || []).map((shot, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--card-bg)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '16px',
                      padding: '20px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ background: 'var(--violet)', color: '#09090e', padding: '3px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 800 }}>
                        PART {i + 1}
                      </span>
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> {shot.time}
                      </span>
                    </div>

                    {shot.voiceover && (
                      <div style={{ marginBottom: '12px' }}>
                        <small style={{ fontSize: '12px', fontWeight: 700, color: 'var(--violet-light)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                          WORDS TO SAY:
                        </small>
                        <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                          &ldquo;{shot.voiceover}&rdquo;
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <div>
                        <small style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>WHAT HAPPENS ON SCREEN:</small>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{shot.visual}</span>
                      </div>
                      <div>
                        <small style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>TEXT ON SCREEN:</small>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>{shot.overlay || 'None'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="step-action-bar">
                <button className="secondary-step-btn" onClick={goToPrevStep}>
                  <ArrowLeft size={18} /> Back to Opening Line
                </button>
                <button className="primary-step-btn" onClick={goToNextStep}>
                  Next: See My Scenes <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SEE YOUR SCENES (STORYBOARD) */}
          {currentStep === 4 && (
            <div className="step-view-card">
              <div className="help-box">
                <HelpCircle size={20} />
                <div>
                  <strong>Storyboard</strong>: A collection of pictures showing what happens in your video.
                  <p style={{ margin: '4px 0 0', fontSize: '13.5px' }}>Each picture matches the exact visual action described for that scene.</p>
                </div>
              </div>

              <VisualStoryboard
                shots={result.shots || []}
                form={form}
                projectTitle={result.title}
                onGenerateAll={onGenerateAllImages}
                onRegenerateSingle={onRegenerateSingleImage}
                generatingAll={generatingAllImages}
              />

              <div className="step-action-bar">
                <button className="secondary-step-btn" onClick={goToPrevStep}>
                  <ArrowLeft size={18} /> Back to Script
                </button>
                <button className="primary-step-btn" onClick={goToNextStep}>
                  Next: Get My Caption <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: YOUR CAPTION */}
          {currentStep === 5 && (
            <div className="step-view-card">
              <div className="help-box">
                <HelpCircle size={20} />
                <div>
                  <strong>Caption</strong>: The text you post along with your video.
                  <p style={{ margin: '4px 0 0', fontSize: '13.5px' }}>Copy and paste this caption into Instagram, TikTok, or YouTube when you post!</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {result.captions?.engaging && (
                  <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--violet)' }}>READY-TO-POST CAPTION</span>
                      <button
                        className="secondary-step-btn"
                        onClick={() => copyText('engagecap', `${result.captions.engaging}\n\n${(result.captions.hashtags || []).join(' ')}`)}
                        style={{ minHeight: '38px', padding: '6px 14px', fontSize: '13.5px' }}
                      >
                        {copied === 'engagecap' ? <><Check size={14} /> Copied Caption!</> : <><Copy size={14} /> Copy Caption</>}
                      </button>
                    </div>

                    <p style={{ fontSize: '16px', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: '0 0 16px' }}>
                      {result.captions.engaging}
                    </p>

                    {Array.isArray(result.captions?.hashtags) && result.captions.hashtags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                        {result.captions.hashtags.map(tag => (
                          <span key={tag} style={{ background: 'var(--hashtag-bg)', border: '1px solid var(--hashtag-border)', color: 'var(--hashtag-color)', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {Array.isArray(result.production_notes) && result.production_notes.length > 0 && (
                  <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
                    <h4 style={{ fontSize: '16px', margin: '0 0 12px', color: 'var(--text-main)' }}>Tips for Making the Video</h4>
                    {result.production_notes.map((note, idx) => (
                      <p key={idx} style={{ fontSize: '14.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                        <Check size={16} style={{ color: 'var(--green)', flexShrink: 0 }} /> {note}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="step-action-bar">
                <button className="secondary-step-btn" onClick={goToPrevStep}>
                  <ArrowLeft size={18} /> Back to Scenes
                </button>
                <button className="primary-step-btn" onClick={goToNextStep}>
                  Finish Video Plan <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: READY! */}
          {currentStep === 6 && (
            <div className="step-view-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet), var(--green))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#09090e' }}>
                <PartyPopper size={36} />
              </div>

              <h2 style={{ fontSize: '28px', color: 'var(--text-main)', margin: '0 0 10px' }}>
                Your video plan is ready!
              </h2>
              <p style={{ fontSize: '17px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 30px' }}>
                You have everything you need to film, edit, and post your video.
              </p>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="primary-step-btn"
                  onClick={() => {
                    const blob = new Blob([fullPlanText], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-video-plan.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={{ minHeight: '52px', fontSize: '17px' }}
                >
                  <Download size={20} /> Download My Video Plan
                </button>

                <button
                  className="secondary-step-btn"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ minHeight: '52px', fontSize: '17px' }}
                >
                  <RotateCcw size={20} /> Start a New Video
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
