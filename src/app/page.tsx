'use client'

import { useEffect, useState } from 'react'
import { supabase, type Event } from '@/lib/supabase'
import Calendar from '@/components/Calendar'
import EventModal from '@/components/EventModal'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const FAMILY_MEMBERS = [
  { name: 'Mama', color: '#ec4899' },
  { name: 'Papa', color: '#3b82f6' },
  { name: 'Kind 1', color: '#10b981' },
  { name: 'Kind 2', color: '#f59e0b' },
  { name: 'Familie', color: '#8b5cf6' },
]

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editEvent, setEditEvent] = useState<Event | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
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

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📅 Familienkalender</h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), "MMMM yyyy", { locale: de })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FAMILY_MEMBERS.map(m => (
            <span
              key={m.name}
              className="px-3 py-1 rounded-full text-white text-xs font-medium"
              style={{ backgroundColor: m.color }}
            >
              {m.name}
            </span>
          ))}
        </div>
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
          members={FAMILY_MEMBERS}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  )
}
