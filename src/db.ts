import Dexie, { type EntityTable } from 'dexie'
import type { AppSettings, DailyEvent, DailyQuestionnaire, PatientProfile, SleepSession, SleepStage } from './types'

export class ISleepDB extends Dexie {
  profiles!: EntityTable<PatientProfile, 'id'>
  sessions!: EntityTable<SleepSession, 'id'>
  stages!: EntityTable<SleepStage, 'id'>
  events!: EntityTable<DailyEvent, 'id'>
  questionnaires!: EntityTable<DailyQuestionnaire, 'id'>
  settings!: EntityTable<AppSettings, 'id'>
  constructor() {
    super('isleep')
    this.version(1).stores({ profiles: 'id, monitoringStart', sessions: 'id, start, end, kind, externalId', events: 'id, occurredAt, type', questionnaires: 'id, date', settings: 'id' })
    this.version(2).stores({ profiles: 'id, monitoringStart', sessions: 'id, start, end, kind, externalId', stages: 'id, sessionId, start, stage, externalId', events: 'id, occurredAt, type', questionnaires: 'id, date', settings: 'id' })
  }
}
export const db = new ISleepDB()
