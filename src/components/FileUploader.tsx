
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, isLoading }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.type === 'application/pdf') {
          onFileUpload(file);
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
    maxFiles: 1,
    disabled: isLoading,
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
            ? 'Drop the PDF file here'
            : isLoading
            ? 'Processing...'
            : 'Drag & drop a PDF file here, or click to select one'}
        </p>
        <p className="text-xs text-gray-500">Only PDF files are supported</p>
      </div>
    </div>
  );
};

export default FileUploader;
