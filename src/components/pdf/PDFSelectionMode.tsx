
import React from 'react';
import { Button } from '@/components/ui/button';

interface PDFSelectionModeProps {
  isSelectionMode: boolean;
  selectedText: string;
  onSelectionComplete: () => void;
  onCancel: () => void;
}

export const PDFSelectionMode: React.FC<PDFSelectionModeProps> = ({
  isSelectionMode,
  selectedText,
  onSelectionComplete,
  onCancel,
}) => {
  if (!isSelectionMode) {
    return (
      <div className="text-sm text-gray-300">
        Click on highlighted text to edit or select new text
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <span className="text-sm text-amber-300">Selection mode active - select text for next word</span>
        {selectedText && (
          <span className="text-sm text-white">Selected: "{selectedText}"</span>
        )}
        {selectedText && (
          <Button 
            className="px-2 py-1 text-xs bg-amber-600 rounded hover:bg-amber-700"
            onClick={onSelectionComplete}
          >
            Set as next word
          </Button>
        )}
      </div>
      <Button
        variant="outline"
        onClick={onCancel}
        className="text-xs"
      >
        Cancel Selection
      </Button>
    </div>
  );
};
