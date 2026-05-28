@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #0a0e1a;
  --bg-secondary: #111827;
  --bg-card: #1a2235;
  --bg-elevated: #1f2d42;
  --border: #2a3a55;
  --border-subtle: #1e2d44;
  --accent-blue: #3b82f6;
  --accent-blue-hover: #2563eb;
  --accent-green: #10b981;
  --accent-yellow: #f59e0b;
  --accent-red: #ef4444;
  --accent-purple: #8b5cf6;
  --text-primary: #f0f4ff;
  --text-secondary: #8da4c4;
  --text-muted: #4a6080;
  --sports-color: #3b82f6;
  --study-color: #10b981;
  --contest-color: #f59e0b;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Noto Sans KR', -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-primary); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

.input-base {
  width: 100%;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  padding: 12px 16px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}
.input-base::placeholder { color: var(--text-muted); }
.input-base:focus { border-color: var(--accent-blue); box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }

.btn-primary {
  background: var(--accent-blue);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-primary:hover { background: var(--accent-blue-hover); box-shadow: 0 4px 16px rgba(59,130,246,0.3); }
.btn-primary:active { transform: scale(0.98); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover { border-color: var(--accent-blue); color: var(--text-primary); }

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}
.card:hover { border-color: var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.3); transform: translateY(-2px); }

.badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-sports { background: rgba(59,130,246,0.15); color: var(--sports-color); }
.badge-study { background: rgba(16,185,129,0.15); color: var(--study-color); }
.badge-contest { background: rgba(245,158,11,0.15); color: var(--contest-color); }
.badge-open { background: rgba(16,185,129,0.15); color: var(--accent-green); }
.badge-closed { background: rgba(239,68,68,0.12); color: var(--accent-red); }
.badge-full { background: rgba(139,92,246,0.12); color: var(--accent-purple); }
.badge-pending { background: rgba(245,158,11,0.12); color: var(--accent-yellow); }
.badge-accepted { background: rgba(16,185,129,0.15); color: var(--accent-green); }
.badge-rejected { background: rgba(239,68,68,0.12); color: var(--accent-red); }

.page-container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
.error-box { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); border-radius: var(--radius-sm); padding: 12px 16px; color: #fca5a5; font-size: 13px; }

@keyframes spin { to { transform: rotate(360deg); } }
.spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--accent-blue); border-radius: 50%; animation: spin 0.7s linear infinite; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.fade-up { animation: fadeUp 0.4s ease both; }
.fade-up-delay-1 { animation-delay: 0.08s; }
.fade-up-delay-2 { animation-delay: 0.16s; }
