import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="text-white antialiased" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(0,229,168,0.08), transparent 50%), radial-gradient(circle at 80% 0%, rgba(124,92,255,0.08), transparent 50%), #0B1220' }}>
        <main className="min-h-screen pb-24 px-0 md:px-4">
          {children}
        </main>
      </body>
    </html>
  );
}

