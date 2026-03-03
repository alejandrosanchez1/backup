// app/reset-password/page.tsx
'use client'

import { useState } from 'react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Nueva Contraseña</h1>
      <input 
        type="password" 
        placeholder="Escribe tu nueva clave"
        className="border p-2 rounded mb-4 text-black"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Actualizar
      </button>
    </div>
  )
}
