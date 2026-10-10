'use client';

import React from 'react';
import { Wand2, MessageSquare, Video, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">
          <Sparkles size={16} /> EASY VIDEO PLANNER
        </div>
        <h1>
          Turn Your Idea Into a Video
        </h1>
        <p className="hero-subtitle">
          Tell us what your video is about. We&apos;ll help you plan everything — from the opening line to the exact scenes and ready-to-use captions.
        </p>

        {/* Simple 3-step 'How does this work?' section for all ages */}
        <div className="how-it-works-grid">
          <div className="how-step-card">
            <div className="how-step-num">1</div>
            <div className="how-step-text">
              <strong>Tell us your idea</strong>
              <p>Type what your video is about and choose where to post it.</p>
            </div>
          </div>

          <div className="how-step-card">
            <div className="how-step-num">2</div>
            <div className="how-step-text">
              <strong>Choose opening line</strong>
              <p>Pick your favorite opening line to grab people&apos;s attention.</p>
            </div>
          </div>

          <div className="how-step-card">
            <div className="how-step-num">3</div>
            <div className="how-step-text">
              <strong>Get your video plan</strong>
              <p>See your script, visual scenes, and caption ready to post!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
