import { create } from 'zustand'
import { db } from './db'
import type { DailyEvent, DailyQuestionnaire, PatientProfile, SleepSession } from './types'
import { dateKey, isoNow, monitoringDateFor, tz, uuid } from './lib/time'

const stamp = () => ({ id: uuid(), createdAt: isoNow(), updatedAt: isoNow(), origin: 'manual' as const, timezone: tz() })
const defaultProfile = (): PatientProfile => ({ ...stamp(), fullName: '', monitoringStart: dateKey(new Date()), monitoringDays: 14 })

interface AppState {
  ready: boolean; profile?: PatientProfile; sessions: SleepSession[]; events: DailyEvent[]; questionnaires: DailyQuestionnaire[]; toast?: string; lastDeleted?: DailyEvent;
  load: () => Promise<void>; saveProfile: (profile: PatientProfile) => Promise<void>; startSleep: (kind?: 'night' | 'nap') => Promise<void>; endSleep: () => Promise<void>;
  updateSession: (id: string, patch: Partial<SleepSession>) => Promise<void>; deleteSession: (id: string) => Promise<void>; addEvent: (type: DailyEvent['type'], data?: Partial<DailyEvent>) => Promise<void>; undoEvent: () => Promise<void>; saveQuestionnaire: (date: string, patch: Partial<DailyQuestionnaire>) => Promise<void>; clearToast: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false, sessions: [], events: [], questionnaires: [],
  load: async () => {
    let profile = await db.profiles.toCollection().first()
    if (!profile) { profile = defaultProfile(); await db.profiles.add(profile) }
    set({ ready: true, profile, sessions: await db.sessions.toArray(), events: await db.events.toArray(), questionnaires: await db.questionnaires.toArray() })
  },
  saveProfile: async profile => { profile.updatedAt = isoNow(); await db.profiles.put(profile); set({ profile, toast: 'Perfil salvo' }) },
  startSleep: async (kind = 'night') => {
    if (get().sessions.some(s => !s.end)) { set({ toast: 'Já existe um repouso em andamento' }); return }
    const session: SleepSession = { ...stamp(), start: isoNow(), kind, reviewed: true }
    await db.sessions.add(session); set(s => ({ sessions: [...s.sessions, session], toast: kind === 'nap' ? 'Cochilo iniciado' : 'Horário de deitar registrado' }))
  },
  endSleep: async () => {
    const active = [...get().sessions].reverse().find(s => !s.end)
    if (!active) { set({ toast: 'Nenhum repouso em andamento' }); return }
    const updated = { ...active, end: isoNow(), gotOutOfBed: true, updatedAt: isoNow() }
    await db.sessions.put(updated); set(s => ({ sessions: s.sessions.map(x => x.id === active.id ? updated : x), toast: active.kind === 'nap' ? 'Cochilo encerrado' : 'Despertar registrado' }))
  },
  updateSession: async (id, patch) => { const current=get().sessions.find(s=>s.id===id);if(!current)return;const updated={...current,...patch,updatedAt:isoNow(),origin:'manual' as const,reviewed:true};await db.sessions.put(updated);set(s=>({sessions:s.sessions.map(x=>x.id===id?updated:x),toast:'Horários corrigidos'})) },
  deleteSession: async id => { await db.transaction('rw',db.sessions,db.stages,async()=>{await db.sessions.delete(id);await db.stages.where('sessionId').equals(id).delete()});set(s=>({sessions:s.sessions.filter(x=>x.id!==id),toast:'Período removido'})) },
  addEvent: async (type, data = {}) => {
    const labels = { caffeine: 'Cafeína', alcohol: 'Bebida alcoólica', 'sleep-medication': 'Medicamento para dormir', medication: 'Novo medicamento', exercise: 'Exercício físico', note: 'Observação' }
    const event: DailyEvent = { ...stamp(), type, occurredAt: isoNow(), title: labels[type], quantity: 1, ...data }
    await db.events.add(event); set(s => ({ events: [...s.events, event], toast: `${event.title} registrado agora`, lastDeleted: event }))
  },
  undoEvent: async () => { const event = get().lastDeleted; if (!event) return; await db.events.delete(event.id); set(s => ({ events: s.events.filter(x => x.id !== event.id), toast: 'Registro desfeito', lastDeleted: undefined })) },
  saveQuestionnaire: async (date, patch) => {
    const current = get().questionnaires.find(q => q.date === date)
    const next: DailyQuestionnaire = current ? { ...current, ...patch, updatedAt: isoNow() } : { ...stamp(), date, ...patch }
    await db.questionnaires.put(next); set(s => ({ questionnaires: current ? s.questionnaires.map(q => q.id === current.id ? next : q) : [...s.questionnaires, next], toast: 'Respostas salvas automaticamente' }))
  },
  clearToast: () => set({ toast: undefined })
}))

export const eventsForDate = (events: DailyEvent[], date: string) => events.filter(e => monitoringDateFor(e.occurredAt) === date)
