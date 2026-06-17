'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, Eye, EyeOff, LogIn, GitBranch, Code } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('请填写邮箱和密码');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('邮箱或密码错误');
      } else {
        toast.success('登录成功');
        router.push('/');
        router.refresh();
      }
    } catch {
      toast.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Card className="p-8 sm:p-10">
            <CardHeader className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-purple-500 shadow-lg shadow-accent/25">
                <LogIn className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">
                <span className="gradient-text">欢迎回来</span>
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                登录以管理你的数字空间
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="邮箱"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="h-4 w-4" />}
                />

                <div className="relative">
                  <Input
                    label="密码"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="h-4 w-4" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  {loading ? '登录中...' : '登录'}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-glass-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-surface px-3 text-text-muted">或者</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="secondary" className="w-full" icon={<GitBranch className="h-4 w-4" />}>
                    GitHub
                  </Button>
                  <Button variant="secondary" className="w-full" icon={<Code className="h-4 w-4" />}>
                    其他
                  </Button>
                </div>
              </div>

              <p className="mt-6 text-center text-xs text-text-muted">
                默认账号: admin@example.com / admin123
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right - Three.js Container */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="hidden lg:block"
        >
          <Card className="h-full overflow-hidden p-0">
            <div
              id="three-container"
              className="flex h-full min-h-[500px] w-full items-center justify-center bg-gradient-to-br from-surface-lighter via-surface to-surface-light"
            >
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent/10 animate-float">
                  <Code className="h-12 w-12 text-accent-light" />
                </div>
                <p className="text-sm text-text-muted">
                  Three.js 场景加载中...
                </p>
                <p className="mt-2 text-xs text-text-muted/60">
                  交互式 3D 背景
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
