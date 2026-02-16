"use server"

export type AuthResult = {
  error?: string;
  success?: boolean;
}

// Ahora aceptamos dos argumentos: el estado anterior y los datos del formulario
export async function signIn(prevState: AuthResult, formData: FormData): Promise<AuthResult> {
  console.log("Iniciando sesión con datos:", formData);
  
  // Aquí es donde iría la lógica real con Supabase
  return { success: true };
}

export async function signUp(prevState: AuthResult, formData: FormData): Promise<AuthResult> {
  console.log("Registrando usuario con datos:", formData);
  
  return { success: true };
}
