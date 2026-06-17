'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { ArrowRight, Calendar, Sparkles, Code, Palette, Layers, Zap, Globe, Cpu } from 'lucide-react';

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
} as const;

const featuredCardIcons = [Sparkles, Code, Palette, Layers, Zap, Globe];

interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: string;
  publishedAt?: string;
  coverImage?: string;
}

interface FragmentData {
  id: string;
  type: string;
  content: string;
  createdAt: string;
}

interface SettingsData {
  siteName: string;
  siteDescription: string;
  status: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [fragments, setFragments] = useState<FragmentData[]>([]);
  const [settings, setSettings] = useState<SettingsData>({
    siteName: '我的数字空间',
    siteDescription: '一个高质感的个人作品集与博客',
    status: 'online',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [postsRes, fragsRes, settingsRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/fragments'),
          fetch('/api/settings'),
        ]);
        if (postsRes.ok) {
          const allPosts: PostData[] = await postsRes.json();
          setPosts(allPosts);
        }
        if (fragsRes.ok) {
          const allFrags: FragmentData[] = await fragsRes.json();
          setFragments(allFrags);
        }
        if (settingsRes.ok) {
          const siteSettings: SettingsData = await settingsRes.json();
          setSettings(siteSettings);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const blogPosts = posts.filter((p) => p.category === 'blog' && p.status === 'published');
  const portfolioItems = posts.filter((p) => p.category === 'portfolio' && p.status === 'published');
  const featuredItems = [...portfolioItems, ...blogPosts].slice(0, 6);
  const recentFragments = fragments.slice(0, 5);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div variants={fadeUp} className="mb-6">
            <Badge variant="accent" className="text-sm px-4 py-1.5">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {settings.status === 'online' ? '在线' : settings.status === 'busy' ? '忙碌中' : '离线'}
            </Badge>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="gradient-text">{settings.siteName}</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mb-10 max-w-2xl text-lg text-text-secondary sm:text-xl"
          >
            {settings.siteDescription}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/portfolio">
              <Button size="lg" icon={<Palette className="h-4 w-4" />}>
                浏览作品
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="secondary" size="lg" icon={<BookOpenIcon className="h-4 w-4" />}>
                阅读博客
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Bento Grid */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="mx-auto max-w-7xl"
        >
          <motion.div variants={fadeUp} className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold">特色作品</h2>
            <p className="text-text-secondary">精选的项目与文章展示</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {(featuredItems.length > 0 ? featuredItems : Array.from({ length: 6 }).map((_, i) => ({
              id: `placeholder-${i}`,
              title: ['Bento Design 系统', '交互式仪表盘', 'UI 组件库', '数据可视化', '品牌设计', 'API 架构'][i],
              slug: '',
              excerpt: [
                '一个融合 Bento Grid 与玻璃拟态的设计系统，支持自适应布局与微交互动画。',
                '可交互的数据仪表盘，实时展示关键指标与趋势分析。',
                '高质量的 React 组件库，包含 50+ 精心设计的 UI 组件。',
                '将复杂数据转化为直观的可视化图表与交互式展示。',
                '从品牌标识到视觉系统的一站式设计解决方案。',
                '高性能的 RESTful API 架构设计，支持百万级并发请求。',
              ][i],
              category: 'portfolio',
              tags: [],
              status: 'published',
            }))).map((item, i) => {
              const Icon = featuredCardIcons[i % featuredCardIcons.length];
              const isWide = i === 0;
              const isTall = i === 1;
              return (
                <motion.div
                  key={item.id}
                  variants={fadeUp}
                  className={
                    isWide
                      ? 'sm:col-span-2 sm:row-span-1'
                      : isTall
                        ? 'sm:col-span-1 sm:row-span-2'
                        : ''
                  }
                >
                  <Link href={item.category === 'portfolio' ? `/portfolio` : `/blog/${item.slug}`}>
                    <Card className={`h-full ${isTall ? 'flex flex-col justify-between' : ''} ${isWide ? 'flex flex-col sm:flex-row sm:items-center sm:gap-6' : ''}`}>
                      <div className={isWide ? 'flex-1' : ''}>
                        {isWide && (
                          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-accent/10">
                            <Icon className="h-8 w-8 text-accent-light" />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={item.category === 'portfolio' ? 'accent' : 'default'}>
                              {item.category === 'portfolio' ? '作品' : '文章'}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold leading-tight">{item.title}</h3>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-text-secondary line-clamp-2">{item.excerpt}</p>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Blog Preview + Fragments Timeline */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Blog Preview */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-100px' }}
              variants={stagger}
              className="lg:col-span-2"
            >
              <motion.div variants={fadeUp} className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">最新博客</h2>
                <Link
                  href="/blog"
                  className="flex items-center gap-1 text-sm text-accent-light hover:text-accent transition-colors"
                >
                  查看全部 <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>

              <div className="space-y-4">
                {(blogPosts.length > 0 ? blogPosts.slice(0, 4) : Array.from({ length: 4 }).map((_, i) => ({
                  id: `placeholder-${i}`,
                  title: ['Next.js 16 新特性解析', 'Bento Grid 布局实践', '玻璃拟态设计指南', 'Framer Motion 动画技巧'][i],
                  slug: '#',
                  excerpt: ['深入探索 Next.js 16 的最新特性与改进，了解 App Router 的完整生态。', '如何利用 Bento Grid 创建引人入胜的页面布局，提升视觉层次感。', '从理论到实践，掌握玻璃拟态在深色模式下的应用技巧。', '使用 Framer Motion 为你的 Next.js 项目添加流畅的交互动画。'][i],
                  publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
                  tags: [['Next.js', 'React'], ['CSS', '设计'], ['CSS', 'UI'], ['动画', 'React']][i],
                }))).map((post, i) => (
                  <motion.div key={post.id} variants={fadeUp}>
                    <Link href={`/blog/${post.slug}`}>
                      <Card className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                        <div className="flex-1">
                          <CardHeader>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <span className="flex items-center gap-1 text-xs text-text-muted">
                                <Calendar className="h-3 w-3" />
                                {post.publishedAt ? formatDate(post.publishedAt) : ''}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold">{post.title}</h3>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-text-secondary line-clamp-2">{post.excerpt}</p>
                          </CardContent>
                          <CardFooter>
                            <div className="flex flex-wrap gap-1.5">
                              {'tags' in post && post.tags?.map((tag: string) => (
                                <Badge key={tag}>{tag}</Badge>
                              ))}
                            </div>
                          </CardFooter>
                        </div>
                        <div className="hidden sm:flex items-center text-text-muted">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Fragments Timeline */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-100px' }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">碎片时光</h2>
              </motion.div>

              <div className="space-y-3">
                {(recentFragments.length > 0 ? recentFragments : [
                  { id: '1', type: 'text', content: '今天开始重构个人网站，采用 Bento Grid 布局', createdAt: new Date().toISOString() },
                  { id: '2', type: 'image', content: '分享了一张新设计的 UI 截图，玻璃拟态效果很棒', createdAt: new Date(Date.now() - 3600000).toISOString() },
                  { id: '3', type: 'link', content: '发现了一个很棒的设计资源站，收藏了', createdAt: new Date(Date.now() - 7200000).toISOString() },
                  { id: '4', type: 'text', content: '研究 Next.js 16 的新特性，App Router 真的很强大', createdAt: new Date(Date.now() - 10800000).toISOString() },
                  { id: '5', type: 'voice', content: '录制了一段关于设计系统的播客片段', createdAt: new Date(Date.now() - 14400000).toISOString() },
                ]).map((frag) => (
                  <motion.div key={frag.id} variants={fadeUp}>
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                          <span className="text-xs">
                            {frag.type === 'text' ? '💬' : frag.type === 'image' ? '📷' : frag.type === 'link' ? '🔗' : '🎙'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary">{frag.content}</p>
                          <span className="mt-1 block text-xs text-text-muted">
                            {formatDate(frag.createdAt)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-glass-border px-4 py-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} {settings.siteName}. Built with Next.js &amp; Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    </svg>
  );
}
