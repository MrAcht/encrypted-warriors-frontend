import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex justify-center gap-4 mb-8">
      {steps.map((step, idx) => (
        <div key={step} className="flex flex-col items-center">
          <div
            className={`rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold border-2 transition-all duration-300 ${
              idx === currentStep
                ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 border-yellow-400 shadow-lg scale-110"
                : idx < currentStep
                ? "bg-green-500 text-white border-green-400"
                : "bg-gray-700 text-gray-400 border-gray-600"
            }`}
          >
            {idx + 1}
          </div>
          <span className={`mt-2 text-xs font-semibold ${idx === currentStep ? "text-yellow-300" : "text-gray-400"}`}>{step}</span>
        </div>
      ))}
    </div>
  );
}