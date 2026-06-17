// 文章/作品类型
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category: 'blog' | 'portfolio' | 'fragment';
  tags: string[];
  status: 'draft' | 'published' | 'private';
  permission: 'public' | 'login' | 'password' | 'link';
  password?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// 文件类型
export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  path: string;
  metadata: Record<string, any>;
  permission: 'public' | 'login' | 'password' | 'link';
  password?: string;
  expiresAt?: string;
  burnAfterRead: boolean;
  downloads: number;
  createdAt: string;
}

// 用户类型
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

// 网站设置
export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logo?: string;
  socialLinks: { platform: string; url: string }[];
  aboutContent: string;
  status: 'online' | 'busy' | 'offline';
}

// 碎片/日常
export interface Fragment {
  id: string;
  type: 'text' | 'image' | 'link' | 'voice';
  content: string;
  mediaUrl?: string;
  expiresAt?: string;
  permanent: boolean;
  createdAt: string;
}

// 访问请求
export interface AccessRequest {
  id: string;
  targetType: 'post' | 'file';
  targetId: string;
  requesterName: string;
  requesterEmail: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
