
import React from 'react';

interface PDFFileSelectorProps {
  fileNames: string[];
  activePdfIndex?: number;
  onFileSelect?: (index: number | undefined) => void;
}

export const PDFFileSelector: React.FC<PDFFileSelectorProps> = ({
  fileNames,
  activePdfIndex,
  onFileSelect,
}) => {
  if (fileNames.length === 0) return null;

  return (
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
  );
};
