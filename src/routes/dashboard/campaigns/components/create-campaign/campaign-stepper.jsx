import React from "react";
import {
  Check,
  PenTool,
  Users,
  Send,
} from "lucide-react";

const CampaignStepper = ({ steps, currentStep }) => {
  const icons = [Users, PenTool, Send];

  return (
    <div className="space-y-6 relative">
      {/* Background Vertical Line */}
      <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-100 -z-10"></div>

      {/* Animated Progress Line */}
      <div
        className="absolute left-6 top-6 w-0.5 bg-indigo-600 -z-10 transition-all duration-700 ease-in-out origin-top shadow-[0_0_10px_rgba(79,70,229,0.3)]"
        style={{
          height: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          maxHeight: 'calc(100% - 48px)'
        }}
      ></div>

      {steps.map((step, index) => {
        const Icon = icons[index];
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;

        return (
          <div
            key={step.number}
            className={`flex items-start gap-4 group transition-all duration-500 ${isActive ? "translate-x-2" : ""
              }`}
          >
            <div className="relative">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-sm ${isActive
                  ? "bg-gradient-to-br from-blue-600 to-indigo-700 border-transparent text-white shadow-xl shadow-indigo-500/20 scale-110"
                  : isCompleted
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 border-transparent text-white shadow-lg shadow-indigo-500/10"
                    : "bg-white border-slate-100 text-slate-300"
                  }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 animate-in zoom-in duration-300" />
                ) : (
                  <Icon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
                )}
              </div>

              {isActive && (
                <div className="absolute -inset-1 border border-blue-500/20 rounded-[1.25rem] animate-pulse"></div>
              )}
            </div>

            <div className="pt-1 select-none">
              <h4 className={`text-xs font-extrabold uppercase tracking-widest transition-colors ${isActive ? "text-slate-900" : isCompleted ? "text-slate-600" : "text-slate-400"
                }`}>
                {step.title}
              </h4>
              <p className={`text-[10px] font-bold uppercase tracking-tight mt-1 transition-colors ${isActive ? "text-indigo-600" : "text-slate-400"
                }`}>
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div >
  );
};

export default CampaignStepper;
