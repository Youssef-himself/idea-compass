// Core data types for IdeaCompass

export interface SearchFilters {
  postType: 'new' | 'top' | 'hot';
  timeRange: 'day' | 'week' | 'month' | 'year' | 'all';
  minScore: number;
  includeComments: boolean;
  excludeNSFW: boolean;
}

export interface SubredditMetadata {
  id: string;
  name: string;
  displayName: string;
  description: string;
  subscribers: number;
  activeUsers: number;
  postsPerDay: number;
  commentsPerDay: number;
  relevanceScore: number;
  qualityIndicator: 'high' | 'medium' | 'low';
  tags: string[];
  rules: string[];
  lastUpdated: Date;
}

export interface RedditPost {
  id: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  score: number;
  upvoteRatio: number;
  numComments: number;
  createdAt: Date;
  url: string;
  permalink: string;
  flair?: string;
  isNSFW: boolean;
  isStickied: boolean;
  comments?: RedditComment[];
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  depth: number;
  createdAt: Date;
  parentId?: string;
  replies?: RedditComment[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  postCount: number;
  percentage: number;
  confidence: number;
  samplePosts: RedditPost[];
  tags: string[];
  selected?: boolean;
}

export interface ScrapingProgress {
  subreddit: string;
  totalPosts: number;
  processedPosts: number;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  errors: string[];
  startTime: Date;
  endTime?: Date;
}

export interface AnalysisConfig {
  selectedCategories: string[];
  analysisType: 'sentiment' | 'trend' | 'competitive' | 'comprehensive';
  outputFormat: 'executive' | 'detailed' | 'technical';
  customPrompt?: string;
  businessContext?: string;
  researchGoals: string[];
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  insights: string[];
  evidence: RedditPost[];
  confidence: number;
  tags: string[];
}

export interface BusinessIdea {
  id: string;
  title: string;
  description: string;
  selected?: boolean;
}

export interface BusinessPlan {
  id: string;
  title: string;
  coreProblem: string;
  proposedSolution: string;
  targetAudience: string;
  keyFeatures: string[];
  marketPotential: number;
  feasibility: number;
  monetization: string;
  actionPlan: string;
}

export interface GeneratedReport {
  id: string;
  title: string;
  executiveSummary: string;
  keyFindings: string[];
  sections: ReportSection[];
  businessPlans: BusinessPlan[];
  metadata: {
    totalPosts: number;
    totalSubreddits: number;
    analysisDate: Date;
    processingTime: number;
    totalIdeas: number;
    selectedIdeas: number;
  };
  recommendations: string[];
  sourceCitation: string[];
}

export interface ResearchSession {
  id: string;
  userId?: string;
  keywords: string[];
  filters: SearchFilters;
  discoveredSubreddits: SubredditMetadata[];
  selectedSubreddits: string[];
  scrapedData: RedditPost[];
  businessIdeas: BusinessIdea[];
  businessPlans: BusinessPlan[];
  report?: GeneratedReport;
  status: 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

// Upload data types for "Bring Your Own Data" feature
export interface UploadedData {
  id: string;
  filename: string;
  size: number;
  uploadedAt: Date;
  columns: string[];
  rowCount: number;
  preview: Record<string, any>[];
  columnMapping: Record<string, string>;
}

// Enhanced CSV Upload and Data Analysis Types
export interface CSVColumn {
  name: string;
  type: 'text' | 'number' | 'date' | 'url' | 'category';
  sampleValues: string[];
  mappedTo?: 'title' | 'content' | 'author' | 'score' | 'date' | 'url' | 'category' | 'ignore';
  required?: boolean;
}

export interface CSVData {
  id: string;
  filename: string;
  headers: string[];
  rows: Record<string, any>[];
  columns: CSVColumn[];
  totalRows: number;
  uploadedAt: Date;
  processedAt?: Date;
  validationErrors?: string[];
}

export interface CSVMapping {
  title?: string;    // Required - maps to post title
  content?: string;  // Optional - maps to post content/body
  author?: string;   // Optional - maps to author/source
  score?: string;    // Optional - maps to engagement/score
  date?: string;     // Optional - maps to creation date
  url?: string;      // Optional - maps to source URL
  category?: string; // Optional - maps to predefined category
}

export interface ExternalDataSource {
  id: string;
  type: 'csv_upload' | 'reddit_scrape';
  name: string;
  description: string;
  dataCount: number;
  csvData?: CSVData;
  redditData?: RedditPost[];
  createdAt: Date;
  processedData?: RedditPost[]; // Converted to standard format
}

export interface DataImportProgress {
  stage: 'uploading' | 'parsing' | 'mapping' | 'processing' | 'completed' | 'error';
  progress: number; // 0-100
  message: string;
  errors?: string[];
  processedRows?: number;
  totalRows?: number;
}

export interface DataSourceOption {
  id: 'reddit' | 'csv_upload';
  name: string;
  description: string;
  icon: string;
  features: string[];
  limitations?: string[];
}

// Step-specific props
export interface Step1Props {
  onNext: (keywords: string[], filters: SearchFilters) => void;
  initialKeywords?: string[];
  initialFilters?: SearchFilters;
}

export interface Step2Props {
  subreddits: SubredditMetadata[];
  onNext: (selectedSubreddits: string[]) => void;
  onBack: () => void;
  selectedSubreddits?: string[];
}

export interface Step3Props {
  selectedSubreddits: string[];
  keywords: string[];
  onNext: (scrapedData: RedditPost[]) => void;
  onBack: () => void;
  onExportData: (data: RedditPost[]) => void;
}

export interface Step4Props {
  scrapedData: RedditPost[];
  onNext: (businessPlans: BusinessPlan[]) => void;
  onBack: () => void;
  sessionId: string;
}

export interface Step5Props {
  posts: RedditPost[];
  businessPlans: BusinessPlan[];
  keywords: string[];
  sessionId: string;
  onBack: () => void;
  onExportReport: (format: 'pdf' | 'docx' | 'html' | 'json' | 'csv') => void;
  onStartNew: () => void;
}

// Utility types
export type StepNumber = 1 | 2 | 3 | 4 | 5;

export interface StepConfig {
  number: StepNumber;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isAccessible: boolean;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ProcessingError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}