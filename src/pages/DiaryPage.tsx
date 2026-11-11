import { useState } from 'react'
import { DiaryGrid } from '../components/DiaryGrid'
import { QuestionnaireGrid } from '../components/QuestionnaireGrid'
import { addDays, dateKey, monitoringDateFor, toLocalDateTimeInput } from '../lib/time'
import { useAppStore } from '../store'

export function DiaryPage(){
  const {profile,sessions,events,questionnaires,saveQuestionnaire,updateSession,deleteSession}=useAppStore()
  const [tab,setTab]=useState<'timeline'|'questions'>('timeline')
  const [selected,setSelected]=useState(profile?.monitoringStart||dateKey(new Date()))
  if(!profile)return null
  const q=questionnaires.find(x=>x.date===selected)
  const selectedSessions=sessions.filter(s=>monitoringDateFor(s.start)===selected)
  return <div className="page wide-page">
    <header className="page-title"><div><span>ACOMPANHAMENTO DE 14 DIAS</span><h1>Diário do sono</h1></div><input type="date" min={profile.monitoringStart} max={addDays(profile.monitoringStart,13)} value={selected} onChange={e=>setSelected(e.target.value)}/></header>
    <div className="tabs"><button className={tab==='timeline'?'active':''} onClick={()=>setTab('timeline')}>Linha do tempo</button><button className={tab==='questions'?'active':''} onClick={()=>setTab('questions')}>Questionário diário</button></div>
    {tab==='timeline'?<>
      <section className="session-editor card"><div><h2>Períodos deste dia</h2><span>Corrija horários ou revise dados importados</span></div>
        {selectedSessions.map(s=><div className="session-row" key={s.id}><span className={`source ${s.origin}`}>{s.origin==='health-connect'?'Health Connect':'Manual'}</span><label>Início<input type="datetime-local" value={toLocalDateTimeInput(s.start)} onChange={e=>updateSession(s.id,{start:new Date(e.target.value).toISOString()})}/></label><label>Fim<input type="datetime-local" value={toLocalDateTimeInput(s.end)} onChange={e=>updateSession(s.id,{end:e.target.value?new Date(e.target.value).toISOString():undefined})}/></label><button onClick={()=>deleteSession(s.id)}>Remover</button></div>)}
        {!selectedSessions.length&&<p>Nenhum período registrado neste dia.</p>}
      </section>
      <div className="paper-scroll"><DiaryGrid profile={profile} sessions={sessions} events={events}/></div>
    </>:<>
      <section className="question-form card"><h2>Respostas de {new Intl.DateTimeFormat('pt-BR',{dateStyle:'long'}).format(new Date(`${selected}T12:00:00`))}</h2>
        <label>Como você se sentiu ao levantar?<select value={q?.morningFeeling||''} onChange={e=>saveQuestionnaire(selected,{morningFeeling:Number(e.target.value) as 1|2|3})}><option value="">Selecione</option><option value="1">1 — Bem acordado</option><option value="2">2 — Desperto, mas cansado</option><option value="3">3 — Sonolento</option></select></label>
        <label>Como você se sentiu durante o dia?<select value={q?.dayFeeling||''} onChange={e=>saveQuestionnaire(selected,{dayFeeling:Number(e.target.value) as 1|2|3|4})}><option value="">Selecione</option><option value="1">1 — Bem</option><option value="2">2 — Cansado</option><option value="3">3 — Sonolento</option><option value="4">4 — Deprimido</option></select></label>
        <div className="binary"><span>Ficou irritado?</span><button className={q?.irritated===false?'active':''} onClick={()=>saveQuestionnaire(selected,{irritated:false})}>Não</button><button className={q?.irritated===true?'active':''} onClick={()=>saveQuestionnaire(selected,{irritated:true})}>Sim</button></div>
        <div className="binary"><span>Ficou estressado?</span><button className={q?.stressed===false?'active':''} onClick={()=>saveQuestionnaire(selected,{stressed:false})}>Não</button><button className={q?.stressed===true?'active':''} onClick={()=>saveQuestionnaire(selected,{stressed:true})}>Sim</button></div>
        <label>Observações<textarea value={q?.notes||''} onChange={e=>saveQuestionnaire(selected,{notes:e.target.value})}/></label>
      </section>
      <div className="paper-scroll"><QuestionnaireGrid profile={profile} sessions={sessions} events={events} questionnaires={questionnaires}/></div>
    </>}
  </div>
}
