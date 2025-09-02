'use client';

import { X, Crown, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getProPlan } from '@/config/plans';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  description?: string;
}

export default function UpgradeModal({ isOpen, onClose, feature, description }: UpgradeModalProps) {
  if (!isOpen) return null;

  const proPlan = getProPlan();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        {/* Modal panel */}
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-white" />
                <h3 className="text-lg font-semibold text-white">Upgrade Required</h3>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                {feature}
              </h4>
              
              <p className="text-gray-600 mb-6">
                {description || 'This feature is available in our Pro and Premium plans. Upgrade now to unlock advanced research capabilities and unlimited access.'}
              </p>

              {/* Benefits */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h5 className="font-semibold text-blue-900 mb-2">Upgrade Benefits:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {proPlan.credits} research credits per month (Pro)</li>
                  <li>• Data Upload Support</li>
                  <li>• Multiple keyword support</li>
                  <li>• Analyze Multiple Subreddits</li>
                  <li>• Full Detailed Report Generation</li>
                  <li>• CSV Data Export</li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Maybe Later
                </button>
                <Link
                  href="/waitlist?plan=pro"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  onClick={onClose}
                >
                  Join Waitlist
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}