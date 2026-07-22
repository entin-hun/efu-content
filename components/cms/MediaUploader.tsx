/**
 * Media Uploader Component
 * 
 * Ez a komponens lehetővé teszi fájlok feltöltését és kezelését a CMS-ben.
 * Támogatja a képek, videók és egyéb fájlok feltöltését.
 */

'use client';

import { useState, useRef } from 'react';
import type { Media } from '@/lib/cms/types';

interface MediaUploaderProps {
  onUpload: (media: Media) => void;
  accept?: string;
  maxSize?: number; // bytes
}

export default function MediaUploader({
  onUpload,
  accept = 'image/*,video/*',
  maxSize = 10 * 1024 * 1024, // 10MB
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    // File size check
    if (file.size > maxSize) {
      setError(`A fájl túl nagy. Maximum ${maxSize / 1024 / 1024}MB lehet.`);
      return;
    }

    // File type check
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    const isAccepted = acceptedTypes.some((type) => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });

    if (!isAccepted) {
      setError(`Nem támogatott fájltípus. Elfogadott: ${accept}`);
      return;
    }

    try {
      setUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload to API
      const response = await fetch('/api/cms/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload file');
      }

      const data = await response.json();
      onUpload(data.media);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          dragActive
            ? 'border-brand-red bg-red-50'
            : 'border-gray-300 hover:border-brand-red hover:bg-gray-50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto"></div>
            <p className="text-gray-600">Feltöltés...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <p className="text-gray-700 font-medium">
              Húzd ide a fájlt, vagy kattints a tallózáshoz
            </p>
            <p className="text-sm text-gray-500">
              Maximum {maxSize / 1024 / 1024}MB • {accept}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
