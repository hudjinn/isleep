export const DAY_MS = 86_400_000
export const tz = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Fortaleza'
export const uuid = () => crypto.randomUUID()
export const isoNow = () => new Date().toISOString()
export const dateKey = (input: string | Date) => {
  const d = typeof input === 'string' ? new Date(input) : input
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const addDays = (date: string, days: number) => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate() + days); return dateKey(d) }
export const daysBetween = (start: string, end: string) => Math.floor((new Date(`${end}T12:00:00`).getTime() - new Date(`${start}T12:00:00`).getTime()) / DAY_MS)
export const monitoringDateFor = (iso: string) => { const d = new Date(iso); if (d.getHours() < 12) d.setDate(d.getDate() - 1); return dateKey(d) }
export const dateAtNoon = (date: string) => new Date(`${date}T12:00:00`)
export const minutesFromDiaryStart = (iso: string, date: string) => (new Date(iso).getTime() - dateAtNoon(date).getTime()) / 60000
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
export const formatTime = (iso?: string) => iso ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '—'
export const toLocalDateTimeInput = (iso?: string) => { if(!iso)return '';const d=new Date(iso);const pad=(n:number)=>String(n).padStart(2,'0');return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}` }
export const formatShortDate = (date: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(`${date}T12:00:00`))
export const weekday = (date: string) => new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(new Date(`${date}T12:00:00`)).replace('.', '')
export const durationMinutes = (start: string, end?: string) => end ? Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)) : 0
export const formatDuration = (minutes: number) => `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}min`
export const ageAt = (birthDate?: string, at = new Date()) => { if (!birthDate) return ''; const b = new Date(`${birthDate}T12:00:00`); let a = at.getFullYear() - b.getFullYear(); if (at < new Date(at.getFullYear(), b.getMonth(), b.getDate())) a--; return String(a) }
