
import React from 'react';

interface PDFViewerProps {
  fileNames: string[];
  activeFile?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileNames, activeFile }) => {
  if (fileNames.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0d1117] border border-gray-800 rounded-md">
        <p className="text-gray-400">No PDF files loaded</p>
      </div>
    );
  }

  const fileName = activeFile || fileNames[0];

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-gray-800 rounded-md overflow-hidden">
      <div className="p-4 bg-[#171923] border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white truncate">{fileName}</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>1 / 1</span>
          <div className="border-r border-gray-700 h-4"></div>
          <span>15%</span>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="bg-white rounded-md w-full max-w-md aspect-[3/4] flex items-center justify-center">
          <p className="text-gray-800">PDF preview not available</p>
        </div>
      </div>
      
      {fileNames.length > 1 && (
        <div className="flex items-center justify-center p-2 bg-[#171923] border-t border-gray-800 gap-2">
          {fileNames.map((name, index) => (
            <div 
              key={index}
              className={`p-2 rounded-md text-xs truncate max-w-[150px] ${
                name === fileName ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:bg-gray-800'
              }`}
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
