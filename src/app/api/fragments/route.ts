import { NextRequest, NextResponse } from 'next/server';
import { getFragments, createFragment } from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { Fragment } from '@/types';

export async function GET() {
  try {
    const fragments = getFragments();
    return NextResponse.json(fragments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch fragments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const fragment: Fragment = {
      id: generateId(),
      type: body.type || 'text',
      content: body.content || '',
      mediaUrl: body.mediaUrl,
      expiresAt: body.expiresAt,
      permanent: body.permanent || false,
      createdAt: now,
    };

    createFragment(fragment);
    return NextResponse.json(fragment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create fragment' }, { status: 500 });
  }
}
