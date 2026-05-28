'use server';

import { createServerActionClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import type { ActionResult } from '@/types/database.types';

export async function signUp(formData: FormData): Promise<ActionResult<void>> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email.endsWith('@cbnu.ac.kr')) {
    return { success: false, error: '충북대학교 이메일(@cbnu.ac.kr)만 가입 가능합니다.' };
  }
  if (password.length < 8) {
    return { success: false, error: '비밀번호는 8자 이상이어야 합니다.' };
  }

  const supabase = await createServerActionClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/verify` },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, error: '이미 가입된 이메일입니다.' };
    }
    return { success: false, error: '회원가입 중 오류가 발생했습니다.' };
  }

  return { success: true, data: undefined };
}

export async function signIn(formData: FormData): Promise<ActionResult<void>> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email.endsWith('@cbnu.ac.kr')) {
    return { success: false, error: '충북대학교 이메일(@cbnu.ac.kr)만 이용 가능합니다.' };
  }

  const supabase = await createServerActionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }

  redirect('/feed');
}

export async function signOut(): Promise<void> {
  const supabase = await createServerActionClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}
