import { NextResponse } from 'next/server';
import { initDefaultData, getUsers, getPosts } from '@/lib/db';

// ─── Seed API — initializes default data ────────────────────────
// POST /api/seed
export async function POST() {
  try {
    // Check if data already exists
    const existingUsers = getUsers();
    if (existingUsers.length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: '数据已存在，跳过初始化',
          users: existingUsers.length,
          posts: getPosts().length,
        },
        { status: 200 }
      );
    }

    // Initialize default data
    initDefaultData();

    const users = getUsers();
    const posts = getPosts();

    return NextResponse.json(
      {
        success: true,
        message: '初始化成功',
        users: users.length,
        posts: posts.length,
        adminEmail: 'admin@example.com',
        adminPassword: 'admin123',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '初始化失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

// GET /api/seed — check current data status
export async function GET() {
  try {
    const users = getUsers();
    const posts = getPosts();

    return NextResponse.json({
      success: true,
      initialized: users.length > 0,
      users: users.length,
      posts: posts.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '查询失败' },
      { status: 500 }
    );
  }
}
