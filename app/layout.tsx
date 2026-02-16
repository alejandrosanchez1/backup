import './globals.css';
import { Home, Dumbbell, Library, User } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-[#0f172a] text-white min-h-screen antialiased">
        <main className="min-h-screen pb-24 pt-14 px-4">
          {children}
        </main>

        {/* Barra de navegación integrada directamente aquí para evitar errores de importación */}
        <nav className="fixed bottom-0 left-0 z-50 w-full h-20 bg-[#1a1f2e] border-t border-gray-800 pb-4">
          <div className="grid h-full max-w-lg grid-cols-4 mx-auto">
            <button className="flex flex-col items-center justify-center"><Home className="text-blue-500"/><span className="text-xs">Inicio</span></button>
            <button className="flex flex-col items-center justify-center"><Dumbbell className="text-gray-400"/><span className="text-xs">Rutinas</span></button>
            <button className="flex flex-col items-center justify-center"><Library className="text-gray-400"/><span className="text-xs">Librería</span></button>
            <button className="flex flex-col items-center justify-center"><User className="text-gray-400"/><span className="text-xs">Perfil</span></button>
          </div>
        </nav>
      </body>
    </html>
  );
}

