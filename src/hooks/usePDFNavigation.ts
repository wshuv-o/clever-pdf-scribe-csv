
import { useState } from 'react';

interface UsePDFNavigationProps {
  totalPages: number;
}

export const usePDFNavigation = ({ totalPages }: UsePDFNavigationProps) => {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);

  const nextPage = () => {
    if (pageNumber < totalPages) {
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

  return {
    pageNumber,
    scale,
    nextPage,
    prevPage,
    zoomIn,
    zoomOut,
    setPageNumber
  };
};
