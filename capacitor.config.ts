import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.com.isleep.app', appName: 'iSleep', webDir: 'dist',
  server: { androidScheme: 'https' }, plugins: { SplashScreen: { launchAutoHide: true, backgroundColor: '#08111f' } }
}
export default config
