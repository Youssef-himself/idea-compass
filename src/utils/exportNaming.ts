/**
 * Utility functions for generating smart export filenames
 */

/**
 * Generates a smart filename for exported data files
 * Format: KeywordName_data_YYYY-MM-DD.extension
 * 
 * @param keywords - Array of research keywords
 * @param extension - File extension (pdf, docx, etc.)
 * @returns Formatted filename string
 */
export function generateSmartFilename(keywords: string[], extension: string): string {
  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Process keywords to create a clean filename
  let keywordPart = '';
  
  if (keywords.length === 0) {
    // Fallback if no keywords
    keywordPart = 'Research';
  } else if (keywords.length === 1) {
    // Single keyword - clean and capitalize
    keywordPart = cleanKeywordForFilename(keywords[0]);
  } else {
    // Multiple keywords - use the first one or create a combined name
    keywordPart = cleanKeywordForFilename(keywords[0]);
  }
  
  return `${keywordPart}_data_${currentDate}.${extension}`;
}

/**
 * Cleans and formats a keyword for use in filenames
 * - Removes special characters
 * - Converts to PascalCase
 * - Handles common abbreviations
 * 
 * @param keyword - Raw keyword string
 * @returns Cleaned keyword suitable for filename
 */
function cleanKeywordForFilename(keyword: string): string {
  // Handle common abbreviations and capitalize them properly
  const abbreviations = new Map([
    ['ai', 'AI'],
    ['ml', 'ML'],
    ['saas', 'SaaS'],
    ['api', 'API'],
    ['ui', 'UI'],
    ['ux', 'UX'],
    ['seo', 'SEO'],
    ['crm', 'CRM'],
    ['erp', 'ERP'],
    ['iot', 'IoT'],
    ['ar', 'AR'],
    ['vr', 'VR'],
    ['b2b', 'B2B'],
    ['b2c', 'B2C'],
  ]);
  
  // Split by spaces and non-alphanumeric characters
  const words = keyword
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, ' ') // Replace special chars with spaces
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 0); // Remove empty strings
  
  // Process each word
  const processedWords = words.map(word => {
    // Check if it's a known abbreviation
    if (abbreviations.has(word)) {
      return abbreviations.get(word)!;
    }
    
    // Capitalize first letter, keep rest lowercase
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  // Join words together (PascalCase style)
  return processedWords.join('');
}

/**
 * Generates a fallback filename when smart naming fails
 * 
 * @param extension - File extension
 * @returns Default filename with current date
 */
export function generateFallbackFilename(extension: string): string {
  const currentDate = new Date().toISOString().split('T')[0];
  return `IdeaCompass_Report_${currentDate}.${extension}`;
}

/**
 * Validates and sanitizes a filename for different operating systems
 * 
 * @param filename - The filename to validate
 * @returns Sanitized filename safe for all platforms
 */
export function sanitizeFilename(filename: string): string {
  // Replace characters that are invalid in Windows filenames
  const invalidChars = /[<>:"/\\|?*]/g;
  const sanitized = filename.replace(invalidChars, '_');
  
  // Ensure filename isn't too long (max 255 chars for most filesystems)
  if (sanitized.length > 200) {
    const parts = sanitized.split('.');
    const extension = parts.pop() || '';
    const nameWithoutExt = parts.join('.');
    const truncatedName = nameWithoutExt.substring(0, 200 - extension.length - 1);
    return `${truncatedName}.${extension}`;
  }
  
  return sanitized;
}

/**
 * Example usage:
 * 
 * generateSmartFilename(['artificial intelligence'], 'pdf')
 * // Returns: "ArtificialIntelligence_data_2024-08-28.pdf"
 * 
 * generateSmartFilename(['SaaS', 'marketing'], 'docx')
 * // Returns: "SaaS_data_2024-08-28.docx"
 * 
 * generateSmartFilename(['machine learning', 'AI tools'], 'pdf')
 * // Returns: "MachineLearning_data_2024-08-28.pdf"
 */