'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Settings, Target, FileText, Zap, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Step5Props, AnalysisConfig } from '@/types';
import StepNavigation from '@/components/ui/StepNavigation';

export default function Step5AnalysisConfig({ 
  categories, 
  onNext, 
  onBack, 
  initialConfig 
}: Step5Props) {
  const [config, setConfig] = useState<AnalysisConfig>(initialConfig || {
    selectedCategories: (categories || []).map(c => c.id),
    analysisType: 'comprehensive',
    outputFormat: 'detailed',
    researchGoals: [],
  });
  
  const [customGoal, setCustomGoal] = useState('');
  const [businessContext, setBusinessContext] = useState(config.businessContext || '');

  const handleCategoryToggle = (categoryId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }));
  };

  const addResearchGoal = () => {
    if (customGoal.trim() && !config.researchGoals.includes(customGoal.trim())) {
      setConfig(prev => ({
        ...prev,
        researchGoals: [...prev.researchGoals, customGoal.trim()]
      }));
      setCustomGoal('');
    }
  };

  const removeResearchGoal = (goal: string) => {
    setConfig(prev => ({
      ...prev,
      researchGoals: prev.researchGoals.filter(g => g !== goal)
    }));
  };

  const handleNext = () => {
    const finalConfig = {
      ...config,
      businessContext: businessContext.trim() || undefined,
    };
    onNext(finalConfig);
  };

  const predefinedGoals = [
    'Identify customer pain points and complaints',
    'Discover feature requests and improvement opportunities',
    'Analyze competitor mentions and sentiment',
    'Understand market trends and emerging topics',
    'Evaluate brand perception and reputation',
    'Find potential partnership or collaboration opportunities',
    'Assess customer satisfaction and loyalty',
    'Identify influencers and community leaders',
  ];

  const analysisTypeDescriptions = {
    comprehensive: 'Complete analysis covering sentiment, trends, opportunities, and insights',
    custom: 'Use your custom analysis instructions below for focused analysis',
  };

  const outputFormatDescriptions = {
    detailed: 'Comprehensive analysis with supporting data and examples',
  };

  const selectedCategoryCount = config.selectedCategories.length;
  const totalPosts = (categories || [])
    .filter(cat => cat && cat.id && config.selectedCategories.includes(cat.id))
    .reduce((sum, cat) => sum + (cat.postCount || 0), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        {/* Top Navigation */}
        <StepNavigation
          position="top"
          onBack={onBack}
          onNext={handleNext}
          backText="Back to Categories"
          nextText="Generate Report"
          nextDisabled={selectedCategoryCount === 0}
        />

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Step 5: Configure Analysis Focus
          </h2>
          <p className="text-lg text-gray-600">
            Customize your analysis to match your research objectives
          </p>
        </div>

        {/* Analysis Overview */}
        <div className="mb-8 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Analysis Scope</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Categories:</span>
              <span className="ml-2 text-blue-700">{selectedCategoryCount} selected</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Posts:</span>
              <span className="ml-2 text-blue-700">{totalPosts.toLocaleString()} to analyze</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Est. Report:</span>
              <span className="ml-2 text-blue-700">Detailed Report</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Category Selection */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Select Categories to Analyze</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Choose which categories should be included in your final report. 
              You can deselect categories that aren't relevant to your research goals.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {(categories || []).filter(cat => cat && cat.id).map((category) => {
                const isSelected = config.selectedCategories.includes(category.id);
                return (
                  <label key={category.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{category.name}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {category.postCount} posts ({category.percentage}%)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs text-gray-500">Keywords:</span>
                        {category.keywords.slice(0, 4).map((keyword, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            {selectedCategoryCount === 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800 text-sm">Please select at least one category for analysis.</p>
              </div>
            )}
          </div>

          {/* Analysis Type */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Analysis Type</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysisTypeDescriptions).map(([type, description]) => (
                <div key={type} className="relative">
                  <input
                    type="radio"
                    id={`analysis-${type}`}
                    name="analysisType"
                    value={type}
                    checked={config.analysisType === type}
                    onChange={(e) => setConfig({ ...config, analysisType: e.target.value as any })}
                    className="sr-only"
                  />
                  <label 
                    htmlFor={`analysis-${type}`}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      config.analysisType === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setConfig({ ...config, analysisType: type as any })}
                  >
                    <h4 className="font-medium text-gray-900 mb-2 capitalize">{type.replace('_', ' ')}</h4>
                    <p className="text-sm text-gray-600">{description}</p>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Output Format - Hidden since only one option */}
          {false && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Report Format</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(outputFormatDescriptions).map(([format, description]) => (
                <div key={format} className="relative">
                  <input
                    type="radio"
                    id={`format-${format}`}
                    name="outputFormat"
                    value={format}
                    checked={config.outputFormat === format}
                    onChange={(e) => setConfig({ ...config, outputFormat: e.target.value as any })}
                    className="sr-only"
                  />
                  <label 
                    htmlFor={`format-${format}`}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors h-full ${
                      config.outputFormat === format
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setConfig({ ...config, outputFormat: format as any })}
                  >
                    <h4 className="font-medium text-gray-900 mb-2 capitalize">{format}</h4>
                    <p className="text-sm text-gray-600">{description}</p>
                  </label>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Research Goals */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Research Goals</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Define specific objectives for your analysis. This helps the AI focus on the most relevant insights.
            </p>
            
            {/* Current Goals */}
            {config.researchGoals.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Selected Goals:</h4>
                <div className="space-y-2">
                  {config.researchGoals.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-800">{goal}</span>
                      <button
                        onClick={() => removeResearchGoal(goal)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add Custom Goal */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="Enter a custom research goal..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addResearchGoal()}
                />
                <button
                  onClick={addResearchGoal}
                  disabled={!customGoal.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
            
            {/* Predefined Goals */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Common Research Goals:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {predefinedGoals
                  .filter(goal => !config.researchGoals.includes(goal))
                  .map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setConfig(prev => ({ ...prev, researchGoals: [...prev.researchGoals, goal] }))}
                      className="text-left p-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      + {goal}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Business Context */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Business Context</h3>
              <span className="text-sm text-gray-500">(Optional)</span>
            </div>
            <p className="text-gray-600 mb-3">
              Provide context about your business, industry, or specific situation to get more relevant insights.
            </p>
            <textarea
              value={businessContext}
              onChange={(e) => setBusinessContext(e.target.value)}
              placeholder="e.g., We're a B2B SaaS company in the project management space, looking to understand user pain points before our next product iteration..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>

          {/* Custom Analysis Prompt */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Custom Analysis Instructions</h3>
              <span className="text-sm text-gray-500">(Advanced)</span>
            </div>
            <p className="text-gray-600 mb-3">
              Provide specific instructions for the AI analysis. This will override the default analysis approach.
            </p>
            <textarea
              value={config.customPrompt || ''}
              onChange={(e) => setConfig({ ...config, customPrompt: e.target.value })}
              placeholder="e.g., Focus specifically on mobile app mentions and compare sentiment before/after our recent update. Identify the top 3 most frequently mentioned bugs..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Categories
          </button>
          
          <button
            onClick={handleNext}
            disabled={selectedCategoryCount === 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generate Report
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Summary */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Configuration Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Analyzing {selectedCategoryCount} categories with {totalPosts.toLocaleString()} posts</p>
            <p>• Analysis type: {config.analysisType.charAt(0).toUpperCase() + config.analysisType.slice(1)}</p>
            <p>• Output format: {config.outputFormat.charAt(0).toUpperCase() + config.outputFormat.slice(1)}</p>
            <p>• Research goals: {config.researchGoals.length > 0 ? config.researchGoals.length : 'None specified'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}