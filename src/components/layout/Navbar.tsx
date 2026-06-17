'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCurrentSession, useLogout } from '@/lib/auth-actions';
import { Menu, X, LogOut, User } from 'lucide-react';

// ─── Navigation Links ───────────────────────────────────────────
const NAV_LINKS = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '博客' },
  { href: '/portfolio', label: '作品集' },
  { href: '/admin', label: '后台', authRequired: true },
];

// ─── Navbar ──────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, session } = useCurrentSession();
  const { logout } = useLogout();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Track scroll position for glassmorphism transition
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[rgba(10,10,15,0.7)] backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/10'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="relative group text-xl font-bold tracking-tight"
        >
          <span className="gradient-text">Digital Space</span>
          <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-gradient-to-r from-accent to-accent-light transition-all duration-300 group-hover:w-full" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            if (link.authRequired && !isAuthenticated) return null;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-text-primary bg-white/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                )}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl border border-white/10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {/* Auth status */}
          <div className="ml-4 pl-4 border-l border-white/10 flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-xs text-text-muted flex items-center gap-1.5">
                  <User size={14} />
                  {session?.user?.name || session?.user?.email}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  <LogOut size={14} />
                  退出
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-accent-light hover:text-accent transition-colors"
              >
                登录
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="relative z-50 flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 mx-4 rounded-2xl border border-white/10 bg-[rgba(10,10,15,0.95)] backdrop-blur-2xl shadow-2xl md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-1">
              {NAV_LINKS.map((link) => {
                if (link.authRequired && !isAuthenticated) return null;
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'text-text-primary bg-white/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <hr className="my-2 border-white/10" />
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                >
                  <LogOut size={16} />
                  退出登录
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-accent-light hover:text-accent transition-all"
                >
                  登录
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
