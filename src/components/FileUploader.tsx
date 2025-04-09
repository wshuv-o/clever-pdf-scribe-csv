
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
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400',
        isDragReject && 'border-red-500 bg-red-50',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2">
        <Upload className="w-8 h-8 text-gray-400" />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? 'Drop the PDF files here'
            : isLoading
            ? 'Processing...'
            : 'Drag & drop PDF files here, or click to select files'}
        </p>
        <p className="text-xs text-gray-500">Only PDF files are supported</p>
      </div>
    </div>
  );
};

export default FileUploader;
