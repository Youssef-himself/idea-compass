'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ThumbsUp, ThumbsDown, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function AddReviewPage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [satisfactionFactors, setSatisfactionFactors] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [functionRole, setFunctionRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const satisfactionOptions = [
    { id: 'accuracy', label: 'Accuracy of Analysis', icon: ThumbsUp },
    { id: 'speed', label: 'Speed of Processing', icon: ThumbsUp },
    { id: 'insights', label: 'Quality of Insights', icon: ThumbsUp },
    { id: 'interface', label: 'User Interface', icon: ThumbsUp },
    { id: 'report', label: 'Report Quality', icon: ThumbsUp },
    { id: 'features', label: 'Feature Completeness', icon: ThumbsUp },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real implementation, you would send this data to your backend
      const reviewData = {
        id: Date.now().toString(),
        name,
        function: functionRole,
        rating,
        satisfactionFactors,
        comment,
        timestamp: new Date().toISOString(),
      };

      // Store in localStorage for demo purposes
      const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
      existingReviews.push(reviewData);
      localStorage.setItem('reviews', JSON.stringify(existingReviews));

      // Redirect to home page with success message
      router.push('/?reviewSubmitted=true');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSatisfactionFactor = (factorId: string) => {
    setSatisfactionFactors(prev => 
      prev.includes(factorId)
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Experience</h1>
              <p className="text-gray-600">
                Help us improve by sharing your feedback about your research experience
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name and Function Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="function" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Function/Role (Optional)
                  </label>
                  <input
                    type="text"
                    id="function"
                    value={functionRole}
                    onChange={(e) => setFunctionRole(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., Product Manager, Startup Founder"
                  />
                </div>
              </div>

              {/* Rating Section */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Rating</h2>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-12 h-12 ${
                          star <= (hoverRating || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2">
                  <span className="text-lg font-medium text-gray-900">
                    {rating > 0 ? `${rating} Star${rating > 1 ? 's' : ''}` : 'Select Rating'}
                  </span>
                </div>
              </div>

              {/* Satisfaction Factors */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  What made you satisfied/not satisfied?
                </h2>
                <p className="text-gray-600 mb-6">
                  Select all that apply to help us understand your experience better
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {satisfactionOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = satisfactionFactors.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleSatisfactionFactor(option.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`mr-3 p-2 rounded-lg ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-medium text-gray-900">{option.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Comments</h2>
                <p className="text-gray-600 mb-4">
                  Share any specific feedback or suggestions for improvement
                </p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Tell us what you liked or what we can improve..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className={`px-8 py-4 rounded-xl font-medium text-white flex items-center transition-all ${
                    isSubmitting || rating === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}