"use client";

import React, { useState, useCallback } from 'react';
import { Paperclip, X, Download, File, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskAttachment } from '@/types';
import { cn } from '@/lib/utils';

interface TaskAttachmentsProps {
  attachments: TaskAttachment[];
  onUpload: (file: File) => Promise<void>;
  onRemove: (attachmentId: string) => Promise<void>;
  readOnly?: boolean;
}

export default function TaskAttachments({
  attachments,
  onUpload,
  onRemove,
  readOnly = false,
}: TaskAttachmentsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        await onUpload(file);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  const handleRemove = useCallback(
    async (id: string) => {
      setIsUploading(true);
      try {
        await onRemove(id);
      } finally {
        setIsUploading(false);
      }
    },
    [onRemove]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isImage = (type: string): boolean => {
    return type.startsWith('image/');
  };

  const getFileIcon = (type: string) => {
    if (isImage(type)) return <ImageIcon className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Paperclip className="h-4 w-4" />
          <span>첨부파일 ({attachments.length})</span>
        </div>
        {!readOnly && (
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <Button variant="ghost" size="sm" className="h-6 text-xs" disabled={isUploading}>
              {isUploading ? '업로드 중...' : '+ 추가'}
            </Button>
          </label>
        )}
      </div>

      {/* Attachments List */}
      {attachments.length === 0 ? (
        <div className="text-center py-4 text-xs text-muted-foreground">
          첨부된 파일이 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              onRemove={!readOnly ? () => handleRemove(attachment.id) : undefined}
              onPreview={() => setPreviewUrl(attachment.url)}
            />
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
}

interface AttachmentItemProps {
  attachment: TaskAttachment;
  onRemove?: () => void;
  onPreview?: () => void;
}

function AttachmentItem({ attachment, onRemove, onPreview }: AttachmentItemProps) {
  const isImageType = attachment.type.startsWith('image/');

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10 group",
        isImageType && "cursor-pointer hover:bg-white/10"
      )}
      onClick={isImageType ? onPreview : undefined}
    >
      {/* Thumbnail or Icon */}
      <div className="shrink-0 w-10 h-10 rounded bg-white/10 flex items-center justify-center">
        {isImageType ? (
          <img
            src={attachment.url}
            alt={attachment.name}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <span className="text-muted-foreground">
            {getFileIcon(attachment.type)}
          </span>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{attachment.name}</p>
        <p className="text-xs text-muted-foreground">
          {attachment.uploaded_by} • {formatFileSize(attachment.size)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={attachment.url}
          download={attachment.name}
          className="p-1.5 hover:bg-white/10 rounded transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="h-4 w-4 text-muted-foreground hover:text-white" />
        </a>
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(type: string): React.ReactNode {
  return <File className="h-4 w-4" />;
}
