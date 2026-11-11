import { jsPDF } from 'jspdf'
import type { DiarySnapshot } from '../types'
import { addDays, ageAt, clamp, formatShortDate, minutesFromDiaryStart, monitoringDateFor, weekday } from './time'
import { answerFor } from './questionnaire'

const C = { navy: '#243b80', blue: '#138bc1', pale: '#dfe6f4', grid: '#314a8d', rose: '#a95369', text: '#172035', white: '#ffffff' }
const eventCode: Record<string,string> = { caffeine:'C', alcohol:'A', 'sleep-medication':'S', medication:'M', exercise:'E', note:'•' }
const clean = (v?: string) => v || ''

export function createMedicalDiaryPdf(data: DiarySnapshot) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
  const { profile, sessions, events, questionnaires } = data
  const dates = [...Array(profile.monitoringDays)].map((_, i) => addDays(profile.monitoringStart, i))
  const W = 297, margin = 7
  doc.setProperties({ title: `Diário do Sono — ${profile.fullName || 'iSleep'}`, subject: 'Diário médico de 14 dias gerado pelo iSleep', author: 'iSleep' })

  // Página 1: Diário do Sono
  doc.setTextColor(C.navy); doc.setFont('helvetica','bold'); doc.setFontSize(20); doc.text('Diário do', margin, 14); doc.setTextColor(C.blue); doc.setFontSize(28); doc.text('sono', margin + 8, 24)
  const px = 67, py = 6, pw = W - px - margin
  doc.setFillColor('#e5e9ef'); doc.rect(px, py, pw, 10, 'F'); doc.rect(px, py + 10, pw, 10, 'F')
  doc.setTextColor(C.text); doc.setFontSize(6); doc.text('Nome', px+2, py+3); doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.text(clean(profile.fullName), px+2, py+8)
  const fields = [['Data da consulta', profile.consultationDate], ['Data de nascimento', profile.birthDate], ['Sexo', profile.sex], ['Idade', ageAt(profile.birthDate)]]
  fields.forEach(([label,value], i) => { const x=px+i*pw/4; doc.setDrawColor('#ffffff'); doc.rect(x,py+10,pw/4,10); doc.setFont('helvetica','bold'); doc.setFontSize(5.5); doc.text(label!,x+1.5,py+13); doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.text(clean(value),x+1.5,py+18) })
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.text('PREENCHA O DIÁRIO DO SONO DUAS SEMANAS ANTES DO RETORNO DA SUA CONSULTA E ENTREGUE PARA O SEU MÉDICO.', margin, 32)
  doc.setFont('helvetica','normal'); doc.setFontSize(5.5); doc.text('Use seta para baixo ao se deitar e seta para cima ao se levantar. As áreas azuis indicam sono e as brancas, períodos acordado. C = cafeína; S = medicamento para dormir; M = novo medicamento; A = álcool; E = exercício.', margin, 37, { maxWidth: W-margin*2 })

  const top=42, left=margin, dateW=15, weekW=17, obsW=42, timelineW=W-margin*2-dateW-weekW-obsW, cellW=timelineW/24, headH=14, rowH=(201-top-headH)/14
  doc.setDrawColor(C.grid); doc.setLineWidth(.25)
  const block=(x:number,w:number,label:string,color:string)=>{doc.setFillColor(color);doc.rect(x,top,w,7,'FD');doc.setTextColor(C.white);doc.setFont('helvetica','bold');doc.setFontSize(6);doc.text(label,x+w/2,top+4.6,{align:'center'})}
  block(left,dateW,'Dia e mês',C.navy); block(left+dateW,weekW,'Dia da semana',C.navy); const tx=left+dateW+weekW
  block(tx,cellW*6,'Tarde',C.blue); block(tx+cellW*6,cellW*6,'Noite',C.navy); block(tx+cellW*12,cellW*6,'Madrugada',C.navy); block(tx+cellW*18,cellW*6,'Manhã',C.blue); block(tx+timelineW,obsW,'Observações importantes',C.rose)
  ;[...Array(24)].forEach((_,i)=>{ const h=(i+12)%24; doc.setFillColor(i<6||i>=18?C.blue:C.navy);doc.rect(tx+i*cellW,top+7,cellW,7,'FD');doc.setTextColor(C.white);doc.setFontSize(5);doc.text(`${h===0?24:h}h`,tx+(i+.5)*cellW,top+11.6,{align:'center'}) })
  dates.forEach((date,r)=>{ const y=top+headH+r*rowH; if(r%2){doc.setFillColor(C.pale);doc.rect(left,y,W-margin*2,rowH,'F')} doc.setDrawColor(C.grid); doc.rect(left,y,dateW,rowH); doc.rect(left+dateW,y,weekW,rowH); doc.setTextColor(C.text); doc.setFont('helvetica','normal');doc.setFontSize(5.2);doc.text(formatShortDate(date),left+dateW/2,y+rowH*.65,{align:'center'});doc.text(weekday(date),left+dateW+weekW/2,y+rowH*.65,{align:'center'})
    for(let i=0;i<24;i++)doc.rect(tx+i*cellW,y,cellW,rowH); doc.rect(tx+timelineW,y,obsW,rowH)
    sessions.filter(s=>monitoringDateFor(s.start)===date).forEach(s=>{ const a=clamp(minutesFromDiaryStart(s.start,date),0,1440), b=clamp(minutesFromDiaryStart(s.end||new Date().toISOString(),date),0,1440); if(b>a){const x=tx+a/1440*timelineW,w=(b-a)/1440*timelineW;doc.setFillColor('#88a9e5');doc.rect(x,y+.5,w,rowH-1,'F');doc.setDrawColor(C.navy);doc.setLineWidth(.35);const downX=x+.8,upX=Math.min(tx+timelineW-.8,x+w-.8),mid=y+rowH*.52;doc.line(downX,y+1,downX,mid);doc.line(downX,mid,downX-.7,mid-.8);doc.line(downX,mid,downX+.7,mid-.8);doc.line(upX,y+rowH-1,upX,mid);doc.line(upX,mid,upX-.7,mid+.8);doc.line(upX,mid,upX+.7,mid+.8)} })
    events.filter(e=>monitoringDateFor(e.occurredAt)===date).forEach(e=>{const m=clamp(minutesFromDiaryStart(e.occurredAt,date),0,1439);doc.setTextColor(C.text);doc.setFont('helvetica','bold');doc.setFontSize(5);doc.text(eventCode[e.type],tx+m/1440*timelineW,y+rowH*.45,{align:'center'})})
    const notes=events.filter(e=>monitoringDateFor(e.occurredAt)===date&&e.notes).map(e=>e.notes!).join('; ');doc.setFont('helvetica','normal');doc.setFontSize(4);doc.text(notes,tx+timelineW+1,y+3,{maxWidth:obsW-2})
  })
  doc.setFontSize(4.5);doc.setTextColor('#58627a');doc.text('Gerado pelo iSleep. Dados de relógio são estimativas e não constituem diagnóstico clínico.',margin,205)

  // Página 2: questionário
  doc.addPage('a4','landscape'); doc.setTextColor(C.text);doc.setFont('helvetica','bold');doc.setFontSize(11);doc.text('PREENCHA O QUESTIONÁRIO ABAIXO À NOITE ANTES DE SE DEITAR PARA DORMIR',W/2,12,{align:'center'})
  const qLeft=7,qTop=18,labelW=94,qCell=(W-14-labelW)/14,qHead=20,qRow=(201-qTop-qHead)/10
  doc.setFillColor(C.navy);doc.setTextColor(C.white);doc.rect(qLeft+labelW,qTop,qCell*14,8,'F');doc.setFontSize(7);doc.text('Data e dia da semana',qLeft+labelW+qCell*7,qTop+5.3,{align:'center'})
  dates.forEach((d,i)=>{const x=qLeft+labelW+i*qCell;doc.setTextColor(C.text);doc.setFont('helvetica','bold');doc.setFontSize(4.5);doc.rect(x,qTop+8,qCell,12);doc.text(formatShortDate(d),x+qCell/2,qTop+13,{align:'center'});doc.text(weekday(d),x+qCell/2,qTop+17,{align:'center'})})
  const questions=['Como você se sentiu quando se levantou pela manhã?\n1 Bem acordado; 2 Desperto, mas cansado; 3 Sonolento','Você cochilou? Qual horário?','Se consumiu bebida com cafeína, quantas tomou?','Qual o último horário que tomou bebida com cafeína?','Se consumiu bebida alcoólica, quantas tomou?','Qual o último horário que consumiu bebida alcoólica?','Se praticou exercícios físicos (pelo menos 20 minutos), em qual horário?','Como você se sentiu durante o dia?\n1 Bem; 2 Cansado; 3 Sonolento; 4 Deprimido','Ficou irritado durante o dia?','Ficou estressado durante o dia?']
  questions.forEach((q,qi)=>{const y=qTop+qHead+qi*qRow;if(qi%2===0){doc.setFillColor(C.pale);doc.rect(qLeft,y,W-14,qRow,'F')}doc.setDrawColor(C.grid);doc.rect(qLeft,y,labelW,qRow);doc.setTextColor(C.text);doc.setFont('helvetica','normal');doc.setFontSize(5.2);doc.text(q,qLeft+2,y+qRow*.45,{maxWidth:labelW-4});dates.forEach((d,i)=>{const x=qLeft+labelW+i*qCell;doc.rect(x,y,qCell,qRow);const ans=String(answerFor(qi,d,questionnaires,events,sessions)||'');doc.setFont('helvetica','bold');doc.setFontSize(5.3);doc.text(ans,x+qCell/2,y+qRow*.58,{align:'center',maxWidth:qCell-1})})})
  return doc
}

export async function exportMedicalDiary(data: DiarySnapshot, action: 'download'|'share' = 'download') {
  const doc=createMedicalDiaryPdf(data); const blob=doc.output('blob'); const name=`iSleep-diario-${data.profile.monitoringStart}.pdf`; const file=new File([blob],name,{type:'application/pdf'})
  if(action==='share' && navigator.share && navigator.canShare?.({files:[file]})){await navigator.share({title:'Diário do Sono',text:'Meu diário médico gerado pelo iSleep',files:[file]});return}
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)
}
