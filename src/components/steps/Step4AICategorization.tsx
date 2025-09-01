'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Brain, BarChart3, Eye, Lightbulb, CheckSquare, Square, Sparkles } from 'lucide-react';
import { Step4Props, Category } from '@/types';
import StepNavigation from '@/components/ui/StepNavigation';

interface BusinessIdea {
  id: string;
  title: string;
  description: string;
  selected?: boolean;
}

interface BusinessPlan {
  id: string;
  title: string;
  coreProblem: string;
  proposedSolution: string;
  targetAudience: string;
  keyFeatures: string[];
  marketPotential: number;
  feasibility: number;
  monetization: string;
  actionPlan: string;
}

export default function Step4AICategorization({ 
  scrapedData, 
  onNext, 
  onBack, 
  categories = [] 
}: Step4Props) {
  const [currentPhase, setCurrentPhase] = useState<'initial' | 'phase1' | 'phase2'>('initial');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [businessIdeas, setBusinessIdeas] = useState<BusinessIdea[]>([]);
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([]);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [error, setError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<string[]>([]);

  // PHASE 1: Generate business ideas
  const handleStartPhase1 = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisProgress(0);
    setCurrentPhase('phase1');
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 800);
    
    try {
      const response = await fetch('/api/analyze/phase1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          posts: scrapedData,
          sessionId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate business ideas');
      }

      setBusinessIdeas(result.data || []);
      setAnalysisProgress(100);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze data');
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  // PHASE 2: Generate detailed business plans
  const handleStartPhase2 = async () => {
    if (selectedIdeaIds.length === 0) {
      setError('Please select at least one business idea to develop');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisProgress(0);
    setCurrentPhase('phase2');
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 1000);
    
    try {
      const selectedIdeas = businessIdeas.filter(idea => selectedIdeaIds.includes(idea.id));
      
      const response = await fetch('/api/analyze/phase2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          posts: scrapedData,
          selectedIdeas,
          sessionId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate business plans');
      }

      setBusinessPlans(result.data || []);
      setAnalysisProgress(100);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate business plans');
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    // Convert business plans to categories for compatibility with the expected Step4Props
    const generatedCategories: Category[] = businessPlans.map((plan, index) => ({
      id: plan.id,
      name: plan.title,
      description: plan.coreProblem,
      keywords: plan.keyFeatures.slice(0, 5),
      postCount: Math.floor(scrapedData.length / businessPlans.length),
      percentage: Math.floor(100 / businessPlans.length),
      confidence: plan.feasibility / 10,
      samplePosts: scrapedData.slice(index * 3, (index + 1) * 3),
      tags: [`market-potential-${plan.marketPotential}`, `feasibility-${plan.feasibility}`],
      selected: true
    }));

    // Pass the converted categories to maintain compatibility
    onNext(generatedCategories);
  };

  const handleIdeaToggle = (ideaId: string) => {
    setSelectedIdeaIds(prev => 
      prev.includes(ideaId) 
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId]
    );
  };

  const handleBackToPhase1 = () => {
    setCurrentPhase('phase1');
    setBusinessPlans([]);
    setSelectedIdeaIds([]);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        {/* Top Navigation */}
        <StepNavigation
          position="top"
          onBack={onBack}
          onNext={handleNext}
          backText="Back to Data Collection"
          nextText={businessPlans.length > 0 ? `Continue to Final Review (${businessPlans.length} plans)` : 'Continue (Analysis Required)'}
          nextDisabled={businessPlans.length === 0}
        />

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Step 4: AI Business Idea Analysis
          </h2>
          <p className="text-lg text-gray-600">
            Transform your data into actionable, high-potential SaaS business ideas
          </p>
          {currentPhase === 'phase1' && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Phase 1:</strong> Generating multiple business opportunities from your data
              </p>
            </div>
          )}
          {currentPhase === 'phase2' && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Phase 2:</strong> Creating detailed business plans for selected ideas
              </p>
            </div>
          )}
        </div>

        {/* Data Summary */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Data Ready for Analysis</h3>
          </div>
          <p className="text-blue-800">
            {scrapedData.length.toLocaleString()} posts collected from {[...new Set(scrapedData.map(p => p.subreddit))].length} subreddits
          </p>
        </div>

        {/* INITIAL STATE */}
        {currentPhase === 'initial' && (
          <div className="text-center mb-8">
            <div className="mb-6">
              <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">AI Business Analysis Ready</h3>
              <div className="max-w-3xl mx-auto">
                <p className="text-gray-600 mb-4">
                  Transform your raw Reddit data into actionable SaaS business opportunities using our 
                  precise two-phase AI analysis process.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Phase 1: Idea Generation</h4>
                    <p className="text-sm text-blue-800">
                      AI analyzes problems and needs in your data to identify multiple distinct SaaS business opportunities
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Phase 2: Business Plans</h4>
                    <p className="text-sm text-green-800">
                      Generate detailed mini business plans with market analysis, features, and action steps
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleStartPhase1}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-5 h-5" />
              Start Business Idea Analysis
            </button>
          </div>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {currentPhase === 'phase1' ? 'Generating Business Ideas' : 'Creating Business Plans'}
              </h3>
              <p className="text-gray-600">
                {currentPhase === 'phase1' 
                  ? `Analyzing ${scrapedData.length} posts to identify business opportunities...`
                  : `Creating detailed business plans for ${selectedIdeaIds.length} selected ideas...`
                }
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(analysisProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                {currentPhase === 'phase1' 
                  ? 'Identifying problems and market opportunities'
                  : 'Generating detailed market analysis and action plans'
                }
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Analysis Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* PHASE 1 RESULTS: Business Ideas List */}
        {currentPhase === 'phase1' && businessIdeas.length > 0 && (
          <div className="mb-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Business Ideas Generated!
                </h3>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                <p className="text-green-800 mb-3">
                  <strong>Phase 1 Complete:</strong> Based on my analysis, I have identified the following potential business ideas. 
                  Please select the number(s) of the ideas you would like me to develop into full business plans:
                </p>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{businessIdeas.length}</div>
                  <div className="text-sm text-green-600">SaaS Ideas Identified</div>
                </div>
              </div>
            </div>

            {/* Business Ideas Selection List */}
            <div className="space-y-3 mb-6">
              {businessIdeas.map((idea, index) => (
                <div 
                  key={idea.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedIdeaIds.includes(idea.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleIdeaToggle(idea.id)}
                >
                  <div className="flex items-start gap-3">
                    {selectedIdeaIds.includes(idea.id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        {index + 1}. {idea.title}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {idea.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Phase 2 Action */}
            <div className="text-center">
              <div className="mb-4">
                <p className="text-gray-600">
                  Selected {selectedIdeaIds.length} idea{selectedIdeaIds.length !== 1 ? 's' : ''} for detailed business plan development
                </p>
              </div>
              <button
                onClick={handleStartPhase2}
                disabled={selectedIdeaIds.length === 0}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Brain className="w-5 h-5" />
                Generate Business Plans ({selectedIdeaIds.length})
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2 RESULTS: Detailed Business Plans */}
        {currentPhase === 'phase2' && businessPlans.length > 0 && (
          <div className="mb-8">
            {/* Phase 2 Results Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Business Plans Complete!
                  </h3>
                </div>
                <button
                  onClick={handleBackToPhase1}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  ← Back to Ideas
                </button>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 mb-3">
                  <strong>Phase 2 Complete:</strong> Here are the detailed business plans for your selected ideas:
                </p>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{businessPlans.length}</div>
                  <div className="text-sm text-green-600">Detailed Business Plans Generated</div>
                </div>
              </div>
            </div>

            {/* Business Plans List */}
            <div className="space-y-8">
              {businessPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="border rounded-lg p-8 bg-white shadow-sm"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Business Idea: {plan.title}
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Core Problem */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">1. The Core Problem:</h4>
                      <p className="text-gray-700 italic">{plan.coreProblem}</p>
                    </div>

                    {/* Proposed Solution */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">2. The Proposed Solution (SaaS Product):</h4>
                      <p className="text-gray-700 italic">{plan.proposedSolution}</p>
                    </div>

                    {/* Target Audience */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">3. Target Audience:</h4>
                      <p className="text-gray-700 italic">{plan.targetAudience}</p>
                    </div>

                    {/* Key Features */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">4. Key Features (MVP):</h4>
                      <ul className="text-gray-700 italic space-y-1 ml-6">
                        {plan.keyFeatures.map((feature, idx) => (
                          <li key={idx} className="list-disc">{feature}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Market Analysis */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">5. Market Potential & Feasibility Analysis:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="text-sm font-medium text-blue-900 mb-1">Market Potential</div>
                          <div className="flex items-center gap-2">
                            <div className="text-xl font-bold text-blue-700">{plan.marketPotential}/10</div>
                            <div className="flex-1 bg-blue-200 h-2 rounded">
                              <div 
                                className="bg-blue-600 h-2 rounded" 
                                style={{ width: `${plan.marketPotential * 10}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                          <div className="text-sm font-medium text-green-900 mb-1">Solo Founder Feasibility</div>
                          <div className="flex items-center gap-2">
                            <div className="text-xl font-bold text-green-700">{plan.feasibility}/10</div>
                            <div className="flex-1 bg-green-200 h-2 rounded">
                              <div 
                                className="bg-green-600 h-2 rounded" 
                                style={{ width: `${plan.feasibility * 10}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                        <div className="text-sm font-medium text-gray-800 mb-1">Monetization Strategy:</div>
                        <p className="text-gray-700 italic">{plan.monetization}</p>
                      </div>
                    </div>

                    {/* Action Plan */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">6. Simple Action Plan:</h4>
                      <p className="text-gray-700 italic">{plan.actionPlan}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Data Collection
          </button>
          
          <button
            onClick={handleNext}
            disabled={businessPlans.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue to Final Review
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">🤖 AI Business Analysis Info</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Phase 1:</strong> Identifies distinct business opportunities from user problems and needs</li>
            <li>• <strong>Phase 2:</strong> Creates comprehensive business plans with market analysis</li>
            <li>• Scoring system evaluates market potential and solo founder feasibility</li>
            <li>• Action plans provide concrete first steps for validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}