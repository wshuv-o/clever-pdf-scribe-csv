
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface SearchResult {
  id: string;
  fileIndex: number;
  fileName: string;
  pageNumber: number;
  beforeMatch: string;
  match: string;
  afterMatch: string;
  nextWord: string;
  fullContext: string;
}

export interface PdfContent {
  fileName: string;
  text: string;
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

export async function parseMultiplePdfs(files: File[]): Promise<PdfContent[]> {
  const results: PdfContent[] = [];
  
  for (const file of files) {
    try {
      const text = await parsePdf(file);
      results.push({ fileName: file.name, text });
    } catch (error) {
      console.error(`Error parsing ${file.name}:`, error);
      // Continue with other files even if one fails
    }
  }
  
  return results;
}

export function getNextWord(text: string, index: number): string {
  // Skip the matched word and find the next word
  let currentIndex = index;
  
  // Find the end of the current word
  while (currentIndex < text.length && !/\s/.test(text[currentIndex])) {
    currentIndex++;
  }
  
  // Skip whitespace and colons
  while (currentIndex < text.length && (/\s/.test(text[currentIndex]) || text[currentIndex] === ':')) {
    currentIndex++;
  }
  
  // Capture the next word
  const nextWordStart = currentIndex;
  while (currentIndex < text.length && !/\s/.test(text[currentIndex])) {
    currentIndex++;
  }
  
  if (nextWordStart < currentIndex) {
    return text.substring(nextWordStart, currentIndex);
  }
  
  return "";
}

export function searchInText(pdfContents: PdfContent[], searchTerms: string[]): SearchResult[] {
  if (!pdfContents.length || !searchTerms.length) return [];
  
  const results: SearchResult[] = [];
  const normalizedSearchTerms = searchTerms.map(term => term.toLowerCase());
  
  pdfContents.forEach((pdfContent, fileIndex) => {
    const { fileName, text } = pdfContent;
    const normalizedText = text.toLowerCase();
    
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
          
          // Get the next word after the match
          const nextWord = getNextWord(page, matchEnd);
          
          results.push({
            id: `${fileIndex}-${pageIndex}-${results.length}`,
            fileIndex,
            fileName,
            pageNumber: pageIndex + 1,
            beforeMatch,
            match,
            afterMatch,
            nextWord,
            fullContext,
          });
          
          index = matchEnd;
        }
      });
    });
  });
  
  return results;
}

export function convertToCSV(results: SearchResult[]): string {
  if (!results.length) return '';
  
  // Create CSV content
  const headers = ['File', 'Page', 'Before Match', 'Match', 'Next Word', 'After Match', 'Full Context'];
  const rows = results.map(result => [
    `"${result.fileName.replace(/"/g, '""')}"`,
    result.pageNumber,
    `"${result.beforeMatch.replace(/"/g, '""')}"`,
    `"${result.match.replace(/"/g, '""')}"`,
    `"${result.nextWord.replace(/"/g, '""')}"`,
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
