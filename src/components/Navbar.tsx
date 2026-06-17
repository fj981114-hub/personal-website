'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, LogOut, User } from 'lucide-react';

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/portfolio', label: '作品集' },
  { href: '/blog', label: '博客' },
  { href: '/login', label: '登录' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass border-b border-glass-border'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="gradient-text text-xl font-bold tracking-tight">
            Portfolio
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-accent-light bg-accent/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {session && (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-glass-border">
              <span className="text-xs text-text-muted px-2">{session.user?.name || session.user?.email}</span>
              <button
                onClick={() => signOut()}
                className="rounded-lg p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200"
                title="退出登录"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass border-b border-glass-border md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'block rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'text-accent-light bg-accent/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {session && (
                <div className="border-t border-glass-border pt-2 mt-2">
                  <div className="flex items-center gap-2 px-4 py-2 text-xs text-text-muted">
                    <User className="h-3 w-3" />
                    {session.user?.name || session.user?.email}
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
