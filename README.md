# iSleep — Diário Inteligente do Sono

PWA offline-first para acompanhar o sono por um período configurável, registrar eventos em poucos toques e exportar as duas folhas do diário médico em PDF A4 horizontal.

## O que já está implementado

- Registro imediato de “Vou dormir”, “Acordei”, cochilo, cafeína, álcool, medicamento, exercício e observação.
- Persistência local em IndexedDB/Dexie e funcionamento PWA offline.
- Questionário diário com salvamento automático e autopreenchimento por eventos.
- Diário visual de 12h às 11h do dia seguinte, com posicionamento proporcional por minuto.
- PDF vetorial em duas páginas, pré-visualização, download e compartilhamento.
- Perfil do paciente, backup JSON e interface responsiva em português brasileiro.
- Período de acompanhamento configurável ou sem limite.
- CI para testes, build web e publicação no GitHub Pages.

## Desenvolvimento

Requer Node.js 22.13+. O arquivo `.nvmrc` seleciona a versão correta quando o NVM está instalado.

```bash
npm install
npm run dev
npm test
npm run build
```

Node 18 e o npm 9.2 distribuído por algumas versões do Ubuntu não são compatíveis com a toolchain atual. Confirme com `node --version` antes da instalação.

## Instalação como aplicativo

Depois de publicar no GitHub Pages, abra o endereço no celular. No Chrome, use **Adicionar à tela inicial** ou **Instalar app**. O iSleep funciona offline após o primeiro carregamento.

Os horários de dormir, acordar, cochilos e demais eventos são registrados manualmente no próprio PWA.

## Privacidade e limitações

Os dados ficam no dispositivo; não há conta, backend, anúncios ou analytics. Limpar os dados do navegador ou desinstalar o PWA pode apagar os registros, portanto exporte backups periodicamente.

O aplicativo é um diário pessoal e não constitui diagnóstico clínico. Nunca versione backups ou dados médicos no repositório.
