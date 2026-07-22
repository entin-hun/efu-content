/**
 * CMS Single Page API Route
 * 
 * GET /api/cms/pages/[slug] - Egy oldal lekérése
 * PUT /api/cms/pages/[slug] - Egy oldal frissítése
 * DELETE /api/cms/pages/[slug] - Egy oldal törlése
 */

import { NextRequest, NextResponse } from 'next/server';
import { pagesStorage } from '@/lib/cms/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const page = await pagesStorage.readPage(params.slug);
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Error reading page:', error);
    return NextResponse.json(
      { error: 'Failed to read page' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const existingPage = await pagesStorage.readPage(params.slug);

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    const updatedPage = {
      ...existingPage,
      ...body,
      slug: params.slug, // slug nem változhat
      updatedAt: new Date().toISOString(),
    };

    await pagesStorage.upsertPage(updatedPage);
    return NextResponse.json({ page: updatedPage });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const existingPage = await pagesStorage.readPage(params.slug);

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    await pagesStorage.deletePage(params.slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}
