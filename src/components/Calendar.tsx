'use client'

import { useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, isWithinInterval, parseISO,
} from 'date-fns'
import { de } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Event } from '@/lib/supabase'
import type { Preview } from '@/app/page'

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const LANE_H = 16   // px per multi-day lane
const DAY_H  = 26   // px for the date-number row

type Props = {
  events: Event[]
  preview: Preview
  onDayClick: (date: Date) => void
  onEventClick: (event: Event) => void
}

function isMultiDayEvent(e: Event) {
  return !!e.end_date && e.end_date > e.date
}

function eventCoversDay(e: Event, day: Date): boolean {
  const start = parseISO(e.date)
  const end   = e.end_date ? parseISO(e.end_date) : start
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  return isWithinInterval(d, { start, end })
}

function isStartDay(e: Event, day: Date) { return isSameDay(parseISO(e.date), day) }
function isEndDay(e: Event, day: Date) {
  return e.end_date ? isSameDay(parseISO(e.end_date), day) : true
}

function makeGradient(colors: string[]): string {
  if (!colors?.length) return '#3b82f6'
  if (colors.length === 1) return colors[0]
  const step = 100 / colors.length
  return `linear-gradient(90deg, ${colors.map((c, i) => `${c} ${i*step}%, ${c} ${(i+1)*step}%`).join(', ')})`
}

function day0(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }

type Lane = { event: Event; startCol: number; endCol: number; lane: number }

function computeLanes(week: Date[], events: Event[]): Lane[] {
  const result: Lane[] = []
  const occupied: boolean[][] = []

  const sorted = events.filter(isMultiDayEvent).sort((a, b) => {
    const len = (x: Event) => parseISO(x.end_date!).getTime() - parseISO(x.date).getTime()
    return len(b) - len(a)
  })

  for (const event of sorted) {
    const eS = day0(parseISO(event.date))
    const eE = day0(parseISO(event.end_date!))
    let sc = -1, ec = -1
    week.forEach((d, col) => {
      const dd = day0(d)
      if (dd >= eS && dd <= eE) { if (sc < 0) sc = col; ec = col }
    })
    if (sc < 0) continue

    let lane = 0
    while (true) {
      if (!occupied[lane]) occupied[lane] = new Array(7).fill(false)
      if (!occupied[lane].slice(sc, ec + 1).some(Boolean)) break
      lane++
    }
    if (!occupied[lane]) occupied[lane] = new Array(7).fill(false)
    for (let c = sc; c <= ec; c++) occupied[lane][c] = true
    result.push({ event, startCol: sc, endCol: ec, lane })
  }
  return result
}

