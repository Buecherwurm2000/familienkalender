'use client'

import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { X, Trash2, Calendar, Clock } from 'lucide-react'
import type { Event } from '@/lib/supabase'
import type { Preview } from '@/app/page'

type Member = { name: string; color: string }

type Props = {
  date: Date | null
  event: Event | null
  members: Member[]
  onSave: (data: Omit<Event, 'id' | 'created_at'>) => void
  onDelete: (id: string) => void
  onClose: () => void
  onPreviewChange: (preview: Preview) => void
}

export default function EventModal({ date, event, members, onSave, onDelete, onClose, onPreviewChange }: Props) {
  const defaultStart = date ? format(date, 'yyyy-MM-dd') : ''
  const [title, setTitle] = useState(event?.title ?? '')
  const [startDate, setStartDate] = useState(event?.date ?? defaultStart)
  const [endDate, setEndDate] = useState(event?.end_date ?? defaultStart)
  const [time, setTime] = useState(event?.time ?? '')
  const [member, setMember] = useState(event?.member ?? members[0]?.name ?? '')
  const [notes, setNotes] = useState(event?.notes ?? '')

  const selectedMember = members.find(m => m.name === member) ?? members[0]
  const isMultiDay = endDate && endDate > startDate

  // Notify calendar of current selection whenever dates or member change
  useEffect(() => {
    onPreviewChange({
      start: startDate,
      end: endDate || startDate,
      color: selectedMember?.color ?? '#3b82f6',
    })
  }, [startDate, endDate, member])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !startDate) return
    const multi = endDate && endDate > startDate
    onSave({
      title: title.trim(),
      date: startDate,
      end_date: multi ? endDate : undefined,
      time: !multi && time ? time : undefined,
      member,
      color: selectedMember.color,
      notes: notes || undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="font-semibold text-gray-800 text-base">
            {event ? 'Termin bearbeiten' : 'Neuer Termin'}
          </h3>
          <div className="flex items-center gap-1">
            {event && (
              <button onClick={() => onDelete(event.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            )}
            <button onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-4">

          {/* Titel */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Titel des Termins..."
            className="w-full text-lg font-medium border-0 border-b-2 border-gray-200 focus:border-blue-400 px-0 py-2 focus:outline-none bg-transparent placeholder-gray-300"
            required
            autoFocus
          />

          {/* Datum-Block */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">

            {/* Von */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: (selectedMember?.color ?? '#3b82f6') + '22' }}>
                <Calendar size={15} style={{ color: selectedMember?.color }} />
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">Von</p>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => {
                      setStartDate(e.target.value)
                      if (endDate < e.target.value) setEndDate(e.target.value)
                    }}
                    className="text-sm font-medium text-gray-800 bg-transparent border-0 focus:outline-none w-full"
                  />
                </div>
                {!isMultiDay && (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock size={13} />
                    <input
                      type="time"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="text-sm bg-transparent border-0 focus:outline-none text-gray-600 w-24"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Trennlinie */}
            <div className="flex items-center gap-3">
              <div className="w-8 flex-shrink-0 flex justify-center">
                <div className="w-0.5 h-4 bg-gray-200" />
              </div>
            </div>

            {/* Bis */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">Bis</p>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="text-sm font-medium text-gray-800 bg-transparent border-0 focus:outline-none w-full"
                  />
                </div>
                {isMultiDay && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                    mehrtägig
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Person */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Person</p>
            <div className="flex flex-wrap gap-2">
              {members.map(m => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => setMember(m.name)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    member === m.name ? 'text-white shadow-sm' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={member === m.name ? { backgroundColor: m.color } : {}}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Notizen */}
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notizen (optional)..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none text-gray-600 placeholder-gray-300"
          />

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Abbrechen
            </button>
            <button type="submit"
              className="flex-1 py-3 px-4 text-sm font-medium text-white rounded-xl transition-colors"
              style={{ backgroundColor: selectedMember?.color }}>
              {event ? 'Speichern' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
