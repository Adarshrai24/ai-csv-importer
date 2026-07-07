'use client';

import React from 'react';
import { AppStep } from '@/types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const STEPS: { key: AppStep; label: string; number: number }[] = [
  { key: 'upload', label: 'Upload', number: 1 },
  { key: 'preview', label: 'Preview', number: 2 },
  { key: 'processing', label: 'Processing', number: 3 },
  { key: 'results', label: 'Results', number: 4 },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="step-indicator" role="navigation" aria-label="Import progress">
      {STEPS.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <React.Fragment key={step.key}>
            <div className="step-item">
              <div
                className={`step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? '✓' : step.number}
              </div>
              <span
                className={`step-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`step-connector ${isCompleted ? 'completed' : ''}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
