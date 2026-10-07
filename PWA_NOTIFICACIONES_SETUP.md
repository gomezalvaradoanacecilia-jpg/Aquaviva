# Activación de PWA y notificaciones - Gestor Pro

1. Publica `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.svg` e `icon-512.svg` bajo HTTPS y en la misma carpeta/origen.
2. En Firebase Console > Project settings > Cloud Messaging > Web Push certificates, genera una clave VAPID. Copia la clave pública en `VAPID_PUBLIC_KEY` dentro de `index.html`.
3. Despliega las Cloud Functions de la carpeta `functions`. La función `dailyClientSummary` corre a las 21:00 en `America/Mexico_City` y no envía nada si no hubo clientes nuevos.
4. Copia la URL HTTPS desplegada de `installPromptGate` en `INSTALL_GATE_URL` dentro de `index.html`. Esa función aplica el máximo de 3 apariciones por IP usando un hash SHA-256; si no configuras la URL, el sistema limita a 3 por navegador mediante localStorage.
5. La colección `notificationTokens` contiene los tokens de los dispositivos y su preferencia (`all`, `window`, `pause-day`, `off`). No publiques ni escribas tokens desde clientes no autorizados en producción; agrega Authentication y reglas restrictivas antes de liberar el sistema.
6. Los clientes nuevos ahora guardan `createdAt`. Los registros históricos que no tengan ese campo no se contabilizan en el resumen diario.

Nota iOS: las notificaciones web push requieren una PWA añadida a la pantalla de inicio en versiones compatibles de iOS/iPadOS. El evento `beforeinstallprompt` no está disponible como en Chromium, por eso la interfaz indica usar Compartir > Añadir a pantalla de inicio cuando corresponda.
