'use client'

import { useState, useEffect } from 'react'
import { supabase, type Event } from '@/lib/supabase'
import { X, Plus, Trash2, UserRound } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

type Props = {
  mamaColor: string
  onClose: () => void
}

type TerminForm = {
  datum: string
  uhrzeit: string
  beschreibung: string
}

const EMPTY_FORM: TerminForm = { datum: '', uhrzeit: '', beschreibung: '' }

export default function MuttiTermineModal({ mamaColor, onClose }: Props) {
  const [termine, setTermine] = useState<Event[]>([])
  const [form, setForm] = useState<TerminForm>(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)
  const [zeigeVergangene, setZeigeVergangene] = useState(false)

  const heute = format(new Date(), 'yyyy-MM-dd')
  const zukuenftige = termine.filter(t => t.date >= heute)
  const vergangene = termine.filter(t => t.date < heute).reverse()

  useEffect(() => {
    loadTermine()
  }, [])

  async function loadTermine() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('member', 'Mama')
      .order('date', { ascending: true })
    if (data) setTermine(data)
  }

  async function handleSave() {
    if (!form.datum || !form.beschreibung.trim()) return
    setFehler(null)

    const { error } = await supabase.from('events').insert({
      title: form.beschreibung.trim(),
      date: form.datum,
      time: form.uhrzeit || null,
      member: 'Mama',
      members: ['Mama'],
      color: mamaColor,
    })

    if (error) {
      setFehler(error.message)
      return
    }

    setForm(EMPTY_FORM)
    setShowForm(false)
    await loadTermine()
  }

  async function handleDelete(id: string) {
    await supabase.from('events').delete().eq('id', id)
    loadTermine()
  }

  function formatDatum(dateStr: string) {
    try {
      return format(new Date(dateStr + 'T12:00:00'), 'EEEE, dd. MMMM yyyy', { locale: de })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserRound size={20} style={{ color: mamaColor }} />
            <h2 className="text-lg font-bold text-gray-800">Muttis Termine</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Terminliste */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {zukuenftige.length === 0 && !showForm && (
            <p className="text-gray-400 text-sm text-center py-6">
              Keine bevorstehenden Termine.
            </p>
          )}

          {zukuenftige.map(t => (
            <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-1.5 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: mamaColor }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm">{t.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDatum(t.date)}{t.time ? ` · ${t.time} Uhr` : ''}
                </p>
              </div>
              <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          {/* Eingabe-Formular */}
          {showForm && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Datum</label>
                  <input
                    type="date"
                    value={form.datum}
                    onChange={e => setForm(f => ({ ...f, datum: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': mamaColor } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Uhrzeit</label>
                  <input
                    type="time"
                    value={form.uhrzeit}
                    onChange={e => setForm(f => ({ ...f, uhrzeit: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Beschreibung</label>
                <textarea
                  value={form.beschreibung}
                  onChange={e => setForm(f => ({ ...f, beschreibung: e.target.value }))}
                  placeholder="z.B. Arzttermin, Friseur, Geburtstag …"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFehler(null) }}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.datum || !form.beschreibung.trim()}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: mamaColor }}
                >
                  Speichern
                </button>
              </div>
              {fehler && (
                <p className="text-xs text-red-500 text-center">{fehler}</p>
              )}
            </div>
          )}

          {/* Vergangene Termine */}
          {vergangene.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => setZeigeVergangene(v => !v)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors w-full text-center py-1"
              >
                {zeigeVergangene ? '▲ Vergangene ausblenden' : `▼ ${vergangene.length} vergangene Termine`}
              </button>
              {zeigeVergangene && (
                <div className="mt-2 space-y-2">
                  {vergangene.map(t => (
                    <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 opacity-50">
                      <div className="w-1.5 self-stretch rounded-full flex-shrink-0 bg-gray-300" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-400 line-through">{t.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDatum(t.date)}{t.time ? ` · ${t.time} Uhr` : ''}
                        </p>
                      </div>
                      <button onClick={() => handleDelete(t.id)} className="text-gray-200 hover:text-red-300 transition-colors flex-shrink-0 mt-0.5">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!showForm && (
          <div className="px-6 py-4 border-t border-gray-100">
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: mamaColor }}
            >
              <Plus size={16} />
              Termin hinzufügen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
