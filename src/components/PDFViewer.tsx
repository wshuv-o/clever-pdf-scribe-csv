
import React, { useState, useEffect, useRef } from 'react';
import { SearchResult } from '@/utils/pdfUtils';

interface PDFViewerProps {
  fileNames: string[];
  activeFile?: string;
  onFileSelect?: (fileIndex: number | undefined) => void;
  activePdfIndex?: number;
  searchResults?: SearchResult[];
  activeKeywords?: string[];
  onToggleHighlight?: (resultId: string) => void;
  onUpdateNextWord?: (resultId: string, newWord: string) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  fileNames, 
  activeFile, 
  onFileSelect,
  activePdfIndex,
  searchResults = [],
  activeKeywords = [],
  onToggleHighlight,
  onUpdateNextWord
}) => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionResultId, setSelectionResultId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter results based on active PDF and keywords
  const filteredResults = searchResults.filter(result => {
    const matchesPdf = activePdfIndex === undefined || result.fileIndex === activePdfIndex;
    const matchesKeyword = activeKeywords.length === 0 || activeKeywords.includes(result.match);
    return matchesPdf && matchesKeyword;
  });

  // Get unique pages with results
  const uniquePages = Array.from(new Set(filteredResults.map(r => `${r.fileIndex}-${r.pageNumber}`)));

  // Get color for a keyword
  const getKeywordColor = (term: string) => {
    const allKeywords = Array.from(new Set(searchResults.map(result => result.match)));
    const index = allKeywords.indexOf(term) % 5;
    return [
      'bg-blue-500',
      'bg-green-500',
      'bg-amber-500',
      'bg-purple-500',
      'bg-pink-500'
    ][index];
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  const handleSetNextWord = (resultId: string) => {
    if (selectedText && onUpdateNextWord) {
      onUpdateNextWord(resultId, selectedText);
      setSelectedText('');
    }
  };

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
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{uniquePages.length} page{uniquePages.length !== 1 ? 's' : ''} with results</span>
        </div>
      </div>
      
      <div 
        className="flex-1 p-4 overflow-auto"
        ref={contentRef}
        onMouseUp={handleMouseUp}
      >
        {selectedText && (
          <div className="sticky top-0 flex items-center gap-2 p-2 mb-4 bg-gray-800 rounded-md">
            <span className="text-sm text-gray-200">Selected: "{selectedText}"</span>
            {selectionResultId && (
              <button 
                className="px-2 py-1 text-xs bg-amber-600 rounded hover:bg-amber-700"
                onClick={() => handleSetNextWord(selectionResultId)}
              >
                Set as next word
              </button>
            )}
          </div>
        )}
        
        {uniquePages.length > 0 ? (
          <div className="space-y-8">
            {uniquePages.map(pageId => {
              const [fileIdx, pageNum] = pageId.split('-').map(Number);
              const pageResults = filteredResults.filter(
                r => r.fileIndex === fileIdx && r.pageNumber === parseInt(pageNum as any)
              );
              
              if (pageResults.length === 0) return null;
              
              return (
                <div key={pageId} className="p-4 bg-[#171923] rounded-md">
                  <div className="text-xs text-gray-500 mb-2">
                    {fileNames[fileIdx]} - Page {pageNum}
                  </div>
                  
                  <div className="space-y-4">
                    {pageResults.map(result => (
                      <div 
                        key={result.id} 
                        className="p-3 bg-gray-800/50 rounded-md"
                        onMouseUp={() => setSelectionResultId(result.id)}
                      >
                        <p className="whitespace-pre-wrap text-gray-300">
                          <span>{result.beforeMatch} </span>
                          <span className={`px-1 rounded text-white font-medium ${getKeywordColor(result.match)}`}>
                            {result.match}
                          </span>
                          <span> {result.afterMatch}</span>
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <span className="text-gray-400">Next word:</span>
                          <span 
                            className={`px-1.5 py-0.5 rounded cursor-pointer ${
                              result.isHighlighted ? 'bg-amber-600' : 'bg-gray-700'
                            }`}
                            onClick={() => onToggleHighlight && onToggleHighlight(result.id)}
                          >
                            {result.nextWord || "N/A"}
                          </span>
                          {selectedText && (
                            <button 
                              className="px-2 py-0.5 text-xs bg-blue-600 rounded hover:bg-blue-700"
                              onClick={() => handleSetNextWord(result.id)}
                            >
                              Update
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No results to display</p>
          </div>
        )}
      </div>
      
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
