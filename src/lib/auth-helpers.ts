import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

// ─── Get the current session on the server ──────────────────────
export async function getSession() {
  return await getServerSession(authOptions);
}

// ─── Get the current user from the session ──────────────────────
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

// ─── Require authentication (redirect if not logged in) ─────────
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }
  return session.user;
}

// ─── Require admin role ─────────────────────────────────────────
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  // Import db to check user role on server
  const { getUser } = await import('@/lib/db');
  const dbUser = getUser((session.user as { id: string }).id);
  if (!dbUser || dbUser.role !== 'admin') {
    redirect('/');
  }

  return { ...session.user, role: dbUser.role };
}
