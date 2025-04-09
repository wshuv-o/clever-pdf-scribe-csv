
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface SearchResult {
  id: string;
  pageNumber: number;
  beforeMatch: string;
  match: string;
  afterMatch: string;
  fullContext: string;
}

export async function parsePdf(file: File): Promise<string> {
  try {
    // Read the file as an array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Get the total number of pages
    const numPages = pdf.numPages;
    
    // Extract text from each page
    let fullText = '';
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n\n'; // Adding page separators
    }
    
    return fullText;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file.');
  }
}

export function searchInText(text: string, searchTerms: string[]): SearchResult[] {
  if (!text || !searchTerms.length) return [];
  
  const results: SearchResult[] = [];
  const normalizedText = text.toLowerCase();
  const normalizedSearchTerms = searchTerms.map(term => term.toLowerCase());
  
  // Split text into pages (approximation)
  const pages = text.split('\n\n\n').filter(Boolean);
  
  pages.forEach((page, pageIndex) => {
    const normalizedPage = page.toLowerCase();
    
    normalizedSearchTerms.forEach(searchTerm => {
      let index = 0;
      while ((index = normalizedPage.indexOf(searchTerm, index)) !== -1) {
        // Extract context (up to 50 characters before and after the match)
        const contextStart = Math.max(0, index - 50);
        const contextEnd = Math.min(page.length, index + searchTerm.length + 50);
        
        // Get the actual text from the original (non-normalized) page
        const matchStart = index;
        const matchEnd = index + searchTerm.length;
        const beforeMatch = page.substring(contextStart, matchStart).trim();
        const match = page.substring(matchStart, matchEnd);
        const afterMatch = page.substring(matchEnd, contextEnd).trim();
        const fullContext = page.substring(contextStart, contextEnd);
        
        results.push({
          id: `${pageIndex}-${results.length}`,
          pageNumber: pageIndex + 1,
          beforeMatch,
          match,
          afterMatch,
          fullContext,
        });
        
        index = matchEnd;
      }
    });
  });
  
  return results;
}

export function convertToCSV(results: SearchResult[]): string {
  if (!results.length) return '';
  
  // Create CSV content
  const headers = ['Page', 'Before Match', 'Match', 'After Match', 'Full Context'];
  const rows = results.map(result => [
    result.pageNumber,
    `"${result.beforeMatch.replace(/"/g, '""')}"`,
    `"${result.match.replace(/"/g, '""')}"`,
    `"${result.afterMatch.replace(/"/g, '""')}"`,
    `"${result.fullContext.replace(/"/g, '""')}"`
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
