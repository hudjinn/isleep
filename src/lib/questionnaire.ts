import type { DailyEvent, DailyQuestionnaire, SleepSession } from '../types'
import { formatTime, monitoringDateFor } from './time'

export function answerFor(index: number, date: string, questionnaires: DailyQuestionnaire[], events: DailyEvent[], sessions: SleepSession[]) {
  const questionnaire = questionnaires.find(item => item.date === date)
  const dayEvents = events.filter(event => monitoringDateFor(event.occurredAt) === date)
  const eventsOfType = (type: DailyEvent['type']) => dayEvents.filter(event => event.type === type)
  const naps = sessions.filter(session => session.kind === 'nap' && monitoringDateFor(session.start) === date)
  switch(index) {
    case 0: return questionnaire?.morningFeeling || ''
    case 1: return naps.map(nap => `${formatTime(nap.start)}–${formatTime(nap.end)}`).join(', ')
    case 2: return eventsOfType('caffeine').reduce((total, event) => total + (event.quantity || 1), 0) || ''
    case 3: return formatTime(eventsOfType('caffeine').at(-1)?.occurredAt)
    case 4: return eventsOfType('alcohol').reduce((total, event) => total + (event.quantity || 1), 0) || ''
    case 5: return formatTime(eventsOfType('alcohol').at(-1)?.occurredAt)
    case 6: return eventsOfType('exercise').filter(event => (event.durationMinutes || 0) >= 20).map(event => formatTime(event.occurredAt)).join(', ')
    case 7: return questionnaire?.dayFeeling || ''
    case 8: return questionnaire?.irritated === undefined ? '' : questionnaire.irritated ? 'Sim' : 'Não'
    case 9: return questionnaire?.stressed === undefined ? '' : questionnaire.stressed ? 'Sim' : 'Não'
    default: return ''
  }
}
