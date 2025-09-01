'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, Shield, Eye, Lock, Users, FileText, Calendar, Mail } from 'lucide-react';

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string>('introduction');

  const sections = [
    { id: 'introduction', title: '1. Introduction', icon: Shield },
    { id: 'information-collection', title: '2. Information We Collect', icon: Eye },
    { id: 'information-use', title: '3. How We Use Your Information', icon: Users },
    { id: 'data-sharing', title: '4. Data Sharing and Disclosure', icon: FileText },
    { id: 'reddit-data', title: '5. Reddit Data', icon: BarChart3 },
    { id: 'data-security', title: '6. Data Security', icon: Lock },
    { id: 'data-retention', title: '7. Data Retention', icon: Calendar },
    { id: 'your-rights', title: '8. Your Rights', icon: Users },
    { id: 'contact', title: '13. Contact Us', icon: Mail }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-blue-200 mr-3" />
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your privacy is our priority. Learn how we collect, use, and protect your information.
            </p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-800 rounded-lg">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">Last Updated: January 1, {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Table of Contents - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Contents
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        <span className="truncate">{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="prose prose-lg max-w-none p-8">
                <section id="introduction" className="mb-12">
                  <div className="flex items-center mb-4">
                    <Shield className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">1. Introduction</h2>
                  </div>
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                    <p className="text-blue-800 m-0">
                      IdeaCompass ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                      explains how we collect, use, disclose, and safeguard your information when you use our market 
                      research platform and services.
                    </p>
                  </div>
                </section>

                <section id="information-collection" className="mb-12">
                  <div className="flex items-center mb-4">
                    <Eye className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">2. Information We Collect</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                      <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Information You Provide
                      </h3>
                      <ul className="space-y-2 text-green-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Account information (name, email, company details)
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Research keywords and project data
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Uploaded CSV files and data
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Payment information (processed by third-party providers)
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Communication with our support team
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                      <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Automatically Collected Information
                      </h3>
                      <ul className="space-y-2 text-purple-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Usage data and analytics
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          IP address and device information
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Browser type and version
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Cookies and similar technologies
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="information-use" className="mb-12">
                  <div className="flex items-center mb-4">
                    <Users className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">3. How We Use Your Information</h2>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <p className="text-blue-800 mb-4">We use your information to:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        'Provide and improve our services',
                        'Process your research requests',
                        'Generate market research reports',
                        'Send service-related communications',
                        'Provide customer support',
                        'Ensure platform security',
                        'Comply with legal obligations'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-blue-800">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section id="data-sharing" className="mb-12">
                  <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">4. Data Sharing and Disclosure</h2>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <Lock className="w-6 h-6 text-red-600 mr-2" />
                      <p className="text-red-800 font-semibold m-0">We do not sell your personal information.</p>
                    </div>
                    <p className="text-red-700 mb-4">We may share information in these circumstances:</p>
                    <ul className="space-y-2">
                      {[
                        'With service providers who assist in our operations',
                        'When required by law or legal process',
                        'To protect our rights and safety',
                        'With your consent'
                      ].map((item, index) => (
                        <li key={index} className="flex items-start text-red-700">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section id="reddit-data" className="mb-12">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">5. Reddit Data</h2>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
                    <p className="text-orange-800">
                      Our platform analyzes publicly available Reddit content. We do not collect personal information 
                      from Reddit users. All Reddit data is processed in compliance with Reddit's Terms of Service 
                      and API guidelines.
                    </p>
                  </div>
                </section>

                <section id="data-security" className="mb-12">
                  <div className="flex items-center mb-4">
                    <Lock className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">6. Data Security</h2>
                  </div>
                  <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                    <p className="text-green-800">
                      We implement appropriate security measures to protect your information, including encryption, 
                      secure servers, and access controls. However, no method of transmission over the internet 
                      is 100% secure.
                    </p>
                  </div>
                </section>

                <section id="data-retention" className="mb-12">
                  <div className="flex items-center mb-4">
                    <Calendar className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">7. Data Retention</h2>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                    <p className="text-gray-800">
                      We retain your information for as long as necessary to provide services, comply with legal 
                      obligations, and resolve disputes. Research data is typically retained for 90 days unless 
                      you request deletion.
                    </p>
                  </div>
                </section>

                <section id="your-rights" className="mb-12">
                  <div className="flex items-center mb-4">
                    <Users className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">8. Your Rights</h2>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                    <p className="text-blue-800 mb-4">You have the right to:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        'Access your personal information',
                        'Correct inaccurate data',
                        'Delete your account and data',
                        'Export your data',
                        'Opt out of marketing communications'
                      ].map((right, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-blue-800">{right}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Additional Sections - Condensed */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Cookies</h3>
                    <p className="text-gray-700 text-sm">
                      We use cookies to improve your experience, analyze usage, and provide personalized content. 
                      You can control cookies through your browser settings.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">10. International Transfers</h3>
                    <p className="text-gray-700 text-sm">
                      Your information may be transferred to and processed in countries other than your own. 
                      We ensure appropriate safeguards are in place for such transfers.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">11. Children's Privacy</h3>
                    <p className="text-gray-700 text-sm">
                      Our services are not intended for children under 13. We do not knowingly collect personal 
                      information from children under 13.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">12. Changes to This Policy</h3>
                    <p className="text-gray-700 text-sm">
                      We may update this Privacy Policy periodically. We will notify you of significant changes 
                      via email or through our platform.
                    </p>
                  </div>
                </div>

                <section id="contact" className="mb-8">
                  <div className="flex items-center mb-6">
                    <Mail className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">13. Contact Us</h2>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-8 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Privacy Questions?</h3>
                        <p className="text-blue-800 mb-4">
                          If you have questions about this Privacy Policy or data practices, we're here to help.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center text-blue-700">
                            <Mail className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">privacy@ideacompass.com</span>
                          </div>
                          <div className="flex items-start text-blue-700">
                            <BarChart3 className="w-4 h-4 mr-2 mt-0.5" />
                            <span className="text-sm">123 Innovation Drive, San Francisco, CA 94105</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <Link 
                          href="/contact" 
                          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          <Mail className="w-5 h-5 mr-2" />
                          Contact Privacy Team
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}