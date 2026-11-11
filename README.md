# iSleep — Diário Inteligente do Sono

Aplicativo offline-first para acompanhar 14 dias de sono, registrar eventos em poucos toques e exportar as duas folhas do diário médico em PDF A4 horizontal.

## O que já está implementado

- Registro imediato de “Vou dormir”, “Acordei”, cochilo, cafeína, álcool, medicamento, exercício e observação.
- Persistência local em IndexedDB/Dexie e funcionamento PWA offline.
- Questionário diário com salvamento automático e autopreenchimento por eventos.
- Diário visual de 12h às 11h do dia seguinte, com posicionamento proporcional por minuto.
- PDF vetorial em duas páginas, pré-visualização, download e compartilhamento.
- Perfil do paciente, backup JSON e interface responsiva em português brasileiro.
- Plugin Kotlin do Health Connect para `SleepSessionRecord`, com permissão explícita, origem e deduplicação.
- CI para testes/build web, APK Android debug e GitHub Pages.

## Desenvolvimento

Requer Node.js 22.13+ e Java 17. O arquivo `.nvmrc` seleciona a versão correta quando o NVM está instalado.

```bash
npm install
npm run dev
npm test
npm run build
```

Node 18 e o npm 9.2 distribuído por algumas versões do Ubuntu não são compatíveis com a toolchain atual. Confirme com `node --version` antes da instalação.

## Android e Galaxy Fit3

O fluxo suportado é **Galaxy Fit3 → Samsung Health → Health Connect → iSleep**. Não há acesso Bluetooth direto ou API privada da Samsung.

```bash
npm install
npm run build
npx cap sync android
cd android
gradle assembleDebug
```

O APK fica em `android/app/build/outputs/apk/debug/app-debug.apk`. No GitHub, execute o workflow **Build iSleep** e baixe o artefato `isleep-apk-debug`.

No celular, habilite o compartilhamento de sono no Samsung Health com o Health Connect. Depois, em **Ajustes → Galaxy Fit3**, conceda a permissão e sincronize. Sessões importadas entram como pendentes de revisão e nunca sobrescrevem registros manuais.

## Privacidade e limitações

Os dados ficam no dispositivo; não há conta, backend, anúncios ou analytics. A PWA não acessa o Health Connect — essa integração exige o APK Android. Dados da Galaxy Fit3 dependem do que o Samsung Health efetivamente disponibiliza ao Health Connect e não constituem diagnóstico clínico.

Para publicação na Play Store, declare os tipos de dados de saúde utilizados, forneça uma política de privacidade pública e configure assinatura de release por segredos do repositório. Nunca versione certificados ou dados médicos.
