/**
 * CMS Page Editor
 * 
 * Ez a komponens lehetővé teszi egy CMS oldal szerkesztését:
 * - Blokkok hozzáadása, szerkesztése, törlése
 * - Blokkok sorrendjének módosítása
 * - SEO beállítások
 * - Publikálás/piszkozat állapot
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Page, Block, BlockType, LocalizedString } from '@/lib/cms/types';

const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: 'hero', label: 'Hero', icon: '🎯' },
  { type: 'text', label: 'Szöveg', icon: '📝' },
  { type: 'image', label: 'Kép', icon: '️' },
  { type: 'video', label: 'Videó', icon: '🎬' },
  { type: 'gallery', label: 'Galéria', icon: '' },
  { type: 'cta', label: 'CTA', icon: '' },
  { type: 'divider', label: 'Elválasztó', icon: '➖' },
  { type: 'spacer', label: 'Térköz', icon: '↕️' },
];

export default function CmsPageEditor() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddBlock, setShowAddBlock] = useState(false);

  useEffect(() => {
    loadPage();
  }, [slug]);

  async function loadPage() {
    try {
      setLoading(true);
      const response = await fetch(`/api/cms/pages/${slug}`);
      const data = await response.json();

      if (response.ok) {
        setPage(data.page);
      } else {
        setError(data.error || 'Failed to load page');
      }
    } catch (err) {
      setError('Failed to load page');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!page) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/cms/pages/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(page),
      });

      if (response.ok) {
        const data = await response.json();
        setPage(data.page);
        setError(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save page');
      }
    } catch (err) {
      setError('Failed to save page');
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish() {
    if (!page) return;

    const updatedPage = {
      ...page,
      published: !page.published,
    };

    setPage(updatedPage);

    try {
      const response = await fetch(`/api/cms/pages/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPage),
      });

      if (!response.ok) {
        setError('Failed to update publish status');
        await loadPage();
      }
    } catch (err) {
      setError('Failed to update publish status');
      await loadPage();
    }
  }

  function handleAddBlock(type: BlockType) {
    if (!page) return;

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      layout: 'full',
      content: getDefaultContent(type),
      settings: {
        padding: 'medium',
      },
      order: page.blocks.length,
      visible: true,
    };

    setPage({
      ...page,
      blocks: [...page.blocks, newBlock],
    });
    setShowAddBlock(false);
  }

  function handleDeleteBlock(blockId: string) {
    if (!page) return;

    setPage({
      ...page,
      blocks: page.blocks
        .filter((b) => b.id !== blockId)
        .map((b, index) => ({ ...b, order: index })),
    });
  }

  function handleMoveBlock(blockId: string, direction: 'up' | 'down') {
    if (!page) return;

    const blockIndex = page.blocks.findIndex((b) => b.id === blockId);
    if (blockIndex === -1) return;

    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= page.blocks.length) return;

    const newBlocks = [...page.blocks];
    const temp = newBlocks[blockIndex];
    newBlocks[blockIndex] = newBlocks[newIndex];
    newBlocks[newIndex] = temp;

    setPage({
      ...page,
      blocks: newBlocks.map((b, index) => ({ ...b, order: index })),
    });
  }

  function handleUpdateBlock(blockId: string, updates: Partial<Block>) {
    if (!page) return;

    setPage({
      ...page,
      blocks: page.blocks.map((b) =>
        b.id === blockId ? { ...b, ...updates } : b
      ),
    });
  }

  function handleUpdateTitle(locale: 'hu' | 'en', value: string) {
    if (!page) return;

    setPage({
      ...page,
      title: {
        ...page.title,
        [locale]: value,
      },
    });
  }

  function getDefaultContent(type: BlockType): Record<string, any> {
    switch (type) {
      case 'hero':
        return {
          title: { hu: '', en: '' },
          subtitle: { hu: '', en: '' },
          ctaText: { hu: '', en: '' },
          ctaLink: '',
        };
      case 'text':
        return {
          content: { hu: '', en: '' },
        };
      case 'image':
        return {
          src: '',
          alt: { hu: '', en: '' },
          caption: { hu: '', en: '' },
        };
      case 'video':
        return {
          url: '',
          autoplay: false,
          loop: false,
        };
      case 'gallery':
        return {
          images: [],
        };
      case 'cta':
        return {
          text: { hu: '', en: '' },
          link: '',
          variant: 'primary',
        };
      case 'divider':
        return {};
      case 'spacer':
        return {
          height: 'medium',
        };
      default:
        return {};
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Betöltés...</div>
      </div>
    );
  }

  if (error && !page) {
    return (
      <div className="p-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => router.push('/admin/cms/pages')}
          className="px-4 py-2 bg-brand-red text-white rounded hover:bg-red-700"
        >
          Vissza
        </button>
      </div>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => router.push('/admin/cms/pages')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Vissza az oldalakhoz
          </button>
          <h1 className="text-3xl font-bold">Oldal szerkesztése: {slug}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTogglePublish}
            className={`px-4 py-2 rounded ${
              page.published
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {page.published ? 'Piszkozat' : 'Publikálás'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-brand-red text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Mentés...' : 'Mentés'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Page Title */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Oldal cím</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Magyar
            </label>
            <input
              type="text"
              value={page.title.hu || ''}
              onChange={(e) => handleUpdateTitle('hu', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              English
            </label>
            <input
              type="text"
              value={page.title.en || ''}
              onChange={(e) => handleUpdateTitle('en', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tartalmi blokkok</h2>
          <button
            onClick={() => setShowAddBlock(true)}
            className="px-4 py-2 bg-brand-red text-white rounded hover:bg-red-700"
          >
            + Blokk hozzáadása
          </button>
        </div>

        {page.blocks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Még nincsenek blokkok. Kattints a "Blokk hozzáadása" gombra.
          </div>
        ) : (
          page.blocks.map((block, index) => (
            <BlockEditor
              key={block.id}
              block={block}
              index={index}
              total={page.blocks.length}
              onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
              onDelete={() => handleDeleteBlock(block.id)}
              onMove={(direction) => handleMoveBlock(block.id, direction)}
            />
          ))
        )}
      </div>

      {/* Add Block Modal */}
      {showAddBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Blokk típus kiválasztása</h3>
            <div className="grid grid-cols-2 gap-4">
              {BLOCK_TYPES.map((bt) => (
                <button
                  key={bt.type}
                  onClick={() => handleAddBlock(bt.type)}
                  className="flex items-center gap-3 p-4 border border-gray-300 rounded hover:border-brand-red hover:bg-red-50 transition"
                >
                  <span className="text-2xl">{bt.icon}</span>
                  <span className="font-medium">{bt.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddBlock(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Mégse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Block Editor Component */
function BlockEditor({
  block,
  index,
  total,
  onUpdate,
  onDelete,
  onMove,
}: {
  block: Block;
  index: number;
  total: number;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const blockType = BLOCK_TYPES.find((bt) => bt.type === block.type);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{blockType?.icon}</span>
          <div>
            <div className="font-medium">{blockType?.label}</div>
            <div className="text-sm text-gray-500">
              #{index + 1} • {block.layout}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30"
            title="Mozgatás felfelé"
          >
            ↑
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={index === total - 1}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30"
            title="Mozgatás lefelé"
          >
            ↓
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-gray-600 hover:text-gray-900"
            title={expanded ? 'Összecsukás' : 'Kibontás'}
          >
            {expanded ? '−' : '+'}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:text-red-900"
            title="Törlés"
          >
            🗑
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Layout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Elrendezés
            </label>
            <select
              value={block.layout}
              onChange={(e) => onUpdate({ layout: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="full">Teljes szélesség</option>
              <option value="wide">Széles</option>
              <option value="narrow">Keskeny</option>
              <option value="split">Osztott</option>
            </select>
          </div>

          {/* Block-specific content editor */}
          <BlockContentEditor block={block} onUpdate={onUpdate} />

          {/* Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Háttérszín
            </label>
            <input
              type="color"
              value={block.settings.backgroundColor || '#ffffff'}
              onChange={(e) =>
                onUpdate({
                  settings: { ...block.settings, backgroundColor: e.target.value },
                })
              }
              className="w-full h-10 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Padding
            </label>
            <select
              value={block.settings.padding || 'medium'}
              onChange={(e) =>
                onUpdate({
                  settings: { ...block.settings, padding: e.target.value as any },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="none">Nincs</option>
              <option value="small">Kicsi</option>
              <option value="medium">Közepes</option>
              <option value="large">Nagy</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`visible-${block.id}`}
              checked={block.visible}
              onChange={(e) => onUpdate({ visible: e.target.checked })}
              className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
            />
            <label htmlFor={`visible-${block.id}`} className="text-sm text-gray-700">
              Látható
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

/** Block Content Editor - típus-specifikus szerkesztő */
function BlockContentEditor({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}) {
  const updateContent = (key: string, value: any) => {
    onUpdate({
      content: { ...block.content, [key]: value },
    });
  };

  const updateLocalized = (key: string, locale: 'hu' | 'en', value: string) => {
    onUpdate({
      content: {
        ...block.content,
        [key]: { ...block.content[key], [locale]: value },
      },
    });
  };

  switch (block.type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <LocalizedInput
            label="Cím"
            value={block.content.title || {}}
            onChange={(locale, value) => updateLocalized('title', locale, value)}
          />
          <LocalizedInput
            label="Alcím"
            value={block.content.subtitle || {}}
            onChange={(locale, value) => updateLocalized('subtitle', locale, value)}
          />
          <LocalizedInput
            label="CTA szöveg"
            value={block.content.ctaText || {}}
            onChange={(locale, value) => updateLocalized('ctaText', locale, value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CTA link
            </label>
            <input
              type="text"
              value={block.content.ctaLink || ''}
              onChange={(e) => updateContent('ctaLink', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="space-y-4">
          <LocalizedTextarea
            label="Tartalom"
            value={block.content.content || {}}
            onChange={(locale, value) => updateLocalized('content', locale, value)}
            rows={6}
          />
        </div>
      );

    case 'image':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kép URL
            </label>
            <input
              type="text"
              value={block.content.src || ''}
              onChange={(e) => updateContent('src', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <LocalizedInput
            label="Alt szöveg"
            value={block.content.alt || {}}
            onChange={(locale, value) => updateLocalized('alt', locale, value)}
          />
          <LocalizedInput
            label="Felirat"
            value={block.content.caption || {}}
            onChange={(locale, value) => updateLocalized('caption', locale, value)}
          />
        </div>
      );

    case 'video':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Videó URL (YouTube, Vimeo, stb.)
            </label>
            <input
              type="text"
              value={block.content.url || ''}
              onChange={(e) => updateContent('url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={block.content.autoplay || false}
                onChange={(e) => updateContent('autoplay', e.target.checked)}
                className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
              />
              <span className="text-sm text-gray-700">Automatikus lejátszás</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={block.content.loop || false}
                onChange={(e) => updateContent('loop', e.target.checked)}
                className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
              />
              <span className="text-sm text-gray-700">Ismétlés</span>
            </label>
          </div>
        </div>
      );

    case 'cta':
      return (
        <div className="space-y-4">
          <LocalizedInput
            label="Szöveg"
            value={block.content.text || {}}
            onChange={(locale, value) => updateLocalized('text', locale, value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link
            </label>
            <input
              type="text"
              value={block.content.link || ''}
              onChange={(e) => updateContent('link', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stílus
            </label>
            <select
              value={block.content.variant || 'primary'}
              onChange={(e) => updateContent('variant', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="primary">Elsődleges</option>
              <option value="secondary">Másodlagos</option>
              <option value="outline">Körvonal</option>
            </select>
          </div>
        </div>
      );

    case 'spacer':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Magasság
          </label>
          <select
            value={block.content.height || 'medium'}
            onChange={(e) => updateContent('height', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-red"
          >
            <option value="small">Kicsi (32px)</option>
            <option value="medium">Közepes (64px)</option>
            <option value="large">Nagy (128px)</option>
          </select>
        </div>
      );

    default:
      return (
        <div className="text-gray-500 text-sm">
          Ehhez a blokk típushoz nincs szerkesztő.
        </div>
      );
  }
}

/** Localized Input Component */
function LocalizedInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: LocalizedString;
  onChange: (locale: 'hu' | 'en', value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} (HU)
        </label>
        <input
          type="text"
          value={value.hu || ''}
          onChange={(e) => onChange('hu', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} (EN)
        </label>
        <input
          type="text"
          value={value.en || ''}
          onChange={(e) => onChange('en', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
      </div>
    </div>
  );
}

/** Localized Textarea Component */
function LocalizedTextarea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: LocalizedString;
  onChange: (locale: 'hu' | 'en', value: string) => void;
  rows?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} (HU)
        </label>
        <textarea
          value={value.hu || ''}
          onChange={(e) => onChange('hu', e.target.value)}
          rows={rows}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} (EN)
        </label>
        <textarea
          value={value.en || ''}
          onChange={(e) => onChange('en', e.target.value)}
          rows={rows}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
      </div>
    </div>
  );
}
