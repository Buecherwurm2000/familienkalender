import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Familienkalender',
  description: 'Unser gemeinsamer Familienkalender',
  icons: { icon: '/icon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
