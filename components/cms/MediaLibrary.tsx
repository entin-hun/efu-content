/**
 * Media Library Component
 * 
 * Ez a komponens megjeleníti a feltöltött média fájlokat,
 * és lehetővé teszi azok kiválasztását CMS blokkokhoz.
 */

'use client';

import { useState, useEffect } from 'react';
import type { Media } from '@/lib/cms/types';
import MediaUploader from './MediaUploader';

interface MediaLibraryProps {
  onSelect?: (media: Media) => void;
  multiple?: boolean;
}

export default function MediaLibrary({ onSelect, multiple = false }: MediaLibraryProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      setLoading(true);
      const response = await fetch('/api/cms/media');
      const data = await response.json();

      if (response.ok) {
        setMedia(data.media);
      } else {
        setError(data.error || 'Failed to load media');
      }
    } catch (err) {
      setError('Failed to load media');
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadComplete(newMedia: Media) {
    await loadMedia();
    setShowUpload(false);
    if (onSelect) {
      onSelect(newMedia);
    }
  }

  function handleSelect(mediaItem: Media) {
    if (!onSelect) return;

    if (multiple) {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(mediaItem.id)) {
        newSelected.delete(mediaItem.id);
      } else {
        newSelected.add(mediaItem.id);
      }
      setSelectedIds(newSelected);
    } else {
      onSelect(mediaItem);
    }
  }

  function handleConfirmSelection() {
    if (!onSelect) return;

    const selected = media.filter((m) => selectedIds.has(m.id));
    if (selected.length > 0) {
      onSelect(selected[0]); // For now, return first selected
    }
    setSelectedIds(new Set());
  }

  const filteredMedia = media.filter((m) => {
    if (filter === 'all') return true;
    if (filter === 'image') return m.mimeType.startsWith('image/');
    if (filter === 'video') return m.mimeType.startsWith('video/');
    return true;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto"></div>
        <p className="mt-4 text-gray-600">Média betöltése...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Média könyvtár</h3>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 bg-brand-red text-white rounded hover:bg-red-700 text-sm"
        >
          {showUpload ? 'Bezárás' : '+ Feltöltés'}
        </button>
      </div>

      {/* Upload Area */}
      {showUpload && (
        <div className="bg-gray-50 rounded-lg p-4">
          <MediaUploader onUpload={handleUploadComplete} />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'image', 'video'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm ${
              filter === f
                ? 'bg-brand-red text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f === 'all' ? 'Összes' : f === 'image' ? 'Képek' : 'Videók'}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={loadMedia}
            className="ml-4 underline hover:no-underline"
          >
            Újra próbál
          </button>
        </div>
      )}

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2"></div>
          <p>Még nincsenek feltöltött fájlok.</p>
          <p className="text-sm mt-1">Kattints a "Feltöltés" gombra az első fájl hozzáadásához.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const isImage = item.mimeType.startsWith('image/');
            const isVideo = item.mimeType.startsWith('video/');

            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition ${
                  isSelected
                    ? 'border-brand-red ring-2 ring-brand-red ring-offset-2'
                    : 'border-gray-200 hover:border-brand-red'
                }`}
              >
                {/* Preview */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={item.alt?.hu || item.alt?.en || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : isVideo ? (
                    <div className="text-4xl">🎬</div>
                  ) : (
                    <div className="text-4xl">📄</div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-700 truncate">
                    {item.alt?.hu || item.alt?.en || 'Névtelen'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(item.size)} • {formatDate(item.createdAt)}
                  </p>
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-brand-red rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Selection (multiple mode) */}
      {multiple && selectedIds.size > 0 && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border">
          <p className="text-sm text-gray-700 mb-2">
            {selectedIds.size} fájl kiválasztva
          </p>
          <button
            onClick={handleConfirmSelection}
            className="px-4 py-2 bg-brand-red text-white rounded hover:bg-red-700 text-sm"
          >
            Kiválasztás megerősítése
          </button>
        </div>
      )}
    </div>
  );
}
