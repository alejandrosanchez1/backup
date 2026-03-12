import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-[#0f172a] text-white min-h-screen antialiased overflow-x-hidden">
        <main className="min-h-screen pb-24 px-0 md:px-4">
          {children}
        </main>
      </body>
    </html>
  );
}

