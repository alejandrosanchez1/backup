'use client'

import { useState, useActionState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { signIn, signUp, type AuthResult } from '@/app/actions/auth'

const initialResult: AuthResult = {}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </CardTitle>
          <CardDescription>
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
                autoComplete="email"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className="h-11"
              />
            </div>
            {(result?.error || message) && (
              <p className="text-sm text-destructive">
                {result?.error || message}
              </p>
            )}
            <Button
              type="submit"
              className="w-full h-11"
              disabled={pending}
            >
              {pending ? 'Espera...' : isSignUp ? 'Registrarse' : 'Entrar'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp((v) => !v)
                setMessage(null)
              }}
              className="text-primary font-medium hover:underline"
            >
              {isSignUp ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
