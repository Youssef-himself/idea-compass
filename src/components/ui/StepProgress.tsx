'use client';

import { CheckCircle, Circle } from 'lucide-react';
import { StepNumber } from '@/types';

interface StepProgressProps {
  currentStep: StepNumber;
  dataSource?: 'reddit' | 'csv';
}

const steps = [
  {
    number: 1,
    title: 'Research Setup',
    description: 'Keywords & Filters',
    shortTitle: 'Setup',
  },
  {
    number: 2,
    title: 'Subreddit Selection',
    description: 'Choose Communities',
    shortTitle: 'Select',
  },
  {
    number: 3,
    title: 'Data Scraping',
    description: 'Collect Posts',
    shortTitle: 'Collect',
  },
  {
    number: 4,
    title: 'AI Analysis',
    description: 'Business Opportunities',
    shortTitle: 'Analyze',
  },
  {
    number: 5,
    title: 'Report Generation',
    description: 'Final Insights',
    shortTitle: 'Report',
  },
];

export default function StepProgress({ currentStep, dataSource = 'reddit' }: StepProgressProps) {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div 
      className="w-full max-w-5xl mx-auto" 
      role="progressbar" 
      aria-valuenow={currentStep} 
      aria-valuemin={1} 
      aria-valuemax={steps.length}
      aria-label={`Step ${currentStep} of ${steps.length}: ${steps[currentStep - 1]?.title}`}
    >
      {/* Desktop Progress */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative px-4">
          {/* Progress Line */}
          <div 
            className="absolute top-6 left-10 right-10 h-1 bg-gray-200 rounded-full overflow-hidden"
            role="presentation"
          >
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Steps */}
          {steps.map((step) => {
            const stepNumber = step.number as StepNumber;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isAccessible = stepNumber <= currentStep;

            return (
              <div key={step.number} className="flex flex-col items-center relative z-10">
                {/* Step Circle */}
                <div 
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 cursor-pointer
                    ${isCompleted 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md transform hover:scale-110' 
                      : isCurrent 
                      ? 'bg-white border-blue-600 text-blue-600 shadow-lg ring-4 ring-blue-100 transform scale-110' 
                      : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'
                    }
                  `}
                  role="button"
                  tabIndex={isAccessible ? 0 : -1}
                  aria-label={`${step.title}: ${isCompleted ? 'Completed' : isCurrent ? 'Current step' : 'Upcoming'}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-bold" aria-hidden="true">{step.number}</span>
                  )}
                </div>

                {/* Step Info */}
                <div className="mt-4 text-center max-w-[140px]">
                  <h3 
                    className={`
                      text-sm font-semibold transition-colors duration-300 leading-tight
                      ${isAccessible ? 'text-gray-900' : 'text-gray-400'}
                      ${isCurrent ? 'text-primary-700' : ''}
                    `}
                  >
                    {step.title}
                  </h3>
                  <p 
                    className={`
                      text-xs mt-1 transition-colors duration-300 leading-relaxed
                      ${isAccessible ? 'text-gray-600' : 'text-gray-300'}
                      ${isCurrent ? 'text-primary-600' : ''}
                    `}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Current Step Pulse Indicator */}
                {isCurrent && (
                  <div className="absolute -bottom-1 w-2 h-2 bg-primary-500 rounded-full animate-pulse" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden space-y-4">
        {/* Progress Header */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            Step {currentStep} of {steps.length}
          </span>
          <span className="font-medium text-primary-600">
            {Math.round((currentStep / steps.length) * 100)}% Complete
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
            role="presentation"
          />
        </div>
        
        {/* Current Step Info */}
        <div className="text-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-center mb-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center border-2 bg-primary-600 border-primary-600 text-white shadow-md
            `}>
              <span className="text-sm font-bold">{currentStep}</span>
            </div>
          </div>
          <h4 className="font-bold text-gray-900 text-lg mb-1">
            {steps[currentStep - 1].title}
          </h4>
          <p className="text-sm text-gray-600">
            {steps[currentStep - 1].description}
          </p>
        </div>
        
        {/* Steps Overview (Horizontal Scroll) */}
        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-3 min-w-max px-1">
            {steps.map((step, index) => {
              const stepNumber = step.number as StepNumber;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              
              return (
                <div 
                  key={step.number} 
                  className={`
                    flex-shrink-0 text-center p-2 rounded-lg min-w-[80px] transition-all duration-300
                    ${isCurrent 
                      ? 'bg-primary-50 border-2 border-primary-200' 
                      : isCompleted 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50 border border-gray-200'
                    }
                  `}
                >
                  <div 
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 text-xs font-bold
                      ${isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-300 text-gray-600'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className={`
                    text-xs font-medium leading-tight
                    ${isCurrent 
                      ? 'text-primary-700' 
                      : isCompleted 
                      ? 'text-green-700' 
                      : 'text-gray-500'
                    }
                  `}>
                    {step.shortTitle}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}