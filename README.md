'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPostDetail, updatePost } from '@/app/actions/matchActions';
import type { PostCategory } from '@/types/database.types';

const CATEGORIES: { value: PostCategory; label: string; emoji: string }[] = [
  { value: 'SPORTS', label: '스포츠', emoji: '⚽' },
  { value: 'STUDY', label: '스터디', emoji: '📚' },
  { value: 'CONTEST', label: '공모전', emoji: '🏆' },
];

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [post, setPost] = useState<any>(null);
  const [category, setCategory] = useState<PostCategory>('STUDY');
  const [error, setError] = useState('');

  useEffect(() => {
    getPostDetail(postId).then((res) => {
      if (res.success && res.data.isAuthor) {
        setPost(res.data);
        setCategory(res.data.category);
      } else {
        router.push(`/posts/${postId}`);
      }
    });
  }, [postId, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updatePost(postId, {
        title: fd.get('title') as string,
        content: fd.get('content') as string,
        category,
        maxMembers: Number(fd.get('maxMembers')),
        contact: (fd.get('contact') as string) || undefined,
        deadline: (fd.get('deadline') as string) || undefined,
      });
      if (result.success) router.push(`/posts/${postId}`);
      else setError(result.error);
    });
  }

  if (!post) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><span className="spinner" style={{ width: '32px', height: '32px' }} /></div>;

  return (
    <div className="page-container fade-up" style={{ paddingTop: '32px', paddingBottom: '80px', maxWidth: '640px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '28px' }}>게시글 수정</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>카테고리</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {CATEGORIES.map(({ value, label, emoji }) => (
              <button key={value} type="button" onClick={() => setCategory(value)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', border: '1px solid', borderColor: category === value ? 'var(--accent-blue)' : 'var(--border)', background: category === value ? 'rgba(59,130,246,0.12)' : 'var(--bg-elevated)', color: category === value ? 'var(--accent-blue)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>제목</label>
          <input name="title" required defaultValue={post.title} className="input-base" />
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>내용</label>
          <textarea name="content" required defaultValue={post.content} className="input-base" style={{ resize: 'vertical', minHeight: '160px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>모집 인원</label>
            <input name="maxMembers" type="number" min={1} max={20} defaultValue={post.max_members} className="input-base" />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>마감일</label>
            <input name="deadline" type="date" defaultValue={post.deadline ?? ''} className="input-base" />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>연락처 변경 <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(변경 시에만 입력)</span></label>
          <input name="contact" placeholder="새 연락처 입력 (비워두면 기존 유지)" className="input-base" />
        </div>
        {error && <div className="error-box">{error}</div>}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
          <button type="button" onClick={() => router.back()} className="btn-secondary" style={{ flex: 1 }}>취소</button>
          <button type="submit" disabled={isPending} className="btn-primary" style={{ flex: 2 }}>
            {isPending ? <span className="spinner" /> : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
