import Link from 'next/link';
import type { PostCategory, PostStatus } from '@/types/database.types';

interface PostCardProps {
  id: string;
  title: string;
  category: PostCategory;
  status: PostStatus;
  max_members: number;
  current_members: number;
  deadline: string | null;
  created_at: string;
  author_department: string;
  author_grade: number;
}

const CATEGORY_LABEL: Record<PostCategory, string> = { SPORTS: '스포츠', STUDY: '스터디', CONTEST: '공모전' };
const CATEGORY_EMOJI: Record<PostCategory, string> = { SPORTS: '⚽', STUDY: '📚', CONTEST: '🏆' };
const STATUS_LABEL: Record<PostStatus, string> = { OPEN: '모집중', CLOSED: '마감', FULL: '정원마감' };

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

function formatDeadline(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((d.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return '마감됨';
  if (diff === 0) return '오늘 마감';
  if (diff <= 3) return `D-${diff} ⚠️`;
  return `D-${diff}`;
}

export function PostCard(props: PostCardProps) {
  const { id, title, category, status, max_members, current_members, deadline, created_at, author_department, author_grade } = props;
  const fillPercent = Math.round((current_members / max_members) * 100);

  return (
    <Link href={`/posts/${id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ padding: '20px', cursor: 'pointer' }}>
        {/* 상단: 카테고리 + 상태 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span className={`badge badge-${category.toLowerCase()}`}>
            {CATEGORY_EMOJI[category]} {CATEGORY_LABEL[category]}
          </span>
          <span className={`badge badge-${status.toLowerCase()}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>

        {/* 제목 */}
        <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', lineHeight: '1.4',
          color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {title}
        </h3>

        {/* 모집 인원 프로그레스바 */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>모집 인원</span>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {current_members} / {max_members}명
            </span>
          </div>
          <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              width: `${fillPercent}%`,
              background: fillPercent >= 100 ? 'var(--accent-purple)' : fillPercent >= 70 ? 'var(--accent-yellow)' : 'var(--accent-blue)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* 하단 메타 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {author_department} {author_grade}학년
          </span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {deadline && (
              <span style={{ fontSize: '11px', color: 'var(--accent-yellow)' }}>
                {formatDeadline(deadline)}
              </span>
            )}
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
