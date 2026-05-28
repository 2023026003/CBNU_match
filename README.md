# CBNUMatch 🎓

충북대학교 학생 전용 스포츠·스터디·공모전 매칭 플랫폼

## 기술 스택

| 항목 | 내용 |
|---|---|
| Frontend/Backend | Next.js 15 App Router (TypeScript) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth — @cbnu.ac.kr 도메인 강제 |
| 보안 | AES-256-GCM 암호화 + HMAC-SHA256 해시 |
| 배포 | Vercel (GitHub 자동 배포) |

---

## 로컬 개발 시작

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`을 열고 아래 값들을 채워주세요:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# 생성: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=<64자 헥사 스트링>

# 생성: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
PEPPER_KEY=<고엔트로피 문자열>
```

### 3. Supabase 스키마 적용

Supabase 대시보드 → SQL Editor → `supabase_schema.sql` 전체 붙여넣기 후 실행

### 4. Supabase Auth 리다이렉트 URL 설정

Supabase → Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/verify`

### 5. 개발 서버 실행

```bash
npm run dev
```

---

## GitHub → Vercel 배포

### 1. GitHub 레포 생성 & 푸시

```bash
git init
git add .
git commit -m "feat: initial CBNUMatch setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cbnumatch.git
git push -u origin main
```

### 2. Vercel 연결

1. [vercel.com](https://vercel.com) → Add New Project
2. GitHub 레포 선택 → Framework: **Next.js** 자동 감지
3. **Deploy** 전에 반드시 환경변수 먼저 입력

### 3. Vercel 환경변수 (⚠️ 필수)

Vercel 대시보드 → Settings → Environment Variables:

| 변수명 | Sensitive 여부 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ 반드시 체크 |
| `ENCRYPTION_KEY` | ✅ 반드시 체크 |
| `PEPPER_KEY` | ✅ 반드시 체크 |

### 4. Supabase 프로덕션 URL 추가

Supabase → Authentication → URL Configuration:
- Redirect URLs에 `https://your-domain.vercel.app/auth/verify` 추가

---

## 프로젝트 구조

```
src/
├── app/
│   ├── actions/
│   │   ├── authActions.ts         # 회원가입 / 로그인 / 로그아웃
│   │   └── matchActions.ts        # 핵심 비즈니스 로직 (암호화 포함)
│   ├── auth/login|signup|verify/  # 인증 페이지
│   ├── feed/                      # 메인 피드 (무한스크롤)
│   ├── posts/[id]/                # 게시글 상세 + 신청자 관리
│   ├── posts/new/                 # 게시글 작성
│   └── mypage/                    # 프로필 / 내 글 / 신청 현황
├── components/
│   ├── layout/Navbar.tsx
│   └── feed/PostCard.tsx
├── lib/
│   ├── supabase.ts                # 브라우저 클라이언트
│   └── supabase-server.ts         # 서버 전용 클라이언트
├── types/database.types.ts        # TypeScript 타입 정의
├── utils/crypto.ts                # AES-256-GCM + HMAC-SHA256
└── middleware.ts                  # 라우트 보호 + 세션 갱신
supabase_schema.sql                # DB 스키마 (SQL Editor에서 실행)
```

## 보안 설계 요약

- **AES-256-GCM**: 이름·학번·연락처를 `iv:authTag:ciphertext` 포맷으로 암호화
- **HMAC-SHA256 + PEPPER**: 학번 중복 탐지용 단방향 해시 (역산 불가)
- **Supabase RLS**: 모든 테이블에 Row Level Security 적용
- **소프트 삭제**: `is_deleted` 플래그로 데이터 보존 및 분쟁 추적
- **서버 전용 키**: `ENCRYPTION_KEY`, `PEPPER_KEY`는 서버에서만 접근
