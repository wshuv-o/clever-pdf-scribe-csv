
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import FileUploader from '@/components/FileUploader';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import { 
  parseMultiplePdfs, 
  searchInText, 
  convertToCSV, 
  downloadCSV, 
  SearchResult,
  PdfContent
} from '@/utils/pdfUtils';

const Index = () => {
  const { toast } = useToast();
  const [pdfContents, setPdfContents] = useState<PdfContent[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    setIsProcessing(true);
    const fileNameList = files.map(file => file.name);
    setFileNames(fileNameList);
    
    try {
      const contents = await parseMultiplePdfs(files);
      setPdfContents(contents);
      setSearchResults([]);
      
      toast({
        title: 'PDFs uploaded successfully',
        description: `${files.length} file(s) ready to be searched.`,
      });
    } catch (error) {
      toast({
        title: 'Error uploading PDFs',
        description: error instanceof Error ? error.message : 'Failed to parse the PDF files.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearch = (searchTerms: string[]) => {
    if (!pdfContents.length) {
      toast({
        title: 'No PDFs loaded',
        description: 'Please upload PDF files first.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const results = searchInText(pdfContents, searchTerms);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: 'No matches found',
          description: 'Try different search terms or upload other PDFs.',
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
        description: 'An error occurred while searching the PDFs.',
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
      const exportFileName = `pdf_search_results.csv`;
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
        <p className="text-muted-foreground">Upload PDFs, search for words, and export results as CSV</p>
      </header>

      <div className="space-y-6">
        {pdfContents.length === 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 1: Upload PDFs</h2>
            <FileUploader onFileUpload={handleFileUpload} isLoading={isProcessing} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">PDFs Loaded: {fileNames.length}</h2>
              <button 
                onClick={() => {
                  setPdfContents([]);
                  setFileNames([]);
                  setSearchResults([]);
                }}
                className="text-sm text-blue-500 hover:underline"
              >
                Change PDFs
              </button>
            </div>
            
            {fileNames.length > 0 && (
              <div className="bg-secondary/20 p-4 rounded-lg">
                <p className="font-medium mb-2">Loaded files:</p>
                <ul className="list-disc pl-5">
                  {fileNames.map((name, index) => (
                    <li key={index} className="text-sm">{name}</li>
                  ))}
                </ul>
              </div>
            )}
            
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
