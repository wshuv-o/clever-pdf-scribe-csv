
import React, { useState } from 'react';
import { SearchResult } from '@/utils/pdfUtils';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultsListProps {
  results: SearchResult[];
  onExport: () => void;
  activeKeywords: string[];
  setActiveKeywords: (keywords: string[]) => void;
  activePdfIndex?: number;
  onToggleHighlight: (resultId: string) => void;
  onUpdateNextWord: (resultId: string, newWord: string) => void;
}

const ResultsList: React.FC<ResultsListProps> = ({ 
  results, 
  onExport, 
  activeKeywords, 
  setActiveKeywords,
  activePdfIndex,
  onToggleHighlight,
  onUpdateNextWord
}) => {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  
  if (results.length === 0) {
    return null;
  }

  // Get unique keywords from results
  const allKeywords = Array.from(new Set(results.map(result => result.match)));
  
  // Filter results by active PDF if set
  const filteredResults = activePdfIndex !== undefined 
    ? results.filter(result => result.fileIndex === activePdfIndex)
    : results;
  
  // Filter by active keywords if any are selected
  const keywordFilteredResults = activeKeywords.length > 0
    ? filteredResults.filter(result => activeKeywords.includes(result.match))
    : filteredResults;
  
  // Group results by search term
  const groupedResults = keywordFilteredResults.reduce<Record<string, SearchResult[]>>((acc, result) => {
    if (!acc[result.match]) {
      acc[result.match] = [];
    }
    acc[result.match].push(result);
    return acc;
  }, {});

  const toggleExpand = (id: string) => {
    setExpandedResult(expandedResult === id ? null : id);
  };

  const toggleKeyword = (keyword: string) => {
    if (activeKeywords.includes(keyword)) {
      setActiveKeywords(activeKeywords.filter(k => k !== keyword));
    } else {
      setActiveKeywords([...activeKeywords, keyword]);
    }
  };

  // Consistent color mapping for keywords
  const getKeywordColorClass = (term: string) => {
    const index = allKeywords.indexOf(term) % 5;
    return [
      'bg-blue-500',
      'bg-green-500',
      'bg-amber-500',
      'bg-purple-500',
      'bg-pink-500'
    ][index];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-lg font-medium text-white">
          Search Results
        </h2>
        <Button onClick={onExport} variant="outline" size="sm" className="flex items-center gap-2 bg-transparent border-gray-700 text-gray-300">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>
      
      <div className="p-4 border-b border-gray-800 overflow-x-auto">
        <h3 className="text-sm text-gray-400 mb-2">Filter by keywords:</h3>
        <div className="flex flex-wrap gap-2">
          {allKeywords.map((keyword) => (
            <div
              key={keyword}
              className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer flex items-center gap-1 ${
                getKeywordColorClass(keyword)
              } ${
                !activeKeywords.includes(keyword) && activeKeywords.length > 0 
                  ? 'opacity-50' 
                  : ''
              }`}
              onClick={() => toggleKeyword(keyword)}
            >
              <span>{keyword}</span>
              <span className="ml-1">({results.filter(r => r.match === keyword).length})</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 space-y-6 p-4 overflow-y-auto">
        {Object.entries(groupedResults).map(([term, termResults]) => (
          <div key={term} className="space-y-2">
            <div 
              className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${getKeywordColorClass(term)}`}
            >
              {term} ({termResults.length})
            </div>
            
            {termResults.map((result) => (
              <div 
                key={result.id} 
                className="rounded-md bg-[#171923] border border-gray-800 overflow-hidden"
              >
                <div 
                  className="p-3 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(result.id)}
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-200">Page {result.pageNumber}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 mr-1">Next word:</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${result.isHighlighted ? 'bg-amber-600' : 'bg-gray-700'}`}>
                        {result.nextWord || "N/A"}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 h-auto ml-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleHighlight(result.id);
                        }}
                      >
                        {result.isHighlighted ? 'Unmark' : 'Mark'}
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      {expandedResult === result.id ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </Button>
                  </div>
                </div>
                
                {expandedResult === result.id && (
                  <div className="p-3 border-t border-gray-800 text-sm">
                    <p className="whitespace-pre-wrap text-gray-300">
                      <span>{result.beforeMatch}</span>{' '}
                      <span className={cn("px-1 rounded text-white font-medium", getKeywordColorClass(result.match))}>{result.match}</span>{' '}
                      <span>{result.afterMatch}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const ChevronDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

const ChevronUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 15-6-6-6 6"/></svg>
);

export default ResultsList;
