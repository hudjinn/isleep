import { Activity, Beer, Coffee, Dumbbell, FileText, HeartPulse, Moon, Pill, Plus, Sun, Watch } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { durationMinutes, formatDuration } from '../lib/time'
import { useAppStore } from '../store'

export function HomePage() {
  const { profile, sessions, startSleep, endSleep, addEvent } = useAppStore()
  const [now, setNow] = useState(() => new Date()); const active = [...sessions].reverse().find(s => !s.end)
  const elapsedDay = profile ? Math.max(1, Math.floor((now.getTime() - new Date(`${profile.monitoringStart}T12:00:00`).getTime()) / 86400000) + 1) : 1
  const unlimited = profile?.monitoringDays === 0
  const day = profile && !unlimited ? Math.min(profile.monitoringDays, elapsedDay) : elapsedDay
  const progress = profile && !unlimited ? Math.round(day / profile.monitoringDays * 100) : 0
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer) }, [])
  return <div className="page home-page">
    <header className="home-header"><div><p>{new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'short'}).format(now).toUpperCase()}</p><h1>Meu sono</h1></div><div className="moon-badge"><Moon/></div></header>
    <section className="card progress-card"><div><span>Diário de acompanhamento</span><Link to="/diario">Ver diário</Link></div><div><b>Dia {day}{unlimited?' · sem limite':` de ${profile?.monitoringDays || 14}`}</b>{!unlimited&&<strong>{progress}%</strong>}</div>{!unlimited&&<div className="progress"><i style={{width:`${progress}%`}}/></div>}</section>
    {active && <div className="active-sleep"><Moon/><span>Repouso em andamento</span><b>{formatDuration(durationMinutes(active.start, new Date().toISOString()))}</b></div>}
    <section className="primary-actions"><button onClick={() => startSleep('night')} disabled={!!active}><Moon/><b>Vou dormir</b><small>Registrar agora</small></button><button onClick={endSleep} disabled={!active}><Sun/><b>Acordei</b><small>Registrar agora</small></button></section>
    <h2>Registro rápido</h2>
    <section className="quick-grid"><button onClick={() => addEvent('caffeine')}><Coffee/>Cafeína</button><button onClick={() => addEvent('sleep-medication')}><Pill/>Remédio</button><button onClick={() => addEvent('exercise', { durationMinutes: 20 })}><Dumbbell/>Exercício</button><button onClick={() => addEvent('alcohol')}><Beer/>Álcool</button><button onClick={() => startSleep('nap')}><Moon/>Cochilo</button><button onClick={() => addEvent('note')}><Plus/>Observação</button></section>
    <Link to="/relatorios" className="export-cta"><FileText/><span><b>Exportar Diário Médico</b><small>PDF fiel ao formulário, em duas páginas</small></span><strong>›</strong></Link>
    <section className="card connect-card"><div><HeartPulse/><b>Health Connect</b><span className="tag">Android</span></div><p>Galaxy Fit3 → Samsung Health → Health Connect → iSleep</p><Link to="/ajustes"><Watch/>Como configurar a sincronização</Link></section>
    <section className="privacy-note"><Activity/> Seus dados ficam somente neste dispositivo.</section>
  </div>
}
