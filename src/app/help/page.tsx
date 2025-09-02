'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  BarChart3, 
  Search, 
  Download, 
  Brain, 
  FileText, 
  Upload, 
  Database, 
  Users, 
  TrendingUp, 
  Settings, 
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Book,
  Zap,
  Target,
  Play,
  ExternalLink,
  Filter,
  Shield,
  Crown,
  CreditCard,
  UserPlus,
  Bell
} from 'lucide-react';
import { PLAN_DETAILS, getFreeplan, getProPlan, getPremiumPlan } from '@/config/plans';

interface FeatureSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  steps: string[];
  tips: string[];
}

interface FAQ {
  question: string;
  answer: string;
}

export default function HelpPage() {
  const [expandedSection, setExpandedSection] = useState<string>('overview');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  
  const freePlan = getFreeplan();
  const proPlan = getProPlan();
  const premiumPlan = getPremiumPlan();

  const featureSections: FeatureSection[] = [
    {
      id: 'account-setup',
      title: 'Account Setup & Plans',
      description: 'Create your account and choose the right subscription plan for your needs',
      icon: UserPlus,
      steps: [
        'Sign up with a professional email address (Gmail, Outlook, or company email)',
        'Verify your email address to activate your account',
        `Start with Free plan (${freePlan.credits} research credits - ${freePlan.dailyCreditLimit} credits replenish daily)`,
        `Upgrade to Pro (${proPlan.price}, ${proPlan.credits} credits) or Premium (${premiumPlan.price}, ${premiumPlan.credits} credits) as needed`,
        'Join the waitlist for paid plans during beta period'
      ],
      tips: [
        `Free plan gives you ${freePlan.credits} total credits with daily replenishment`,
        'Pro plan ideal for regular researchers and consultants',
        'Premium plan best for teams and heavy users',
        'Temporary/disposable emails are not allowed for security',
        `Credits reset monthly for Pro users, ${premiumPlan.credits} for Premium`
      ]
    },
    {
      id: 'research-setup',
      title: 'Research Setup',
      description: 'Configure your research parameters and choose your data source',
      icon: Settings,
      steps: [
        'Choose between Reddit Discovery or CSV Upload',
        'Enter relevant keywords for your research topic',
        'Configure search filters (time range, post type, minimum score)',
        'Set content preferences (include comments, exclude NSFW)',
        'Click "Discover Subreddits" or upload your CSV file'
      ],
      tips: [
        'Use specific, industry-relevant keywords for better results',
        'Combine broad and niche terms (e.g., "AI", "machine learning", "startup")',
        'CSV files should have columns: title, content, author, score, date',
        'Use "month" or "week" time range for trending discussions',
        'Each research session consumes 1 credit (except Premium users)'
      ]
    },
    {
      id: 'subreddit-selection',
      title: 'Subreddit Selection',
      description: 'Choose the most relevant Reddit communities for your research',
      icon: Users,
      steps: [
        'Review AI-discovered subreddits with relevance scores',
        'Use search and filters to find specific communities',
        'Check quality indicators (high, medium, low)',
        'Select communities with high relevance and activity',
        'Review total reach and average relevance score'
      ],
      tips: [
        'Focus on high-quality communities with active discussions',
        'Mix large and niche subreddits for diverse perspectives',
        'Check subscriber count and activity levels',
        'Select 5-15 subreddits for optimal data quality',
        'Free users can access basic discovery features'
      ]
    },
    {
      id: 'data-scraping',
      title: 'Data Collection',
      description: 'Automatically collect posts and comments from selected communities',
      icon: Download,
      steps: [
        'Review selected subreddits and collection settings',
        'Click "Start Data Collection" to begin scraping',
        'Monitor real-time progress and collection status',
        'Review collected posts with quality metrics',
        'Export raw data or proceed to AI analysis'
      ],
      tips: [
        'Collection typically takes 2-5 minutes per subreddit',
        'Quality scoring helps identify the most valuable posts',
        'Include comments for deeper insights into user needs',
        'Aim for 100-500 posts for comprehensive analysis',
        'Pro and Premium users get priority processing'
      ]
    },
    {
      id: 'ai-analysis',
      title: 'AI Business Analysis',
      description: 'Transform discussions into actionable business opportunities',
      icon: Brain,
      steps: [
        'Phase 1: AI identifies distinct business opportunities',
        'Review generated business ideas with descriptions',
        'Select 1-3 most promising ideas for detailed analysis (Free: 1 idea, Pro/Premium: unlimited)',
        'Phase 2: AI creates comprehensive business plans',
        'Review detailed plans with market analysis and features'
      ],
      tips: [
        'Phase 1 analysis takes 1-2 minutes to identify opportunities',
        'Free users can view 1 business idea, upgrade for more',
        'Select diverse ideas to explore different market angles',
        'Phase 2 provides market potential scores (1-10)',
        'Focus on ideas with high feasibility scores for solo founders'
      ]
    },
    {
      id: 'report-generation',
      title: 'Report Generation',
      description: 'Generate comprehensive reports with insights and recommendations',
      icon: FileText,
      steps: [
        'Configure analysis focus and selected categories',
        'Choose report sections and detail level',
        'Generate comprehensive business report',
        'Review executive summary and key insights',
        'Export to PDF or Word format'
      ],
      tips: [
        'Include executive summary for stakeholder presentations',
        'Market analysis section provides validation insights',
        'Action recommendations offer concrete next steps',
        'Export formats maintain professional formatting',
        'Premium users get advanced report customization'
      ]
    }
  ];

  const faqs: FAQ[] = [
    {
      question: "What subscription plans are available?",
      answer: `IdeaCompass offers three plans: Free (${freePlan.credits} research credits with daily replenishment, perfect for trying the platform), Pro (${proPlan.price}, ${proPlan.credits} credits/month, ideal for regular researchers), and Premium (${premiumPlan.price}, ${premiumPlan.credits} credits, best for teams and heavy users). During beta, paid plans are available via waitlist.`
    },
    {
      question: "How do research credits work?",
      answer: `One (1) credit is consumed the moment you select a subreddit and proceed to the data scraping step. Actions like generating ideas or reports afterwards do not consume additional credits for the same research. Free users get ${freePlan.credits} total credits with ${freePlan.dailyCreditLimit} replenishing daily. Pro users get ${proPlan.credits} credits per month. Premium users have ${premiumPlan.credits} credits. Credits reset monthly for Pro users.`
    },
    {
      question: "What data sources does IdeaCompass support?",
      answer: "IdeaCompass supports two main data sources: Reddit Discovery (automatically finds and scrapes relevant subreddits) and CSV Upload (analyze your own data). For CSV uploads, ensure your file has columns for title, content, author, score, and date."
    },
    {
      question: "How do I join the waitlist for paid plans?",
      answer: "Click on any Pro or Premium plan button to join the waitlist. You'll be notified when payment processing is available. Currently, payment systems are temporarily disabled while we enhance the platform."
    },
    {
      question: "What's the difference between Free and Pro plans for AI analysis?",
      answer: "Free users can view 1 business idea from Phase 1 analysis and need to upgrade to see additional ideas. Pro and Premium users can view all generated business ideas and select multiple ideas for detailed business plan development."
    },
    {
      question: "How accurate is the AI business analysis?",
      answer: "Our AI analysis is trained on successful business patterns and market validation principles. The analysis identifies genuine user problems and needs from community discussions. However, all AI-generated insights should be validated through direct user research and market testing."
    },
    {
      question: "How long does the research process take?",
      answer: "A complete research session typically takes 15-30 minutes: Setup (2-3 min), Subreddit Selection (3-5 min), Data Collection (5-10 min), AI Analysis (3-5 min), and Report Generation (2-5 min). CSV uploads skip the discovery and collection phases."
    },
    {
      question: "Is there an admin system for managing the platform?",
      answer: "Yes, IdeaCompass includes a comprehensive admin system for platform management. Admin access is restricted to authorized personnel and includes user management, usage analytics, and system monitoring capabilities."
    },
    {
      question: "What makes a good research topic?",
      answer: "Good research topics are specific enough to find targeted communities but broad enough to discover opportunities. Focus on industries, technologies, or problems you're interested in. Examples: 'SaaS productivity tools', 'remote work challenges', 'e-commerce automation'."
    },
    {
      question: "Can I export and share my research results?",
      answer: "Yes! You can export reports in PDF or Word format for sharing with stakeholders. Raw data can also be exported as JSON for further analysis. All exports maintain professional formatting suitable for business presentations."
    },
    {
      question: "How do I interpret the business opportunity scores?",
      answer: "Market Potential (1-10): Size and demand for the opportunity. Feasibility (1-10): Technical and resource requirements for solo founders. Scores 7+ indicate strong opportunities worth deeper investigation."
    },
    {
      question: "What if I don't find relevant subreddits for my topic?",
      answer: "Try broader or alternative keywords, check spelling, or use CSV upload with your own data. Some niche topics may have limited Reddit presence. Consider adjacent communities or broader industry discussions."
    },
    {
      question: "How should I act on the business insights?",
      answer: "Start with the action plans provided in each business opportunity. Validate assumptions through direct user interviews, create landing pages to test demand, and build MVPs with the suggested core features. Always validate before building."
    },
    {
      question: "What data formats are supported for CSV upload?",
      answer: "CSV files should include columns for title, content, author, score, and date. The system automatically maps common column names. Maximum file size is 10MB with up to 10,000 rows for optimal performance."
    },
    {
      question: "Can I save and resume my research sessions?",
      answer: "Currently, research sessions are completed in one sitting. However, you can export data at any step and re-upload as CSV for future analysis. Your account dashboard tracks your usage and remaining credits."
    },
    {
      question: "What makes the AI analysis reliable?",
      answer: "Our AI is trained on successful business patterns, market validation frameworks, and startup methodologies. It analyzes genuine user discussions for authentic pain points. However, always validate insights with direct user research."
    },
    {
      question: "How does the free plan credit system work?",
      answer: `The free plan provides ${freePlan.credits} total research credits with a daily replenishment system. You get ${freePlan.dailyCreditLimit} credits back each day, up to a maximum of ${freePlan.credits} credits. This means you can conduct ${freePlan.dailyCreditLimit} research sessions daily, or save up credits for larger research projects when needed.`
    },
    {
      question: "What are the current subscription plan prices?",
      answer: `We offer three plans: Free (${freePlan.price} - ${freePlan.credits} credits with daily replenishment), Pro (${proPlan.price} - ${proPlan.credits} credits monthly), and Premium (${premiumPlan.price} - ${premiumPlan.credits} credits). During our beta period, paid plans are available via waitlist. All plans include full feature access with credit-based usage limits.`
    },
    {
      question: "How often should I conduct market research?",
      answer: "Quarterly research helps track market evolution and emerging trends. Research before major product decisions, when entering new markets, or when user feedback suggests changing needs. Stay connected to your target communities."
    },
    {
      question: "Is my account and research data secure?",
      answer: "Yes, IdeaCompass implements enterprise-grade security including encrypted data storage, secure authentication, input validation, and regular security audits. Your research data is private and never shared with third parties."
    }
  ];

  const quickStartSteps = [
    {
      step: 1,
      title: "Create Account",
      description: "Sign up and verify your professional email",
      time: "1-2 min"
    },
    {
      step: 2,
      title: "Setup Research",
      description: "Enter keywords and choose data source",
      time: "2-3 min"
    },
    {
      step: 3,
      title: "Select Communities",
      description: "Choose relevant subreddits or upload CSV",
      time: "3-5 min"
    },
    {
      step: 4,
      title: "Collect Data",
      description: "Automated data scraping",
      time: "5-10 min"
    },
    {
      step: 5,
      title: "AI Analysis",
      description: "Generate business opportunities",
      time: "3-5 min"
    },
    {
      step: 6,
      title: "Export Report",
      description: "Download professional insights",
      time: "2-5 min"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Book className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Help & Guide</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete guide to using IdeaCompass for market research and business opportunity discovery
          </p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => setExpandedSection('overview')}
              className={`p-4 rounded-lg text-left transition-all ${
                expandedSection === 'overview' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <Target className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold">Quick Start</h3>
              <p className="text-sm text-gray-600">Get started in 5 steps</p>
            </button>
            
            <button
              onClick={() => setExpandedSection('plans')}
              className={`p-4 rounded-lg text-left transition-all ${
                expandedSection === 'plans' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold">Plans & Credits</h3>
              <p className="text-sm text-gray-600">Subscription plans and usage</p>
            </button>
            
            <button
              onClick={() => setExpandedSection('features')}
              className={`p-4 rounded-lg text-left transition-all ${
                expandedSection === 'features' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <Zap className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold">Features Guide</h3>
              <p className="text-sm text-gray-600">Detailed feature walkthrough</p>
            </button>
            
            <button
              onClick={() => setExpandedSection('tips')}
              className={`p-4 rounded-lg text-left transition-all ${
                expandedSection === 'tips' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <HelpCircle className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold">Tips & Best Practices</h3>
              <p className="text-sm text-gray-600">Maximize your results</p>
            </button>
            
            <button
              onClick={() => setExpandedSection('faq')}
              className={`p-4 rounded-lg text-left transition-all ${
                expandedSection === 'faq' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <Circle className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold">FAQ</h3>
              <p className="text-sm text-gray-600">Common questions</p>
            </button>
            
            <button
              onClick={() => setExpandedSection('troubleshooting')}
              className={`p-4 rounded-lg text-left transition-all ${
                expandedSection === 'troubleshooting' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <HelpCircle className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold">Troubleshooting</h3>
              <p className="text-sm text-gray-600">Common issues & solutions</p>
            </button>
          </div>
        </div>

        {/* Quick Start Overview */}
        {expandedSection === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What is IdeaCompass?</h3>
                  <p className="text-gray-700 mb-4">
                    IdeaCompass transforms Reddit discussions into actionable business insights. Our AI-powered 
                    platform discovers market opportunities, validates ideas, and generates comprehensive 
                    business reports from community conversations.
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Secure authentication system</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Flexible subscription plans</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">AI-powered opportunity discovery</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Automated data collection</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Professional business reports</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Perfect For</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Entrepreneurs seeking market opportunities</li>
                    <li>• Product managers validating ideas</li>
                    <li>• Investors researching market trends</li>
                    <li>• Consultants gathering market intelligence</li>
                    <li>• Startups looking for product-market fit</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">5-Step Process</h3>
                </div>
                <div className="grid md:grid-cols-5 gap-4">
                  {quickStartSteps.map((step, index) => (
                    <div key={step.step} className="text-center">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                        {step.step}
                      </div>
                      <h4 className="font-medium text-blue-900 mb-1">{step.title}</h4>
                      <p className="text-sm text-blue-800 mb-2">{step.description}</p>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">{step.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/auth?redirect=research"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mr-4"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  View Plans
                  <Crown className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Plans & Credits Section */}
        {expandedSection === 'plans' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Subscription Plans & Credits</h2>
              
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {PLAN_DETAILS.map((plan, index) => (
                  <div key={plan.name} className={`border rounded-lg p-6 ${
                    plan.name === 'Pro' 
                      ? 'border-2 border-blue-500 relative' 
                      : plan.name === 'Premium' 
                      ? 'bg-purple-50' 
                      : ''
                  }`}>
                    {plan.name === 'Pro' && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Popular</span>
                      </div>
                    )}
                    <div className="text-center mb-6">
                      {plan.name === 'Premium' && (
                        <div className="flex items-center justify-center mb-2">
                          <Crown className="w-5 h-5 text-purple-600 mr-1" />
                          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        </div>
                      )}
                      {plan.name !== 'Premium' && (
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      )}
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {plan.price}
                        {plan.price !== 'Waitlist' && plan.price !== '€0' && <span className="text-sm text-gray-600">/month</span>}
                      </p>
                      <p className="text-gray-600">
                        {plan.name === 'Free' ? 'Perfect for trying out' : 
                         plan.name === 'Pro' ? 'For regular researchers' : 
                         'For teams & heavy users'}
                      </p>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link 
                      href={plan.name === 'Free' ? "/auth?plan=free" : `/waitlist?plan=${plan.name.toLowerCase()}`}
                      className={`w-full block text-center py-2 px-4 rounded-lg transition-colors ${
                        plan.name === 'Free' 
                          ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
                          : plan.name === 'Pro'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {plan.name === 'Free' ? 'Start Free' : 'Join Waitlist'}
                    </Link>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">How Credits Work</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Credit Consumption:</h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• <strong>1 Credit is used</strong> when you start data scraping for a chosen subreddit.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Included Actions (Do not cost extra credits):</h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• Generating a list of ideas from the scraped data.</li>
                      <li>• Generating a Lite Report for a chosen idea.</li>
                      <li>• Exporting the final Lite Report.</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium text-blue-900 mb-2">Actions Not Available on Free Plan:</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Uploading your own data files.</li>
                    <li>• Exporting the raw scraped data (CSV file).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Guide */}
        {expandedSection === 'features' && (
          <div className="space-y-6">
            {featureSections.map((section) => (
              <div key={section.id} className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <section.icon className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                  </div>
                  <p className="text-gray-600">{section.description}</p>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Step-by-Step Process</h4>
                      <ol className="space-y-3">
                        {section.steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Tips & Best Practices</h4>
                      <ul className="space-y-3">
                        {section.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips & Best Practices */}
        {expandedSection === 'tips' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Tips & Best Practices</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Research Strategy
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Start with broad keywords, then refine based on discovered communities</li>
                    <li>• Research complementary topics to find adjacent opportunities</li>
                    <li>• Use recent time ranges (week/month) for trending insights</li>
                    <li>• Include both problem-focused and solution-focused keywords</li>
                    <li>• Consider seasonal trends in your research timing</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600" />
                    Data Quality
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Focus on high-quality communities with active moderation</li>
                    <li>• Balance large and niche communities for diverse perspectives</li>
                    <li>• Include comments for deeper user sentiment analysis</li>
                    <li>• Set appropriate minimum scores to filter low-quality content</li>
                    <li>• Verify community relevance before including in analysis</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    AI Analysis
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Review Phase 1 opportunities carefully before selecting</li>
                    <li>• Choose diverse ideas to explore different market angles</li>
                    <li>• Pay attention to feasibility scores for resource planning</li>
                    <li>• Use market potential scores to prioritize opportunities</li>
                    <li>• Validate AI insights with additional research</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Reports & Next Steps
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Export reports for stakeholder presentations and documentation</li>
                    <li>• Focus on action plans for immediate next steps</li>
                    <li>• Use insights to create user interview questions</li>
                    <li>• Build landing pages to validate demand hypotheses</li>
                    <li>• Start with MVP features identified in business plans</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">🚀 Pro Tips for Success</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Research Multiple Topics</h4>
                  <p className="text-sm text-blue-800">Explore 3-5 different areas to find the best opportunities</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Validate Everything</h4>
                  <p className="text-sm text-blue-800">Use AI insights as starting points, not final decisions</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Act on Insights</h4>
                  <p className="text-sm text-blue-800">Follow action plans and build MVPs to test assumptions</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {expandedSection === 'faq' && (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === `faq-${index}` ? null : `faq-${index}`)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {expandedFAQ === `faq-${index}` ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFAQ === `faq-${index}` && (
                    <div className="p-4 pt-0 border-t border-gray-200">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Troubleshooting Section */}
        {expandedSection === 'troubleshooting' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Troubleshooting Guide</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-red-600" />
                    Discovery Issues
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-200 pl-4">
                      <h4 className="font-medium text-gray-900">No subreddits found</h4>
                      <p className="text-sm text-gray-600 mt-1">Try broader keywords, check spelling, or use different terms. Some topics may have limited Reddit presence.</p>
                    </div>
                    <div className="border-l-4 border-yellow-200 pl-4">
                      <h4 className="font-medium text-gray-900">Low relevance scores</h4>
                      <p className="text-sm text-gray-600 mt-1">Refine keywords to be more specific to your industry or use niche terminology your target audience uses.</p>
                    </div>
                    <div className="border-l-4 border-blue-200 pl-4">
                      <h4 className="font-medium text-gray-900">Discovery takes too long</h4>
                      <p className="text-sm text-gray-600 mt-1">Reduce the number of keywords or try again later. Heavy traffic can slow API responses.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-600" />
                    Data Collection Issues
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-200 pl-4">
                      <h4 className="font-medium text-gray-900">Collection fails or times out</h4>
                      <p className="text-sm text-gray-600 mt-1">Reduce the number of selected subreddits or try again later. Large communities may take longer to process.</p>
                    </div>
                    <div className="border-l-4 border-yellow-200 pl-4">
                      <h4 className="font-medium text-gray-900">Low quality posts collected</h4>
                      <p className="text-sm text-gray-600 mt-1">Increase minimum score filter, select high-quality communities, or adjust time range to recent periods.</p>
                    </div>
                    <div className="border-l-4 border-blue-200 pl-4">
                      <h4 className="font-medium text-gray-900">Not enough data collected</h4>
                      <p className="text-sm text-gray-600 mt-1">Select more subreddits, reduce filters, or extend time range. Some communities may have limited recent activity.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-green-600" />
                    AI Analysis Issues
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-200 pl-4">
                      <h4 className="font-medium text-gray-900">Analysis fails or produces poor results</h4>
                      <p className="text-sm text-gray-600 mt-1">Ensure you have quality data with at least 50-100 posts. Try different data or refine your collection criteria.</p>
                    </div>
                    <div className="border-l-4 border-yellow-200 pl-4">
                      <h4 className="font-medium text-gray-900">Generic or irrelevant business ideas</h4>
                      <p className="text-sm text-gray-600 mt-1">Your data may be too broad or off-topic. Focus on specific problems and communities related to your research goals.</p>
                    </div>
                    <div className="border-l-4 border-blue-200 pl-4">
                      <h4 className="font-medium text-gray-900">AI analysis takes too long</h4>
                      <p className="text-sm text-gray-600 mt-1">Phase 1 typically takes 1-2 minutes, Phase 2 takes 2-3 minutes. Refresh if it takes longer than 5 minutes.</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-purple-600" />
                    CSV Upload Issues
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-200 pl-4">
                      <h4 className="font-medium text-gray-900">CSV upload fails</h4>
                      <p className="text-sm text-gray-600 mt-1">Check file size (max 10MB), format (valid CSV), and ensure required columns exist (title, content).</p>
                    </div>
                    <div className="border-l-4 border-yellow-200 pl-4">
                      <h4 className="font-medium text-gray-900">Columns not mapped correctly</h4>
                      <p className="text-sm text-gray-600 mt-1">Use common column names: title, content, author, score, date. Check data preview before proceeding.</p>
                    </div>
                    <div className="border-l-4 border-blue-200 pl-4">
                      <h4 className="font-medium text-gray-900">Poor analysis results from CSV</h4>
                      <p className="text-sm text-gray-600 mt-1">Ensure your data contains meaningful discussions about problems, needs, or pain points rather than just announcements.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Still Need Help?</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <HelpCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-blue-900 mb-2">Check FAQ</h4>
                    <p className="text-sm text-blue-800">Common questions and detailed answers</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <ExternalLink className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-blue-900 mb-2">Contact Support</h4>
                    <p className="text-sm text-blue-800">Get personalized help from our team</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Play className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-blue-900 mb-2">Try Again</h4>
                    <p className="text-sm text-blue-800">Start a new research session with refined parameters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="bg-blue-600 rounded-lg p-8 text-center mt-12">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Your Research?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Transform Reddit discussions into actionable business insights with our AI-powered platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Start Research
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border border-blue-400 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Support
              <ExternalLink className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}