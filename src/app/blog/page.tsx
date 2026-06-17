'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Calendar, Tag, Search, ArrowRight } from 'lucide-react';

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
} as const;

interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: string;
  publishedAt?: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const allPosts: PostData[] = await res.json();
          setPosts(allPosts);
        }
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const blogPosts = posts.filter((p) => p.category === 'blog' && p.status === 'published');
  const allTags = Array.from(new Set(blogPosts.flatMap((p) => p.tags))).sort();

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === null || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const displayPosts = filteredPosts.length > 0
    ? filteredPosts
    : (blogPosts.length > 0 ? [] : Array.from({ length: 6 }).map((_, i) => ({
        id: `placeholder-${i}`,
        title: ['Next.js 16 新特性解析', 'Bento Grid 布局实践', '玻璃拟态设计指南', 'Framer Motion 动画技巧', 'TypeScript 高级类型技巧', 'React 19 并发模式深入'][i],
        slug: '#',
        excerpt: ['深入探索 Next.js 16 的最新特性与改进，了解 App Router 的完整生态与最佳实践。', '如何利用 Bento Grid 创建引人入胜的页面布局，提升视觉层次感与用户体验。', '从理论到实践，掌握玻璃拟态在深色模式下的应用技巧与注意事项。', '使用 Framer Motion 为你的 Next.js 项目添加流畅的交互动画与页面过渡。', '深入理解 TypeScript 的高级类型系统，提升代码的健壮性与可维护性。', '探索 React 19 的并发特性，构建更流畅、响应更快的用户界面。'][i],
        publishedAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
        tags: [['Next.js', 'React'], ['CSS', '设计', 'UI'], ['CSS', 'UI'], ['动画', 'Framer', 'React'], ['TypeScript'], ['React', '并发']][i],
      })));

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div initial="initial" animate="animate" variants={stagger} className="mb-10 text-center">
          <motion.h1 variants={fadeUp} className="mb-4 text-4xl font-bold">
            <span className="gradient-text">博客</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mx-auto max-w-xl text-text-secondary">
            记录技术思考、设计心得与创意灵感
          </motion.p>
        </motion.div>

        {/* Search & Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          <div className="relative mx-auto max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="搜索文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-glass-border bg-glass-bg py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted backdrop-blur-sm focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedTag === null
                    ? 'bg-accent text-white'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary'
                }`}
              >
                全部
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    selectedTag === tag
                      ? 'bg-accent text-white'
                      : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Blog List */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="space-y-5"
        >
          {displayPosts.length > 0 ? (
            displayPosts.map((post) => (
              <motion.div key={post.id} variants={fadeUp}>
                <Link href={`/blog/${post.slug}`}>
                  <Card className="group flex flex-col sm:flex-row sm:items-center sm:gap-6 transition-all">
                    <div className="flex-1">
                      <CardHeader>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <Calendar className="h-3 w-3" />
                            {post.publishedAt ? formatDate(post.publishedAt) : ''}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold group-hover:text-accent-light transition-colors">
                          {post.title}
                        </h3>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                      </CardContent>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Tag className="h-3 w-3 text-text-muted" />
                        {'tags' in post && post.tags?.map((tag: string) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center text-text-muted group-hover:text-accent-light transition-colors">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div variants={fadeUp} className="text-center py-20">
              <p className="text-text-muted text-lg">没有找到匹配的文章</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                className="mt-4 text-sm text-accent-light hover:text-accent transition-colors"
              >
                清除筛选条件
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
