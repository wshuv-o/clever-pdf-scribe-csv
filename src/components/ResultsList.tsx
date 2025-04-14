
import React, { useState } from 'react';
import { SearchResult } from '@/utils/pdfUtils';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultsListProps {
  results: SearchResult[];
  onExport: () => void;
  activeKeyword?: string;
  setActiveKeyword: (keyword: string | undefined) => void;
  activePdfIndex?: number;
}

const ResultsList: React.FC<ResultsListProps> = ({ 
  results, 
  onExport, 
  activeKeyword, 
  setActiveKeyword,
  activePdfIndex
}) => {
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  
  if (results.length === 0) {
    return null;
  }
  
  // Filter results by active PDF if set
  const filteredResults = activePdfIndex !== undefined 
    ? results.filter(result => result.fileIndex === activePdfIndex)
    : results;
  
  // Group results by search term
  const groupedResults = filteredResults.reduce<Record<string, SearchResult[]>>((acc, result) => {
    if (!acc[result.match]) {
      acc[result.match] = [];
    }
    acc[result.match].push(result);
    return acc;
  }, {});

  const toggleExpand = (id: string) => {
    setExpandedResult(expandedResult === id ? null : id);
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
      
      <div className="space-y-6 p-4 overflow-y-auto">
        {Object.entries(groupedResults)
          .filter(([term, _]) => !activeKeyword || term === activeKeyword)
          .map(([term, termResults]) => (
            <div key={term} className="space-y-2">
              <div 
                className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center cursor-pointer
                  ${term === 'hey' ? 'bg-blue-500' : 
                    term === 'how' ? 'bg-green-500' : 
                    term === 'where' ? 'bg-amber-500' : 
                    term === 'good' ? 'bg-purple-500' : 'bg-pink-500'}`}
                onClick={() => setActiveKeyword(activeKeyword === term ? undefined : term)}
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
                      <span className="text-xs text-gray-400">Next word: {result.nextWord || "N/A"}</span>
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
                        <span className={cn("bg-blue-500/30 px-1 rounded text-white font-medium")}>{result.match}</span>{' '}
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
