'use server';

/**
 * app/actions/matchActions.ts
 * CBNUMatch 핵심 Server Actions
 */

import { createServerActionClient } from '@/lib/supabase-server';
import { encrypt, decrypt, generateDeterministicHash } from '@/utils/crypto';
import { revalidatePath } from 'next/cache';
import type {
  ProfileInsert,
  PostInsert,
  ActionResult,
  DecryptedContact,
  DecryptedProfile,
  PostCategory,
} from '@/types/database.types';

// ─── 인증 세션 + 도메인 검증 ─────────────────────────────────
async function getVerifiedSession() {
  const supabase = await createServerActionClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw new Error('로그인이 필요합니다.');

  const email = user.email ?? '';
  if (!email.endsWith('@cbnu.ac.kr')) {
    throw new Error('충북대학교 이메일(@cbnu.ac.kr)만 이용 가능합니다.');
  }

  return { userId: user.id, email, supabase };
}

// ─── 프로필 등록 ─────────────────────────────────────────────
export async function registerProfile(
  input: ProfileInsert
): Promise<ActionResult<{ profileId: string }>> {
  try {
    const { userId, email, supabase } = await getVerifiedSession();

    const studentIdHash = generateDeterministicHash(input.studentId);

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('student_id_hash', studentIdHash)
      .eq('is_deleted', false)
      .maybeSingle();

    if (existing) {
      return { success: false, error: '이미 등록된 학번입니다.' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name_enc: encrypt(input.name),
        student_id_enc: encrypt(input.studentId),
        student_id_hash: studentIdHash,
        phone_enc: encrypt(input.phone),
        department: input.department,
        grade: input.grade,
        email,
        is_deleted: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[registerProfile]', error.code);
      return { success: false, error: '프로필 등록 중 오류가 발생했습니다.' };
    }

    revalidatePath('/mypage/profile');
    return { success: true, data: { profileId: data.id } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}

// ─── 프로필 수정 ─────────────────────────────────────────────
export async function updateProfile(
  input: Partial<ProfileInsert>
): Promise<ActionResult<void>> {
  try {
    const { userId, supabase } = await getVerifiedSession();
    const updates: Record<string, unknown> = {};

    if (input.name) updates.name_enc = encrypt(input.name);
    if (input.phone) updates.phone_enc = encrypt(input.phone);
    if (input.department) updates.department = input.department;
    if (input.grade) updates.grade = input.grade;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) return { success: false, error: '프로필 수정 중 오류가 발생했습니다.' };

    revalidatePath('/mypage/profile');
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}

// ─── 내 프로필 조회 (복호화) ──────────────────────────────────
export async function getMyProfile(): Promise<ActionResult<DecryptedProfile>> {
  try {
    const { userId, supabase } = await getVerifiedSession();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error || !data) return { success: false, error: '프로필을 찾을 수 없습니다.' };

    return {
      success: true,
      data: {
        id: data.id,
        name: decrypt(data.name_enc),
        studentId: decrypt(data.student_id_enc),
        phone: decrypt(data.phone_enc),
        department: data.department,
        grade: data.grade,
        email: data.email,
        createdAt: data.created_at,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}

// ─── 게시글 작성 ─────────────────────────────────────────────
export async function createPost(
  input: PostInsert
): Promise<ActionResult<{ postId: string }>> {
  try {
    const { userId, supabase } = await getVerifiedSession();

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .eq('is_deleted', false)
      .maybeSingle();

    if (!profile) {
      return { success: false, error: '게시글 작성 전 프로필을 먼저 등록해 주세요.' };
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: userId,
        title: input.title,
        content: input.content,
        category: input.category,
        max_members: input.maxMembers,
        contact_enc: encrypt(input.contact),
        deadline: input.deadline ?? null,
        status: 'OPEN',
        current_members: 0,
        is_deleted: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[createPost]', error.code);
      return { success: false, error: '게시글 등록 중 오류가 발생했습니다.' };
    }

    revalidatePath('/feed');
    return { success: true, data: { postId: data.id } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}

// ─── 게시글 수정 ─────────────────────────────────────────────
export async function updatePost(
  postId: string,
  input: Partial<PostInsert>
): Promise<ActionResult<void>> {
  try {
    const { userId, supabase } = await getVerifiedSession();
    const updates: Record<string, unknown> = {};

    if (input.title) updates.title = input.title;
    if (input.content) updates.content = input.content;
    if (input.category) updates.category = input.category;
    if (input.maxMembers) updates.max_members = input.maxMembers;
    if (input.contact) updates.contact_enc = encrypt(input.contact);
    if (input.deadline !== undefined) updates.deadline = input.deadline ?? null;

    const { error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .eq('author_id', userId);

    if (error) return { success: false, error: '게시글 수정 중 오류가 발생했습니다.' };

    revalidatePath(`/posts/${postId}`);
    revalidatePath('/feed');
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}

// ─── 게시글 소프트 삭제 ───────────────────────────────────────
export async function deletePost(postId: string): Promise<ActionResult<void>> {
  try {
    const { userId, supabase } = await getVerifiedSession();

    const { error } = await supabase
      .from('posts')
      .update({ is_deleted: true })
      .eq('id', postId)
      .eq('author_id', userId);

    if (error) return { success: false, error: '게시글 삭제 중 오류가 발생했습니다.' };

    revalidatePath('/feed');
    revalidatePath('/mypage/my-posts');
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}

// ─── 매칭 신청 ───────────────────────────────────────────────
export async function applyToPost(
  postId: string,
  message?: string
): Promise<ActionResult<{ applicationId: string }>> {
  try {
    const { userId, supabase } = await getVerifiedSession();

    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id, status, current_members, max_members, deadline, is_deleted')
      .eq('id', postId)
      .maybeSingle();

    if (!post || post.is_deleted) return { success: false, error: '존재하지 않는 게시글입니다.' };
    if (post.author_id === userId) return { success: false, error: '본인 게시글에는 신청할 수 없습니다.' };
    if (post.status !== 'OPEN') return { success: false, error: '모집이 마감된 게시글입니다.' };
    if (post.deadline && new Date(post.deadline) < new Date()) {
      return { success: false, error: '신청 마감일이 지난 게시글입니다.' };
    }
    if (post.current_members >= post.max_members) {
      return { success: false, error: '정원이 마감되었습니다.' };
    }

    const { data: existing } = await supabase
      .from('match_applications')
      .select('id, status, is_deleted')
      .eq('post_id', postId)
      .eq('applicant_id', userId)
      .maybeSingle();

    if (existing && !existing.is_deleted) {
      return { success: false, error: `이미 신청한 게시글입니다. 현재 상태: ${existing.status}` };
    }

    const { data, error } = await supabase
      .from('match_applications')
      .insert({ post_id: postId, applicant_id: userId, message: message ?? null, status: 'PENDING', is_deleted: false })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') return { success: false, error: '이미 신청한 게시글입니다.' };
      return { success: false, error: '신청 중 오류가 발생했습니다.' };
    }

    revalidatePath(`/posts/${postId}`);
    return { success: true, data: { applicationId: data.id } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}

// ─── 신청 수락/거절 ───────────────────────────────────────────
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: 'ACCEPTED' | 'REJECTED'
): Promise<ActionResult<void>> {
  try {
    const { userId, supabase } = await getVerifiedSession();

    const { data: application } = await supabase
      .from('match_applications')
      .select('id, status, is_deleted, post_id')
      .eq('id', applicationId)
      .maybeSingle();

    if (!application || application.is_deleted) {
      return { success: false, error: '존재하지 않는 신청입니다.' };
    }
    if (application.status !== 'PENDING') {
      return { success: false, error: `이미 처리된 신청입니다. 현재 상태: ${application.status}` };
    }

    const { data: post } = await supabase
      .from('posts')
      .select('author_id, current_members, max_members')
      .eq('id', application.post_id)
      .single();

    if (!post || post.author_id !== userId) {
      return { success: false, error: '본인 게시글의 신청만 처리할 수 있습니다.' };
    }
    if (newStatus === 'ACCEPTED' && post.current_members >= post.max_members) {
      return { success: false, error: '정원이 초과되어 수락할 수 없습니다.' };
    }

    const { error } = await supabase
      .from('match_applications')
      .update({ status: newStatus })
      .eq('id', applicationId);

    if (error) return { success: false, error: '상태 변경 중 오류가 발생했습니다.' };

    if (newStatus === 'ACCEPTED') {
      await supabase
        .from('posts')
        .update({ current_members: post.current_members + 1 })
        .eq('id', application.post_id);
    }

    revalidatePath(`/posts/${application.post_id}`);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}

// ─── 연락처 조건부 열람 ───────────────────────────────────────
export async function getApprovedContact(
  postId: string
): Promise<ActionResult<DecryptedContact>> {
  try {
    const { userId, supabase } = await getVerifiedSession();

    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id, contact_enc, is_deleted')
      .eq('id', postId)
      .maybeSingle();

    if (!post || post.is_deleted) return { success: false, error: '존재하지 않는 게시글입니다.' };

    const isAuthor = post.author_id === userId;

    if (!isAuthor) {
      const { data: application } = await supabase
        .from('match_applications')
        .select('id, status')
        .eq('post_id', postId)
        .eq('applicant_id', userId)
        .eq('is_deleted', false)
        .maybeSingle();

      if (!application) return { success: false, error: '이 게시글에 신청 이력이 없습니다.' };
      if (application.status !== 'ACCEPTED') {
        return { success: false, error: `연락처는 매칭 승인(ACCEPTED) 후에만 열람 가능합니다. 현재 상태: ${application.status}` };
      }
    }

    const contact = decrypt(post.contact_enc);
    return { success: true, data: { contact, postId, viewedBy: userId, viewedAt: new Date().toISOString() } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : '알 수 없는 오류';
    if (msg.includes('복호화')) {
      console.error('[getApprovedContact] 복호화 실패 postId:', postId);
      return { success: false, error: '연락처를 불러올 수 없습니다.' };
    }
    return { success: false, error: msg };
  }
}

// ─── 피드 게시글 목록 조회 ────────────────────────────────────
export async function getPosts(params: {
  category?: PostCategory;
  cursor?: string;
  limit?: number;
}) {
  try {
    const supabase = await createServerActionClient();
    const limit = params.limit ?? 20;

    let query = supabase
      .from('posts')
      .select(`
        id, title, category, status, max_members, current_members, deadline, created_at,
        profiles!inner(department, grade)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (params.category) query = query.eq('category', params.category);
    if (params.cursor) query = query.lt('created_at', params.cursor);

    const { data, error } = await query;
    if (error) return { success: false as const, error: '게시글을 불러오지 못했습니다.' };

    const hasMore = data.length > limit;
    const posts = data.slice(0, limit);

    return {
      success: true as const,
      data: {
        posts: posts.map((p) => {
          const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
          return {
            id: p.id,
            title: p.title,
            category: p.category,
            status: p.status,
            max_members: p.max_members,
            current_members: p.current_members,
            deadline: p.deadline,
            created_at: p.created_at,
            author_department: profile?.department ?? '',
            author_grade: profile?.grade ?? 0,
          };
        }),
        hasMore,
        nextCursor: hasMore ? posts[posts.length - 1].created_at : null,
      },
    };
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}

// ─── 게시글 상세 조회 ─────────────────────────────────────────
export async function getPostDetail(postId: string) {
  try {
    const supabase = await createServerActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        id, title, content, category, status, max_members, current_members,
        deadline, created_at, author_id, is_deleted,
        profiles!inner(department, grade)
      `)
      .eq('id', postId)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error || !post) return { success: false as const, error: '게시글을 찾을 수 없습니다.' };

    let myApplicationStatus = null;
    if (user) {
      const { data: app } = await supabase
        .from('match_applications')
        .select('status')
        .eq('post_id', postId)
        .eq('applicant_id', user.id)
        .eq('is_deleted', false)
        .maybeSingle();
      myApplicationStatus = app?.status ?? null;
    }

    const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;

    return {
      success: true as const,
      data: {
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category,
        status: post.status,
        max_members: post.max_members,
        current_members: post.current_members,
        deadline: post.deadline,
        created_at: post.created_at,
        author_id: post.author_id,
        author_department: profile?.department ?? '',
        author_grade: profile?.grade ?? 0,
        isAuthor: user?.id === post.author_id,
        myApplicationStatus,
      },
    };
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}

// ─── 내 게시글 목록 ───────────────────────────────────────────
export async function getMyPosts() {
  try {
    const { userId, supabase } = await getVerifiedSession();

    const { data, error } = await supabase
      .from('posts')
      .select('id, title, category, status, max_members, current_members, deadline, created_at, is_deleted')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { success: false as const, error: '게시글을 불러오지 못했습니다.' };
    return { success: true as const, data: data ?? [] };
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}

// ─── 내 신청 목록 ─────────────────────────────────────────────
export async function getMyApplications() {
  try {
    const { userId, supabase } = await getVerifiedSession();

    const { data, error } = await supabase
      .from('match_applications')
      .select('id, status, message, created_at, post_id, posts(id, title, category, status, deadline)')
      .eq('applicant_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) return { success: false as const, error: '신청 목록을 불러오지 못했습니다.' };
    return { success: true as const, data: data ?? [] };
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}

// ─── 게시글 신청자 목록 (모집자 전용) ─────────────────────────
export async function getPostApplications(postId: string) {
  try {
    const { userId, supabase } = await getVerifiedSession();

    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (!post || post.author_id !== userId) {
      return { success: false as const, error: '권한이 없습니다.' };
    }

    const { data, error } = await supabase
      .from('match_applications')
      .select('id, status, message, created_at, profiles!inner(department, grade)')
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) return { success: false as const, error: '신청자 목록을 불러오지 못했습니다.' };
    return { success: true as const, data: data ?? [] };
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : '알 수 없는 오류' };
  }
}
