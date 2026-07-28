'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Member } from '@/app/page'

const PRESET_COLORS = [
  '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

type Props = {
  members: Member[]
  onSave: (members: Member[]) => void
  onClose: () => void
}

export default function MembersModal({ members, onSave, onClose }: Props) {
  const [list, setList] = useState<Member[]>(members.map(m => ({ ...m })))

  function update(index: number, field: keyof Member, value: string) {
    setList(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  function addMember() {
    const usedColors = list.map(m => m.color)
    const nextColor = PRESET_COLORS.find(c => !usedColors.includes(c)) ?? '#64748b'
    setList(prev => [...prev, { name: '', color: nextColor }])
  }

  function removeMember(index: number) {
    setList(prev => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    const valid = list.filter(m => m.name.trim() !== '')
    if (valid.length === 0) return
    onSave(valid)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Familienmitglieder</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {list.map((member, i) => (
            <div key={i} className="flex items-center gap-3">
              {/* Color picker */}
              <div className="relative flex-shrink-0">
                <input
                  type="color"
                  value={member.color}
                  onChange={e => update(i, 'color', e.target.value)}
                  className="sr-only"
                  id={`color-${i}`}
                />
                <label
                  htmlFor={`color-${i}`}
                  className="block w-8 h-8 rounded-full cursor-pointer border-2 border-white shadow-md hover:scale-110 transition-transform"
                  style={{ backgroundColor: member.color }}
                />
              </div>

              {/* Preset colors */}
              <div className="flex gap-1 flex-wrap flex-1">
                {PRESET_COLORS.slice(0, 5).map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => update(i, 'color', color)}
                    className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${member.color === color ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Name input */}
              <input
                type="text"
                value={member.name}
                onChange={e => update(i, 'name', e.target.value)}
                placeholder="Name"
                className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <button
                onClick={() => removeMember(i)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <button
            onClick={addMember}
            className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 font-medium mt-2"
          >
            <Plus size={16} /> Mitglied hinzufügen
          </button>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 px-4 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}
