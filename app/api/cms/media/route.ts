/**
 * CMS Media API Route
 * 
 * POST /api/cms/media - Fájl feltöltése
 * GET /api/cms/media - Összes média lekérése
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Media } from '@/lib/cms/types';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MEDIA_DATA_DIR = path.join(process.cwd(), 'data', 'cms', 'media');

/** Biztosítja, hogy a könyvtárak léteznek */
async function ensureDirectories(): Promise<void> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(MEDIA_DATA_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    await ensureDirectories();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'bin';
    const filename = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Create media record
    const media: Media = {
      id: uuidv4(),
      url: `/uploads/${filename}`,
      alt: {
        hu: file.name,
        en: file.name,
      },
      mimeType: file.type,
      size: file.size,
      createdAt: new Date().toISOString(),
    };

    // Save media metadata
    const metadataPath = path.join(MEDIA_DATA_DIR, `${media.id}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(media, null, 2));

    return NextResponse.json({ media });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await ensureDirectories();

    const files = await fs.readdir(MEDIA_DATA_DIR);
    const media: Media[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(MEDIA_DATA_DIR, file), 'utf-8');
        const item = JSON.parse(content) as Media;
        media.push(item);
      }
    }

    return NextResponse.json({
      media: media.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    });
  } catch (error) {
    console.error('Error reading media:', error);
    return NextResponse.json(
      { error: 'Failed to read media' },
      { status: 500 }
    );
  }
}
