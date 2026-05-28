'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getPostDetail, applyToPost, getApprovedContact,
  updateApplicationStatus, getPostApplications, deletePost,
} from '@/app/actions/matchActions';
import type { PostCategory, PostStatus, ApplicationStatus } from '@/types/database.types';

const CATEGORY_LABEL: Record<PostCategory, string> = { SPORTS: '스포츠', STUDY: '스터디', CONTEST: '공모전' };
const CATEGORY_EMOJI: Record<PostCategory, string> = { SPORTS: '⚽', STUDY: '📚', CONTEST: '🏆' };
const STATUS_LABEL: Record<PostStatus, string> = { OPEN: '모집중', CLOSED: '마감', FULL: '정원마감' };
const APP_STATUS_LABEL: Record<ApplicationStatus, string> = { PENDING: '검토중', ACCEPTED: '수락됨', REJECTED: '거절됨', CANCELLED: '취소됨' };

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const [isPending, startTransition] = useTransition();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyMsg, setApplyMsg] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [contact, setContact] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [showApplications, setShowApplications] = useState(false);

  useEffect(() => {
    getPostDetail(postId).then((res) => {
      if (res.success) setPost(res.data);
      else setError(res.error);
      setLoading(false);
    });
  }, [postId]);

  async function handleApply() {
    setActionMsg('');
    startTransition(async () => {
      const result = await applyToPost(postId, applyMsg || undefined);
      if (result.success) {
        setActionMsg('✅ 신청이 완료되었습니다!');
        const refreshed = await getPostDetail(postId);
        if (refreshed.success) setPost(refreshed.data);
      } else {
        setActionMsg(`❌ ${result.error}`);
      }
    });
  }

  async function handleGetContact() {
    startTransition(async () => {
      const result = await getApprovedContact(postId);
      if (result.success) setContact(result.data.contact);
      else setActionMsg(`❌ ${result.error}`);
    });
  }

  async function handleLoadApplications() {
    const result = await getPostApplications(postId);
    if (result.success) { setApplications(result.data); setShowApplications(true); }
  }

  async function handleUpdateApp(applicationId: string, newStatus: 'ACCEPTED' | 'REJECTED') {
    startTransition(async () => {
      const result = await updateApplicationStatus(applicationId, newStatus);
      if (result.success) {
        const refreshed = await getPostApplications(postId);
        if (refreshed.success) setApplications(refreshed.data);
        const postRefreshed = await getPostDetail(postId);
        if (postRefreshed.success) setPost(postRefreshed.data);
      } else {
        setActionMsg(`❌ ${result.error}`);
      }
    });
  }

  async function handleDelete() {
    if (!confirm('게시글을 삭제하시겠습니까? (복구 불가)')) return;
    startTransition(async () => {
      const result = await deletePost(postId);
      if (result.success) router.push('/mypage/my-posts');
      else setActionMsg(`❌ ${result.error}`);
    });
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <span className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
    </div>
  );

  if (error || !post) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>😢</div>
      <p>{error || '게시글을 찾을 수 없습니다.'}</p>
      <Link href="/feed"><button className="btn-secondary" style={{ marginTop: '20px' }}>피드로 돌아가기</button></Link>
    </div>
  );

  const canApply = !post.isAuthor && !post.myApplicationStatus && post.status === 'OPEN' && post.current_members < post.max_members;
  const canViewContact = post.isAuthor || post.myApplicationStatus === 'ACCEPTED';

  return (
    <div className="page-container fade-up" style={{ paddingTop: '32px', paddingBottom: '80px', maxWidth: '720px' }}>
      {/* 뒤로가기 */}
      <Link href="/feed" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '24px' }}>
        ← 피드로 돌아가기
      </Link>

      {/* 헤더 배지 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <span className={`badge badge-${post.category.toLowerCase()}`}>
          {CATEGORY_EMOJI[post.category as PostCategory]} {CATEGORY_LABEL[post.category as PostCategory]}
        </span>
        <span className={`badge badge-${post.status.toLowerCase()}`}>
          {STATUS_LABEL[post.status as PostStatus]}
        </span>
      </div>

      {/* 제목 */}
      <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '16px', lineHeight: '1.3' }}>
        {post.title}
      </h1>

      {/* 메타 */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
        {[
          { label: '작성자', value: `${post.author_department} ${post.author_grade}학년` },
          { label: '모집 인원', value: `${post.current_members} / ${post.max_members}명` },
          { label: '마감일', value: post.deadline ? new Date(post.deadline).toLocaleDateString('ko-KR') : '기한 없음' },
          { label: '등록일', value: new Date(post.created_at).toLocaleDateString('ko-KR') },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>{label}</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* 내용 */}
      <div style={{
        fontSize: '14px', lineHeight: '1.8', color: 'var(--text-secondary)',
        marginBottom: '32px', whiteSpace: 'pre-wrap',
      }}>
        {post.content}
      </div>

      {actionMsg && (
        <div className={actionMsg.startsWith('✅') ? 'error-box' : 'error-box'}
          style={{ background: actionMsg.startsWith('✅') ? 'rgba(16,185,129,0.08)' : undefined,
            borderColor: actionMsg.startsWith('✅') ? 'rgba(16,185,129,0.25)' : undefined,
            color: actionMsg.startsWith('✅') ? '#6ee7b7' : undefined, marginBottom: '16px' }}>
          {actionMsg}
        </div>
      )}

      {/* 신청자용 상태 표시 */}
      {!post.isAuthor && post.myApplicationStatus && (
        <div style={{
          padding: '16px', borderRadius: '12px', marginBottom: '16px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          fontSize: '13px', color: 'var(--text-secondary)',
        }}>
          신청 상태: <span className={`badge badge-${post.myApplicationStatus.toLowerCase()}`} style={{ marginLeft: '8px' }}>
            {APP_STATUS_LABEL[post.myApplicationStatus as ApplicationStatus]}
          </span>
        </div>
      )}

      {/* 신청 폼 */}
      {canApply && (
        <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>신청하기</h3>
          <textarea
            value={applyMsg}
            onChange={(e) => setApplyMsg(e.target.value)}
            placeholder="자기소개 및 지원 동기를 작성해 주세요 (선택, 최대 500자)"
            maxLength={500}
            className="input-base"
            style={{ resize: 'vertical', minHeight: '80px', marginBottom: '12px' }}
          />
          <button onClick={handleApply} disabled={isPending} className="btn-primary" style={{ width: '100%' }}>
            {isPending ? <span className="spinner" /> : '신청하기'}
          </button>
        </div>
      )}

      {/* 연락처 열람 */}
      {canViewContact && (
        <div style={{ marginBottom: '16px' }}>
          {contact ? (
            <div style={{
              padding: '16px', borderRadius: '12px',
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              fontSize: '14px', fontWeight: '600', color: '#6ee7b7',
            }}>
              📞 연락처: {contact}
            </div>
          ) : (
            <button onClick={handleGetContact} disabled={isPending} className="btn-primary"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)', width: '100%' }}>
              {isPending ? <span className="spinner" /> : '📞 연락처 보기'}
            </button>
          )}
        </div>
      )}

      {/* 모집자 전용: 신청자 목록 + 관리 */}
      {post.isAuthor && (
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>신청자 관리</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleLoadApplications} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                신청자 목록 보기
              </button>
              <Link href={`/posts/${postId}/edit`}>
                <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>수정</button>
              </Link>
              <button onClick={handleDelete} disabled={isPending}
                style={{ padding: '6px 14px', fontSize: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                삭제
              </button>
            </div>
          </div>

          {showApplications && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {applications.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>아직 신청자가 없습니다</p>
              ) : applications.map((app: any) => {
                const profile = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles;
                return (
                  <div key={app.id} className="card" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {profile?.department ?? '?'} {profile?.grade ?? '?'}학년
                      </div>
                      {app.message && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: '4px' }}>
                          {app.message}
                        </p>
                      )}
                      <span className={`badge badge-${app.status.toLowerCase()}`} style={{ marginTop: '6px' }}>
                        {APP_STATUS_LABEL[app.status as ApplicationStatus]}
                      </span>
                    </div>
                    {app.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => handleUpdateApp(app.id, 'ACCEPTED')} disabled={isPending}
                          style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
                          수락
                        </button>
                        <button onClick={() => handleUpdateApp(app.id, 'REJECTED')} disabled={isPending}
                          style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
                          거절
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
