import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DiaryPage } from './pages/DiaryPage'
import { HomePage } from './pages/HomePage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { useAppStore } from './store'

export default function App(){const ready=useAppStore(s=>s.ready),load=useAppStore(s=>s.load);useEffect(()=>{load()},[load]);if(!ready)return <div className="splash"><img src="/icon.svg"/><b>iSleep</b><span>Diário Inteligente do Sono</span></div>;return <Layout><Routes><Route path="/" element={<HomePage/>}/><Route path="/diario" element={<DiaryPage/>}/><Route path="/relatorios" element={<ReportsPage/>}/><Route path="/ajustes" element={<SettingsPage/>}/><Route path="*" element={<Navigate to="/"/>}/></Routes></Layout>}
