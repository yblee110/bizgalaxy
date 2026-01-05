"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UploadedDocument } from '@/types';

interface DocumentDropzoneProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  isScanning?: boolean;
}

export default function DocumentDropzone({
  onFileSelect,
  onFileRemove,
  selectedFile,
  isScanning = false,
}: DocumentDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/markdown': ['.md'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  if (selectedFile) {
    return (
      <div className="relative glass rounded-lg p-4 border border-primary/30">
        <div className="flex items-center gap-3">
          {getFileIcon(selectedFile.name)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          {!isScanning && (
            <button
              onClick={onFileRemove}
              className="p-1 hover:bg-white/10 rounded-md transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {isScanning && (
          <div className="mt-3">
            <div className="flex items-center gap-2 text-sm text-primary">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>문서 분석 중...</span>
            </div>
            {/* Scanning animation */}
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-scan" style={{ width: '100%' }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'glass rounded-lg p-8 border-2 border-dashed transition-all cursor-pointer',
        (isDragActive || isDragging)
          ? 'border-primary bg-primary/10'
          : 'border-white/20 hover:border-white/40 hover:bg-white/5'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className={cn(
            'p-4 rounded-full transition-all',
            isDragActive ? 'bg-primary/20' : 'bg-white/5'
          )}
        >
          <Upload
            className={cn(
              'h-6 w-6',
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            {isDragActive ? '여기에 파일을 놓으세요' : '기획서 업로드'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, Markdown 또는 TXT 파일
          </p>
        </div>
      </div>
    </div>
  );
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') {
    return <File className="h-8 w-8 text-red-400" />;
  }
  if (ext === 'md' || ext === 'txt') {
    return <FileText className="h-8 w-8 text-blue-400" />;
  }
  return <File className="h-8 w-8 text-muted-foreground" />;
}
