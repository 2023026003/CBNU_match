/**
 * types/database.types.ts
 * DB 스키마와 1:1 매핑되는 TypeScript 인터페이스 타입 정의
 */

// ─── 공통 ────────────────────────────────────────────────────
interface BaseRecord {
  id: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Enum 타입 ───────────────────────────────────────────────
export type PostCategory = 'SPORTS' | 'STUDY' | 'CONTEST';
export type PostStatus = 'OPEN' | 'CLOSED' | 'FULL';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

// ─── DB Row 타입 ─────────────────────────────────────────────
export interface Profile extends BaseRecord {
  id: string;
  name_enc: string;
  student_id_enc: string;
  student_id_hash: string;
  phone_enc: string;
  department: string;
  grade: number;
  email: string;
}

export interface Post extends BaseRecord {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: PostCategory;
  status: PostStatus;
  max_members: number;
  current_members: number;
  contact_enc: string;
  deadline: string | null;
}

export interface MatchApplication extends BaseRecord {
  id: string;
  post_id: string;
  applicant_id: string;
  status: ApplicationStatus;
  message: string | null;
}

// ─── Insert 입력 타입 ────────────────────────────────────────
export interface ProfileInsert {
  name: string;
  studentId: string;
  phone: string;
  department: string;
  grade: number;
}

export interface PostInsert {
  title: string;
  content: string;
  category: PostCategory;
  maxMembers: number;
  contact: string;
  deadline?: string;
}

// ─── 복호화 결과 타입 ────────────────────────────────────────
export interface DecryptedContact {
  contact: string;
  postId: string;
  viewedBy: string;
  viewedAt: string;
}

export interface DecryptedProfile {
  id: string;
  name: string;
  studentId: string;
  phone: string;
  department: string;
  grade: number;
  email: string;
  createdAt: string;
}

// ─── 조인/뷰 타입 ────────────────────────────────────────────
export interface PostSummary {
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

export interface ApplicationWithPost extends MatchApplication {
  post: Pick<Post, 'id' | 'title' | 'category' | 'status' | 'deadline'>;
}

export interface ApplicationWithApplicantInfo {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  created_at: string;
  applicant_department: string;
  applicant_grade: number;
}

// ─── Supabase Database 제네릭 타입 ───────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'current_members' | 'status' | 'created_at' | 'updated_at' | 'is_deleted'>;
        Update: Partial<Omit<Post, 'id' | 'author_id' | 'created_at'>>;
      };
      match_applications: {
        Row: MatchApplication;
        Insert: Omit<MatchApplication, 'id' | 'status' | 'created_at' | 'updated_at' | 'is_deleted'>;
        Update: Partial<Pick<MatchApplication, 'status' | 'is_deleted'>>;
      };
    };
    Enums: {
      post_category: PostCategory;
      post_status: PostStatus;
      application_status: ApplicationStatus;
    };
  };
}
