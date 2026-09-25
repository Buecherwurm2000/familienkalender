import type { Metadata } from 'next'
import KalenderSeite from '@/components/KalenderSeite'

export const metadata: Metadata = {
  title: 'Anja & Simon',
  description: 'Kalender für Anja und Simon',
  manifest: '/manifest-anja-simon.json',
  appleWebApp: { capable: true, title: 'Anja & Simon', statusBarStyle: 'default' },
}

export default function AnjaSimon() {
  return <KalenderSeite calendarId="anja-simon" />
}
