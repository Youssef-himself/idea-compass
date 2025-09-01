import { CSVData, CSVColumn, CSVMapping, RedditPost, DataImportProgress } from '@/types';

// CSV file size limit (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 10000; // Maximum rows to process

export class CSVProcessor {
  // Parse CSV file from upload
  static async parseFile(
    file: File,
    onProgress?: (progress: DataImportProgress) => void
  ): Promise<CSVData> {
    // Validate file
    this.validateFile(file);

    if (onProgress) {
      onProgress({
        stage: 'uploading',
        progress: 0,
        message: 'Starting file upload...',
      });
    }

    try {
      // Read file content
      const content = await this.readFileContent(file);
      
      if (onProgress) {
        onProgress({
          stage: 'parsing',
          progress: 30,
          message: 'Parsing CSV content...',
        });
      }

      // Parse CSV content
      const { headers, rows } = this.parseCSVContent(content);
      
      if (onProgress) {
        onProgress({
          stage: 'mapping',
          progress: 60,
          message: 'Analyzing columns...',
        });
      }

      // Analyze columns
      const columns = this.analyzeColumns(headers, rows);
      
      if (onProgress) {
        onProgress({
          stage: 'completed',
          progress: 100,
          message: `Successfully processed ${rows.length} rows`,
        });
      }

      return {
        id: `csv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name,
        headers,
        rows: rows.slice(0, MAX_ROWS), // Limit rows
        columns,
        totalRows: rows.length,
        uploadedAt: new Date(),
        validationErrors: this.validateData(headers, rows),
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (onProgress) {
        onProgress({
          stage: 'error',
          progress: 0,
          message: 'Failed to process CSV file',
          errors: [errorMessage],
        });
      }
      
      throw new Error(`CSV processing failed: ${errorMessage}`);
    }
  }

  // Convert CSV data to Reddit post format
  static convertToRedditPosts(
    csvData: CSVData,
    mapping: CSVMapping
  ): RedditPost[] {
    const posts: RedditPost[] = [];
    
    // Validate mapping
    if (!mapping.title) {
      throw new Error('Title column mapping is required');
    }

    csvData.rows.forEach((row, index) => {
      try {
        // Required fields
        const title = String(row[mapping.title!] || '').trim();
        if (!title) return; // Skip rows without title

        // Optional fields with defaults
        const content = mapping.content ? String(row[mapping.content] || '') : '';
        const author = mapping.author ? String(row[mapping.author] || 'Unknown') : 'CSV Import';
        const scoreValue = mapping.score ? this.parseNumber(row[mapping.score]) : 1;
        const dateValue = mapping.date ? this.parseDate(row[mapping.date]) : new Date();
        const urlValue = mapping.url ? String(row[mapping.url] || '') : '';

        const post: RedditPost = {
          id: `csv_${csvData.id}_${index}`,
          title,
          content,
          author,
          subreddit: `imported_${csvData.filename.replace(/[^a-zA-Z0-9]/g, '_')}`,
          score: scoreValue,
          upvoteRatio: 0.8, // Default ratio
          numComments: 0,
          createdAt: dateValue,
          url: urlValue,
          permalink: `#csv-import-${index}`,
          isNSFW: false,
          isStickied: false,
          flair: mapping.category && row[mapping.category] ? String(row[mapping.category]) : undefined,
        };

        posts.push(post);
      } catch (error) {
        console.warn(`Error processing row ${index}:`, error);
      }
    });

    return posts;
  }

  // Suggest automatic column mapping
  static suggestMapping(columns: CSVColumn[]): CSVMapping {
    const mapping: CSVMapping = {};
    
    // Enhanced patterns with more variations and partial matching
    const titlePatterns = /^(title|name|subject|headline|post_title|post|question|text|selftext|content|body|description)$/i;
    const contentPatterns = /^(content|body|description|details|comment|message|text|post|selftext|summary)$/i;
    const authorPatterns = /^(author|user|username|name|creator|poster|by|redditor|user_name)$/i;
    const scorePatterns = /^(score|rating|votes|points|likes|upvotes|engagement|ups|karma)$/i;
    const datePatterns = /^(date|time|created|posted|timestamp|when|created_utc|created_time)$/i;
    const urlPatterns = /^(url|link|source|permalink|href|link_url|post_url)$/i;
    const categoryPatterns = /^(category|type|tag|flair|group|class|subreddit|sub)$/i;

    // Debug: Log all column names to understand what we're working with
    console.log('🔍 Available columns:', columns.map(c => c.name));

    // First pass: Exact pattern matching
    for (const column of columns) {
      const name = column.name.toLowerCase().trim();
      
      if (!mapping.title && titlePatterns.test(name)) {
        mapping.title = column.name;
        console.log('✅ Title mapped to:', column.name);
      } else if (!mapping.content && contentPatterns.test(name)) {
        mapping.content = column.name;
        console.log('✅ Content mapped to:', column.name);
      } else if (!mapping.author && authorPatterns.test(name)) {
        mapping.author = column.name;
        console.log('✅ Author mapped to:', column.name);
      } else if (!mapping.score && scorePatterns.test(name) && column.type === 'number') {
        mapping.score = column.name;
        console.log('✅ Score mapped to:', column.name);
      } else if (!mapping.date && datePatterns.test(name) && column.type === 'date') {
        mapping.date = column.name;
        console.log('✅ Date mapped to:', column.name);
      } else if (!mapping.url && urlPatterns.test(name) && column.type === 'url') {
        mapping.url = column.name;
        console.log('✅ URL mapped to:', column.name);
      } else if (!mapping.category && categoryPatterns.test(name)) {
        mapping.category = column.name;
        console.log('✅ Category mapped to:', column.name);
      }
    }

    // Second pass: Fallback strategies if no title found
    if (!mapping.title) {
      console.log('⚠️ No title column found, applying fallback strategies...');
      
      // Strategy 1: Look for columns with "title" or "text" in the name (partial matching)
      for (const column of columns) {
        const name = column.name.toLowerCase();
        if ((name.includes('title') || name.includes('text') || name.includes('subject') || 
             name.includes('headline') || name.includes('post') || name.includes('content')) &&
            column.type === 'text') {
          mapping.title = column.name;
          console.log('✅ Title mapped (fallback 1) to:', column.name);
          break;
        }
      }
    }

    // Strategy 2: Use the first text column with substantial content as title
    if (!mapping.title) {
      console.log('⚠️ Still no title, trying content-based detection...');
      for (const column of columns) {
        if (column.type === 'text' && column.sampleValues.length > 0) {
          // Check if this column has substantial text content (likely titles)
          const avgLength = column.sampleValues.reduce((sum, val) => sum + val.length, 0) / column.sampleValues.length;
          if (avgLength > 10 && avgLength < 200) { // Reasonable title length
            mapping.title = column.name;
            console.log('✅ Title mapped (fallback 2 - content analysis) to:', column.name, 'avg length:', avgLength);
            break;
          }
        }
      }
    }

    // Strategy 3: Last resort - use the first text column as title
    if (!mapping.title) {
      console.log('⚠️ Last resort: using first text column as title...');
      const firstTextColumn = columns.find(c => c.type === 'text');
      if (firstTextColumn) {
        mapping.title = firstTextColumn.name;
        console.log('✅ Title mapped (last resort) to:', firstTextColumn.name);
      }
    }

    console.log('🤖 Final mapping result:', mapping);
    return mapping;
  }

  // Private helper methods
  private static validateFile(file: File): void {
    // Check file type
    const allowedTypes = ['text/csv', 'application/csv', 'text/plain'];
    const isCSV = allowedTypes.includes(file.type) || file.name.toLowerCase().endsWith('.csv');
    
    if (!isCSV) {
      throw new Error('Please upload a valid CSV file');
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    if (file.size === 0) {
      throw new Error('File appears to be empty');
    }
  }

  private static async readFileContent(file: File): Promise<string> {
    // Check if we're in a browser environment (FileReader exists)
    if (typeof FileReader !== 'undefined') {
      // Browser environment - use FileReader
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (!content) {
            reject(new Error('Failed to read file content'));
          } else {
            resolve(content);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
      });
    } else {
      // Node.js environment (server-side) - use File.text() method
      try {
        const content = await file.text();
        if (!content) {
          throw new Error('Failed to read file content');
        }
        return content;
      } catch (error) {
        throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private static parseCSVContent(content: string): { headers: string[], rows: Record<string, any>[] } {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      throw new Error('CSV file appears to be empty');
    }

    // Parse headers
    const headers = this.parseCSVLine(lines[0]);
    if (headers.length === 0) {
      throw new Error('No columns found in CSV header');
    }

    // Parse rows
    const rows: Record<string, any>[] = [];
    for (let i = 1; i < lines.length && i <= MAX_ROWS + 1; i++) {
      try {
        const values = this.parseCSVLine(lines[i]);
        if (values.length > 0) {
          const row: Record<string, any> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          rows.push(row);
        }
      } catch (error) {
        console.warn(`Error parsing line ${i + 1}:`, error);
      }
    }

    if (rows.length === 0) {
      throw new Error('No data rows found in CSV file');
    }

    return { headers, rows };
  }

  private static parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
      } else if (inQuotes && char === quoteChar) {
        // Check for escaped quote
        if (line[i + 1] === quoteChar) {
          current += char;
          i++; // Skip next character
        } else {
          inQuotes = false;
          quoteChar = '';
        }
      } else if (!inQuotes && char === ',') {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  private static analyzeColumns(headers: string[], rows: Record<string, any>[]): CSVColumn[] {
    return headers.map(header => {
      const sampleValues = rows.slice(0, 10).map(row => String(row[header] || '')).filter(v => v.length > 0);
      const type = this.detectColumnType(sampleValues);
      
      return {
        name: header,
        type,
        sampleValues: sampleValues.slice(0, 5),
      };
    });
  }

  private static detectColumnType(values: string[]): 'text' | 'number' | 'date' | 'url' | 'category' {
    if (values.length === 0) return 'text';

    // Check for URLs
    const urlPattern = /^https?:\/\//i;
    if (values.some(v => urlPattern.test(v))) return 'url';

    // Check for numbers
    const numberPattern = /^-?\d*\.?\d+$/;
    if (values.every(v => numberPattern.test(v) || v === '')) return 'number';

    // Check for dates
    const datePattern = /\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4}/;
    if (values.some(v => datePattern.test(v) || !isNaN(Date.parse(v)))) return 'date';

    // Check for categories (limited unique values)
    const uniqueValues = new Set(values);
    if (uniqueValues.size <= Math.max(5, values.length * 0.3)) return 'category';

    return 'text';
  }

  private static validateData(headers: string[], rows: Record<string, any>[]): string[] {
    const errors: string[] = [];

    // Check for duplicate headers
    const headerSet = new Set();
    headers.forEach(header => {
      if (headerSet.has(header)) {
        errors.push(`Duplicate column name: "${header}"`);
      }
      headerSet.add(header);
    });

    // Check for empty headers
    headers.forEach((header, index) => {
      if (!header.trim()) {
        errors.push(`Empty column name at position ${index + 1}`);
      }
    });

    // Check row consistency
    const expectedColumns = headers.length;
    const inconsistentRows = rows.filter(row => Object.keys(row).length !== expectedColumns).length;
    if (inconsistentRows > 0) {
      errors.push(`${inconsistentRows} rows have inconsistent number of columns`);
    }

    return errors;
  }

  private static parseNumber(value: any): number {
    const num = parseFloat(String(value));
    return isNaN(num) ? 0 : Math.max(0, num);
  }

  private static parseDate(value: any): Date {
    const date = new Date(String(value));
    return isNaN(date.getTime()) ? new Date() : date;
  }

  // Generate sample data for demo purposes
  static generateSampleCSV(): string {
    const sampleData = [
      ['Title', 'Content', 'Author', 'Score', 'Date', 'Category'],
      ['Best productivity tips for remote work', 'Looking for advice on staying productive while working from home...', 'user123', '45', '2024-01-15', 'Productivity'],
      ['New AI tool for content creation', 'Just discovered this amazing AI tool that helps with writing...', 'techie456', '78', '2024-01-14', 'Technology'],
      ['Startup funding strategies', 'What are the best ways to secure funding for early-stage startups?', 'entrepreneur789', '32', '2024-01-13', 'Business'],
      ['Market research best practices', 'Share your experience with conducting effective market research...', 'researcher101', '56', '2024-01-12', 'Research'],
      ['Digital marketing trends 2024', 'What marketing trends should we watch out for this year?', 'marketer202', '89', '2024-01-11', 'Marketing']
    ];

    return sampleData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  }
}

export default CSVProcessor;