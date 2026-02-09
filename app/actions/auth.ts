'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AuthResult = { error?: string }

export async function signUp(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email?.trim() || !password) {
    return { error: 'Email y contraseña son obligatorios' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email: email.trim(), password })

  if (error) {
    return { error: error.message }
  }

  redirect(
    '/login?message=' + encodeURIComponent('Revisa tu email para confirmar la cuenta.')
  )
}

export async function signIn(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email?.trim() || !password) {
    return { error: 'Email y contraseña son obligatorios' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
