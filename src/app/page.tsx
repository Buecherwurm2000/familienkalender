import type { Metadata } from 'next'
export type { Member, Preview, CalendarId } from '@/components/KalenderSeite'
import KalenderSeite from '@/components/KalenderSeite'

export const metadata: Metadata = {
  title: 'Familienkalender',
  description: 'Unser gemeinsamer Familienkalender',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Familienkalender', statusBarStyle: 'default' },
}

export default function Home() {
  return <KalenderSeite calendarId="alle" />
}
