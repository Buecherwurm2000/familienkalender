export type { Member, Preview, CalendarId } from '@/components/KalenderSeite'
import KalenderSeite from '@/components/KalenderSeite'

export default function Home() {
  return <KalenderSeite calendarId="alle" />
}
