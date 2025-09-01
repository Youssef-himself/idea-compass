'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { SearchFilters, SubredditMetadata, RedditPost, BusinessPlan, GeneratedReport, StepNumber } from '@/types';
import Step1ResearchSetup from '@/components/steps/Step1ResearchSetup';
import Step2SubredditSelection from '@/components/steps/Step2SubredditSelection';
import Step3DataScraping from '@/components/steps/Step3DataScraping';
import Step4AIAnalysis from '@/components/steps/Step4AIAnalysis';
import Step5ReportGeneration from '@/components/steps/Step5ReportGeneration';
import StepProgress from '@/components/ui/StepProgress';

const steps = [
  { title: 'Research Setup' },
  { title: 'Subreddit Selection' },
  { title: 'Data Scraping' },
  { title: 'AI Analysis' },
  { title: 'Report Generation' },
];

export default function ResearchPage() {
  // Application state
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [dataSource, setDataSource] = useState<'reddit' | 'csv'>('reddit');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [uploadedData, setUploadedData] = useState<RedditPost[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    postType: 'top',
    timeRange: 'month',
    minScore: 10,
    includeComments: true,
    excludeNSFW: true,
  });
  const [discoveredSubreddits, setDiscoveredSubreddits] = useState<SubredditMetadata[]>([]);
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>([]);
  const [scrapedData, setScrapedData] = useState<RedditPost[]>([]);
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([]);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);

  // Step navigation handlers - Updated for CSV upload logic
  const handleStep1Complete = (
    source: 'reddit' | 'csv',
    newKeywords: string[],
    filters: SearchFilters,
    subreddits?: SubredditMetadata[],
    uploaded?: RedditPost[]
  ) => {
    setDataSource(source);
    setKeywords(newKeywords);
    setSearchFilters(filters);
    
    if (source === 'csv' && uploaded) {
      // For CSV uploads, skip data scraping and go directly to categorization
      setUploadedData(uploaded);
      setCurrentStep(4); // Skip to Step 4 (AI Categorization)
    } else {
      // For Reddit discovery, proceed to subreddit selection
      setDiscoveredSubreddits(subreddits || []);
      setCurrentStep(2);
    }
  };

  const handleStep2Complete = (selected: string[]) => {
    setSelectedSubreddits(selected);
    setCurrentStep(3);
  };

  const handleStep3Complete = (data: RedditPost[]) => {
    setScrapedData(data);
    setCurrentStep(4);
  };

  const handleStep4Complete = (plans: BusinessPlan[]) => {
    setBusinessPlans(plans);
    setCurrentStep(5);
  };

  const handleStep5Complete = (report: GeneratedReport) => {
    setGeneratedReport(report);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Smart back navigation considering CSV upload workflow
      if (dataSource === 'csv' && currentStep === 4) {
        // If CSV upload, go back to Step 1
        setCurrentStep(1);
      } else {
        // Normal back navigation
        setCurrentStep((prev) => (prev - 1) as StepNumber);
      }
    }
  };

  const handleStartNew = () => {
    // Reset all state
    setCurrentStep(1);
    setDataSource('reddit');
    setKeywords([]);
    setUploadedData([]);
    setDiscoveredSubreddits([]);
    setSelectedSubreddits([]);
    setScrapedData([]);
    setBusinessPlans([]);
    setGeneratedReport(null);
  };

  // Get current data based on source
  const currentData = dataSource === 'csv' ? uploadedData : scrapedData;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ResearchSetup
            onNext={handleStep1Complete}
            initialKeywords={keywords}
            initialDataSource={dataSource}
            initialFilters={searchFilters}
          />
        );
      case 2:
        return (
          <Step2SubredditSelection
            subreddits={discoveredSubreddits}
            onNext={handleStep2Complete}
            onBack={handleBack}
            selectedSubreddits={selectedSubreddits}
          />
        );
      case 3:
        return (
          <Step3DataScraping
            selectedSubreddits={selectedSubreddits}
            keywords={keywords}
            onNext={handleStep3Complete}
            onBack={handleBack}
            onExportData={(data) => {
              // Handle raw data export
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'scraped-data.json';
              a.click();
            }}
          />
        );
      case 4:
        return (
          <Step4AIAnalysis
            scrapedData={currentData}
            onNext={handleStep4Complete}
            onBack={handleBack}
            sessionId={sessionId}
          />
        );
      case 5:
        return (
          <Step5ReportGeneration
            posts={currentData}
            businessPlans={businessPlans}
            keywords={keywords}
            sessionId={sessionId}
            onBack={handleBack}
            onExportReport={(format) => {
              // Handle report export
              console.log('Exporting report in format:', format);
            }}
            onStartNew={handleStartNew}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6 sm:py-8" role="main">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section - Only show on step 1 */}
          {currentStep === 1 && (
            <section className="text-center mb-8 sm:mb-12" aria-labelledby="hero-title">
              <h1 
                id="hero-title"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight"
              >
                Transform Reddit Discussions into{' '}
                <span className="text-blue-600 block sm:inline">
                  Actionable Business Insights
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                IdeaCompass guides you through a 5-step process to discover, analyze, and transform 
                Reddit conversations into actionable business opportunities.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-8 max-w-2xl mx-auto px-4">
                <div className="text-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">5</div>
                  <div className="text-xs sm:text-sm text-gray-600">Simple Steps</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">AI</div>
                  <div className="text-xs sm:text-sm text-gray-600">Powered</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">CSV</div>
                  <div className="text-xs sm:text-sm text-gray-600">Export Ready</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">Pro</div>
                  <div className="text-xs sm:text-sm text-gray-600">Reports</div>
                </div>
              </div>
            </section>
          )}

          {/* Step Progress */}
          <section aria-label="Progress indicator" className="mb-6 sm:mb-8">
            <StepProgress currentStep={currentStep} dataSource={dataSource} />
          </section>

          {/* Current Step Content */}
          <section 
            className="mt-6 sm:mt-8"
            aria-live="polite"
            aria-label={`Step ${currentStep} content`}
          >
            {renderCurrentStep()}
          </section>

          {/* Help Section - Show on mobile for steps 2+ */}
          {currentStep > 1 && (
            <aside className="mt-8 sm:mt-12 lg:hidden">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs font-bold">?</span>
                  </span>
                  Need Help?
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  You're currently on step {currentStep} of {steps.length}. 
                  {currentStep < steps.length 
                    ? `Next up: ${steps[currentStep]?.title}` 
                    : 'You\'re all done!'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentStep > 1 && (
                    <button 
                      onClick={handleBack}
                      className="text-xs bg-white text-blue-700 px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      aria-label="Go back to previous step"
                    >
                      ← Previous Step
                    </button>
                  )}
                  <button 
                    onClick={handleStartNew}
                    className="text-xs bg-white text-blue-700 px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    aria-label="Start a new research session"
                  >
                    🔄 Start Over
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}