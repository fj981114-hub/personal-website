'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import type { SiteSettings } from '@/types';
import {
  Save,
  Globe,
  Info,
  Link2,
  Plus,
  X,
  Loader2,
  Circle,
} from 'lucide-react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<SiteSettings>({
    siteName: '',
    siteDescription: '',
    logo: '',
    socialLinks: [],
    aboutContent: '',
    status: 'online',
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data: SiteSettings = await res.json();
          setForm(data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const addSocialLink = () => {
    setForm((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', url: '' }],
    }));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setForm((prev) => {
      const links = [...prev.socialLinks];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, socialLinks: links };
    });
  };

  const removeSocialLink = (index: number) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('保存失败');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: 'online' as const, label: '在线', color: 'text-success', dot: 'bg-success' },
    { value: 'busy' as const, label: '忙碌', color: 'text-warning', dot: 'bg-warning' },
    { value: 'offline' as const, label: '离线', color: 'text-danger', dot: 'bg-danger' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-text-muted">
          <Loader2 size={20} className="animate-spin" />
          <span>加载设置...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">网站设置</h1>
          <p className="text-sm text-text-muted mt-1">管理网站的基本信息和配置</p>
        </div>
        <Button onClick={handleSave} loading={saving} icon={<Save size={14} />}>
          {saved ? '已保存' : '保存设置'}
        </Button>
      </div>

      {saved && (
        <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3">
          <p className="text-sm text-success">设置已成功保存</p>
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-accent-light" />
            <h2 className="text-sm font-semibold text-text-primary">基本信息</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="网站名称"
            placeholder="我的数字空间"
            value={form.siteName}
            onChange={(e) => setForm((prev) => ({ ...prev, siteName: e.target.value }))}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">网站描述</label>
            <textarea
              value={form.siteDescription}
              onChange={(e) => setForm((prev) => ({ ...prev, siteDescription: e.target.value }))}
              placeholder="一个高质感的个人作品集与博客"
              rows={3}
              className="w-full rounded-xl border border-glass-border bg-glass-bg p-3 text-sm text-text-primary placeholder:text-text-muted backdrop-blur-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-200 resize-y"
            />
          </div>
          <Input
            label="Logo URL（可选）"
            placeholder="https://example.com/logo.png"
            value={form.logo || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, logo: e.target.value }))}
          />
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Circle size={16} className="text-accent-light" />
            <h2 className="text-sm font-semibold text-text-primary">在线状态</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm((prev) => ({ ...prev, status: opt.value }))}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  form.status === opt.value
                    ? 'bg-accent/10 border border-accent/30 text-accent-light'
                    : 'bg-glass-bg border border-glass-border text-text-muted hover:border-accent/20 hover:text-text-primary'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 size={16} className="text-accent-light" />
              <h2 className="text-sm font-semibold text-text-primary">社交链接</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={addSocialLink}
              icon={<Plus size={14} />}
            >
              添加
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.socialLinks.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">
              暂无社交链接，点击"添加"按钮创建
            </p>
          ) : (
            form.socialLinks.map((link, index) => (
              <div
                key={index}
                className="flex items-start gap-2 rounded-xl border border-glass-border bg-glass-bg p-3"
              >
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="平台名称 (如 GitHub)"
                    value={link.platform}
                    onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                  />
                  <Input
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    icon={<Link2 size={14} />}
                  />
                </div>
                <button
                  onClick={() => removeSocialLink(index)}
                  className="mt-2 rounded-lg p-1.5 text-text-muted hover:bg-white/5 hover:text-danger transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info size={16} className="text-accent-light" />
            <h2 className="text-sm font-semibold text-text-primary">关于页面内容</h2>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            value={form.aboutContent}
            onChange={(e) => setForm((prev) => ({ ...prev, aboutContent: e.target.value }))}
            placeholder="关于页面的内容..."
            rows={6}
            className="w-full rounded-xl border border-glass-border bg-glass-bg p-3 text-sm text-text-primary placeholder:text-text-muted backdrop-blur-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-200 resize-y"
          />
        </CardContent>
      </Card>

      {/* Save button at bottom */}
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} icon={<Save size={14} />}>
          {saved ? '已保存' : '保存设置'}
        </Button>
      </div>
    </div>
  );
}
