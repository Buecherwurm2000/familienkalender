import type { Metadata } from 'next'
import KalenderSeite from '@/components/KalenderSeite'

export const metadata: Metadata = {
  title: 'Mutti-Kalender',
  description: 'Termine für Mutti',
  manifest: '/manifest-mutti.json',
  appleWebApp: { capable: true, title: 'Mutti-Kalender', statusBarStyle: 'default' },
}

export default function Mutti() {
  return <KalenderSeite calendarId="mutti" />
}
