/**
 * CMS Pages API Route
 * 
 * GET /api/cms/pages - Összes oldal lekérése
 * POST /api/cms/pages - Új oldal létrehozása
 */

import { NextRequest, NextResponse } from 'next/server';
import { pagesStorage, initializeSeedData } from '@/lib/cms/storage';
import type { Page } from '@/lib/cms/types';

export async function GET() {
  try {
    await initializeSeedData();
    const pages = await pagesStorage.readAllPages();
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error reading pages:', error);
    return NextResponse.json(
      { error: 'Failed to read pages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const page: Page = {
      ...body,
      id: body.id || `page-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await pagesStorage.upsertPage(page);
    return NextResponse.json({ page });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}
