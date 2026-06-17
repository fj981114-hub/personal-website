'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { AccessRequest } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Check,
  X as XIcon,
  Loader2,
  FileText,
  FolderOpen,
  Clock,
} from 'lucide-react';

export default function AdminRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<{ open: boolean; request: AccessRequest | null }>({
    open: false,
    request: null,
  });

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/access-requests?status=${statusFilter}`);
      if (!res.ok) throw new Error('加载失败');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/access-requests`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: action }),
      });
      if (!res.ok) throw new Error('操作失败');
      setDetailModal({ open: false, request: null });
      fetchRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">待审批</Badge>;
      case 'approved':
        return <Badge variant="success">已通过</Badge>;
      case 'rejected':
        return <Badge variant="danger">已拒绝</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
      <div>
        <h1 className="text-2xl font-bold text-text-primary">访客请求</h1>
        <p className="text-sm text-text-muted mt-1">管理访客的访问申请</p>
      </div>

      {/* Filter tabs */}
      <Card>
        <CardContent>
          <div className="flex gap-2">
            {[
              { value: 'pending', label: '待审批' },
              { value: 'approved', label: '已通过' },
              { value: 'rejected', label: '已拒绝' },
              { value: '', label: '全部' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  statusFilter === tab.value
                    ? 'bg-accent/10 text-accent-light border border-accent/30'
                    : 'text-text-muted hover:bg-white/5 hover:text-text-primary border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requests list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-text-muted">
            <Loader2 size={20} className="animate-spin" />
            <span>加载中...</span>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <Users size={40} className="text-text-muted mb-3" />
              <p className="text-text-muted text-sm">暂无请求</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} hover={false}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-medium text-accent-light">
                        {req.requesterName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {req.requesterName}
                        </p>
                        <p className="text-xs text-text-muted">{req.requesterEmail}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {req.targetType === 'post' ? (
                        <FileText size={14} className="text-accent-light" />
                      ) : (
                        <FolderOpen size={14} className="text-accent-light" />
                      )}
                      <span className="text-xs text-text-muted">
                        申请访问 {req.targetType === 'post' ? '文章' : '文件'} (ID: {req.targetId})
                      </span>
                    </div>
                    {req.reason && (
                      <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                        {req.reason}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Clock size={12} className="text-text-muted" />
                      <span className="text-xs text-text-muted">{formatDate(req.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                    {getStatusBadge(req.status)}
                    {req.status === 'pending' && (
                      <button
                        onClick={() => setDetailModal({ open: true, request: req })}
                        className="text-xs text-accent-light hover:underline"
                      >
                        查看详情
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail & action modal */}
      <Modal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, request: null })}
        title="请求详情"
      >
        {detailModal.request && (
          <div className="space-y-4">
            <div className="rounded-xl bg-glass-bg p-4 space-y-3">
              <div>
                <p className="text-xs text-text-muted">申请人</p>
                <p className="text-sm text-text-primary">{detailModal.request.requesterName}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">邮箱</p>
                <p className="text-sm text-text-primary">{detailModal.request.requesterEmail}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">目标类型</p>
                <p className="text-sm text-text-primary">
                  {detailModal.request.targetType === 'post' ? '文章' : '文件'}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">目标 ID</p>
                <p className="text-sm text-text-primary font-mono">{detailModal.request.targetId}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">申请理由</p>
                <p className="text-sm text-text-secondary">
                  {detailModal.request.reason || '未提供理由'}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">申请时间</p>
                <p className="text-sm text-text-primary">
                  {formatDate(detailModal.request.createdAt)}
                </p>
              </div>
            </div>

            {detailModal.request.status === 'pending' && (
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => handleAction(detailModal.request!.id, 'rejected')}
                  loading={processing === detailModal.request.id}
                  icon={<XIcon size={14} />}
                >
                  拒绝
                </Button>
                <Button
                  onClick={() => handleAction(detailModal.request!.id, 'approved')}
                  loading={processing === detailModal.request.id}
                  icon={<Check size={14} />}
                >
                  批准
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
