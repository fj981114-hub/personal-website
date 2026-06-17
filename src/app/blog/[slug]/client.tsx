'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import type { Post, SiteSettings } from '@/types';
import { Calendar, Tag, ArrowLeft, Clock, User, Share2, ArrowRight } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
} as const;

interface BlogDetailClientProps {
  post: Post;
  relatedPosts: Post[];
  settings: SiteSettings;
}

// Simple markdown renderer component
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = '';
  let codeLang = '';

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="my-4 overflow-x-auto rounded-xl bg-surface-lighter p-4 text-sm">
            <code>{codeContent.trim()}</code>
          </pre>
        );
        codeContent = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      return;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="mb-3 mt-6 text-lg font-semibold text-text-primary">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="mb-4 mt-8 text-xl font-bold text-text-primary">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="mb-4 mt-8 text-2xl font-bold text-text-primary">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-text-secondary">
          {line.slice(2)}
        </li>
      );
    } else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <li key={i} className="ml-4 list-decimal text-text-secondary">
          {line.replace(/^\d+\.\s/, '')}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="my-3 border-l-2 border-accent/50 pl-4 italic text-text-secondary">
          {line.slice(2)}
        </blockquote>
      );
    } else if (line.startsWith('---')) {
      elements.push(<hr key={i} className="my-6 border-glass-border" />);
    } else {
      // Inline formatting
      const imgMatch = line.match(/^!\[(.+?)\]\((.+?)\)$/);
      if (imgMatch) {
        elements.push(
          <div key={i} className="my-6">
            <img
              src={imgMatch[2]}
              alt={imgMatch[1]}
              className="w-full rounded-xl shadow-lg"
              loading="lazy"
            />
            {imgMatch[1] && (
              <p className="mt-2 text-center text-xs text-text-muted">{imgMatch[1]}</p>
            )}
          </div>
        );
        return;
      }

      let formatted = line
        .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-xl max-w-full" />')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-accent/10 text-accent-light px-1.5 py-0.5 rounded text-xs">$1</code>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-accent-light hover:underline">$1</a>');
      elements.push(
        <p key={i} className="text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    }
  });

  return <div className="space-y-1">{elements}</div>;
}

export function BlogDetailClient({ post, relatedPosts, settings }: BlogDetailClientProps) {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back button */}
        <motion.div initial="initial" animate="animate" variants={fadeUp} className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
              返回博客列表
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main content */}
          <motion.article initial="initial" animate="animate" variants={fadeUp}>
            <Card className="p-6 sm:p-8">
              {/* Header info */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="accent">博客</Badge>
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <Calendar className="h-3 w-3" />
                    {post.publishedAt ? formatDate(post.publishedAt) : ''}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="h-3 w-3" />
                    {Math.ceil(post.content.length / 500)} 分钟阅读
                  </span>
                </div>

                <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl">
                  {post.title}
                </h1>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>

                <p className="text-lg text-text-secondary leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              {/* Cover image */}
              {post.coverImage && (
                <div className="mb-8 overflow-hidden rounded-xl">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {/* Divider */}
              <div className="mb-8 border-t border-glass-border" />

              {/* Content */}
              <div className="prose-custom">
                <MarkdownRenderer content={post.content} />
              </div>
            </Card>
          </motion.article>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Author card */}
            <Card className="p-5 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <User className="h-8 w-8 text-accent-light" />
              </div>
              <h3 className="font-semibold">Admin</h3>
              <p className="mt-1 text-xs text-text-muted">创意开发者 &amp; 设计师</p>
            </Card>

            {/* Share card */}
            <Card className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-text-primary">分享</h3>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={<Share2 className="h-3.5 w-3.5" />}>
                  复制链接
                </Button>
              </div>
            </Card>

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <Card className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-text-primary">相关文章</h3>
                <div className="space-y-3">
                  {relatedPosts.map((rp) => (
                    <Link key={rp.id} href={`/blog/${rp.slug}`} className="group block">
                      <div className="rounded-lg p-2 -mx-2 transition-colors hover:bg-white/5">
                        <h4 className="text-sm font-medium text-text-primary group-hover:text-accent-light transition-colors line-clamp-2">
                          {rp.title}
                        </h4>
                        <span className="mt-1 block text-xs text-text-muted">
                          {rp.publishedAt ? formatDate(rp.publishedAt) : ''}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Tags card */}
            {post.tags.length > 0 && (
              <Card className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-text-primary">标签</h3>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </Card>
            )}
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
