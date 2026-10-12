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
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
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
