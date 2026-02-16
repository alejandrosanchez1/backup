'use client'

import { useState, useActionState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { signIn, signUp, type AuthResult } from '../actions/auth'
import { Toast } from '@capacitor/toast'

const initialResult: AuthResult = {}

// 1. Componente del Formulario
function LoginForm() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)

  // Mensaje de bienvenida al cargar
  useEffect(() => {
    const welcome = async () => {
      await Toast.show({
        text: '¡Bienvenido a la App!',
        duration: 'short'
      });
    };
    welcome();
  }, []);

  useEffect(() => {
    const m = searchParams.get('message')
    if (m) setMessage(decodeURIComponent(m))
  }, [searchParams])

  const [signInResult, signInAction, isSignInPending] = useActionState(
    async (_prev: AuthResult, formData: FormData) => {
      setMessage(null)
      return signIn(_prev, formData)
    },
    initialResult
  )

  const [signUpResult, signUpAction, isSignUpPending] = useActionState(
    async (_prev: AuthResult, formData: FormData) => {
      setMessage(null)
      return signUp(_prev, formData)
    },
    initialResult
  )

  const result = isSignUp ? signUpResult : signInResult
  const pending = isSignUp ? isSignUpPending : isSignInPending
  const action = isSignUp ? signUpAction : signInAction

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-white">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {isSignUp
              ? 'Introduce tu email y contraseña para registrarte'
              : 'Introduce tu email y contraseña'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                className="bg-slate-800 border-slate-700 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-slate-800 border-slate-700 h-11"
              />
            </div>
            {(result?.error || message) && (
              <p className="text-sm text-red-400">
                {result?.error || message}
              </p>
            )}
            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              disabled={pending}
            >
              {pending ? 'Espera...' : isSignUp ? 'Registrarse' : 'Entrar'}
            </Button>
          </form>
          <p className="text-center text-sm text-slate-400">
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp((v) => !v)
                setMessage(null)
              }}
              className="text-blue-400 font-medium hover:underline"
            >
              {isSignUp ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// 2. ÚNICO EXPORT DEFAULT DEL ARCHIVO
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-white">Cargando...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
