import { NextRequest, NextResponse } from 'next/server';
import { getFiles, createFile } from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { FileItem } from '@/types';

export async function GET() {
  try {
    const files = getFiles();
    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const file: FileItem = {
      id: generateId(),
      name: body.name || '',
      originalName: body.originalName || body.name || '',
      type: body.type || 'unknown',
      size: body.size || 0,
      path: body.path || '',
      metadata: body.metadata || {},
      permission: body.permission || 'public',
      password: body.password,
      expiresAt: body.expiresAt,
      burnAfterRead: body.burnAfterRead || false,
      downloads: 0,
      createdAt: now,
    };

    createFile(file);
    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }
}
