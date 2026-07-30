// Deutsche gesetzliche Feiertage (bundesweit)
// Bewegliche Feiertage werden per Algorithmus berechnet

function easterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function fmt(date: Date): string {
  return date.toISOString().split('T')[0]
}

export type Holiday = { date: string; title: string }

export function getHolidays(year: number): Holiday[] {
  const easter = easterSunday(year)

  return [
    { date: `${year}-01-01`, title: 'Neujahr' },
    { date: fmt(addDays(easter, -2)), title: 'Karfreitag' },
    { date: fmt(addDays(easter, 1)), title: 'Ostermontag' },
    { date: `${year}-05-01`, title: 'Tag der Arbeit' },
    { date: fmt(addDays(easter, 39)), title: 'Christi Himmelfahrt' },
    { date: fmt(addDays(easter, 50)), title: 'Pfingstmontag' },
    { date: fmt(addDays(easter, 60)), title: 'Fronleichnam' },
    { date: `${year}-10-03`, title: 'Tag der Deutschen Einheit' },
    { date: `${year}-11-01`, title: 'Allerheiligen' },
    { date: `${year}-12-25`, title: '1. Weihnachtstag' },
    { date: `${year}-12-26`, title: '2. Weihnachtstag' },
  ]
}