export default function Calendar({ events, preview, onDayClick, onEventClick }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const calStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
  const calEnd   = endOfWeek(endOfMonth(currentMonth),     { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

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
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase">{d}</div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week, wi) => {
        const weekEvents = events.filter(e => week.some(d => eventCoversDay(e, d)))
        const lanes = computeLanes(week, weekEvents)
        const maxLane = lanes.length > 0 ? Math.max(...lanes.map(l => l.lane)) + 1 : 0

        // Preview lane for multi-day preview
        const previewLane: (Lane & { isPreview: true }) | null = (() => {
          if (!preview || preview.start === preview.end) return null
          const pS = day0(parseISO(preview.start))
          const pE = day0(parseISO(preview.end))
          let sc = -1, ec = -1
          week.forEach((d, col) => {
            const dd = day0(d)
            if (dd >= pS && dd <= pE) { if (sc < 0) sc = col; ec = col }
          })
          if (sc < 0) return null
          return { event: { id: '__preview__', title: 'Neuer Termin', date: preview.start, end_date: preview.end, member: '', color: preview.color, created_at: '' }, startCol: sc, endCol: ec, lane: maxLane, isPreview: true }
        })()

        const topHeight = DAY_H + (maxLane + (previewLane ? 1 : 0)) * LANE_H

        return (
          <div key={wi} className="relative grid grid-cols-7">

            {/* Day cells — click targets + single-day events */}
            {week.map((day, di) => {
              const inMonth = isSameMonth(day, currentMonth)
              const singleEvents = weekEvents.filter(e => !isMultiDayEvent(e) && isSameDay(parseISO(e.date), day))
              const singlePreview = preview?.start === preview?.end && preview && isSameDay(parseISO(preview.start), day)

              return (
                <div
                  key={di}
                  onClick={() => onDayClick(day)}
                  style={{ paddingTop: topHeight }}
                  className={`min-h-[80px] border-b border-r border-gray-50 cursor-pointer transition-colors relative
                    ${inMonth ? 'bg-white hover:bg-blue-50' : 'bg-gray-50'}
                    ${isToday(day) ? 'ring-2 ring-inset ring-blue-400' : ''}
                  `}
                >
                  {/* Date number */}
                  <span
                    className={`absolute text-xs font-medium inline-flex w-6 h-6 items-center justify-center rounded-full
                      ${isToday(day) ? 'bg-blue-500 text-white' : inMonth ? 'text-gray-700' : 'text-gray-300'}
                    `}
                    style={{ top: 4, left: 4 }}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Single-day events */}
                  <div className="px-1 pt-0.5 space-y-px">
                    {singleEvents.slice(0, 4).map(event => {
                      const colors = event.colors?.length ? event.colors : [event.color]
                      return (
                        <button
                          key={event.id}
                          onClick={e => { e.stopPropagation(); if (!event.is_holiday) onEventClick(event) }}
                          title={event.title}
                          className={`w-full text-left text-[10px] leading-[14px] py-px px-1.5 font-medium rounded-full truncate block
                            ${event.is_holiday ? 'italic' : ''}
                          `}
                          style={{ background: makeGradient(colors), color: 'white', opacity: inMonth ? 1 : 0.4 }}
                        >
                          {event.time ? `${event.time} ` : ''}{event.title}
                        </button>
                      )
                    })}
                    {singlePreview && preview && (
                      <div className="w-full text-[10px] leading-[14px] py-px px-1.5 font-medium rounded-full truncate block opacity-60"
                        style={{ backgroundColor: preview.color, color: 'white' }}>
                        Neuer Termin
                      </div>
                    )}
                    {singleEvents.length > 4 && (
                      <span className="text-xs text-gray-400 pl-1">+{singleEvents.length - 4}</span>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Multi-day bars — absolutely positioned over all cells */}
            <div className="absolute inset-x-0 pointer-events-none" style={{ top: DAY_H, bottom: 0 }}>
              {[...lanes, ...(previewLane ? [previewLane] : [])].map((l) => {
                const isPreview = 'isPreview' in l && l.isPreview
                const { event, startCol, endCol, lane } = l
                const inMonth = isSameMonth(week[startCol], currentMonth)
                const isStart = isStartDay(event, week[startCol])
                const isEnd   = isEndDay(event, week[endCol])
                const showTitle = isStart || startCol === 0
                const colors = event.colors?.length ? event.colors : [event.color]

                return (
                  <button
                    key={event.id}
                    onClick={isPreview || event.is_holiday ? undefined : e => { e.stopPropagation(); onEventClick(event) }}
                    title={event.title}
                    className={`absolute text-[10px] font-medium text-white overflow-hidden text-left
                      ${event.is_holiday ? 'italic' : ''}
                    `}
                    style={{
                      left:   `${startCol / 7 * 100}%`,
                      width:  `${(endCol - startCol + 1) / 7 * 100}%`,
                      top:    lane * LANE_H,
                      height: LANE_H - 2,
                      background: makeGradient(colors),
                      opacity: isPreview ? 0.65 : inMonth ? 1 : 0.5,
                      pointerEvents: isPreview || event.is_holiday ? 'none' : 'auto',
                      paddingLeft:  isStart ? 8 : 3,
                      paddingRight: isEnd   ? 8 : 3,
                      borderRadius: `${isStart ? 999 : 2}px ${isEnd ? 999 : 2}px ${isEnd ? 999 : 2}px ${isStart ? 999 : 2}px`,
                      lineHeight: `${LANE_H - 2}px`,
                    }}
                  >
                    <span className="truncate block">{showTitle ? event.title : ''}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
