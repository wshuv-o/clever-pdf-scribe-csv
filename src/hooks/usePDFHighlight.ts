
import { useEffect, RefObject } from 'react';
import { SearchResult } from '@/utils/pdfUtils';

interface UsePDFHighlightProps {
  textLayerRef: RefObject<HTMLDivElement>;
  filteredResults: SearchResult[];
  textLayerRendered: boolean;
  pageNumber: number;
}

export const usePDFHighlight = ({
  textLayerRef,
  filteredResults,
  textLayerRendered,
  pageNumber
}: UsePDFHighlightProps) => {
  useEffect(() => {
    if (!textLayerRef.current || !filteredResults.length || !textLayerRendered) return;

    const applyHighlights = () => {
      const textLayer = textLayerRef.current;
      if (!textLayer) return;

      // Remove existing highlights
      const previousHighlights = textLayer.querySelectorAll('.pdf-highlight');
      previousHighlights.forEach(highlight => highlight.remove());

      // Get all text nodes in the PDF
      const walker = document.createTreeWalker(
        textLayer,
        NodeFilter.SHOW_TEXT,
        null
      );

      filteredResults.forEach(result => {
        if (!result.isHighlighted) return;

        const searchTerm = result.match.toLowerCase();
        let node: Node | null = walker.currentNode;

        // Reset walker to start
        walker.currentNode = textLayer;

        while (node = walker.nextNode()) {
          const text = node.textContent || '';
          const lowerText = text.toLowerCase();
          let position = lowerText.indexOf(searchTerm);

          while (position !== -1) {
            const range = document.createRange();
            range.setStart(node, position);
            range.setEnd(node, position + searchTerm.length);

            const rect = range.getBoundingClientRect();
            const highlight = document.createElement('div');
            highlight.className = 'pdf-highlight';
            highlight.style.position = 'absolute';
            highlight.style.left = `${rect.left - textLayer.getBoundingClientRect().left}px`;
            highlight.style.top = `${rect.top - textLayer.getBoundingClientRect().top}px`;
            highlight.style.width = `${rect.width}px`;
            highlight.style.height = `${rect.height}px`;
            highlight.style.backgroundColor = 'rgba(139, 92, 246, 0.5)';
            highlight.style.pointerEvents = 'none';
            highlight.style.mixBlendMode = 'multiply';
            highlight.style.zIndex = '1';

            textLayer.appendChild(highlight);

            position = lowerText.indexOf(searchTerm, position + 1);
          }
        }
      });
    };

    const timer = setTimeout(applyHighlights, 100);
    return () => clearTimeout(timer);
  }, [filteredResults, textLayerRendered, pageNumber]);
};
