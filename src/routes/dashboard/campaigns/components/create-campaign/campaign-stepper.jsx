import React from 'react';
import { Check, PenTool, Users, Send } from 'lucide-react';

const CampaignStepper = ({ steps, currentStep }) => {
  const icons = [Users, PenTool, Send];

  return (
    <div className="w-full mb-12 relative px-4">
      {/* Container for steps */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto relative z-10">
        {/* Background Connector Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-100 -z-10 mx-6"></div>

        {/* Animated Progress Line */}
        <div
          className="absolute top-6 left-0 h-0.5 bg-indigo-600 -z-10 mx-6 transition-all duration-700 ease-in-out origin-left shadow-[0_0_10px_rgba(79,70,229,0.3)]"
          style={{
            width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 48px)`,
          }}
        ></div>

        {steps.map((step, index) => {
          const Icon = icons[index];
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div
              key={step.number}
              className="flex flex-col items-center gap-3 relative"
            >
              {/* Step Circle */}
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-sm ${isActive
                      ? 'bg-linear-to-br from-blue-600 to-indigo-700 border-transparent text-white shadow-xl shadow-indigo-500/20 scale-110'
                      : isCompleted
                        ? 'bg-linear-to-br from-blue-500 to-indigo-600 border-transparent text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-white border-slate-100 text-slate-300'
                    }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 animate-in zoom-in duration-300" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                  )}
                </div>

                {isActive && (
                  <div className="absolute -inset-1 border border-blue-500/20 rounded-[1.25rem] animate-pulse"></div>
                )}
              </div>

              {/* Step Label */}
              <div className="text-center absolute -bottom-8 whitespace-nowrap">
                <h4
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-slate-900' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                    }`}
                >
                  {step.title}
                </h4>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignStepper;
