'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase, type Event } from '@/lib/supabase'
import Calendar from '@/components/Calendar'
import EventModal from '@/components/EventModal'
import MembersModal from '@/components/MembersModal'
import { getHolidays } from '@/lib/holidays'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Settings } from 'lucide-react'

export type Member = { id?: string; name: string; color: string; sort_order?: number }

const DEFAULT_MEMBERS: Member[] = [
  { name: 'Mama', color: '#ec4899', sort_order: 0 },
  { name: 'Papa', color: '#3b82f6', sort_order: 1 },
  { name: 'Kind 1', color: '#10b981', sort_order: 2 },
  { name: 'Kind 2', color: '#f59e0b', sort_order: 3 },
  { name: 'Familie', color: '#8b5cf6', sort_order: 4 },
]

export type Preview = { start: string; end: string; color: string; colors?: string[] } | null

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editEvent, setEditEvent] = useState<Event | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [preview, setPreview] = useState<Preview>(null)

  // Generate holidays for current + next year
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
  }, [])

  async function loadMembers() {
    const { data } = await supabase
      .from('members')
      .select('*')
      .order('sort_order', { ascending: true })
    if (data && data.length > 0) setMembers(data)
  }

  async function loadEvents() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
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
    if (editEvent) {
      await supabase.from('events').update(data).eq('id', editEvent.id)
    } else {
      await supabase.from('events').insert(data)
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

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Familienkalender</h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), 'MMMM yyyy', { locale: de })}
          </p>
        </div>
        <button
          onClick={() => setShowMembers(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium transition-colors"
          title="Familienmitglieder verwalten"
        >
          <Settings size={16} />
          Mitglieder
        </button>
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
    </main>
  )
}
