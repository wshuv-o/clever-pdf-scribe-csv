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
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [textLayerRendered, setTextLayerRendered] = useState<boolean>(false);
  
  const filteredResults = searchResults.filter(result => {
    const matchesPdf = activePdfIndex === undefined || result.fileIndex === activePdfIndex;
    const matchesKeyword = activeKeywords.length === 0 || activeKeywords.includes(result.match);
    return matchesPdf && matchesKeyword && result.pageNumber === pageNumber;
  });
  
  const activePdf = pdfFiles && activePdfIndex !== undefined ? pdfFiles[activePdfIndex] : null;
  
  useEffect(() => {
    setPageNumber(1);
    setTextLayerRendered(false);
  }, [activePdfIndex]);
  
  useEffect(() => {
    setTextLayerRendered(false);
  }, [pageNumber]);
  
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
  
  useEffect(() => {
    if (!textLayerRef.current || !filteredResults.length || !textLayerRendered) return;
    
    const applyHighlights = () => {
      const textLayer = textLayerRef.current;
      if (!textLayer) return;
      
      // Remove existing highlights
      const previousHighlights = textLayer.querySelectorAll('.pdf-highlight');
      previousHighlights.forEach(highlight => highlight.remove());
      
      // Get all text nodes in the PDF
      const walker = document.createTreeWalker(
        textLayer,
        NodeFilter.SHOW_TEXT,
        null
      );

      filteredResults.forEach(result => {
        if (!result.isHighlighted) return;
        
        const searchTerm = result.match.toLowerCase();
        let node: Node | null = walker.currentNode;
        
        // Reset walker to start
        walker.currentNode = textLayer;
        
        while (node = walker.nextNode()) {
          const text = node.textContent || '';
          const lowerText = text.toLowerCase();
          let position = lowerText.indexOf(searchTerm);
          
          while (position !== -1) {
            const range = document.createRange();
            range.setStart(node, position);
            range.setEnd(node, position + searchTerm.length);
            
            const rect = range.getBoundingClientRect();
            const highlight = document.createElement('div');
            highlight.className = 'pdf-highlight';
            highlight.style.position = 'absolute';
            highlight.style.left = `${rect.left - textLayer.getBoundingClientRect().left}px`;
            highlight.style.top = `${rect.top - textLayer.getBoundingClientRect().top}px`;
            highlight.style.width = `${rect.width}px`;
            highlight.style.height = `${rect.height}px`;
            highlight.style.backgroundColor = 'rgba(139, 92, 246, 0.5)'; // Bright purple with opacity
            highlight.style.pointerEvents = 'none';
            highlight.style.mixBlendMode = 'multiply';
            highlight.style.zIndex = '1';
            
            textLayer.appendChild(highlight);
            
            position = lowerText.indexOf(searchTerm, position + 1);
          }
        }
      });
    };
    
    // Apply highlights with a small delay to ensure PDF is rendered
    const timer = setTimeout(applyHighlights, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [filteredResults, textLayerRendered, pageNumber]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  
  const onTextLayerRender = () => {
    console.log("Text layer rendered for page", pageNumber);
    setTextLayerRendered(true);
  };
  
  const getKeywordColor = (term: string, withOpacity = false) => {
    const allKeywords = Array.from(new Set(searchResults.map(result => result.match)));
    const index = allKeywords.indexOf(term) % 5;
    const colors = [
      withOpacity ? 'rgba(59, 130, 246, 0.5)' : '#3B82F6', // blue
      withOpacity ? 'rgba(16, 185, 129, 0.5)' : '#10B981', // green
      withOpacity ? 'rgba(139, 92, 246, 0.5)' : '#8B5CF6', // purple
      withOpacity ? 'rgba(236, 72, 153, 0.5)' : '#EC4899', // pink
      withOpacity ? 'rgba(245, 158, 11, 0.5)' : '#F59E0B'  // amber
    ];
    return colors[index];
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

  const highlightStyles = `
    .pdf-text-highlight {
      pointer-events: all !important;
      mix-blend-mode: multiply;
    }
    .pdf-next-word-highlight {
      pointer-events: all !important;
      mix-blend-mode: multiply;
    }
    .react-pdf__Page {
      position: relative;
    }
    .react-pdf__Page__textContent {
      user-select: text;
      pointer-events: auto;
    }
  `;

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-gray-800 rounded-md overflow-hidden">
      {/* Header styles */}
      <div className="p-4 bg-[#171923] border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white truncate">{fileName}</h2>
        <div className="flex items-center gap-2">
          <Button onClick={zoomOut} variant="ghost" size="icon" className="h-8 w-8">-</Button>
          <span className="text-sm text-gray-300">{Math.round(scale * 100)}%</span>
          <Button onClick={zoomIn} variant="ghost" size="icon" className="h-8 w-8">+</Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center">
        {/* Selection mode status bar */}
        <div className="sticky top-0 z-10 p-2 w-full bg-gray-800/90 flex justify-between items-center">
          {isSelectionMode ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-amber-300">Selection mode active - select text for next word</span>
              {selectedText && (
                <span className="text-sm text-white">Selected: "{selectedText}"</span>
              )}
              {selectionResultId && selectedText && (
                <Button 
                  className="px-2 py-1 text-xs bg-amber-600 rounded hover:bg-amber-700"
                  onClick={() => {
                    onUpdateNextWord && onUpdateNextWord(selectionResultId, selectedText);
                    setSelectedText('');
                    setSelectionResultId(null);
                    setIsSelectionMode(false);
                  }}
                >
                  Set as next word
                </Button>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-300">
              Click on highlighted text to edit or select new text
            </div>
          )}
          
          {isSelectionMode && (
            <Button
              variant="outline"
              onClick={() => {
                setIsSelectionMode(false);
                setSelectionResultId(null);
                setSelectedText('');
              }}
              className="text-xs"
            >
              Cancel Selection
            </Button>
          )}
        </div>
        
        <style>{highlightStyles}</style>
        
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
                onGetTextSuccess={onTextLayerRender}
                className="position-relative"
              >
                <div 
                  ref={textLayerRef} 
                  className="react-pdf__Page__textContent absolute top-0 left-0 w-full h-full"
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
