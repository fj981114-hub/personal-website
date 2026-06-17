import * as fs from 'fs';
import * as path from 'path';
import type { Post, FileItem, User, SiteSettings, Fragment, AccessRequest } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON<T>(filename: string, fallback: T): T {
  ensureDir();
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function writeJSON(filename: string, data: unknown) {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
}

// Posts
export function getPosts(): Post[] {
  return readJSON<Post[]>('posts.json', []);
}

export function getPost(id: string): Post | undefined {
  return getPosts().find(p => p.id === id);
}

export function getPostBySlug(slug: string): Post | undefined {
  return getPosts().find(p => p.slug === slug);
}

export function createPost(post: Post) {
  const posts = getPosts();
  posts.push(post);
  writeJSON('posts.json', posts);
}

export function updatePost(id: string, updates: Partial<Post>) {
  const posts = getPosts();
  const idx = posts.findIndex(p => p.id === id);
  if (idx >= 0) {
    posts[idx] = { ...posts[idx], ...updates, updatedAt: new Date().toISOString() };
    writeJSON('posts.json', posts);
  }
}

export function deletePost(id: string) {
  const posts = getPosts().filter(p => p.id !== id);
  writeJSON('posts.json', posts);
}

// Files
export function getFiles(): FileItem[] {
  return readJSON<FileItem[]>('files.json', []);
}

export function getFile(id: string): FileItem | undefined {
  return getFiles().find(f => f.id === id);
}

export function createFile(file: FileItem) {
  const files = getFiles();
  files.push(file);
  writeJSON('files.json', files);
}

export function updateFile(id: string, updates: Partial<FileItem>) {
  const files = getFiles();
  const idx = files.findIndex(f => f.id === id);
  if (idx >= 0) {
    files[idx] = { ...files[idx], ...updates };
    writeJSON('files.json', files);
  }
}

export function deleteFile(id: string) {
  const files = getFiles().filter(f => f.id !== id);
  writeJSON('files.json', files);
}

// Users
export function getUsers(): User[] {
  return readJSON<User[]>('users.json', []);
}

export function getUser(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email === email);
}

export function createUser(user: User) {
  const users = getUsers();
  users.push(user);
  writeJSON('users.json', users);
}

export function updateUser(id: string, updates: Partial<User>) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updates };
    writeJSON('users.json', users);
  }
}

// Fragments
export function getFragments(): Fragment[] {
  return readJSON<Fragment[]>('fragments.json', []);
}

export function createFragment(fragment: Fragment) {
  const fragments = getFragments();
  fragments.unshift(fragment);
  writeJSON('fragments.json', fragments);
}

export function deleteFragment(id: string) {
  const fragments = getFragments().filter(f => f.id !== id);
  writeJSON('fragments.json', fragments);
}

// Access Requests
export function getAccessRequests(): AccessRequest[] {
  return readJSON<AccessRequest[]>('access-requests.json', []);
}

export function createAccessRequest(req: AccessRequest) {
  const requests = getAccessRequests();
  requests.push(req);
  writeJSON('access-requests.json', requests);
}

export function updateAccessRequest(id: string, status: 'approved' | 'rejected') {
  const requests = getAccessRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx >= 0) {
    requests[idx].status = status;
    writeJSON('access-requests.json', requests);
  }
}

// Site Settings
const defaultSettings: SiteSettings = {
  siteName: '我的数字空间',
  siteDescription: '一个高质感的个人作品集与博客',
  socialLinks: [],
  aboutContent: '这里是我的个人数字空间，记录着作品、灵感与日常。',
  status: 'online',
};

export function getSettings(): SiteSettings {
  return readJSON<SiteSettings>('settings.json', defaultSettings);
}

export function updateSettings(updates: Partial<SiteSettings>) {
  const settings = { ...getSettings(), ...updates };
  writeJSON('settings.json', settings);
}

// Initialize default admin
export function initDefaultData() {
  const users = getUsers();
  if (users.length === 0) {
    const bcrypt = require('bcryptjs');
    const initialPosts: Post[] = [
      {
        id: '1', title: '欢迎来到我的数字空间',
        slug: 'welcome', content: '## 欢迎\n\n这是我的第一个作品。这里将展示我的设计、开发与创意作品。\n\n### 关于我\n\n我是一名创意开发者，热衷于构建有质感的数字产品。',
        excerpt: '这是我的第一个作品，欢迎来到我的个人数字空间。',
        category: 'blog', tags: ['个人', '欢迎'],
        status: 'published', permission: 'public',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
      {
        id: '2', title: '项目：Bento Design 系统',
        slug: 'bento-design-system', content: '## Bento Design System\n\n这是一个基于 Bento Grid 布局的设计系统，融合了玻璃拟态与微动效。\n\n### 特性\n\n- Bento Grid 自适应布局\n- 玻璃拟态效果\n- 微交互动画\n- 深色模式优先',
        excerpt: '一个融合 Bento Grid 与玻璃拟态的设计系统。',
        category: 'portfolio', tags: ['设计', 'UI/UX'],
        status: 'published', permission: 'public',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
    ];
    writeJSON('posts.json', initialPosts);

    createUser({
      id: 'admin-1', name: 'Admin', email: 'admin@example.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin', createdAt: new Date().toISOString(),
    });
  }
}
