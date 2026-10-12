import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UniMarket | Compra, vende e intercambia entre estudiantes',
  description: 'El marketplace universitario de Paraguay. Encuentra libros, tecnología, apuntes y más dentro de tu campus.',
  generator: 'UniMarket',
  manifest: '/manifest.webmanifest',
  applicationName: 'UniMarket',
  keywords: ['marketplace universitario', 'estudiantes Paraguay', 'compra y venta', 'libros universitarios'],
  openGraph: {
    title: 'UniMarket | Tu campus. Tu mercado.',
    description: 'Compra, vende e intercambia con estudiantes de tu universidad.',
    type: 'website',
    locale: 'es_PY',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'UniMarket',
    startupImage: ['/icon-512.png'],
  },
  icons: {
    icon: [
      {
        url: '/favicon.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        url: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        url: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-PY">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
