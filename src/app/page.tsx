'use client'

import { useEffect, useState } from 'react'
import { supabase, type Event } from '@/lib/supabase'
import Calendar from '@/components/Calendar'
import EventModal from '@/components/EventModal'
import MembersModal from '@/components/MembersModal'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Settings } from 'lucide-react'

const DEFAULT_MEMBERS = [
  { name: 'Mama', color: '#ec4899' },
  { name: 'Papa', color: '#3b82f6' },
  { name: 'Kind 1', color: '#10b981' },
  { name: 'Kind 2', color: '#f59e0b' },
  { name: 'Familie', color: '#8b5cf6' },
]

export type Member = { name: string; color: string }

function loadMembers(): Member[] {
  if (typeof window === 'undefined') return DEFAULT_MEMBERS
  try {
    const stored = localStorage.getItem('familyMembers')
    return stored ? JSON.parse(stored) : DEFAULT_MEMBERS
  } catch {
    return DEFAULT_MEMBERS
  }
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editEvent, setEditEvent] = useState<Event | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showMembers, setShowMembers] = useState(false)

  useEffect(() => {
    setMembers(loadMembers())
    loadEvents()

    const channel = supabase
      .channel('events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        loadEvents()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

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
    setShowModal(false)
    loadEvents()
  }

  async function handleDelete(id: string) {
    await supabase.from('events').delete().eq('id', id)
    setShowModal(false)
    loadEvents()
  }

  function handleSaveMembers(updated: Member[]) {
    localStorage.setItem('familyMembers', JSON.stringify(updated))
    setMembers(updated)
    setShowMembers(false)
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📅 Familienkalender</h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), "MMMM yyyy", { locale: de })}
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
        events={events}
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
          onClose={() => setShowModal(false)}
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
