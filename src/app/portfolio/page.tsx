'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { ExternalLink, Code, Palette, Layers, Globe, Smartphone, Cpu, Filter } from 'lucide-react';

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
} as const;

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '前端': Code,
  '设计': Palette,
  '全栈': Layers,
  'API': Globe,
  '移动端': Smartphone,
  'AI': Cpu,
};

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

export default function PortfolioPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

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

  const portfolioItems = posts.filter((p) => p.category === 'portfolio' && p.status === 'published');
  const allTags = Array.from(new Set(portfolioItems.flatMap((p) => p.tags)));

  const filteredItems = filter
    ? portfolioItems.filter((p) => p.tags.includes(filter))
    : portfolioItems;

  const displayItems = filteredItems.length > 0 ? filteredItems : (portfolioItems.length > 0 ? [] : Array.from({ length: 9 }).map((_, i) => ({
    id: `placeholder-${i}`,
    title: [
      'Bento Design 系统', '交互式仪表盘', 'UI 组件库',
      '数据可视化平台', '品牌设计系统', 'API 网关架构',
      '移动应用设计', 'AI 创意工具', '个人博客引擎',
    ][i],
    slug: '#',
    excerpt: [
      '一个融合 Bento Grid 与玻璃拟态的设计系统，支持自适应布局与微交互动画。',
      '可交互的数据仪表盘，实时展示关键指标与趋势分析，支持自定义 widget。',
      '高质量的 React 组件库，包含 50+ 精心设计的 UI 组件，开箱即用。',
      '将复杂数据转化为直观的可视化图表与交互式展示，支持多数据源接入。',
      '从品牌标识到视觉系统的一站式设计解决方案，覆盖线上线下全渠道。',
      '高性能的 RESTful API 架构设计，支持百万级并发请求与智能路由。',
      '精致的移动端应用设计，融合 Material You 与 Glassmorphism 风格。',
      '基于 GPT 的创意辅助工具，帮助设计师快速生成配色方案与布局灵感。',
      '全栈个人博客系统，支持 Markdown 编辑、标签管理与 RSS 订阅。',
    ][i],
    tags: [['设计', 'UI'], ['前端', '数据'], ['React', 'UI'],
           ['前端', '数据'], ['设计', '品牌'], ['后端', 'API'],
           ['移动端', '设计'], ['AI', '工具'], ['全栈', '博客']][i],
    publishedAt: new Date(Date.now() - i * 86400000 * 7).toISOString(),
  })));

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div initial="initial" animate="animate" variants={stagger} className="mb-10 text-center">
          <motion.h1 variants={fadeUp} className="mb-4 text-4xl font-bold">
            <span className="gradient-text">作品集</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mx-auto max-w-xl text-text-secondary">
            精选的项目与创意作品，展示技术与设计的融合
          </motion.p>
        </motion.div>

        {/* Filter tags */}
        {allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex flex-wrap justify-center gap-2"
          >
            <button
              onClick={() => setFilter(null)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                filter === null
                  ? 'bg-accent text-white'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary'
              }`}
            >
              <Filter className="h-3 w-3" />
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag === filter ? null : tag)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  filter === tag
                    ? 'bg-accent text-white'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary'
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}

        {/* Portfolio Grid */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {displayItems.length > 0 ? (
            displayItems.map((item) => {
              const Icon = categoryIcons[item.tags[0]] || Code;
              return (
                <motion.div key={item.id} variants={fadeUp}>
                  <Card className="group h-full flex flex-col overflow-hidden">
                    {/* Cover image area */}
                    <div className="relative h-48 overflow-hidden rounded-t-2xl -m-6 mb-0 p-6 pb-0">
                      <div className="h-full w-full rounded-xl bg-gradient-to-br from-accent/20 via-accent/5 to-surface-lighter flex items-center justify-center">
                        <Icon className="h-16 w-16 text-accent-light/40 group-hover:text-accent-light/60 transition-all duration-500 group-hover:scale-110" />
                      </div>
                    </div>

                    <CardHeader className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="accent">作品</Badge>
                        {item.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                      <h3 className="text-lg font-semibold group-hover:text-accent-light transition-colors">
                        {item.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                        {item.excerpt}
                      </p>
                    </CardContent>
                    <div className="mt-auto px-6 pb-6 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">
                          {item.publishedAt ? formatDate(item.publishedAt) : ''}
                        </span>
                        <Button variant="ghost" size="sm" icon={<ExternalLink className="h-3.5 w-3.5" />}>
                          查看详情
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              variants={fadeUp}
              className="col-span-full text-center py-20"
            >
              <p className="text-text-muted text-lg">没有找到匹配的作品</p>
              {filter && (
                <button
                  onClick={() => setFilter(null)}
                  className="mt-4 text-sm text-accent-light hover:text-accent transition-colors"
                >
                  清除筛选
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
