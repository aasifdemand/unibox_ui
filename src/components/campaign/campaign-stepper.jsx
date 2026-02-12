import React from "react";
import {
  Check,
  PenTool,
  FileText,
  Users,
  Calendar,
  Settings,
} from "lucide-react";

const CampaignStepper = ({ steps, currentStep }) => {
  const icons = [PenTool, FileText, Users, Calendar, Settings];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
        <div
          className="absolute top-5 left-0 h-0.5 bg-linear-to-r from-blue-600 to-indigo-600 -z-10 transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        ></div>

        {steps.map((step, index) => {
          const Icon = icons[index];
          return (
            <div
              key={step.number}
              className="flex flex-col items-center relative"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  currentStep >= step.number
                    ? "bg-linear-to-r from-blue-600 to-indigo-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="mt-3 text-center">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= step.number
                      ? "text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignStepper;
