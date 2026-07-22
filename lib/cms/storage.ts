/**
 * CMS Storage - JSON fájl alapú tárolás
 * 
 * Ez a modul kezeli a CMS adatok olvasását és írását JSON fájlokba.
 * A fájlok a `data/cms/` könyvtárban találhatók.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { Page, Media, CmsStorage } from './types';

const CMS_DATA_DIR = path.join(process.cwd(), 'data', 'cms');
const PAGES_DIR = path.join(CMS_DATA_DIR, 'pages');
const MEDIA_DIR = path.join(CMS_DATA_DIR, 'media');

/** Biztosítja, hogy a könyvtárak léteznek */
async function ensureDirectories(): Promise<void> {
  await fs.mkdir(PAGES_DIR, { recursive: true });
  await fs.mkdir(MEDIA_DIR, { recursive: true });
}

/** Egy JSON fájl olvasása */
async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/** Egy JSON fájl írása */
async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/** Pages storage implementation */
export const pagesStorage: CmsStorage = {
  async readAllPages(): Promise<Page[]> {
    await ensureDirectories();
    const files = await fs.readdir(PAGES_DIR);
    const pages: Page[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const page = await readJsonFile<Page>(path.join(PAGES_DIR, file));
        if (page) {
          pages.push(page);
        }
      }
    }
    
    return pages.sort((a, b) => a.slug.localeCompare(b.slug));
  },

  async readPage(slug: string): Promise<Page | null> {
    await ensureDirectories();
    const filePath = path.join(PAGES_DIR, `${slug}.json`);
    return readJsonFile<Page>(filePath);
  },

  async readPublishedPages(): Promise<Page[]> {
    const allPages = await this.readAllPages();
    return allPages.filter(page => page.published);
  },

  async upsertPage(page: Page): Promise<void> {
    await ensureDirectories();
    const filePath = path.join(PAGES_DIR, `${page.slug}.json`);
    await writeJsonFile(filePath, page);
  },

  async deletePage(slug: string): Promise<void> {
    await ensureDirectories();
    const filePath = path.join(PAGES_DIR, `${slug}.json`);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  },

  // Media methods - not implemented in this storage
  async readAllMedia(): Promise<Media[]> {
    return [];
  },

  async readMedia(id: string): Promise<Media | null> {
    return null;
  },

  async upsertMedia(media: Media): Promise<void> {
    // Not implemented
  },

  async deleteMedia(id: string): Promise<void> {
    // Not implemented
  },
};

/** Media storage implementation */
export const mediaStorage: CmsStorage = {
  async readAllPages(): Promise<Page[]> {
    return [];
  },

  async readPage(slug: string): Promise<Page | null> {
    return null;
  },

  async readPublishedPages(): Promise<Page[]> {
    return [];
  },

  async upsertPage(page: Page): Promise<void> {
    // Not implemented
  },

  async deletePage(slug: string): Promise<void> {
    // Not implemented
  },

  async readAllMedia(): Promise<Media[]> {
    await ensureDirectories();
    const files = await fs.readdir(MEDIA_DIR);
    const media: Media[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const item = await readJsonFile<Media>(path.join(MEDIA_DIR, file));
        if (item) {
          media.push(item);
        }
      }
    }
    
    return media.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async readMedia(id: string): Promise<Media | null> {
    await ensureDirectories();
    const filePath = path.join(MEDIA_DIR, `${id}.json`);
    return readJsonFile<Media>(filePath);
  },

  async upsertMedia(media: Media): Promise<void> {
    await ensureDirectories();
    const filePath = path.join(MEDIA_DIR, `${media.id}.json`);
    await writeJsonFile(filePath, media);
  },

  async deleteMedia(id: string): Promise<void> {
    await ensureDirectories();
    const filePath = path.join(MEDIA_DIR, `${id}.json`);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  },
};

/** Seed data - alap oldalak */
export const SEED_PAGES: Page[] = [
  {
    id: 'home',
    slug: 'home',
    title: {
      hu: 'Főoldal',
      en: 'Home',
    },
    blocks: [
      {
        id: 'hero-1',
        type: 'hero',
        layout: 'full',
        content: {
          title: {
            hu: 'Elite Fight Universe',
            en: 'Elite Fight Universe',
          },
          subtitle: {
            hu: 'A jövő harcművészete',
            en: 'The future of martial arts',
          },
          ctaText: {
            hu: 'Csatlakozz most',
            en: 'Join now',
          },
          ctaLink: '/register',
        },
        settings: {
          backgroundColor: '#0A0A0A',
          padding: 'large',
        },
        order: 0,
        visible: true,
      },
    ],
    seo: {
      title: {
        hu: 'EFU - Elite Fight Universe',
        en: 'EFU - Elite Fight Universe',
      },
      description: {
        hu: 'A jövő harcművészeti univerzuma',
        en: 'The future martial arts universe',
      },
    },
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/** Inicializálja a seed adatokat */
export async function initializeSeedData(): Promise<void> {
  await ensureDirectories();
  
  for (const page of SEED_PAGES) {
    const existing = await pagesStorage.readPage(page.slug);
    if (!existing) {
      await pagesStorage.upsertPage(page);
    }
  }
}
