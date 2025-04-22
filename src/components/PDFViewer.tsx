
import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { SearchResult } from '@/utils/pdfUtils';
import { Button } from '@/components/ui/button';
import { PDFControls } from './pdf/PDFControls';
import { PDFFileSelector } from './pdf/PDFFileSelector';
import { usePDFNavigation } from '@/hooks/usePDFNavigation';
import { usePDFHighlight } from '@/hooks/usePDFHighlight';

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
  const [selectedText, setSelectedText] = useState('');
  const [selectionResultId, setSelectionResultId] = useState<string | null>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [textLayerRendered, setTextLayerRendered] = useState<boolean>(false);

  const { pageNumber, scale, nextPage, prevPage, zoomIn, zoomOut } = usePDFNavigation({
    totalPages: numPages
  });

  const filteredResults = searchResults.filter(result => {
    const matchesPdf = activePdfIndex === undefined || result.fileIndex === activePdfIndex;
    const matchesKeyword = activeKeywords.length === 0 || activeKeywords.includes(result.match);
    return matchesPdf && matchesKeyword && result.pageNumber === pageNumber;
  });

  usePDFHighlight({
    textLayerRef,
    filteredResults,
    textLayerRendered,
    pageNumber
  });

  const activePdf = pdfFiles && activePdfIndex !== undefined ? pdfFiles[activePdfIndex] : null;

  React.useEffect(() => {
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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onTextLayerRender = () => {
    console.log("Text layer rendered for page", pageNumber);
    setTextLayerRendered(true);
  };

  if (fileNames.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0d1117] border border-gray-800 rounded-md">
        <p className="text-gray-400">No PDF files loaded</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-gray-800 rounded-md overflow-hidden">
      <div className="p-4 bg-[#171923] border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white truncate">{activeFile || fileNames[activePdfIndex !== undefined ? activePdfIndex : 0]}</h2>
        <div className="flex items-center gap-2">
          <Button onClick={zoomOut} variant="ghost" size="icon" className="h-8 w-8">-</Button>
          <span className="text-sm text-gray-300">{Math.round(scale * 100)}%</span>
          <Button onClick={zoomIn} variant="ghost" size="icon" className="h-8 w-8">+</Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center">
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
      </div>

      {numPages > 0 && (
        <PDFControls
          pageNumber={pageNumber}
          numPages={numPages}
          scale={scale}
          onPrevPage={prevPage}
          onNextPage={nextPage}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
        />
      )}

      <PDFFileSelector
        fileNames={fileNames}
        activePdfIndex={activePdfIndex}
        onFileSelect={onFileSelect}
      />
    </div>
  );
};

export default PDFViewer;
