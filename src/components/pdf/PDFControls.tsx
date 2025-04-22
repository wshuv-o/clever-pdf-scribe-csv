
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PDFControlsProps {
  pageNumber: number;
  numPages: number;
  scale: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const PDFControls: React.FC<PDFControlsProps> = ({
  pageNumber,
  numPages,
  scale,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="flex items-center justify-between p-2 bg-[#171923] border-t border-gray-800">
      <Button
        variant="outline"
        onClick={onPrevPage}
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
        onClick={onNextPage}
        disabled={pageNumber >= numPages}
        className="flex items-center gap-2 bg-[#171923] border-gray-700 text-gray-300"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
