import './globals.css'
import type { Metadata, Viewport } from 'next'

// Configuración de metadatos para SEO y PWA
export const metadata: Metadata = {
  title: 'GymPro App',
  description: 'Mi entrenador personal de gimnasio',
  manifest: '/manifest.json', // Enlace al archivo de configuración PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GymPro App',
  },
  formatDetection: {
    telephone: false,
  },
}

// Configuración del color de la barra del navegador y zoom
export const viewport: Viewport = {
  themeColor: '#020617', // Coincide con tu fondo slate-950
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Evita que la pantalla "baile" al escribir en el móvil
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Favicon básico */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-slate-950 text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
