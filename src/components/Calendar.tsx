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
  try {
    const start = parseISO(preview.start)
    const end = parseISO(preview.end)
    const d = new Date(day.getFullYear(), day.getMonth(), day.getDate())
    return isWithinInterval(d, { start, end })
  } catch { return false }
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

  // Render a single event/preview bar
  function renderBar(opts: {
    key: string
    color: string
    title: string
    time?: string
    isStart: boolean
    isEnd: boolean
    isMulti: boolean
    isPreview: boolean
    inMonth: boolean
    day: Date
    onClick?: (e: React.MouseEvent) => void
  }) {
    const { key, color, title, time, isStart, isEnd, isMulti, isPreview, inMonth, day, onClick } = opts
    const roundLeft = !isMulti || isStart || isWeekStart(day)
    const roundRight = !isMulti || isEnd || isWeekEnd(day)
    const showTitle = !isMulti || isStart || isWeekStart(day)

    const Tag = onClick ? 'button' : 'div'

    return (
      <Tag
        key={key}
        onClick={onClick}
        title={title}
        className={`w-full text-left text-[10px] leading-[14px] py-px font-medium block overflow-hidden
          ${roundLeft ? 'rounded-l-full pl-1.5' : 'pl-0.5'}
          ${roundRight ? 'rounded-r-full pr-1.5' : 'pr-0'}
          ${isPreview ? 'opacity-60' : ''}
        `}
        style={{
          backgroundColor: color,
          color: 'white',
          opacity: isPreview ? 0.65 : inMonth ? 1 : 0.4,
          outline: isPreview ? `2px dashed ${color}` : undefined,
          outlineOffset: isPreview ? '1px' : undefined,
        }}
      >
        {showTitle
          ? <span className="truncate block">{!isMulti && time ? `${time} ` : ''}{title}</span>
          : <span className="opacity-0 select-none text-[10px]">·</span>
        }
      </Tag>
    )
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
          const previewIsMulti = preview ? preview.start !== preview.end : false

          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              className={`min-h-[110px] p-1 border-b border-r border-gray-50 cursor-pointer transition-colors
                ${inMonth ? 'bg-white hover:bg-blue-50' : 'bg-gray-50'}
                ${isToday(day) ? 'ring-2 ring-inset ring-blue-400' : ''}
              `}
            >
              <span className={`text-xs font-medium inline-flex w-6 h-6 items-center justify-center rounded-full mb-1
                ${isToday(day) ? 'bg-blue-500 text-white' : inMonth ? 'text-gray-700' : 'text-gray-300'}
              `}>
                {format(day, 'd')}
              </span>

              <div className="space-y-px">
                {/* Saved events */}
                {dayEvents.slice(0, 6).map(event =>
                  renderBar({
                    key: event.id,
                    color: event.color,
                    title: event.title,
                    time: event.time,
                    isStart: isStartDay(event, day),
                    isEnd: isEndDay(event, day),
                    isMulti: isMultiDay(event),
                    isPreview: false,
                    inMonth,
                    day,
                    onClick: e => { e.stopPropagation(); onEventClick(event) },
                  })
                )}

                {/* Preview bar */}
                {inPreview && preview && renderBar({
                  key: 'preview',
                  color: preview.color,
                  title: 'Neuer Termin',
                  isStart: isSameDay(parseISO(preview.start), day),
                  isEnd: isSameDay(parseISO(preview.end), day),
                  isMulti: previewIsMulti,
                  isPreview: true,
                  inMonth,
                  day,
                })}

                {dayEvents.length > 6 && (
                  <span className="text-xs text-gray-400 pl-1">+{dayEvents.length - 6}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
