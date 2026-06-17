'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { slugify } from '@/lib/utils';
import type { Post } from '@/types';
import ImageUpload from '@/components/editor/ImageUpload';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  EyeOff,
  Lock,
  Link2,
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'blog' as 'blog' | 'portfolio' | 'fragment',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'private',
    permission: 'public' as 'public' | 'login' | 'password' | 'link',
    password: '',
  });

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/posts?id=${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error('加载失败');
        }
        const post: Post = await res.json();
        setForm({
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          category: post.category,
          tags: post.tags,
          status: post.status,
          permission: post.permission,
          password: post.password || '',
        });
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [id]);

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugify(title) || prev.slug,
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = '请输入文章标题';
    if (!form.slug.trim()) errs.slug = '请输入 URL 别名';
    if (!form.content.trim()) errs.content = '请输入文章内容';
    if (form.permission === 'password' && !form.password.trim()) {
      errs.password = '请设置访问密码';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitPost = async (status: 'draft' | 'published') => {
    if (!validate()) return;

    const publishFn = status === 'published' ? setPublishing : setSaving;
    publishFn(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...form,
          status,
          publishedAt: status === 'published' ? new Date().toISOString() : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '保存失败');
      }

      router.push('/admin/posts');
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败');
    } finally {
      publishFn(false);
    }
  };

  const insertImage = (markdown: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.content;
    const newText = text.substring(0, start) + markdown + text.substring(end);
    setForm((prev) => ({ ...prev, content: newText }));
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + markdown.length;
      textarea.setSelectionRange(pos, pos);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-text-muted">
          <Loader2 size={20} className="animate-spin" />
          <span>加载文章...</span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-danger mb-2">文章不存在</p>
        <Link
          href="/admin/posts"
          className="text-sm text-accent-light hover:underline"
        >
          返回文章列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="rounded-lg p-2 text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">编辑文章</h1>
            <p className="text-sm text-text-muted mt-1">编辑 &ldquo;{form.title}&rdquo;</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => submitPost('draft')}
            loading={saving}
            icon={<Save size={14} />}
          >
            保存草稿
          </Button>
          <Button
            onClick={() => submitPost('published')}
            loading={publishing}
            icon={<Send size={14} />}
          >
            发布
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="space-y-4">
              <Input
                label="文章标题"
                placeholder="输入文章标题..."
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                error={errors.title}
              />
              <Input
                label="URL 别名"
                placeholder="url-slug"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                error={errors.slug}
                icon={<Link2 size={14} />}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary">文章内容</h2>
                <ImageUpload onInsert={insertImage} />
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                ref={contentRef}
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="支持 Markdown 语法..."
                rows={16}
                className={`w-full rounded-xl border border-glass-border bg-glass-bg p-4 text-sm text-text-primary placeholder:text-text-muted backdrop-blur-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-200 resize-y font-mono ${
                  errors.content ? 'border-danger/50' : ''
                }`}
              />
              {errors.content && (
                <p className="text-xs text-danger mt-1.5">{errors.content}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-text-primary">摘要</h2>
            </CardHeader>
            <CardContent>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="文章摘要，用于列表展示..."
                rows={3}
                className="w-full rounded-xl border border-glass-border bg-glass-bg p-4 text-sm text-text-primary placeholder:text-text-muted backdrop-blur-sm focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all duration-200 resize-y"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-text-primary">分类</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'blog', label: '博客' },
                  { value: 'portfolio', label: '作品' },
                  { value: 'fragment', label: '碎片' },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setForm((prev) => ({ ...prev, category: cat.value as typeof form.category }))}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      form.category === cat.value
                        ? 'bg-accent/10 text-accent-light border border-accent/30'
                        : 'bg-glass-bg text-text-muted border border-glass-border hover:border-accent/20 hover:text-text-primary'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-text-primary">标签</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <span key={tag} onClick={() => removeTag(tag)} className="inline-flex items-center gap-1 rounded-full bg-accent/10 text-accent-light px-2.5 py-0.5 text-xs font-medium cursor-pointer">
                    {tag}
                    <X size={10} />
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="输入标签..."
                  className="flex-1 rounded-lg border border-glass-border bg-glass-bg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                />
                <button
                  onClick={addTag}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-white/5 hover:text-accent-light transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-text-primary">权限设置</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { value: 'public', label: '公开', icon: Eye, desc: '所有人可见' },
                { value: 'login', label: '登录可见', icon: EyeOff, desc: '仅登录用户可见' },
                { value: 'password', label: '密码保护', icon: Lock, desc: '需输入密码访问' },
                { value: 'link', label: '链接可见', icon: Link2, desc: '仅通过链接访问' },
              ].map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setForm((prev) => ({ ...prev, permission: opt.value as typeof form.permission }))}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition-all ${
                      form.permission === opt.value
                        ? 'bg-accent/10 border border-accent/30'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon
                      size={14}
                      className={
                        form.permission === opt.value ? 'text-accent-light' : 'text-text-muted'
                      }
                    />
                    <div>
                      <p
                        className={
                          form.permission === opt.value ? 'text-accent-light' : 'text-text-primary'
                        }
                      >
                        {opt.label}
                      </p>
                      <p className="text-text-muted">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
              {form.permission === 'password' && (
                <div className="mt-2">
                  <Input
                    label="访问密码"
                    type="password"
                    placeholder="设置密码..."
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    error={errors.password}
                    icon={<Lock size={14} />}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
