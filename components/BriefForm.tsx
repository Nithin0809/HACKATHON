'use client';

import React from 'react';
import { ReelBriefForm } from '@/types/reelforge';
import { Sparkles, LoaderCircle, ArrowRight, Video, Clock, Users, Palette, Check } from 'lucide-react';

interface BriefFormProps {
  form: ReelBriefForm;
  setForm: React.Dispatch<React.SetStateAction<ReelBriefForm>>;
  loading: boolean;
  error: string;
  generate: (e?: React.FormEvent) => void;
}

export const BriefForm: React.FC<BriefFormProps> = ({
  form,
  setForm,
  loading,
  error,
  generate
}) => {
  const update = (key: keyof ReelBriefForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const platforms = [
    { label: 'Instagram Reel', val: 'Instagram Reels' },
    { label: 'YouTube', val: 'YouTube' },
    { label: 'YouTube Shorts', val: 'YouTube Shorts' },
    { label: 'TikTok', val: 'TikTok' }
  ];

  const durations = [
    { label: '15 seconds', val: '15' },
    { label: '30 seconds', val: '30' },
    { label: '60 seconds', val: '60' }
  ];

  const audiences = [
    { label: 'Beginners', val: 'Beginner creators' },
    { label: 'Students', val: 'Students' },
    { label: 'Business owners', val: 'Founders & professionals' },
    { label: 'Everyone', val: 'General audience' }
  ];

  const styles = [
    { label: 'Educational', val: 'Educational & clear' },
    { label: 'Funny', val: 'Funny & energetic' },
    { label: 'Cinematic', val: 'Cinematic & emotional' },
    { label: 'Promotional', val: 'Bold & conversational' },
    { label: 'Storytelling', val: 'Storytelling' }
  ];

  return (
    <div className="panel brief-panel">
      <div className="panel-heading">
        <div>
          <h2>Start Your Video Plan</h2>
          <p>Fill in a simple idea below. We&apos;ll create a step-by-step plan for you.</p>
        </div>
      </div>

      <form onSubmit={generate}>
        {/* Large Input Field */}
        <div style={{ marginBottom: '24px' }}>
          <label className="field-label" htmlFor="topic" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>
            What is your video about? <span className="required">*</span>
          </label>
          <textarea
            id="topic"
            rows={3}
            value={form.topic}
            onChange={e => update('topic', e.target.value)}
            placeholder="Example: 5 editing mistakes beginners make"
            style={{
              width: '100%',
              fontSize: '17px',
              padding: '16px',
              borderRadius: '14px',
              border: '1.5px solid var(--input-border)',
              background: 'var(--input-bg)',
              color: 'var(--input-text)',
              lineHeight: '1.5'
            }}
            required
          />

          <div className="idea-chips" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Or click a sample:</span>
            {[
              '5 editing mistakes beginners make',
              '3 camera tricks for Instagram',
              'AI tools every student needs'
            ].map(sample => (
              <button
                type="button"
                key={sample}
                onClick={() => update('topic', sample)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* 1. WHERE WILL YOU POST YOUR VIDEO? */}
        <div className="option-selector-group">
          <label className="option-group-label">
            <Video size={16} /> WHERE WILL YOU POST YOUR VIDEO?
          </label>
          <div className="option-chips-grid">
            {platforms.map(p => (
              <button
                type="button"
                key={p.val}
                className={`option-chip-btn ${form.platform === p.val ? 'selected' : ''}`}
                onClick={() => update('platform', p.val)}
              >
                {form.platform === p.val && <Check size={16} />}
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. HOW LONG SHOULD YOUR VIDEO BE? */}
        <div className="option-selector-group">
          <label className="option-group-label">
            <Clock size={16} /> HOW LONG SHOULD YOUR VIDEO BE?
          </label>
          <div className="option-chips-grid">
            {durations.map(d => (
              <button
                type="button"
                key={d.val}
                className={`option-chip-btn ${form.duration === d.val ? 'selected' : ''}`}
                onClick={() => update('duration', d.val)}
              >
                {form.duration === d.val && <Check size={16} />}
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. WHO IS YOUR VIDEO FOR? */}
        <div className="option-selector-group">
          <label className="option-group-label">
            <Users size={16} /> WHO IS YOUR VIDEO FOR?
          </label>
          <div className="option-chips-grid">
            {audiences.map(a => (
              <button
                type="button"
                key={a.val}
                className={`option-chip-btn ${form.audience === a.val ? 'selected' : ''}`}
                onClick={() => update('audience', a.val)}
              >
                {form.audience === a.val && <Check size={16} />}
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. WHAT STYLE DO YOU WANT? */}
        <div className="option-selector-group">
          <label className="option-group-label">
            <Palette size={16} /> WHAT STYLE DO YOU WANT?
          </label>
          <div className="option-chips-grid">
            {styles.map(s => (
              <button
                type="button"
                key={s.val}
                className={`option-chip-btn ${form.tone === s.val ? 'selected' : ''}`}
                onClick={() => update('tone', s.val)}
              >
                {form.tone === s.val && <Check size={16} />}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Submit Button */}
        <button
          className="main-submit-btn"
          type="submit"
          disabled={loading || !form.topic.trim()}
        >
          {loading ? (
            <>
              <LoaderCircle className="spin" size={22} /> Creating Your Video Plan…
            </>
          ) : (
            <>
              <Sparkles size={22} /> Create My Video Plan <ArrowRight size={20} />
            </>
          )}
        </button>

        {error && (
          <div
            className="error-message"
            style={{
              marginTop: '16px',
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '15px'
            }}
          >
            {error}
          </div>
        )}
      </form>
    </div>
  );
};
