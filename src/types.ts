export type Origin = 'manual' | 'system' | 'health-connect'
export type EventType = 'caffeine' | 'alcohol' | 'sleep-medication' | 'medication' | 'exercise' | 'note'

export interface BaseRecord { id: string; createdAt: string; updatedAt: string; origin: Origin; timezone: string; externalId?: string }
export interface PatientProfile extends BaseRecord { fullName: string; birthDate?: string; sex?: string; consultationDate?: string; returnDate?: string; monitoringStart: string; monitoringDays: number }
export interface SleepSession extends BaseRecord { start: string; end?: string; sleepOnsetMinutes?: number; kind: 'night' | 'nap'; gotOutOfBed?: boolean; notes?: string; sourceName?: string; reviewed: boolean }
export interface SleepStage extends BaseRecord { sessionId: string; start: string; end: string; stage: 'awake' | 'light' | 'deep' | 'rem' | 'sleeping' | 'unknown' }
export interface DailyEvent extends BaseRecord { type: EventType; occurredAt: string; title: string; quantity?: number; unit?: string; durationMinutes?: number; notes?: string }
export interface DailyQuestionnaire extends BaseRecord { date: string; morningFeeling?: 1 | 2 | 3; dayFeeling?: 1 | 2 | 3 | 4; irritated?: boolean; stressed?: boolean; notes?: string }
export interface AppSettings { id: 'settings'; theme: 'dark' | 'light'; reminders: boolean; lastSyncAt?: string; healthConnectAvailable?: boolean }
export interface DiarySnapshot { profile: PatientProfile; sessions: SleepSession[]; events: DailyEvent[]; questionnaires: DailyQuestionnaire[] }
