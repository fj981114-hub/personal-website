'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { FileItem } from '@/types';
import { formatDate, formatFileSize } from '@/lib/utils';
import {
  FolderOpen,
  Search,
  Trash2,
  Download,
  Filter,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Link2,
} from 'lucide-react';

export default function AdminFiles() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; file: FileItem | null }>({
    open: false,
    file: null,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (typeFilter !== 'all') params.set('type', typeFilter);

      const res = await fetch(`/api/admin/files?${params.toString()}`);
      if (!res.ok) throw new Error('加载失败');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, typeFilter]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async () => {
    if (!deleteModal.file) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/files?id=${deleteModal.file.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('删除失败');
      setDeleteModal({ open: false, file: null });
      fetchFiles();
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeleting(false);
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
        return <Link2 size={14} className="text-text-muted" />;
      default:
        return null;
    }
  };

  const getFileIconEmoji = (type: string): string => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'];
    const docTypes = ['pdf', 'doc', 'docx', 'xlsx', 'pptx', 'txt', 'md'];
    const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
    const videoTypes = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg'];
    const codeTypes = ['js', 'ts', 'html', 'css', 'json', 'xml'];

    const ext = type.toLowerCase();
    if (imageTypes.includes(ext)) return '🖼️';
    if (docTypes.includes(ext)) return '📄';
    if (archiveTypes.includes(ext)) return '🗜️';
    if (videoTypes.includes(ext)) return '🎬';
    if (audioTypes.includes(ext)) return '🎵';
    if (codeTypes.includes(ext)) return '📜';
    return '📁';
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || f.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

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

  // Collect unique file types for filter
  const fileTypes = Array.from(new Set(files.map((f) => f.type.toLowerCase())));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">文件管理</h1>
          <p className="text-sm text-text-muted mt-1">管理上传的文件资源</p>
        </div>
        <Button icon={<Upload size={16} />}>上传文件</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="搜索文件名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 rounded-xl border border-glass-border bg-glass-bg px-3 pr-8 text-sm text-text-primary appearance-none cursor-pointer focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
              >
                <option value="all">全部类型</option>
                {fileTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
              <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-text-muted">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <span>加载中...</span>
          </div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <FolderOpen size={40} className="text-text-muted mb-3" />
              <p className="text-text-muted text-sm mb-1">暂无文件</p>
              <p className="text-text-muted text-xs">上传文件后即可在此管理</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} hover={false}>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-glass-bg text-lg">
                    {getFileIconEmoji(file.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {file.originalName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text-muted">{formatFileSize(file.size)}</span>
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-muted">{file.downloads} 次下载</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-glass-border">
                  <div className="flex items-center gap-1.5">
                    {getPermissionIcon(file.permission)}
                    <Badge variant={file.permission === 'public' ? 'success' : 'default'}>
                      {file.permission === 'public' ? '公开' : file.permission === 'login' ? '登录' : file.permission === 'password' ? '加密' : '链接'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => window.open(file.path, '_blank')}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-white/5 hover:text-accent-light transition-colors"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ open: true, file })}
                      className="rounded-lg p-1.5 text-text-muted hover:bg-white/5 hover:text-danger transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-2">{formatDate(file.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, file: null })}
        title="确认删除"
      >
        <p className="text-sm text-text-secondary mb-6">
          确定要删除文件 <span className="text-text-primary font-medium">&ldquo;{deleteModal.file?.originalName}&rdquo;</span> 吗？此操作不可撤销。
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ open: false, file: null })}
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
