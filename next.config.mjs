/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',      // <--- OBLIGATORIO para Capacitor
  trailingSlash: true,   // <--- OBLIGATORIO para que encuentre los archivos CSS
  images: {
    unoptimized: true,   // <--- OBLIGATORIO (las imágenes de Next no funcionan en móvil sin esto)
  },
};

export default nextConfig;
