
import { useState, useEffect } from 'react';

interface UsePDFTextSelectionProps {
  isSelectionMode: boolean;
  onUpdateNextWord?: (resultId: string, newWord: string) => void;
}

export const usePDFTextSelection = ({ isSelectionMode, onUpdateNextWord }: UsePDFTextSelectionProps) => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionResultId, setSelectionResultId] = useState<string | null>(null);

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

  const handleSelectionComplete = () => {
    if (selectionResultId && selectedText && onUpdateNextWord) {
      onUpdateNextWord(selectionResultId, selectedText);
      setSelectedText('');
      setSelectionResultId(null);
    }
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectionResultId(null);
    setSelectedText('');
  };

  return {
    selectedText,
    selectionResultId,
    setSelectionResultId,
    handleSelectionComplete,
    cancelSelection,
  };
};
