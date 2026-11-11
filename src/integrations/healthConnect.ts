import { Capacitor, registerPlugin } from '@capacitor/core'
import { db } from '../db'
import type { SleepSession, SleepStage } from '../types'
import { isoNow, tz, uuid } from '../lib/time'

export interface NativeSleepSession { externalId: string; start: string; end: string; sourceName: string; title?: string; stages: { start: string; end: string; type: number }[] }
interface HealthConnectPlugin { checkAvailability(): Promise<{ status: 'available'|'update-required'|'unavailable' }>; requestPermissions(): Promise<{ granted: boolean }>; readSleepSessions(options: { days: number }): Promise<{ sessions: NativeSleepSession[] }> }
const native = registerPlugin<HealthConnectPlugin>('ISleepHealthConnect')

export const isNativeAndroid = () => Capacitor.getPlatform() === 'android'
export async function healthConnectStatus(){ if(!isNativeAndroid()) return {status:'unavailable' as const}; return native.checkAvailability() }
export async function requestHealthPermissions(){ if(!isNativeAndroid()) return false; return (await native.requestPermissions()).granted }
export async function syncHealthConnect(days=14){
  if(!isNativeAndroid()) throw new Error('A importação do Health Connect requer o aplicativo Android.')
  const result=await native.readSleepSessions({days}); const existing=await db.sessions.toArray(); let imported=0
  for(const item of result.sessions){
    const duplicate=existing.find(s=>s.externalId===item.externalId || (Math.abs(new Date(s.start).getTime()-new Date(item.start).getTime())<60_000 && s.end && Math.abs(new Date(s.end).getTime()-new Date(item.end).getTime())<60_000))
    if(duplicate) continue
    const now=isoNow(); const record:SleepSession={id:uuid(),createdAt:now,updatedAt:now,origin:'health-connect',timezone:tz(),externalId:item.externalId,start:item.start,end:item.end,kind:'night',sourceName:item.sourceName,reviewed:false}
    await db.transaction('rw',db.sessions,db.stages,async()=>{await db.sessions.add(record);for(const [index,stage] of item.stages.entries()){const names:Record<number,SleepStage['stage']>={1:'awake',2:'sleeping',3:'awake',4:'light',5:'deep',6:'rem',7:'awake'};const stageRecord:SleepStage={id:uuid(),createdAt:now,updatedAt:now,origin:'health-connect',timezone:tz(),externalId:`${item.externalId}:${index}`,sessionId:record.id,start:stage.start,end:stage.end,stage:names[stage.type]||'unknown'};await db.stages.add(stageRecord)}}); imported++
  }
  return {imported,total:result.sessions.length}
}
