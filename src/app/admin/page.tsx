'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Post, FileItem, AccessRequest } from '@/types';
import { formatDate, formatFileSize } from '@/lib/utils';
import {
  FileText,
  FolderOpen,
  Users,
  ArrowUpRight,
  Clock,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  postCount: number;
  fileCount: number;
  requestCount: number;
  publishedPosts: number;
  draftPosts: number;
  recentPosts: Post[];
  recentFiles: FileItem[];
  pendingRequests: AccessRequest[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [postsRes, filesRes, requestsRes] = await Promise.all([
          fetch('/api/admin/posts'),
          fetch('/api/admin/files'),
          fetch('/api/admin/access-requests'),
        ]);

        if (!postsRes.ok || !filesRes.ok || !requestsRes.ok) {
          throw new Error('数据加载失败');
        }

        const posts: Post[] = await postsRes.json();
        const files: FileItem[] = await filesRes.json();
        const requests: AccessRequest[] = await requestsRes.json();

        setStats({
          postCount: posts.length,
          fileCount: files.length,
          requestCount: requests.length,
          publishedPosts: posts.filter((p) => p.status === 'published').length,
          draftPosts: posts.filter((p) => p.status === 'draft').length,
          recentPosts: posts.slice(0, 5),
          recentFiles: files.slice(0, 5),
          pendingRequests: requests.filter((r) => r.status === 'pending').slice(0, 5),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-text-muted">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-danger mb-2">{error}</p>
          <p className="text-sm text-text-muted">数据 API 可能尚未创建</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: '文章总数',
      value: stats.postCount,
      sub: `${stats.publishedPosts} 已发布 · ${stats.draftPosts} 草稿`,
      icon: FileText,
      color: 'text-accent-light',
      bg: 'bg-accent/10',
      href: '/admin/posts',
    },
    {
      label: '文件总数',
      value: stats.fileCount,
      sub: stats.fileCount > 0 ? `${(stats.fileCount * 1.2).toFixed(1)} MB · 管理` : '暂无文件',
      icon: FolderOpen,
      color: 'text-success',
      bg: 'bg-success/10',
      href: '/admin/files',
    },
    {
      label: '待处理请求',
      value: stats.pendingRequests.length,
      sub: stats.pendingRequests.length > 0 ? `${stats.pendingRequests.length} 条待审批` : '暂无待处理',
      icon: Users,
      color: 'text-warning',
      bg: 'bg-warning/10',
      href: '/admin/settings',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">仪表盘</h1>
        <p className="text-sm text-text-muted mt-1">欢迎回到管理后台</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="group cursor-pointer">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className={cn('rounded-xl p-3', stat.bg)}>
                      <Icon size={24} className={stat.color} />
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
                    <p className="text-sm text-text-muted mt-1">{stat.label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{stat.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent posts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-accent-light" />
                <h2 className="text-sm font-semibold text-text-primary">最近文章</h2>
              </div>
              <Link
                href="/admin/posts"
                className="text-xs text-accent-light hover:underline"
              >
                查看全部
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentPosts.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">暂无文章</p>
            ) : (
              <div className="space-y-2">
                {stats.recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/admin/posts/${post.id}`}
                    className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-2 w-2 shrink-0 rounded-full bg-accent/50" />
                      <span className="text-sm text-text-primary truncate">{post.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          post.status === 'published'
                            ? 'success'
                            : post.status === 'draft'
                              ? 'warning'
                              : 'default'
                        }
                      >
                        {post.status === 'published' ? '已发布' : post.status === 'draft' ? '草稿' : '私密'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-warning" />
                <h2 className="text-sm font-semibold text-text-primary">待处理请求</h2>
              </div>
              <Link
                href="/admin/settings"
                className="text-xs text-accent-light hover:underline"
              >
                查看全部
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.pendingRequests.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">暂无待处理请求</p>
            ) : (
              <div className="space-y-2">
                {stats.pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-white/5 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary truncate">
                        {req.requesterName}
                      </p>
                      <p className="text-xs text-text-muted truncate">{req.targetType === 'post' ? '文章' : '文件'}访问请求</p>
                    </div>
                    <Badge variant="warning">待审批</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent files */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-success" />
                <h2 className="text-sm font-semibold text-text-primary">最近上传</h2>
              </div>
              <Link
                href="/admin/files"
                className="text-xs text-accent-light hover:underline"
              >
                查看全部
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentFiles.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">暂无文件</p>
            ) : (
              <div className="space-y-2">
                {stats.recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FolderOpen size={14} className="shrink-0 text-text-muted" />
                      <span className="text-sm text-text-primary truncate">{file.originalName}</span>
                    </div>
                    <span className="text-xs text-text-muted shrink-0">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
