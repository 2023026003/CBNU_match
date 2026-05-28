'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/app/actions/authActions';

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [emailVal, setEmailVal] = useState('');
  const isCbnuEmail = emailVal.endsWith('@cbnu.ac.kr');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signUp(formData);
      if (!result.success) {
        setError(result.error);
      } else {
        router.push('/auth/verify');
      }
    });
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="card fade-up" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎓</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>CBNUMatch 가입</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>충북대학교 이메일이 필요합니다</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              충북대 이메일
            </label>
            <input
              name="email" type="email" required
              placeholder="학번@cbnu.ac.kr"
              className="input-base"
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
              style={{ borderColor: emailVal && !isCbnuEmail ? 'var(--accent-red)' : undefined }}
            />
            {emailVal && !isCbnuEmail && (
              <p style={{ fontSize: '11px', color: 'var(--accent-red)', marginTop: '4px' }}>
                @cbnu.ac.kr 이메일만 가입 가능합니다
              </p>
            )}
            {emailVal && isCbnuEmail && (
              <p style={{ fontSize: '11px', color: 'var(--accent-green)', marginTop: '4px' }}>✓ 충북대 이메일 확인</p>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              비밀번호 <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(8자 이상)</span>
            </label>
            <input name="password" type="password" required minLength={8} placeholder="비밀번호 입력" className="input-base" />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" disabled={isPending || (!!emailVal && !isCbnuEmail)} className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {isPending ? <span className="spinner" /> : '가입하기'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '600' }}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
