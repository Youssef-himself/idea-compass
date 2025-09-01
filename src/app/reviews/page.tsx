'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ArrowLeft, Send, Calendar, User } from 'lucide-react';
import Link from 'next/link';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    function: '',
    rating: 0,
    comment: '',
    satisfactionFactors: [] as string[],
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load reviews from localStorage on component mount
  useEffect(() => {
    const storedReviews = localStorage.getItem('reviews');
    if (storedReviews) {
      try {
        const parsedReviews = JSON.parse(storedReviews);
        setReviews(parsedReviews.reverse());
      } catch (e) {
        console.error('Failed to parse reviews', e);
        setReviews([]);
      }
    }
  }, []);

  const satisfactionOptions = [
    { id: 'accuracy', label: 'Accuracy of Analysis' },
    { id: 'speed', label: 'Speed of Processing' },
    { id: 'insights', label: 'Quality of Insights' },
    { id: 'interface', label: 'User Interface' },
    { id: 'report', label: 'Report Quality' },
    { id: 'features', label: 'Feature Completeness' },
  ];

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create new review object
      const reviewData = {
        id: Date.now().toString(),
        name: newReview.name,
        function: newReview.function,
        rating: newReview.rating,
        satisfactionFactors: newReview.satisfactionFactors,
        comment: newReview.comment,
        timestamp: new Date().toISOString(),
      };

      // Store in localStorage
      const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
      const updatedReviews = [reviewData, ...existingReviews];
      localStorage.setItem('reviews', JSON.stringify(updatedReviews));

      // Update state
      setReviews(updatedReviews);
      setNewReview({
        name: '',
        function: '',
        rating: 0,
        comment: '',
        satisfactionFactors: [],
      });
      setShowAddReview(false);

      // Show success message
      alert('Thank you for your review!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSatisfactionFactor = (factorId: string) => {
    setNewReview(prev => ({
      ...prev,
      satisfactionFactors: prev.satisfactionFactors.includes(factorId)
        ? prev.satisfactionFactors.filter(id => id !== factorId)
        : [...prev.satisfactionFactors, factorId]
    }));
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Client Reviews</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our users say about IdeaCompass and share your own experience
          </p>
        </div>

        {/* Add Review Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={() => setShowAddReview(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Send className="w-5 h-5 mr-2" />
            Add Your Review
          </button>
        </div>

        {/* Add Review Form */}
        {showAddReview && (
          <div className="mb-12 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Share Your Experience</h2>
                <button
                  onClick={() => setShowAddReview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-8">
                {/* Name and Function Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={newReview.name}
                      onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="function" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Function/Role (Optional)
                    </label>
                    <input
                      type="text"
                      id="function"
                      value={newReview.function}
                      onChange={(e) => setNewReview({...newReview, function: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., Product Manager, Startup Founder"
                    />
                  </div>
                </div>

                {/* Rating Section */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Overall Rating</h3>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-12 h-12 ${
                            star <= (hoverRating || newReview.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-lg font-medium text-gray-900">
                      {newReview.rating > 0 ? `${newReview.rating} Star${newReview.rating > 1 ? 's' : ''}` : 'Select Rating'}
                    </span>
                  </div>
                </div>

                {/* Satisfaction Factors */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    What made you satisfied/not satisfied?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Select all that apply to help us understand your experience better
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {satisfactionOptions.map((option) => {
                      const isSelected = newReview.satisfactionFactors.includes(option.id);
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
                              <ThumbsUp className="w-5 h-5" />
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Comments</h3>
                  <p className="text-gray-600 mb-4">
                    Share any specific feedback or suggestions for improvement
                  </p>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Tell us what you liked or what we can improve..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || newReview.rating === 0}
                    className={`px-8 py-4 rounded-xl font-medium text-white flex items-center transition-all ${
                      isSubmitting || newReview.rating === 0
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
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What Our Clients Say <span className="text-blue-600">({reviews.length} Reviews)</span>
            </h2>

            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600 mb-6">Be the first to share your experience with IdeaCompass</p>
                <button
                  onClick={() => setShowAddReview(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Add Your Review
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center mr-4">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {review.name || 'Anonymous User'}
                          </h4>
                          {review.function && (
                            <p className="text-sm text-gray-600">{review.function}</p>
                          )}
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(review.timestamp)}
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-gray-700 mb-4">{review.comment}</p>
                    )}

                    {review.satisfactionFactors && review.satisfactionFactors.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Satisfied with:</h5>
                        <div className="flex flex-wrap gap-2">
                          {review.satisfactionFactors.map((factor: string, idx: number) => {
                            const factorLabel = satisfactionOptions.find(opt => opt.id === factor)?.label || factor;
                            return (
                              <span 
                                key={idx} 
                                className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                              >
                                {factorLabel}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}