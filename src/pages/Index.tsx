
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import FileUploader from '@/components/FileUploader';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import { parsePdf, searchInText, convertToCSV, downloadCSV, SearchResult } from '@/utils/pdfUtils';

const Index = () => {
  const { toast } = useToast();
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);
    
    try {
      const text = await parsePdf(file);
      setPdfText(text);
      setSearchResults([]);
      toast({
        title: 'PDF uploaded successfully',
        description: `${file.name} is ready to be searched.`,
      });
    } catch (error) {
      toast({
        title: 'Error uploading PDF',
        description: error instanceof Error ? error.message : 'Failed to parse the PDF file.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearch = (searchTerms: string[]) => {
    if (!pdfText) {
      toast({
        title: 'No PDF loaded',
        description: 'Please upload a PDF file first.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const results = searchInText(pdfText, searchTerms);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: 'No matches found',
          description: 'Try different search terms or upload another PDF.',
        });
      } else {
        toast({
          title: 'Search completed',
          description: `Found ${results.length} matches.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Search error',
        description: 'An error occurred while searching the PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    if (searchResults.length === 0) return;
    
    try {
      const csvContent = convertToCSV(searchResults);
      const exportFileName = `${fileName.replace('.pdf', '')}_search_results.csv`;
      downloadCSV(csvContent, exportFileName);
      
      toast({
        title: 'Export successful',
        description: `Results exported as ${exportFileName}`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'An error occurred while exporting to CSV.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 space-y-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">PDF Word Scraper</h1>
        <p className="text-muted-foreground">Upload a PDF, search for words, and export results as CSV</p>
      </header>

      <div className="space-y-6">
        {!pdfText ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 1: Upload a PDF</h2>
            <FileUploader onFileUpload={handleFileUpload} isLoading={isProcessing} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">PDF Loaded: {fileName}</h2>
              <button 
                onClick={() => {
                  setPdfText(null);
                  setFileName('');
                  setSearchResults([]);
                }}
                className="text-sm text-blue-500 hover:underline"
              >
                Change PDF
              </button>
            </div>
            
            <div className="space-y-4 bg-secondary/30 p-6 rounded-lg">
              <h2 className="text-xl font-semibold">Step 2: Search for Words</h2>
              <SearchForm onSearch={handleSearch} isLoading={isProcessing} />
            </div>
          </>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 3: Review and Export Results</h2>
            <ResultsList results={searchResults} onExport={handleExport} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
