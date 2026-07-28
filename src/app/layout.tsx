import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Familienkalender',
  description: 'Unser gemeinsamer Familienkalender',
  icons: { icon: '/icon.svg', apple: '/icon-192.svg' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Familienkalender',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Familienkalender" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
