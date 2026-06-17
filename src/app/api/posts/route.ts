import { NextRequest, NextResponse } from 'next/server';
import { getPosts, createPost } from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { Post } from '@/types';

export async function GET() {
  try {
    const posts = getPosts();
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const post: Post = {
      id: generateId(),
      title: body.title || 'Untitled',
      slug: body.slug || '',
      content: body.content || '',
      excerpt: body.excerpt || '',
      coverImage: body.coverImage,
      category: body.category || 'blog',
      tags: body.tags || [],
      status: body.status || 'draft',
      permission: body.permission || 'public',
      password: body.password,
      createdAt: now,
      updatedAt: now,
      publishedAt: body.status === 'published' ? now : undefined,
    };

    createPost(post);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
