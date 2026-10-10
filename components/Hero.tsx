'use client';

import React from 'react';
import { Zap, Clapperboard, Sparkles, Camera, Check } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
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
  );
};
