
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import FileUploader from '@/components/FileUploader';
import SearchForm from '@/components/SearchForm';
import ResultsList from '@/components/ResultsList';
import PDFViewer from '@/components/PDFViewer';
import { Upload } from 'lucide-react';
import { 
  parseMultiplePdfs, 
  searchInText, 
  convertToCSV, 
  downloadCSV, 
  SearchResult,
  PdfContent
} from '@/utils/pdfUtils';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { toast } = useToast();
  const [pdfContents, setPdfContents] = useState<PdfContent[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUploader, setShowUploader] = useState(true);

  const handleFileUpload = async (files: File[]) => {
    setIsProcessing(true);
    const fileNameList = files.map(file => file.name);
    setFileNames(fileNameList);
    
    try {
      const contents = await parseMultiplePdfs(files);
      setPdfContents(contents);
      setSearchResults([]);
      setShowUploader(false);
      
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
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      {/* Header */}
      <header className="bg-[#171923] border-b border-gray-800 py-3 px-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-white">PDFlyzer</h1>
          
          <div className="flex items-center gap-4">
            {pdfContents.length > 0 && (
              <>
                <div className="w-96">
                  <SearchForm onSearch={handleSearch} isLoading={isProcessing} />
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-[#171923] border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={() => setShowUploader(true)}
                >
                  <Upload className="w-4 h-4" />
                  Upload PDFs
                </Button>
              </>
            )}
            
            {searchResults.length > 0 && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-[#171923] border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={handleExport}
              >
                Export
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex">
        {showUploader && pdfContents.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
              <h2 className="text-xl font-semibold mb-6 text-white text-center">Upload PDFs</h2>
              <FileUploader onFileUpload={handleFileUpload} isLoading={isProcessing} />
            </div>
          </div>
        ) : showUploader ? (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#171923] rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4 text-white">Upload PDFs</h2>
              <FileUploader onFileUpload={handleFileUpload} isLoading={isProcessing} />
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowUploader(false)}
                  className="text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex max-h-[calc(100vh-60px)]">
            {/* Left Sidebar - Results */}
            <div className={`w-80 border-r border-gray-800 bg-[#171923] flex flex-col ${searchResults.length === 0 ? 'hidden' : ''}`}>
              <ResultsList 
                results={searchResults}
                onExport={handleExport}
              />
            </div>
            
            {/* Main Content - PDF Viewer */}
            <div className="flex-1 p-4 overflow-hidden">
              <PDFViewer fileNames={fileNames} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
