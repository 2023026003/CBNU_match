'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { signOut } from '@/app/actions/authActions';
import { createClient } from '@/lib/supabase';
import { useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: '64px',
      background: 'rgba(10,14,26,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center',
    }}>
      <div className="page-container" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* 로고 */}
        <Link href={user ? '/feed' : '/'} style={{
          fontSize: '18px', fontWeight: '800',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textDecoration: 'none', letterSpacing: '-0.02em',
        }}>
          CBNU<span style={{ fontWeight: '400' }}>Match</span>
        </Link>

        {/* 네비 링크 */}
        {user && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { href: '/feed', label: '피드' },
              { href: '/posts/new', label: '글쓰기' },
              { href: '/mypage', label: '마이페이지' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: '500',
                color: isActive(href) ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive(href) ? 'var(--bg-elevated)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s',
              }}>
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* 우측 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user ? (
            <>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
              <button onClick={handleSignOut} disabled={isPending} className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '13px' }}>
                {isPending ? '...' : '로그아웃'}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>로그인</button>
              </Link>
              <Link href="/auth/signup">
                <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }}>회원가입</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
