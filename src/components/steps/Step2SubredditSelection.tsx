import { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Users, TrendingUp, Star, Filter, Search, Grid, List, Check, AlertCircle, Info, Eye, BarChart } from 'lucide-react';
import { Step2Props } from '@/types';
import StepNavigation from '@/components/ui/StepNavigation';

export default function Step2SubredditSelection({ 
  subreddits, 
  onNext, 
  onBack, 
  selectedSubreddits = [] 
}: Step2Props) {
  const [selected, setSelected] = useState<string[]>(selectedSubreddits);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'subscribers' | 'activity'>('relevance');
  const [filterBy, setFilterBy] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter and sort subreddits
  const filteredAndSortedSubreddits = useMemo(() => {
    let filtered = subreddits.filter(subreddit => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        subreddit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subreddit.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Quality filter
      const matchesQuality = filterBy === 'all' || subreddit.qualityIndicator === filterBy;
      
      return matchesSearch && matchesQuality;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevanceScore - a.relevanceScore;
        case 'subscribers':
          return b.subscribers - a.subscribers;
        case 'activity':
          return b.activeUsers - a.activeUsers;
        default:
          return 0;
      }
    });

    return filtered;
  }, [subreddits, searchTerm, sortBy, filterBy]);

  const toggleSubreddit = (subredditName: string) => {
    console.log('Toggling subreddit:', subredditName, 'Currently selected:', selected);
    if (selected.includes(subredditName)) {
      setSelected(selected.filter(s => s !== subredditName));
    } else {
      setSelected([...selected, subredditName]);
    }
  };

  const selectAll = () => {
    setSelected(filteredAndSortedSubreddits.map(s => s.name));
  };

  const selectNone = () => {
    setSelected([]);
  };

  const selectByQuality = (quality: 'high' | 'medium') => {
    const qualitySubreddits = filteredAndSortedSubreddits
      .filter(s => s.qualityIndicator === quality)
      .map(s => s.name);
    setSelected([...new Set([...selected, ...qualitySubreddits])]);
  };

  const handleNext = () => {
    if (selected.length > 0) {
      onNext(selected);
    }
  };

  const selectedData = subreddits.filter(s => selected.includes(s.name));
  const totalSelectedSubscribers = selectedData.reduce((sum, s) => sum + s.subscribers, 0);
  const avgRelevanceScore = selectedData.length > 0 
    ? selectedData.reduce((sum, s) => sum + s.relevanceScore, 0) / selectedData.length 
    : 0;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        {/* Top Navigation */}
        <StepNavigation
          position="top"
          onBack={onBack}
          onNext={handleNext}
          backText="Back to Setup"
          nextText={`Continue to Data Collection (${selected.length} selected)`}
          nextDisabled={selected.length === 0}
        />

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Step 2: Select Subreddits
          </h2>
          <p className="text-lg text-gray-600">
            Choose the Reddit communities most relevant to your research goals
          </p>
        </div>

        {/* Discovery Summary */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Discovery Results</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Found:</span>
              <span className="ml-2 text-blue-700">{subreddits.length} communities</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Selected:</span>
              <span className="ml-2 text-blue-700">{selected.length} communities</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Total Reach:</span>
              <span className="ml-2 text-blue-700">{formatNumber(totalSelectedSubscribers)} users</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Avg Relevance:</span>
              <span className="ml-2 text-blue-700">{Math.round(avgRelevanceScore * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search communities by name or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="subscribers">Sort by Size</option>
              <option value="activity">Sort by Activity</option>
            </select>

            {/* Quality Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Quality</option>
              <option value="high">High Quality</option>
              <option value="medium">Medium Quality</option>
              <option value="low">Low Quality</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Quick select:</span>
            <button
              onClick={selectAll}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              All ({filteredAndSortedSubreddits.length})
            </button>
            <button
              onClick={selectNone}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              None
            </button>
            <button
              onClick={() => selectByQuality('high')}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            >
              High Quality
            </button>
            <button
              onClick={() => selectByQuality('medium')}
              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
            >
              Medium Quality
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-3 h-3 inline mr-1" />
              Advanced
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-3">Advanced Selection Criteria</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Minimum Subscribers</label>
                  <input type="number" className="w-full px-2 py-1 border rounded" placeholder="e.g., 1000" />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Minimum Relevance (%)</label>
                  <input type="number" className="w-full px-2 py-1 border rounded" placeholder="e.g., 50" min="0" max="100" />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Activity Level</label>
                  <select className="w-full px-2 py-1 border rounded">
                    <option value="any">Any Activity</option>
                    <option value="high">High Activity (&gt;100 users)</option>
                    <option value="medium">Medium Activity (10-100 users)</option>
                    <option value="low">Low Activity (&lt;10 users)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredAndSortedSubreddits.length} of {subreddits.length} communities
          {searchTerm && ` matching "${searchTerm}"`}
        </div>

        {/* Subreddit Grid/List */}
        <div className={`mb-8 ${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'space-y-3'
        }`}>
          {filteredAndSortedSubreddits.map((subreddit) => {
            const isSelected = selected.includes(subreddit.name);
            
            if (viewMode === 'list') {
              return (
                <div
                  key={subreddit.id}
                  className={`
                    flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                  onClick={() => toggleSubreddit(subreddit.name)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                      ${isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                      }
                    `}>
                      {isSelected && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">r/{subreddit.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(subreddit.qualityIndicator)}`}>
                          {subreddit.qualityIndicator}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {subreddit.description || 'No description available'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{formatNumber(subreddit.subscribers)}</span>
                      </div>
                      <div className="text-xs">subscribers</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{formatNumber(subreddit.activeUsers)}</span>
                      </div>
                      <div className="text-xs">active</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span>{Math.round(subreddit.relevanceScore * 100)}%</span>
                      </div>
                      <div className="text-xs">relevance</div>
                    </div>
                  </div>
                </div>
              );
            }

            // Grid view
            return (
              <div
                key={subreddit.id}
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all relative
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }
                `}
                onClick={() => toggleSubreddit(subreddit.name)}
              >
                {/* Selection Indicator */}
                <div className={`
                  absolute top-3 right-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                  ${isSelected
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300'
                  }
                `}>
                  {isSelected && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Subreddit Header */}
                <div className="mb-3 pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">r/{subreddit.name}</h4>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(subreddit.qualityIndicator)}`}>
                    {subreddit.qualityIndicator} quality
                  </span>
                </div>
                
                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                  {subreddit.description || 'No description available'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-3 h-3" />
                      <span className="font-medium">{formatNumber(subreddit.subscribers)}</span>
                    </div>
                    <div>subscribers</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-medium">{formatNumber(subreddit.activeUsers)}</span>
                    </div>
                    <div>active users</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-3 h-3" />
                      <span className="font-medium">{Math.round(subreddit.relevanceScore * 100)}%</span>
                    </div>
                    <div>relevance</div>
                  </div>
                </div>

                {/* Tags */}
                {subreddit.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {subreddit.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {subreddit.tags.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        +{subreddit.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredAndSortedSubreddits.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find relevant communities.
            </p>
          </div>
        )}

        {/* Selection Summary */}
        {selected.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">
              Selection Summary ({selected.length} communities)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-800">Total Reach:</span>
                <span className="ml-2 text-green-700">{formatNumber(totalSelectedSubscribers)} users</span>
              </div>
              <div>
                <span className="font-medium text-green-800">Avg Relevance:</span>
                <span className="ml-2 text-green-700">{Math.round(avgRelevanceScore * 100)}%</span>
              </div>
              <div>
                <span className="font-medium text-green-800">Quality Mix:</span>
                <span className="ml-2 text-green-700">
                  {selectedData.filter(s => s.qualityIndicator === 'high').length}H / 
                  {selectedData.filter(s => s.qualityIndicator === 'medium').length}M / 
                  {selectedData.filter(s => s.qualityIndicator === 'low').length}L
                </span>
              </div>
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
            Back to Setup
          </button>
          
          <button
            onClick={handleNext}
            disabled={selected.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue to Data Collection ({selected.length} selected)
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Selection Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Choose communities with high relevance scores for better research quality</li>
            <li>• Mix large and small communities for diverse perspectives</li>
            <li>• Consider activity levels - more active communities provide fresher insights</li>
            <li>• Quality indicators help identify well-moderated, valuable communities</li>
            <li>• Aim for 3-8 communities for optimal analysis depth and breadth</li>
          </ul>
        </div>
      </div>
    </div>
  );
}