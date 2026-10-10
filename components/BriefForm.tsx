'use client';

import React from 'react';
import { ReelBriefForm } from '@/types/reelforge';
import { WandSparkles, ChevronRight, LoaderCircle, Sparkles } from 'lucide-react';

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

  return (
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
        <label className="field-label" htmlFor="topic">
          Video idea <span className="required">*</span>
        </label>
        <textarea
          id="topic"
          rows={4}
          value={form.topic}
          onChange={e => update('topic', e.target.value)}
          placeholder="e.g. Why most startups fail at marketing"
          required
        />

        <div className="idea-chips">
          <span>Try an idea:</span>
          {['AI tools for students', '3 camera tricks for reels', 'Personal branding mistakes'].map(x => (
            <button type="button" key={x} onClick={() => update('topic', x)}>
              {x}
            </button>
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
  );
};
