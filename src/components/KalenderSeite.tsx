'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase, type Event } from '@/lib/supabase'
import Calendar from '@/components/Calendar'
import EventModal from '@/components/EventModal'
import MembersModal from '@/components/MembersModal'
import MuttiTermineModal from '@/components/MuttiTermineModal'
import { getHolidays } from '@/lib/holidays'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Settings, UserRound } from 'lucide-react'

export type Member = { id?: string; name: string; color: string; sort_order?: number }
export type Preview = { start: string; end: string; color: string; colors?: string[] } | null
export type CalendarId = 'alle' | 'anja-simon' | 'mutti'

const DEFAULT_MEMBERS: Member[] = [
  { name: 'Mama', color: '#ec4899', sort_order: 0 },
  { name: 'Papa', color: '#3b82f6', sort_order: 1 },
  { name: 'Kind 1', color: '#10b981', sort_order: 2 },
  { name: 'Kind 2', color: '#f59e0b', sort_order: 3 },
  { name: 'Familie', color: '#8b5cf6', sort_order: 4 },
]

const KALENDER_LABELS: Record<CalendarId, string> = {
  'alle': 'Familienkalender',
  'anja-simon': 'Anja & Simon',
  'mutti': 'Mutti-Kalender',
}

type Props = { calendarId: CalendarId }

export default function KalenderSeite({ calendarId }: Props) {
  const [events, setEvents] = useState<Event[]>([])
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editEvent, setEditEvent] = useState<Event | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showMuttiTermine, setShowMuttiTermine] = useState(false)
  const [preview, setPreview] = useState<Preview>(null)

  const holidays = useMemo<Event[]>(() => {
    const year = new Date().getFullYear()
    return [...getHolidays(year), ...getHolidays(year + 1)].map(h => ({
      id: `holiday-${h.date}`,
      title: h.title,
      date: h.date,
      member: '',
      color: '#9ca3af',
      is_holiday: true,
      created_at: '',
    }))
  }, [])

  const allEvents = useMemo(() => [...holidays, ...events], [holidays, events])

  useEffect(() => {
    loadMembers()
    loadEvents()

    const channel = supabase
      .channel('realtime-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, loadEvents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, loadMembers)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [calendarId])

  async function loadMembers() {
    const { data } = await supabase
      .from('members')
      .select('*')
      .order('sort_order', { ascending: true })
    if (data && data.length > 0) setMembers(data)
  }

  async function loadEvents() {
    let query = supabase.from('events').select('*').order('date', { ascending: true })
    if (calendarId === 'anja-simon') {
      query = query.eq('calendar', 'anja-simon')
    } else if (calendarId === 'mutti') {
      query = query.eq('member', 'Mama')
    } else {
      // Familie: alles außer anja-simon
      query = query.or('calendar.neq.anja-simon,calendar.is.null')
    }
    const { data } = await query
    if (data) setEvents(data)
  }

  function handleDayClick(date: Date) {
    setSelectedDate(date)
    setEditEvent(null)
    setShowModal(true)
  }

  function handleEventClick(event: Event) {
    if (event.is_holiday) return
    setEditEvent(event)
    setSelectedDate(new Date(event.date))
    setShowModal(true)
  }

  async function handleSave(data: Omit<Event, 'id' | 'created_at'>) {
    const calendar = calendarId === 'anja-simon' ? 'anja-simon' : 'alle'
    const row = { ...data, calendar }
    if (editEvent) {
      await supabase.from('events').update(row).eq('id', editEvent.id)
    } else {
      await supabase.from('events').insert(row)
    }
    setPreview(null)
    setShowModal(false)
    loadEvents()
  }

  async function handleDelete(id: string) {
    await supabase.from('events').delete().eq('id', id)
    setPreview(null)
    setShowModal(false)
    loadEvents()
  }

  async function handleSaveMembers(updated: Member[]) {
    await supabase.from('members').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('members').insert(
      updated.map((m, i) => ({ name: m.name, color: m.color, sort_order: i }))
    )
    setMembers(updated)
    setShowMembers(false)
  }

  const mamaColor = members.find(m => m.name === 'Mama')?.color ?? '#ec4899'
  const currentLabel = KALENDER_LABELS[calendarId]

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{currentLabel}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), 'MMMM yyyy', { locale: de })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {calendarId === 'mutti' && (
            <button
              onClick={() => setShowMuttiTermine(true)}
              className="p-2 rounded-xl hover:opacity-80 transition-opacity"
              style={{ backgroundColor: mamaColor }}
              title="Muttis Termine"
            >
              <UserRound size={18} color="white" />
            </button>
          )}
          <button
            onClick={() => setShowMembers(true)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Familienmitglieder verwalten"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <Calendar
        events={allEvents}
        preview={preview}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
      />

      {showModal && (
        <EventModal
          date={selectedDate}
          event={editEvent}
          members={members}
          onSave={handleSave}
          onDelete={handleDelete}
          onPreviewChange={setPreview}
          onClose={() => { setPreview(null); setShowModal(false) }}
        />
      )}

      {showMembers && (
        <MembersModal
          members={members}
          onSave={handleSaveMembers}
          onClose={() => setShowMembers(false)}
        />
      )}

      {showMuttiTermine && (
        <MuttiTermineModal
          mamaColor={mamaColor}
          onClose={() => setShowMuttiTermine(false)}
        />
      )}
    </main>
  )
}
