import React, { useRef, useState } from 'react';
import { Upload, X, FileIcon, Image as ImageIcon, FileText } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface FileUploadProps {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  value = [],
  onChange,
  accept = 'image/*,.pdf,.doc,.docx',
  maxFiles = 5,
  maxSize = 10,
  label,
  description,
  className,
  disabled = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !onChange) return;

    const newFiles: UploadedFile[] = [];
    const maxSizeBytes = maxSize * 1024 * 1024;

    Array.from(files).forEach((file) => {
      if (file.size > maxSizeBytes) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return;
      }

      if (value.length + newFiles.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const uploadedFile: UploadedFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: e.target?.result as string,
          uploadedAt: new Date().toISOString(),
        };

        newFiles.push(uploadedFile);
        if (newFiles.length === files.length) {
          onChange([...value, ...newFiles]);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (fileId: string) => {
    if (onChange) {
      onChange(value.filter((f) => f.id !== fileId));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <FileIcon className="w-5 h-5" />;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <div>
          <label className="text-sm font-medium">{label}</label>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      )}

      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600',
          disabled && 'opacity-50 cursor-not-allowed',
          value.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-500">
            Maximum {maxFiles} files, up to {maxSize}MB each
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || value.length >= maxFiles}
        />
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex-shrink-0 text-gray-500">
                {getFileIcon(file.type)}
              </div>
              
              {file.type.startsWith('image/') ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-700"
                />
              ) : null}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
