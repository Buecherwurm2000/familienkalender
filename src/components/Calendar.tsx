'use client'

import { useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, isWithinInterval, parseISO, getDay,
} from 'date-fns'
import { de } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Event } from '@/lib/supabase'
import type { Preview } from '@/app/page'

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

type Props = {
  events: Event[]
  preview: Preview
  onDayClick: (date: Date) => void
  onEventClick: (event: Event) => void
}

function isMultiDay(event: Event) {
  return !!event.end_date && event.end_date > event.date
}

function eventCoversDay(event: Event, day: Date): boolean {
  const start = parseISO(event.date)
  const end = event.end_date ? parseISO(event.end_date) : start
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  return isWithinInterval(d, { start, end })
}

function isStartDay(event: Event, day: Date) {
  return isSameDay(parseISO(event.date), day)
}

function isEndDay(event: Event, day: Date) {
  if (!event.end_date) return true
  return isSameDay(parseISO(event.end_date), day)
}

function isoWeekday(day: Date) {
  const d = getDay(day)
  return d === 0 ? 6 : d - 1
}

function isWeekStart(day: Date) { return isoWeekday(day) === 0 }
function isWeekEnd(day: Date) { return isoWeekday(day) === 6 }

function previewCoversDay(preview: Preview, day: Date): boolean {
  if (!preview) return false
  const start = parseISO(preview.start)
  const end = parseISO(preview.end)
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  return isWithinInterval(d, { start, end })
}

export default function Calendar({ events, preview, onDayClick, onEventClick }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  function eventsForDay(day: Date) {
    return events.filter(e => eventCoversDay(e, day))
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-blue-500 text-white">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-blue-400 rounded">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: de })}
        </h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-blue-400 rounded">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAYS.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayEvents = eventsForDay(day)
          const inMonth = isSameMonth(day, currentMonth)
          const inPreview = previewCoversDay(preview, day)
          const previewStart = preview ? isSameDay(parseISO(preview.start), day) : false
          const previewEnd = preview ? isSameDay(parseISO(preview.end), day) : false
          const previewSingle = preview ? preview.start === preview.end : false

          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              className={`min-h-[90px] p-1 border-b border-r border-gray-50 cursor-pointer transition-colors relative
                ${inMonth ? 'bg-white hover:bg-blue-50' : 'bg-gray-50'}
                ${isToday(day) ? 'ring-2 ring-inset ring-blue-400' : ''}
              `}
            >
              {/* Preview highlight strip at top of cell */}
              {inPreview && preview && (
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{
                    backgroundColor: preview.color,
                    opacity: 0.5,
                    borderRadius: previewSingle
                      ? '4px'
                      : previewStart
                        ? '4px 0 0 4px'
                        : previewEnd
                          ? '0 4px 4px 0'
                          : '0',
                  }}
                />
              )}

              {/* Background tint for preview range */}
              {inPreview && preview && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ backgroundColor: preview.color, opacity: 0.07 }}
                />
              )}

              <span className={`relative text-xs font-medium inline-flex w-6 h-6 items-center justify-center rounded-full mb-1
                ${isToday(day) ? 'bg-blue-500 text-white' : inMonth ? 'text-gray-700' : 'text-gray-300'}
                ${inPreview && preview && !isToday(day) ? 'ring-2 ring-offset-1' : ''}
              `}
                style={inPreview && preview && !isToday(day) ? { ringColor: preview.color } : {}}
              >
                {format(day, 'd')}
              </span>

              <div className="relative space-y-0.5">
                {dayEvents.slice(0, 3).map(event => {
                  const multi = isMultiDay(event)
                  const start = isStartDay(event, day)
                  const end = isEndDay(event, day)
                  const roundLeft = !multi || start || isWeekStart(day)
                  const roundRight = !multi || end || isWeekEnd(day)
                  const showTitle = !multi || start || isWeekStart(day)

                  return (
                    <button
                      key={event.id}
                      onClick={e => { e.stopPropagation(); onEventClick(event) }}
                      title={event.title}
                      className={`w-full text-left text-xs py-0.5 font-medium block overflow-hidden
                        ${roundLeft ? 'rounded-l-full pl-2' : 'pl-0.5'}
                        ${roundRight ? 'rounded-r-full pr-2' : 'pr-0'}
                      `}
                      style={{ backgroundColor: event.color, color: 'white', opacity: inMonth ? 1 : 0.4 }}
                    >
                      {showTitle
                        ? <span className="truncate block">{!multi && event.time ? `${event.time} ` : ''}{event.title}</span>
                        : <span className="opacity-0 select-none text-[10px]">·</span>
                      }
                    </button>
                  )
                })}
                {dayEvents.length > 3 && (
                  <span className="text-xs text-gray-400 pl-1">+{dayEvents.length - 3}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
