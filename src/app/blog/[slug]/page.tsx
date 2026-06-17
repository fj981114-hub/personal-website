import { notFound } from 'next/navigation';
import { getPosts, getSettings } from '@/lib/db';
import { BlogDetailClient } from './client';

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = getPosts();
  const settings = getSettings();

  const post = posts.find((p) => p.slug === slug && p.category === 'blog' && p.status === 'published');
  if (!post) {
    notFound();
  }

  const relatedPosts = posts
    .filter((p) => p.id !== post.id && p.category === 'blog' && p.status === 'published')
    .slice(0, 3);

  return <BlogDetailClient post={post} relatedPosts={relatedPosts} settings={settings} />;
}
