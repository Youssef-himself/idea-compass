import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  nextText?: string;
  backText?: string;
  nextDisabled?: boolean;
  nextIcon?: React.ComponentType<{ className?: string }>;
  backIcon?: React.ComponentType<{ className?: string }>;
  nextVariant?: 'primary' | 'secondary';
  className?: string;
  position?: 'top' | 'bottom';
}

export default function StepNavigation({
  onBack,
  onNext,
  nextText = 'Next',
  backText = 'Back',
  nextDisabled = false,
  nextIcon: NextIcon = ArrowRight,
  backIcon: BackIcon = ArrowLeft,
  nextVariant = 'primary',
  className = '',
  position = 'bottom'
}: StepNavigationProps) {
  const baseButtonClasses = 'flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium';
  
  const backButtonClasses = `${baseButtonClasses} border border-gray-300 text-gray-700 hover:bg-gray-50`;
  
  const nextButtonClasses = nextVariant === 'primary'
    ? `${baseButtonClasses} bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`
    : `${baseButtonClasses} border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`;

  // Add different styling for top vs bottom positioning
  const containerClasses = position === 'top' 
    ? 'flex justify-between mb-6 pb-4 border-b border-gray-100'
    : 'flex justify-between';

  return (
    <div className={`${containerClasses} ${className}`}>
      {onBack ? (
        <button
          onClick={onBack}
          className={backButtonClasses}
          type="button"
        >
          <BackIcon className="w-5 h-5" />
          {backText}
        </button>
      ) : (
        <div></div> // Placeholder for consistent spacing
      )}
      
      {onNext ? (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={nextButtonClasses}
          type="button"
        >
          {nextText}
          <NextIcon className="w-5 h-5" />
        </button>
      ) : (
        <div></div> // Placeholder for consistent spacing
      )}
    </div>
  );
}