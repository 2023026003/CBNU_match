'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '@/app/actions/authActions';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signIn(formData);
      if (result && !result.success) setError(result.error);
    });
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="card fade-up" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>👋</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>다시 만나요</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>충북대학교 이메일로 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              이메일
            </label>
            <input name="email" type="email" required placeholder="학번@cbnu.ac.kr" className="input-base" />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              비밀번호
            </label>
            <input name="password" type="password" required placeholder="비밀번호 입력" className="input-base" />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" disabled={isPending} className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {isPending ? <span className="spinner" /> : '로그인'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          계정이 없으신가요?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '600' }}>
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
