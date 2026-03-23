import React from 'react';
import { Check } from 'lucide-react';

const CampaignStepper = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between w-full px-8">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;

        return (
          <React.Fragment key={step.number}>
            {/* Step Item */}
            <div className="flex items-center gap-3 py-2 transition-all">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20'
                      : isActive
                        ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/40 scale-110'
                        : 'border-2 border-slate-200 text-slate-400 bg-white'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" strokeWidth={4} />
                ) : (
                  step.number
                )}
              </div>

              <div className="flex flex-col items-start">
                <span
                  className={`
                    text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300
                    ${isActive ? 'text-orange-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}
                    `}
                >
                  Step {step.number}
                </span>
                <span
                  className={`
                    text-[11px] font-bold transition-colors duration-300 whitespace-nowrap
                    ${isActive ? 'text-slate-900' : isCompleted ? 'text-slate-600' : 'text-slate-300'}
                    `}
                >
                  {step.title}
                </span>
              </div>
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-4 bg-slate-100 overflow-hidden">
                <div
                  className={`h-full bg-orange-600 transition-all duration-700 ease-in-out ${isCompleted ? 'w-full' : 'w-0'}`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CampaignStepper;
