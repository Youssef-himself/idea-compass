'use client';

import Link from 'next/link';
import { BarChart3, Users, Target, Lightbulb, Rocket, Zap, Brain, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Youssef ALAOUI",
      role: "Founder & CEO",
      bio: "Former product lead at tech startups with a passion for market research innovation."
    },
    {
      name: "Sarah Chen",
      role: "Head of AI Research",
      bio: "PhD in Machine Learning with expertise in natural language processing."
    },
    {
      name: "Michael Rodriguez",
      role: "Engineering Lead",
      bio: "Full-stack developer with 10+ years building scalable data platforms."
    }
  ];

  const stats = [
    { value: "10K+", label: "Research Projects" },
    { value: "500+", label: "Business Ideas Generated" },
    { value: "98%", label: "User Satisfaction" },
    { value: "15s", label: "Avg. Report Time" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                <BarChart3 className="w-14 h-14 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
              About IdeaCompass
            </h1>
            <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
              We're on a mission to democratize market research by making it accessible, 
              affordable, and powered by AI.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/research"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Research
                <Rocket className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section with Vibrant Colors */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Mission</h2>
            <h3 className="mt-2 text-4xl font-extrabold text-gray-900">
              Empowering better decisions through data
            </h3>
            <p className="mt-4 max-w-3xl text-xl text-gray-600 mx-auto">
              Market research shouldn't be expensive, time-consuming, or limited to large corporations. 
              We believe every entrepreneur, startup, and business should have access to powerful insights 
              that help them make better decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transform hover:scale-[1.02] transition-all duration-300">
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h4>
              <p className="text-gray-600 mb-6">
                We envision a world where every business, regardless of size, has access to the same 
                powerful market intelligence that was once reserved for Fortune 500 companies.
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                <Zap className="w-5 h-5 mr-2" />
                <span>Democratizing Market Intelligence</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
              <h4 className="text-2xl font-bold mb-4">Our Approach</h4>
              <p className="mb-6 opacity-90">
                By combining cutting-edge AI with intuitive design, we make complex market research 
                simple, fast, and actionable for everyone.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>AI-Powered Analysis</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Real-time Insights</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Actionable Recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section with Timeline */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Story</h2>
              <h3 className="mt-2 text-4xl font-extrabold text-gray-900 mb-6">
                Born from frustration
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                IdeaCompass was born out of our own frustration with traditional market research. 
                As entrepreneurs and product managers, we repeatedly faced the same challenges:
              </p>
              
              <div className="space-y-6">
                <div className="flex group">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-900">Identifying the Problem</h4>
                    <p className="mt-2 text-gray-600">
                      Traditional market research was too expensive for small teams and took weeks to complete, often delivering outdated insights.
                    </p>
                  </div>
                </div>
                
                <div className="flex group">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-900">Developing the Solution</h4>
                    <p className="mt-2 text-gray-600">
                      We began developing our AI-powered platform to automate and accelerate market research, making it accessible to everyone.
                    </p>
                  </div>
                </div>
                
                <div className="flex group">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-900">Bringing It to Market</h4>
                    <p className="mt-2 text-gray-600">
                      IdeaCompass launched to the public, helping businesses make better decisions faster with real-time insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">The IdeaCompass Team</h4>
                    <p className="text-sm text-gray-500">Founder</p>
                  </div>
                </div>
                <blockquote className="text-xl text-gray-800 italic mb-6">
                  "There had to be a better way to understand our market and validate our ideas quickly and affordably."
                </blockquote>
                <p className="text-gray-600">
                  Today, we're proud to serve thousands of entrepreneurs and businesses worldwide, 
                  helping them uncover opportunities and make data-driven decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Founder & CEO Message</h2>
            <h3 className="mt-2 text-4xl font-extrabold text-gray-900">
              Youssef ALAOUI
            </h3>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
              Founder and CEO of IdeaCompass
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-6">
                  <span className="text-3xl font-bold text-white">YA</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">Youssef ALAOUI</h4>
                  <p className="text-blue-600 font-medium">Founder & CEO</p>
                </div>
              </div>
              <blockquote className="text-xl text-gray-800 italic mb-6">
                "As an industrial engineer turned entrepreneur, I've always been fascinated by the intersection of technology, process optimization, and human behavior. My journey from the factory floor to founding IdeaCompass was driven by a desire to solve real-world problems through innovative solutions. The motivation behind IdeaCompass came from my own struggles in traditional market research - spending weeks gathering insights that were often outdated by the time they were analyzed. I believed there had to be a better way to understand markets and validate ideas quickly and affordably."
              </blockquote>
              <p className="text-gray-600 mb-4">
                My engineering background taught me the importance of systematic approaches to problem-solving. At IdeaCompass, we apply these same principles to market research - creating efficient processes that deliver accurate insights. The impact of engineering thinking on our platform is evident in how we've automated complex data collection and analysis workflows, reducing what used to take weeks into minutes.
              </p>
              <p className="text-gray-600">
                Today, as CEO, I'm passionate about democratizing market research. Our mission is to make powerful insights accessible to all businesses, regardless of their size. With our platform, we transform online discussions into concrete business opportunities, enabling entrepreneurs and startups to make informed decisions quickly and efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section with Cards */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl mb-6">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Values</h2>
            <h3 className="mt-2 text-4xl font-extrabold text-gray-900">
              What drives us forward
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-700">
                We constantly push the boundaries of what's possible with AI and data analysis 
                to provide insights that were previously impossible to obtain.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Accessibility</h3>
              <p className="text-gray-700">
                Market research should be available to everyone, not just Fortune 500 companies. 
                We make powerful tools accessible to businesses of all sizes.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Accuracy</h3>
              <p className="text-gray-700">
                We're committed to providing accurate, reliable insights that you can trust 
                to make important business decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Technology</h2>
            <h3 className="mt-2 text-4xl font-extrabold text-gray-900">
              AI-powered insights at scale
            </h3>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
              We combine the latest advances in artificial intelligence with robust data collection 
              to deliver insights that are both deep and actionable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Smart Data Collection</h3>
              </div>
              <p className="text-gray-600">
                Our algorithms automatically identify the most relevant communities and conversations, 
                filtering noise to focus on signals that matter for your research.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">AI Business Analysis</h3>
              </div>
              <p className="text-gray-600">
                We use state-of-the-art natural language processing to transform discussions into actionable business opportunities with detailed market analysis and feasibility assessments.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Real-time Processing</h3>
              </div>
              <p className="text-gray-600">
                Our platform processes data in real-time, so you get fresh insights that reflect 
                the current state of your market, not outdated snapshots.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Business Opportunity Reports</h3>
              </div>
              <p className="text-gray-600">
                We don't just give you data – we provide detailed business plans with market potential scores, feasibility assessments, and concrete action steps you can implement immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with Vibrant Gradient */}
      <div className="relative py-20 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-6">
            Ready to experience the future of market research?
          </h2>
          <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto mb-10">
            Join thousands of entrepreneurs and businesses who trust IdeaCompass for their market insights.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/research"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Your Research Today
              <Rocket className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:bg-opacity-10 transition-all duration-300"
            >
              Watch Demo
              <Zap className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}