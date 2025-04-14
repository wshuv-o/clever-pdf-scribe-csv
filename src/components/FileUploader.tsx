
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (files: File[]) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, isLoading }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
        if (pdfFiles.length > 0) {
          onFileUpload(pdfFiles);
        }
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    disabled: isLoading,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border border-dashed rounded-md p-6 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-gray-600 hover:border-gray-500',
        isDragReject && 'border-red-500 bg-red-500/10',
        isLoading && 'opacity-50 cursor-not-allowed',
        'flex flex-col items-center justify-center'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2">
        <Upload className="w-5 h-5 text-gray-400" />
        <p className="text-sm text-gray-300">
          {isDragActive
            ? 'Drop the PDF files here'
            : isLoading
            ? 'Processing...'
            : 'Upload PDFs'}
        </p>
      </div>
    </div>
  );
};

export default FileUploader;
