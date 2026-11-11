import { BarChart3, CalendarDays, Home, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import { useAppStore } from '../store'

export function Layout({ children }: PropsWithChildren) {
  const toast = useAppStore(s => s.toast)
  const undo = useAppStore(s => s.undoEvent)
  const lastDeleted = useAppStore(s => s.lastDeleted)
  return <div className="app-shell">
    <main>{children}</main>
    <nav className="bottom-nav" aria-label="Navegação principal">
      <NavLink to="/"><Home/><span>Início</span></NavLink>
      <NavLink to="/diario"><CalendarDays/><span>Diário</span></NavLink>
      <NavLink to="/relatorios"><BarChart3/><span>Relatórios</span></NavLink>
      <NavLink to="/ajustes"><Settings/><span>Ajustes</span></NavLink>
    </nav>
    {toast && <div className="toast" role="status"><span>{toast}</span>{lastDeleted && <button onClick={undo}>Desfazer</button>}</div>}
  </div>
}
