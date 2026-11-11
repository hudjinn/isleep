import { Download, FileText, Share2 } from 'lucide-react'
import { useState } from 'react'
import { DiaryGrid } from '../components/DiaryGrid'
import { QuestionnaireGrid } from '../components/QuestionnaireGrid'
import { exportMedicalDiary } from '../lib/pdf'
import { addDays, daysBetween, durationMinutes, formatDuration } from '../lib/time'
import { useAppStore } from '../store'

export function ReportsPage(){
  const {profile,sessions,events,questionnaires}=useAppStore()
  const [page,setPage]=useState(1)
  const [reportStart,setReportStart]=useState(profile?.monitoringStart||'')
  const [reportDays,setReportDays]=useState(Math.min(profile?.monitoringDays||14,14))
  if(!profile)return null
  const unlimited=profile.monitoringDays===0
  const remaining=unlimited?14:Math.max(1,profile.monitoringDays-Math.max(0,daysBetween(profile.monitoringStart,reportStart)))
  const safeDays=Math.min(reportDays,remaining,14)
  const reportProfile={...profile,monitoringStart:reportStart,monitoringDays:safeDays}
  const complete=sessions.filter(session=>session.end&&session.kind==='night')
  const average=complete.length?Math.round(complete.reduce((total,session)=>total+durationMinutes(session.start,session.end),0)/complete.length):0
  const data={profile:reportProfile,sessions,events,questionnaires}
  const changeStart=(value:string)=>{setReportStart(value);const available=unlimited?14:Math.max(1,profile.monitoringDays-Math.max(0,daysBetween(profile.monitoringStart,value)));setReportDays(current=>Math.min(current,available,14))}
  return <div className="page wide-page reports-page">
    <header className="page-title"><div><span>CONSULTA MÉDICA</span><h1>Exportar Diário Médico</h1><p>Selecione até 14 dias por documento para preservar o formato original.</p></div><FileText/></header>
    <section className="metrics"><div><span>Noites registradas</span><b>{complete.length}</b></div><div><span>Média de repouso</span><b>{average?formatDuration(average):'Sem dados'}</b></div><div><span>Acompanhamento</span><b>{unlimited?'Sem limite':`${profile.monitoringDays} dias`}</b></div></section>
    <section className="card report-range"><h2>Período do PDF</h2><div><label>Primeiro dia<input type="date" min={profile.monitoringStart} max={unlimited?undefined:addDays(profile.monitoringStart,profile.monitoringDays-1)} value={reportStart} onChange={event=>changeStart(event.target.value)}/></label><label>Quantidade de dias<input type="number" min="1" max={Math.min(14,remaining)} value={safeDays} onChange={event=>setReportDays(Math.max(1,Math.min(14,Number(event.target.value)||1)))}/></label></div><small>Para períodos maiores, gere outros PDFs escolhendo o próximo bloco de dias.</small></section>
    <section className="preview-toolbar"><div><button className={page===1?'active':''} onClick={()=>setPage(1)}>Página 1 · Diário</button><button className={page===2?'active':''} onClick={()=>setPage(2)}>Página 2 · Questionário</button></div><span>{reportStart} até {addDays(reportStart,safeDays-1)}</span></section>
    <div className="pdf-preview">{page===1?<DiaryGrid profile={reportProfile} sessions={sessions} events={events} compact startDate={reportStart} dayCount={safeDays}/>:<QuestionnaireGrid profile={reportProfile} sessions={sessions} events={events} questionnaires={questionnaires} compact startDate={reportStart} dayCount={safeDays}/>}</div>
    <div className="export-actions"><button className="primary" onClick={()=>exportMedicalDiary(data)}><Download/>Gerar e salvar PDF</button><button onClick={()=>exportMedicalDiary(data,'share')}><Share2/>Compartilhar</button></div>
    <p className="disclaimer">O iSleep organiza dados informados e medidos. Estimativas de relógios não substituem avaliação médica.</p>
  </div>
}
