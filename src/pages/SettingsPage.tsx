import { Database, Moon, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { db } from '../db'
import { ageAt } from '../lib/time'
import { useAppStore } from '../store'

export function SettingsPage() {
  const { profile, saveProfile } = useAppStore()
  const [lastFixedDays, setLastFixedDays] = useState(profile?.monitoringDays || 14)

  if (!profile) return null

  const change = (key: string, value: string | number) => saveProfile({ ...profile, [key]: value })
  const backup = async () => {
    const data = {
      profile,
      sessions: await db.sessions.toArray(),
      stages: await db.stages.toArray(),
      events: await db.events.toArray(),
      questionnaires: await db.questionnaires.toArray(),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'isleep-backup.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return <div className="page settings-page">
    <header className="page-title"><div><span>PRIVACIDADE PRIMEIRO</span><h1>Ajustes</h1></div><Moon /></header>
    <section className="card form-card">
      <h2>Perfil do paciente</h2>
      <label>Nome completo<input value={profile.fullName} onChange={event => change('fullName', event.target.value)} placeholder="Seu nome" /></label>
      <div className="form-row">
        <label>Data de nascimento<input type="date" value={profile.birthDate || ''} onChange={event => change('birthDate', event.target.value)} /><small>{ageAt(profile.birthDate) ? `${ageAt(profile.birthDate)} anos` : ''}</small></label>
        <label>Sexo (opcional)<select value={profile.sex || ''} onChange={event => change('sex', event.target.value)}><option value="">Não informar</option><option>Feminino</option><option>Masculino</option><option>Outro</option></select></label>
      </div>
      <div className="form-row">
        <label>Data da consulta<input type="date" value={profile.consultationDate || ''} onChange={event => change('consultationDate', event.target.value)} /></label>
        <label>Retorno previsto<input type="date" value={profile.returnDate || ''} onChange={event => change('returnDate', event.target.value)} /></label>
      </div>
      <label>Início do acompanhamento<input type="date" value={profile.monitoringStart} onChange={event => change('monitoringStart', event.target.value)} /></label>
      <div className="duration-config">
        <span>Duração do acompanhamento</span>
        <div className="duration-modes">
          <button className={profile.monitoringDays > 0 ? 'active' : ''} onClick={() => change('monitoringDays', lastFixedDays)}>Definir período</button>
          <button className={profile.monitoringDays === 0 ? 'active' : ''} onClick={() => change('monitoringDays', 0)}>Sem limite</button>
        </div>
        {profile.monitoringDays > 0 && <label>Quantidade de dias<input type="number" min="1" value={profile.monitoringDays} onChange={event => { const days = Math.max(1, Number(event.target.value) || 1); setLastFixedDays(days); change('monitoringDays', days) }} /><small>Você pode escolher qualquer quantidade de dias.</small></label>}
        {profile.monitoringDays === 0 && <p>O diário continuará contando os dias sem uma data final.</p>}
      </div>
    </section>
    <section className="card data-card"><div><Database /><span><b>Backup dos dados</b><small>JSON completo, salvo no dispositivo</small></span></div><button onClick={backup}>Exportar backup</button></section>
    <section className="card privacy-card"><ShieldCheck /><div><b>Seus dados são privados</b><p>O iSleep não usa conta, anúncios ou analytics. Os registros manuais permanecem neste dispositivo e só saem dele quando você exporta um PDF ou backup.</p></div></section>
  </div>
}
