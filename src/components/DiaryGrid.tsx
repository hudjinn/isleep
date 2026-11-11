import type { DailyEvent, PatientProfile, SleepSession } from '../types'
import type { CSSProperties } from 'react'
import { addDays, clamp, formatShortDate, minutesFromDiaryStart, monitoringDateFor, weekday } from '../lib/time'

const hours = [...Array(24)].map((_, i) => (i + 12) % 24)
const marker: Record<DailyEvent['type'], string> = { caffeine: 'C', alcohol: 'A', 'sleep-medication': 'S', medication: 'M', exercise: 'E', note: '•' }

export function DiaryGrid({ profile, sessions, events, compact = false, startDate = profile.monitoringStart, dayCount = Math.min(profile.monitoringDays || 14, 14) }: { profile: PatientProfile; sessions: SleepSession[]; events: DailyEvent[]; compact?: boolean; startDate?: string; dayCount?: number }) {
  const dates = [...Array(dayCount)].map((_, i) => addDays(startDate, i))
  return <div className={`paper diary-paper ${compact ? 'compact' : ''}`}>
    <section className="paper-heading">
      <div className="diary-logo">Diário do <strong>sono</strong></div>
      <div className="patient-strip"><span><b>Nome</b>{profile.fullName || ' '}</span><span><b>Data da consulta</b>{profile.consultationDate || ' '}</span><span><b>Data de nascimento</b>{profile.birthDate || ' '}</span><span><b>Sexo</b>{profile.sex || ' '}</span></div>
    </section>
    <div className="instructions"><b>PREENCHA O DIÁRIO DO SONO DUAS SEMANAS ANTES DO RETORNO DA SUA CONSULTA E ENTREGUE PARA O SEU MÉDICO.</b><br/>Use <strong>↓</strong> ao se deitar e <strong>↑</strong> ao se levantar. Os horários dormidos são preenchidos em azul; períodos acordado permanecem em branco. C = cafeína, S = medicamento para dormir, M = novo medicamento, A = álcool e E = exercício.</div>
    <div className="timeline-grid" style={{ '--rows': dates.length } as CSSProperties}>
      <div className="th date-col row-span-2">Dia e mês</div><div className="th week-col row-span-2">Dia da semana</div>
      <div className="th period afternoon">Tarde</div><div className="th period night">Noite</div><div className="th period dawn">Madrugada</div><div className="th period morning">Manhã</div><div className="th notes-col row-span-2">Observações importantes</div>
      <div className="hour-heads">{hours.map(h => <span key={h}>{h === 0 ? 24 : h}h</span>)}</div>
      {dates.map((date, row) => {
        const daySessions = sessions.filter(s => monitoringDateFor(s.start) === date || (!!s.end && monitoringDateFor(s.end) === date))
        const dayEvents = events.filter(e => monitoringDateFor(e.occurredAt) === date)
        return <div className={`diary-row ${row % 2 ? 'stripe' : ''}`} key={date}>
          <span className="date-cell">{formatShortDate(date)}</span><span className="week-cell">{weekday(date)}</span>
          <div className="time-cell">
            {daySessions.map(s => { const left = clamp(minutesFromDiaryStart(s.start, date), 0, 1440); const right = clamp(minutesFromDiaryStart(s.end || new Date().toISOString(), date), 0, 1440); if (right <= left) return null; return <span className="sleep-block" key={s.id} style={{ left: `${left / 14.4}%`, width: `${(right-left)/14.4}%` }}><i>↓</i><em>↑</em></span> })}
            {dayEvents.map(e => { const pos = clamp(minutesFromDiaryStart(e.occurredAt, date), 0, 1439); return <b className="event-marker" key={e.id} style={{ left: `${pos/14.4}%` }} title={`${e.title}`}>{marker[e.type]}</b> })}
          </div>
          <span className="notes-cell">{dayEvents.filter(e => e.notes).map(e => e.notes).join('; ')}</span>
        </div>
      })}
    </div>
  </div>
}
