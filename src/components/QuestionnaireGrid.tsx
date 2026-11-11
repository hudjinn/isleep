import type { DailyEvent, DailyQuestionnaire, PatientProfile, SleepSession } from '../types'
import { addDays, formatShortDate, weekday } from '../lib/time'
import { answerFor } from '../lib/questionnaire'

const questions = [
  'Como você se sentiu quando se levantou pela manhã?\n1 Bem acordado; 2 Desperto, mas cansado; 3 Sonolento',
  'Você cochilou? Qual horário?', 'Se consumiu bebida com cafeína, quantas tomou?', 'Qual o último horário que tomou bebida com cafeína?',
  'Se consumiu bebida alcoólica, quantas tomou?', 'Qual o último horário que consumiu bebida alcoólica?', 'Se praticou exercícios físicos (pelo menos 20 minutos), em qual horário?',
  'Como você se sentiu durante o dia?\n1 Bem; 2 Cansado; 3 Sonolento; 4 Deprimido', 'Ficou irritado durante o dia?', 'Ficou estressado durante o dia?'
]

export function QuestionnaireGrid({ profile, sessions, events, questionnaires, compact = false }: { profile: PatientProfile; sessions: SleepSession[]; events: DailyEvent[]; questionnaires: DailyQuestionnaire[]; compact?: boolean }) {
  const dates = [...Array(profile.monitoringDays)].map((_, i) => addDays(profile.monitoringStart, i))
  return <div className={`paper questionnaire-paper ${compact ? 'compact' : ''}`}>
    <h2>PREENCHA O QUESTIONÁRIO ABAIXO À NOITE ANTES DE SE DEITAR PARA DORMIR</h2>
    <div className="question-table"><div className="q-empty"/><div className="q-title">Data e dia da semana</div><div className="q-empty"/>{dates.map(d => <div className="q-date" key={d}>{formatShortDate(d)}<small>{weekday(d)}</small></div>)}
      {questions.map((question, qi) => <div className={`q-row ${qi % 2 ? '' : 'stripe'}`} key={question}><div className="q-label">{question}</div>{dates.map(d => <div className="q-answer" key={d}>{answerFor(qi, d, questionnaires, events, sessions)}</div>)}</div>)}
    </div>
  </div>
}
