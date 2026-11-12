import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import { useAppStore } from './store'

describe('registro manual de sono', () => {
  beforeEach(async () => {
    await db.sessions.clear()
    useAppStore.setState({ sessions: [], toast: undefined })
  })

  it('salva os horários informados e atualiza o diário', async () => {
    const start = '2026-11-11T22:30:00.000Z'
    const end = '2026-11-12T06:45:00.000Z'

    await useAppStore.getState().addManualSession(start, end, 'night')

    const sessions = useAppStore.getState().sessions
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toMatchObject({ start, end, kind: 'night', origin: 'manual', reviewed: true })
    await expect(db.sessions.get(sessions[0].id)).resolves.toMatchObject({ start, end })
  })
})
