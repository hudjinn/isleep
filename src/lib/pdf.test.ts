import { describe, expect, it } from 'vitest'
import { createMedicalDiaryPdf } from './pdf'
import { answerFor } from './questionnaire'
import type { DiarySnapshot } from '../types'

const data:DiarySnapshot={profile:{id:'p',createdAt:'x',updatedAt:'x',origin:'manual',timezone:'America/Fortaleza',fullName:'Maria da Silva',birthDate:'1990-01-01',consultationDate:'2026-11-25',monitoringStart:'2026-11-01',monitoringDays:14},sessions:[{id:'s',createdAt:'x',updatedAt:'x',origin:'manual',timezone:'America/Fortaleza',start:'2026-11-01T22:30:00-03:00',end:'2026-11-02T06:30:00-03:00',kind:'night',reviewed:true}],events:[{id:'e',createdAt:'x',updatedAt:'x',origin:'manual',timezone:'America/Fortaleza',type:'caffeine',occurredAt:'2026-11-01T15:00:00-03:00',title:'Cafeína',quantity:1}],questionnaires:[]}
describe('PDF médico',()=>it('gera exatamente duas páginas A4 paisagem com dados armazenados',()=>{expect(answerFor(2,'2026-11-01',data.questionnaires,data.events,data.sessions)).toBe(1);const pdf=createMedicalDiaryPdf(data);expect(pdf.getNumberOfPages()).toBe(2);expect(pdf.output('arraybuffer').byteLength).toBeGreaterThan(5000)}))
