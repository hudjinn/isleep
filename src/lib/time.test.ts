import { describe, expect, it } from 'vitest'
import { daysBetween, durationMinutes, minutesFromDiaryStart, monitoringDateFor } from './time'

describe('cálculos do diário',()=>{
  it('associa madrugada ao dia iniciado ao meio-dia anterior',()=>expect(monitoringDateFor('2026-11-12T02:30:00')).toBe('2026-11-11'))
  it('calcula sessão que atravessa a meia-noite',()=>expect(durationMinutes('2026-11-11T22:45:00-03:00','2026-11-12T06:15:00-03:00')).toBe(450))
  it('posiciona horários proporcionalmente a partir das 12h',()=>{expect(minutesFromDiaryStart('2026-11-11T18:00:00','2026-11-11')).toBe(360);expect(minutesFromDiaryStart('2026-11-12T06:00:00','2026-11-11')).toBe(1080)})
  it('calcula a posição em acompanhamentos longos',()=>expect(daysBetween('2026-11-01','2026-12-01')).toBe(30))
})
