'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { X, Trash2 } from 'lucide-react'
import type { Event } from '@/lib/supabase'

type Member = { name: string; color: string }

type Props = {
  date: Date | null
  event: Event | null
  members: Member[]
  onSave: (data: Omit<Event, 'id' | 'created_at'>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function EventModal({ date, event, members, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [time, setTime] = useState(event?.time ?? '')
  const [member, setMember] = useState(event?.member ?? members[0].name)
  const [notes, setNotes] = useState(event?.notes ?? '')

  const selectedMember = members.find(m => m.name === member) ?? members[0]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !date) return
    onSave({
      title: title.trim(),
      date: format(date, 'yyyy-MM-dd'),
      time: time || undefined,
      member,
      color: selectedMember.color,
      notes: notes || undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            {event ? 'Termin bearbeiten' : 'Neuer Termin'}
          </h3>
          <div className="flex items-center gap-2">
            {event && (
              <button
                onClick={() => onDelete(event.id)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Löschen"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {date && (
            <p className="text-sm text-gray-500 capitalize">
              {format(date, 'EEEE, d. MMMM yyyy', { locale: de })}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="z.B. Zahnarzt, Fußballtraining..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uhrzeit</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Person</label>
            <div className="flex flex-wrap gap-2">
              {members.map(m => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => setMember(m.name)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    member === m.name ? 'text-white shadow-md scale-105' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={member === m.name ? { backgroundColor: m.color } : {}}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Zusätzliche Infos..."
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: selectedMember.color }}
            >
              {event ? 'Speichern' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
