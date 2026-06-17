import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/[0.06] bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold">
              <span className="gradient-text">Digital Space</span>
            </h3>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              一个高质感的个人数字空间，记录设计、开发与创意日常。
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-text-secondary">快速链接</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: '首页' },
                { href: '/blog', label: '博客' },
                { href: '/portfolio', label: '作品集' },
                { href: '/login', label: '登录' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Meta */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-text-secondary">信息</h4>
            <ul className="space-y-2">
              <li className="text-sm text-text-muted">
                基于 Next.js · Three.js · Tailwind CSS
              </li>
              <li className="text-sm text-text-muted">
                &copy; {currentYear} Digital Space
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  运行中
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/[0.04] text-center">
          <p className="text-xs text-text-muted">
            使用 ❤️ 与 Next.js 构建 · 保留所有权利
          </p>
        </div>
      </div>
    </footer>
  );
}
