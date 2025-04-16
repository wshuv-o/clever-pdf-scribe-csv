
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { SearchResult } from '@/utils/pdfUtils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  fileNames: string[];
  activeFile?: string;
  onFileSelect?: (fileIndex: number | undefined) => void;
  activePdfIndex?: number;
  searchResults?: SearchResult[];
  activeKeywords?: string[];
  onToggleHighlight?: (resultId: string) => void;
  onUpdateNextWord?: (resultId: string, newWord: string) => void;
  pdfFiles?: File[];
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  fileNames, 
  activeFile, 
  onFileSelect,
  activePdfIndex,
  searchResults = [],
  activeKeywords = [],
  onToggleHighlight,
  onUpdateNextWord,
  pdfFiles = []
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [selectedText, setSelectedText] = useState('');
  const [selectionResultId, setSelectionResultId] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.2);
  const textLayerRef = useRef<HTMLDivElement>(null);
  
  // Filter results based on active PDF and keywords
  const filteredResults = searchResults.filter(result => {
    const matchesPdf = activePdfIndex === undefined || result.fileIndex === activePdfIndex;
    const matchesKeyword = activeKeywords.length === 0 || activeKeywords.includes(result.match);
    return matchesPdf && matchesKeyword && result.isHighlighted;
  });
  
  // Active PDF file
  const activePdf = pdfFiles && activePdfIndex !== undefined ? pdfFiles[activePdfIndex] : null;
  
  useEffect(() => {
    // Reset page number when changing PDFs
    setPageNumber(1);
  }, [activePdfIndex]);
  
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        setSelectedText(selection.toString().trim());
      }
    };
    
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []);
  
  // Apply highlights to the text layer
  useEffect(() => {
    if (!textLayerRef.current || !filteredResults.length) return;
    
    const applyHighlights = () => {
      const textLayer = textLayerRef.current;
      if (!textLayer) return;
      
      // Find all text spans in the text layer
      const textSpans = textLayer.querySelectorAll('.react-pdf__Page__textContent span');
      
      // Loop through all text spans
      textSpans.forEach(span => {
        const spanText = span.textContent || '';
        
        // Check if any of our search terms are in this span
        filteredResults.forEach(result => {
          if (spanText.toLowerCase().includes(result.match.toLowerCase())) {
            // Apply highlight style
            (span as HTMLElement).style.backgroundColor = getKeywordColor(result.match);
            (span as HTMLElement).style.color = 'white';
            (span as HTMLElement).dataset.resultId = result.id;
            (span as HTMLElement).style.cursor = 'pointer';
            
            // Add next word highlighting if present
            if (result.nextWord && spanText.toLowerCase().includes(result.nextWord.toLowerCase())) {
              (span as HTMLElement).style.backgroundColor = '#F97316';  // Amber highlight for next words
              (span as HTMLElement).style.textDecoration = 'underline';
            }
          }
        });
      });
    };
    
    // Add a small delay to ensure the text layer is fully rendered
    const timer = setTimeout(applyHighlights, 500);
    return () => clearTimeout(timer);
  }, [filteredResults, pageNumber, numPages]);
  
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  
  const handleTextLayerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const resultId = target.dataset.resultId;
    
    if (resultId) {
      if (selectedText && onUpdateNextWord) {
        onUpdateNextWord(resultId, selectedText);
        setSelectedText('');
      } else if (onToggleHighlight) {
        onToggleHighlight(resultId);
      }
    }
  };
  
  // Get color for a keyword
  const getKeywordColor = (term: string) => {
    const allKeywords = Array.from(new Set(searchResults.map(result => result.match)));
    const index = allKeywords.indexOf(term) % 5;
    return [
      '#3B82F6', // blue
      '#10B981', // green
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#F59E0B'  // amber
    ][index];
  };
  
  const nextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };
  
  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };
  
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.6));
  
  if (fileNames.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0d1117] border border-gray-800 rounded-md">
        <p className="text-gray-400">No PDF files loaded</p>
      </div>
    );
  }

  const fileName = activeFile || fileNames[activePdfIndex !== undefined ? activePdfIndex : 0];

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-gray-800 rounded-md overflow-hidden">
      <div className="p-4 bg-[#171923] border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white truncate">{fileName}</h2>
        <div className="flex items-center gap-2">
          <Button onClick={zoomOut} variant="ghost" size="icon" className="h-8 w-8">-</Button>
          <span className="text-sm text-gray-300">{Math.round(scale * 100)}%</span>
          <Button onClick={zoomIn} variant="ghost" size="icon" className="h-8 w-8">+</Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center">
        {selectedText && (
          <div className="sticky top-0 z-10 flex items-center gap-2 p-2 mb-4 bg-gray-800 rounded-md">
            <span className="text-sm text-gray-200">Selected: "{selectedText}"</span>
            {selectionResultId && (
              <Button 
                className="px-2 py-1 text-xs bg-amber-600 rounded hover:bg-amber-700"
                onClick={() => onUpdateNextWord && onUpdateNextWord(selectionResultId, selectedText)}
              >
                Set as next word
              </Button>
            )}
          </div>
        )}
        
        {activePdf ? (
          <div className="pdf-container my-4 mx-auto">
            <Document
              file={activePdf}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-80">
                  <p className="text-gray-400">Loading PDF...</p>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-80">
                  <p className="text-red-400">Error loading PDF.</p>
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                customTextRenderer={({ str, itemIndex }) => {
                  return str;
                }}
                onGetTextSuccess={(textContent) => {
                  // Handle text content if needed
                }}
              >
                <div 
                  ref={textLayerRef} 
                  onClick={handleTextLayerClick}
                  className="react-pdf__Page__textContent absolute top-0 left-0 z-10"
                />
              </Page>
            </Document>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Select a PDF to view</p>
          </div>
        )}
      </div>
      
      {numPages > 0 && (
        <div className="flex items-center justify-between p-2 bg-[#171923] border-t border-gray-800">
          <Button
            variant="outline"
            onClick={prevPage}
            disabled={pageNumber <= 1}
            className="flex items-center gap-2 bg-[#171923] border-gray-700 text-gray-300"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <p className="text-sm text-gray-300">
            Page {pageNumber} of {numPages}
          </p>
          
          <Button
            variant="outline"
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className="flex items-center gap-2 bg-[#171923] border-gray-700 text-gray-300"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {fileNames.length > 0 && (
        <div className="flex items-center justify-center p-2 bg-[#171923] border-t border-gray-800 gap-2 overflow-x-auto">
          <div 
            className={`p-2 rounded-md text-xs cursor-pointer ${
              activePdfIndex === undefined ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:bg-gray-800'
            }`}
            onClick={() => onFileSelect && onFileSelect(undefined)}
          >
            All
          </div>
          {fileNames.map((name, index) => (
            <div 
              key={index}
              className={`p-2 rounded-md text-xs truncate max-w-[150px] cursor-pointer ${
                index === activePdfIndex ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:bg-gray-800'
              }`}
              onClick={() => onFileSelect && onFileSelect(index)}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
