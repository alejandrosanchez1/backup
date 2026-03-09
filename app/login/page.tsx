'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!email || !password) { setError('Por favor ingresa tu email y contraseña'); return }
    setLoading(true); setError(null); setSuccess(null)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
        else setSuccess('Revisa tu email para confirmar tu cuenta')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError('Email o contraseña incorrectos')
        else if (data.session) window.location.replace('/')
      }
    } catch { setError('Error inesperado, intenta de nuevo') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="bg-blue-600 p-4 rounded-full w-fit mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-white">{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
          <p className="text-slate-400 text-sm">{isSignUp ? 'Crea tu cuenta para comenzar' : 'Introduce tu email y contraseña'}</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500 h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e as any) }} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500 h-11" />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}
          <button type="button" onClick={handleSubmit} disabled={loading} className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold text-white transition-colors">
            {loading ? 'Espera...' : isSignUp ? 'Registrarse' : 'Entrar'}
          </button>
        </div>
        <p className="text-center text-sm text-slate-400">
          {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button type="button" onClick={() => { setIsSignUp(v => !v); setError(null); setSuccess(null) }} className="text-blue-400 font-medium hover:underline">
            {isSignUp ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </p>
      </div>
    </div>
  )
}