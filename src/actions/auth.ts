"use server"

import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export type AuthResult = {
  error?: string
  success?: boolean
}

export async function signIn(prevState: AuthResult, formData: FormData): Promise<AuthResult> {
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Por favor ingresa tu email y contraseña' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Mensajes de error en español
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email o contraseña incorrectos' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Confirma tu email antes de iniciar sesión' }
    }
    return { error: error.message }
  }

  redirect('/')
}

export async function signUp(prevState: AuthResult, formData: FormData): Promise<AuthResult> {
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Por favor ingresa tu email y contraseña' }
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('User already registered')) {
      return { error: 'Ya existe una cuenta con este email' }
    }
    return { error: error.message }
  }

  return { success: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}