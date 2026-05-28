'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMyPosts } from '@/app/actions/matchActions';
import type { PostCategory, PostStatus } from '@/types/database.types';

const CATEGORY_LABEL: Record<PostCategory, string> = { SPORTS: '스포츠', STUDY: '스터디', CONTEST: '공모전' };
const STATUS_LABEL: Record<PostStatus, string> = { OPEN: '모집중', CLOSED: '마감', FULL: '정원마감' };

export default function MyPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPosts().then((res) => {
      if (res.success) setPosts(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><span className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} /></div>;

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>총 {posts.length}개의 게시글</p>
        <Link href="/posts/new">
          <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>+ 새 글 작성</button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📝</div>
          <p>작성한 게시글이 없습니다</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    <span className={`badge badge-${post.category.toLowerCase()}`}>{CATEGORY_LABEL[post.category as PostCategory]}</span>
                    <span className={`badge badge-${post.status.toLowerCase()}`}>{STATUS_LABEL[post.status as PostStatus]}</span>
                    {post.is_deleted && <span className="badge" style={{ background: 'rgba(100,100,100,0.15)', color: '#888' }}>삭제됨</span>}
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                    {post.current_members} / {post.max_members}명
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(post.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
