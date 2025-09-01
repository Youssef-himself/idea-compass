'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Brain, Download, Search, Users, Zap, CheckCircle, Star, TrendingUp, Lightbulb, FileText, Rocket } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  
  // State for real reviews
  const [reviews, setReviews] = useState<any[]>([]);
  
  // Load reviews from localStorage on component mount
  useEffect(() => {
    const storedReviews = localStorage.getItem('reviews');
    if (storedReviews) {
      try {
        const parsedReviews = JSON.parse(storedReviews);
        // For demo purposes, we'll show up to 3 most recent reviews
        setReviews(parsedReviews.slice(-3).reverse());
      } catch (e) {
        console.error('Failed to parse reviews', e);
        setReviews([]);
      }
    }
  }, []);

  // Smart authentication logic for research buttons
  const getResearchLink = () => {
    if (!user) {
      // Not authenticated - redirect to signup/login with free plan context
      return '/auth?plan=free&redirect=research';
    }
    
    // Authenticated user - go directly to research
    return '/research';
  };

  // Smart demo redirection logic
  const getDemoLink = () => {
    if (!user) {
      // Not authenticated - show them the features and pricing first
      return '/pricing';
    }
    
    // Authenticated user - redirect to research since they can try it hands-on
    return '/research';
  };

  // Feature data with enhanced visuals
  const features = [
    {
      icon: Search,
      title: "Smart Discovery",
      description: "Find relevant subreddits automatically based on your keywords. Our AI identifies the most active and relevant communities.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Download,
      title: "Data Collection",
      description: "Collect posts and comments from multiple subreddits with smart filtering and quality controls.",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: Brain,
      title: "AI Business Analysis",
      description: "Transform discussions into actionable business opportunities with detailed market analysis and feasibility assessments.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Professional Reports",
      description: "Generate comprehensive reports with insights, recommendations, and export to PDF or Word.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "Rapid Insights",
      description: "Get actionable insights in minutes instead of weeks with our lightning-fast processing.",
      color: "from-yellow-500 to-amber-500"
    },
    {
      icon: Users,
      title: "Audience Understanding",
      description: "Deep dive into user sentiments, pain points, and desires to build products people actually want.",
      color: "from-pink-500 to-rose-500"
    }
  ];

  // How it works steps
  const steps = [
    { 
      step: 1, 
      title: "Setup Research", 
      desc: "Enter keywords or upload your data", 
      icon: Search,
      color: "bg-blue-100 text-blue-600"
    },
    { 
      step: 2, 
      title: "Select Sources", 
      desc: "Choose relevant subreddits", 
      icon: Users,
      color: "bg-purple-100 text-purple-600"
    },
    { 
      step: 3, 
      title: "Collect Data", 
      desc: "Automated data scraping", 
      icon: Download,
      color: "bg-green-100 text-green-600"
    },
    { 
      step: 4, 
      title: "AI Analysis", 
      desc: "Generate business opportunities", 
      icon: Brain,
      color: "bg-amber-100 text-amber-600"
    },
    { 
      step: 5, 
      title: "Get Report", 
      desc: "Export professional insights", 
      icon: FileText,
      color: "bg-red-100 text-red-600"
    }
  ];

  // Render star ratings
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Turn Reddit discussions into</span>{' '}
                  <span className="block text-yellow-300 xl:inline">actionable insights</span>
                </h1>
                <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover market opportunities, validate ideas, and understand your audience through AI-powered analysis of Reddit communities. Get comprehensive reports in minutes, not weeks.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href={getResearchLink()}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105"
                    >
                      {user ? 'Start Research' : 'Start Free Research'}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="/pricing"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 bg-opacity-30 hover:bg-opacity-40 md:py-4 md:text-lg md:px-10 transition-all duration-300"
                    >
                      View Pricing
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 flex items-center justify-center p-8">
          <div className="relative w-full h-full max-w-lg">
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 to-blue-500 rounded-2xl transform rotate-6 shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-2xl transform -rotate-6 shadow-2xl"></div>
            <div className="relative bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 h-full flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="bg-gray-100 rounded-lg p-4 h-full">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Market Research Report</div>
                      <div className="text-xs text-gray-500">Generated in 2 minutes</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">Opportunity Identified</div>
                          <div className="text-sm text-gray-600">Remote Work Productivity Tools</div>
                        </div>
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">High Potential</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="font-medium text-gray-900 mb-1">Key Insights</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Users struggle with task management in remote settings</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Integration with communication tools is critical</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="font-medium text-blue-900 mb-1">Recommended Action</div>
                      <p className="text-sm text-blue-800">Develop an AI-powered task manager with Slack integration targeting remote teams.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gradient-to-br from-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Powerful Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for market research
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              From discovery to insights, our platform handles the entire research workflow automatically.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl blur-sm"
                      style={{
                        background: `linear-gradient(45deg, ${index % 2 === 0 ? '#3b82f6, #8b5cf6' : '#10b981, #f59e0b'})`
                      }}
                    ></div>
                    <div className="relative bg-white rounded-2xl shadow-lg p-6 h-full border border-gray-100 hover:shadow-xl transition-all duration-300">
                      <div className={`flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-6`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">How it Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple 5-step process
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Transform Reddit discussions into actionable business insights in just minutes.
            </p>
          </div>

          <div className="mt-10">
            <div className="relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-12 left-12 right-12 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {steps.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.step} className="relative group">
                      <div className="flex flex-col items-center text-center">
                        <div className={`flex items-center justify-center h-16 w-16 rounded-2xl ${item.color} mb-4 group-hover:scale-110 transition-transform duration-300 z-10 relative`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 w-full transition-all duration-300 group-hover:shadow-xl">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-bold mb-3 mx-auto">
                            {item.step}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-extrabold text-blue-600 mb-2">10K+</div>
              <p className="text-gray-600">Research Projects</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-extrabold text-green-600 mb-2">500+</div>
              <p className="text-gray-600">Business Ideas Generated</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-extrabold text-purple-600 mb-2">98%</div>
              <p className="text-gray-600">User Satisfaction</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-extrabold text-amber-600 mb-2">15min</div>
              <p className="text-gray-600">Average Report Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real Reviews Section */}
      {reviews.length > 0 && (
        <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-16">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Real User Reviews</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                What our users say
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Hear from entrepreneurs and businesses who have used IdeaCompass
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {reviews.map((review, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                      <div className="ml-4">
                        <h4 className="font-bold text-gray-900">User {index + 1}</h4>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{review.comment || "No comment provided."}</p>
                    <div className="text-sm text-gray-500">
                      {review.satisfactionFactors && review.satisfactionFactors.length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium">Satisfied with:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {review.satisfactionFactors.map((factor: string, idx: number) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {factor}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link 
                  href="/add-review" 
                  className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Add Your Review
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section - Only show if no reviews yet */}
      {reviews.length === 0 && (
        <div className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Be the first to share your experience</span>
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-blue-100">
              After completing your research, share your feedback to help others discover IdeaCompass
            </p>
            <div className="mt-8">
              <Link
                href={getResearchLink()}
                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {user ? 'Start Research' : 'Start Free Research'}
                <Rocket className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced CTA Section */}
      <div className="relative py-16 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-10 left-1/2 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
              <span className="block">Transform ideas into reality</span>
              <span className="block text-yellow-300 mt-2">Start your free research today</span>
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-blue-100">
              Join thousands of entrepreneurs and businesses who trust IdeaCompass for their market insights.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href={getResearchLink()}
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {user ? 'Start Research' : 'Start Free Research'}
                <Rocket className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href={getDemoLink()}
                className="inline-flex items-center justify-center px-8 py-4 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:bg-opacity-10 transition-all duration-300"
              >
                {user ? 'Try Live Demo' : 'View Plans'}
                <Zap className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center text-blue-200">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>{user ? 'Ready to research' : '3 free research credits'}</span>
              <span className="mx-2">•</span>
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>{user ? 'Start immediately' : 'No credit card required'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}