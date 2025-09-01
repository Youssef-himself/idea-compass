'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, Scale, FileText, Users, Globe, Shield, DollarSign, Copyright, Calendar } from 'lucide-react';

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('acceptance');

  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms', icon: Scale },
    { id: 'service', title: 'Description of Service', icon: Globe },
    { id: 'accounts', title: 'User Accounts', icon: Users },
    { id: 'acceptable-use', title: 'Acceptable Use', icon: Shield },
    { id: 'data', title: 'Data and Content', icon: FileText },
    { id: 'payment', title: 'Subscription and Payment', icon: DollarSign },
    { id: 'ip', title: 'Intellectual Property', icon: Copyright },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Scale className="w-12 h-12 text-gray-300 mr-3" />
              <h1 className="text-4xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Please read these terms carefully before using our services.
            </p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-gray-600 rounded-lg">
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
                <section id="acceptance" className="mb-12">
                  <div className="flex items-center mb-4">
                    <Scale className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">1. Acceptance of Terms</h2>
                  </div>
                  <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-r-lg">
                    <p className="text-yellow-800 m-0">
                      By accessing or using IdeaCompass ("the Service"), you agree to be bound by these Terms of Service 
                      ("Terms"). If you do not agree to these Terms, please do not use the Service.
                    </p>
                  </div>
                </section>

                <section id="service" className="mb-12">
                  <div className="flex items-center mb-4">
                    <Globe className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">2. Description of Service</h2>
                  </div>
                  <p>
                    IdeaCompass is a market research platform that analyzes publicly available Reddit content to 
                    provide business insights, market trends, and competitive intelligence through AI-powered analysis.
                  </p>
                </section>

                <section id="accounts" className="mb-12">
                  <div className="flex items-center mb-4">
                    <Users className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">3. User Accounts</h2>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">3.1 Account Creation</h3>
                  <ul>
                    <li>You must provide accurate and complete information</li>
                    <li>You are responsible for maintaining account security</li>
                    <li>You must be at least 18 years old to use the Service</li>
                  </ul>
                  <h3 className="text-lg font-semibold text-gray-900">3.2 Account Responsibilities</h3>
                  <ul>
                    <li>You are responsible for all activities under your account</li>
                    <li>You must notify us immediately of any unauthorized use</li>
                    <li>You may not share your account credentials</li>
                  </ul>
                </section>

                <div className="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Questions About These Terms?</h3>
                  <p className="text-gray-600 mb-4">
                    If you have any questions about our Terms of Service, please don't hesitate to reach out.
                  </p>
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}