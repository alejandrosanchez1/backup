'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Dumbbell } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Por favor ingresa tu email y contraseña')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Revisa tu email para confirmar tu cuenta')
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      console.log('LOGIN RESULT:', { data, error })
      if (error) {
        setError(error.message)
      } else {
        window.location.href = '/'
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="bg-blue-600 p-4 rounded-full w-fit mx-auto">
            <Dumbbell size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isSignUp ? 'Introduce tu email y contraseña para registrarte' : 'Introduce tu email y contraseña'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500 h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500 h-11"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}

          <button
            onClick={(e) => { e.preventDefault(); handleSubmit(); }}            disabled={loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold text-white transition-colors"
          >
            {loading ? 'Espera...' : isSignUp ? 'Registrarse' : 'Entrar'}
          </button>
        </div>

        <p className="text-center text-sm text-slate-400">
          {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button
            onClick={() => { setIsSignUp(v => !v); setError(null); setSuccess(null) }}
            className="text-blue-400 font-medium hover:underline"
          >
            {isSignUp ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </p>
      </div>
    </div>
  )
}