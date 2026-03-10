import React from 'react';
import { Check } from 'lucide-react';

const CampaignStepper = ({ steps, currentStep }) => {
  return (
    <div className="w-full mb-8 pt-6 px-4">
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              {/* Step Item */}
              <div className={`flex items-center gap-3 shrink-0 ${!isActive && !isCompleted ? 'opacity-70' : ''}`}>
                {/* Circle */}
                <div
                  className={`
                    w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300
                    ${isCompleted
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-slate-400 border-[1.5px] border-slate-300'
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-4 h-4 text-white hover:scale-110 transition-transform" strokeWidth={3} /> : step.number}
                </div>

                {/* Title */}
                <span
                  className={`
                    text-xs sm:text-sm font-semibold tracking-wide transition-colors duration-300
                    ${isActive ? 'text-slate-900' : isCompleted ? 'text-slate-700' : 'text-slate-500'}
                  `}
                >
                  {step.title}
                </span>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="flex-auto mx-4 sm:mx-6">
                  <div className="h-[2px] w-full bg-slate-200 rounded-full overflow-hidden relative">
                    <div
                      className={`absolute inset-y-0 left-0 bg-blue-600 transition-all duration-700 ease-in-out ${isCompleted ? 'w-full' : 'w-0'}`}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignStepper;
