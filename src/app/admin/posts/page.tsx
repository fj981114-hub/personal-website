'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { Post } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  FileText,
  Filter,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPosts() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; post: Post | null }>({
    open: false,
    post: null,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);

      const res = await fetch(`/api/admin/posts?${params.toString()}`);
      if (!res.ok) throw new Error('加载失败');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async () => {
    if (!deleteModal.post) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts?id=${deleteModal.post.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('删除失败');
      setDeleteModal({ open: false, post: null });
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">已发布</Badge>;
      case 'draft':
        return <Badge variant="warning">草稿</Badge>;
      case 'private':
        return <Badge variant="default">私密</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'public':
        return <Eye size={14} className="text-success" />;
      case 'login':
        return <EyeOff size={14} className="text-warning" />;
      case 'password':
        return <Lock size={14} className="text-accent-light" />;
      case 'link':
        return <Lock size={14} className="text-text-muted" />;
      default:
        return null;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'blog': return '博客';
      case 'portfolio': return '作品';
      case 'fragment': return '碎片';
      default: return cat;
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">文章管理</h1>
          <p className="text-sm text-text-muted mt-1">管理所有文章和作品</p>
        </div>
        <Button onClick={() => router.push('/admin/posts/new')} icon={<Plus size={16} />}>
          新建文章
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="搜索文章标题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-xl border border-glass-border bg-glass-bg px-3 text-sm text-text-primary appearance-none cursor-pointer focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
                >
                  <option value="all">全部状态</option>
                  <option value="published">已发布</option>
                  <option value="draft">草稿</option>
                  <option value="private">私密</option>
                </select>
                <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-10 rounded-xl border border-glass-border bg-glass-bg px-3 text-sm text-text-primary appearance-none cursor-pointer focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
                >
                  <option value="all">全部分类</option>
                  <option value="blog">博客</option>
                  <option value="portfolio">作品</option>
                  <option value="fragment">碎片</option>
                </select>
                <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts table */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-text-muted">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                <span>加载中...</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText size={40} className="text-text-muted mb-3" />
              <p className="text-text-muted text-sm mb-1">暂无文章</p>
              <p className="text-text-muted text-xs mb-4">开始创建你的第一篇文章</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/admin/posts/new')}
                icon={<Plus size={14} />}
              >
                新建文章
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-glass-border">
                    <th className="text-left py-3 px-3 text-text-muted font-medium">标题</th>
                    <th className="text-left py-3 px-3 text-text-muted font-medium hidden sm:table-cell">分类</th>
                    <th className="text-left py-3 px-3 text-text-muted font-medium hidden md:table-cell">状态</th>
                    <th className="text-left py-3 px-3 text-text-muted font-medium hidden lg:table-cell">权限</th>
                    <th className="text-left py-3 px-3 text-text-muted font-medium hidden lg:table-cell">更新</th>
                    <th className="text-right py-3 px-3 text-text-muted font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="border-b border-glass-border last:border-0 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="shrink-0 text-text-muted" />
                          <div className="min-w-0">
                            <p className="text-text-primary font-medium truncate max-w-[200px] lg:max-w-[300px]">
                              {post.title}
                            </p>
                            <p className="text-text-muted text-xs truncate max-w-[200px] lg:max-w-[300px]">
                              /{post.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <Badge>{getCategoryLabel(post.category)}</Badge>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          {getPermissionIcon(post.permission)}
                          <span className="text-xs text-text-muted">{post.permission}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <span className="text-xs text-text-muted">{formatDate(post.updatedAt)}</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-accent-light transition-colors"
                          >
                            <Edit3 size={14} />
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ open: true, post })}
                            className="rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-danger transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, post: null })}
        title="确认删除"
      >
        <p className="text-sm text-text-secondary mb-6">
          确定要删除文章 <span className="text-text-primary font-medium">&ldquo;{deleteModal.post?.title}&rdquo;</span> 吗？此操作不可撤销。
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ open: false, post: null })}
          >
            取消
          </Button>
          <Button
            variant="danger"
            loading={deleting}
            onClick={handleDelete}
            icon={<Trash2 size={14} />}
          >
            删除
          </Button>
        </div>
      </Modal>
    </div>
  );
}
