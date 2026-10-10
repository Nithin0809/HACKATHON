'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface StepTrackerProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  maxStepReached: number;
}

export const steps = [
  { id: 1, title: 'Your Video Idea' },
  { id: 2, title: 'Your Opening Line' },
  { id: 3, title: 'Your Video Script' },
  { id: 4, title: 'See Your Scenes' },
  { id: 5, title: 'Your Caption' },
  { id: 6, title: 'Ready!' }
];

export const StepTracker: React.FC<StepTrackerProps> = ({
  currentStep,
  onSelectStep,
  maxStepReached
}) => {
  return (
    <div className="stepper-wrapper">
      <div className="stepper-bar">
        {steps.map((step, idx) => {
          const isCompleted = step.id < currentStep || maxStepReached > step.id;
          const isActive = step.id === currentStep;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                className={`step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => onSelectStep(step.id)}
                aria-label={`Go to Step ${step.id}: ${step.title}`}
              >
                <div className="step-badge-num">
                  {isCompleted ? <Check size={14} /> : step.id}
                </div>
                <span>{step.title}</span>
              </button>
              {idx < steps.length - 1 && <div className="step-connector" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
