import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', textAlign: 'center',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)',
    }}>
      <div className="fade-up" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: '20px', padding: '6px 16px', marginBottom: '32px',
        fontSize: '12px', color: 'var(--accent-blue)', fontWeight: '600',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'inline-block' }} />
        충북대학교 전용 매칭 플랫폼
      </div>

      <h1 className="fade-up fade-up-delay-1" style={{
        fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: '800',
        lineHeight: '1.1', letterSpacing: '-0.04em', marginBottom: '24px',
      }}>
        <span style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #8da4c4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>팀을 찾고</span><br />
        <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>팀원을 찾는</span><br />
        <span style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #8da4c4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CBNUMatch</span>
      </h1>

      <p className="fade-up fade-up-delay-2" style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: '1.7', marginBottom: '40px' }}>
        스포츠 팀원부터 스터디 파트너, 공모전 팀까지.<br />충북대 이메일 인증으로 신뢰할 수 있는 매칭을 경험하세요.
      </p>

      <div className="fade-up fade-up-delay-2" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/auth/signup"><button className="btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }}>시작하기 →</button></Link>
        <Link href="/feed"><button className="btn-secondary" style={{ padding: '14px 32px', fontSize: '15px' }}>둘러보기</button></Link>
      </div>

      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '600px', marginTop: '80px', width: '100%' }}>
        {[
          { emoji: '⚽', label: '스포츠', desc: '풋살, 농구, 배드민턴 등 팀원 모집', color: 'var(--sports-color)' },
          { emoji: '📚', label: '스터디', desc: '취업, 자격증, 전공 스터디 모집', color: 'var(--study-color)' },
          { emoji: '🏆', label: '공모전', desc: '아이디어, 개발, 디자인 팀 구성', color: 'var(--contest-color)' },
        ].map((item) => (
          <div key={item.label} className="card" style={{ padding: '24px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.emoji}</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: item.color, marginBottom: '6px' }}>{item.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{item.desc}</div>
          </div>
        ))}
      </div>

      <div className="fade-up" style={{ marginTop: '60px', display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['🔐 AES-256-GCM 암호화', '🎓 충북대 이메일 인증', '🛡 개인정보 안전 보관'].map((item) => (
          <span key={item} style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item}</span>
        ))}
      </div>
    </div>
  );
}
