import Link from 'next/link';

export default function VerifyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="card fade-up" style={{ maxWidth: '440px', width: '100%', padding: '48px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📬</div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>이메일을 확인해 주세요</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '32px' }}>
          충북대 이메일로 인증 링크를 발송했습니다.<br />
          메일함을 확인하고 링크를 클릭해 가입을 완료하세요.
        </p>
        <div style={{
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '10px', padding: '16px', marginBottom: '28px',
          fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6',
        }}>
          스팸 메일함도 확인해 보세요.<br />
          메일이 오지 않으면 몇 분 후 재시도해 주세요.
        </div>
        <Link href="/auth/login">
          <button className="btn-secondary" style={{ width: '100%' }}>로그인 페이지로 이동</button>
        </Link>
      </div>
    </div>
  );
}
