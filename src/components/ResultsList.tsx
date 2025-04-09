
import React from 'react';
import { SearchResult } from '@/utils/pdfUtils';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResultsListProps {
  results: SearchResult[];
  onExport: () => void;
}

const ResultsList: React.FC<ResultsListProps> = ({ results, onExport }) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Results ({results.length})
        </h2>
        <Button onClick={onExport} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export as CSV
        </Button>
      </div>

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id}>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                Page {result.pageNumber}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3 text-sm">
              <p className="whitespace-pre-wrap">
                <span className="text-muted-foreground">{result.beforeMatch}</span>{' '}
                <span className={cn("highlight font-medium")}>{result.match}</span>{' '}
                <span className="text-muted-foreground">{result.afterMatch}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ResultsList;
