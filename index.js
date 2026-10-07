const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Función programada: Se ejecuta todos los días a las 8:30 p.m. (20:30)
 * Zona horaria: America/Mexico_City
 * Revisa si hubo registros de personas/clientes en el día.
 * - Si count === 0: NO envía nada (regla estricta solicitada).
 * - Si count > 0: envía notificación push a todos los dispositivos registrados en 'fcm_tokens'.
 */
exports.resumenDiario830 = onSchedule(
  {
    schedule: '30 20 * * *',
    timeZone: 'America/Mexico_City',
    region: 'us-central1'
  },
  async (event) => {
    console.log('Iniciando verificación de resumen diario a las 8:30 p.m.');

    const now = new Date();
    // Obtener la fecha local en formato YYYY-MM-DD
    const localDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City'
    }).format(now);

    console.log(`Fecha local en México: ${localDateStr}`);

    // Consultar clientes registrados
    const clientsSnap = await db.collection('clients').get();
    const todayClients = [];

    clientsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.createdAt) {
        const clientDate = new Date(data.createdAt);
        const clientDateStr = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Mexico_City'
        }).format(clientDate);

        if (clientDateStr === localDateStr) {
          todayClients.push({ id: doc.id, ...data });
        }
      }
    });

    const count = todayClients.length;
    console.log(`Cantidad de personas registradas hoy: ${count}`);

    // Si en ese día no hay registros, NO enviar nada
    if (count === 0) {
      console.log('Hoy no hubo registros de personas. Finalizando sin enviar notificación.');
      return null;
    }

    // Obtener tokens de dispositivos en la colección fcm_tokens
    const tokensSnap = await db.collection('fcm_tokens').get();
    if (tokensSnap.empty) {
      console.log('Hay registros, pero no hay dispositivos con token FCM suscritos.');
      return null;
    }

    const tokens = [];
    tokensSnap.forEach((doc) => {
      const data = doc.data();
      if (data.token) {
        tokens.push(data.token);
      }
    });

    if (tokens.length === 0) {
      console.log('No se encontraron tokens válidos.');
      return null;
    }

    const names = todayClients.slice(0, 3).map((c) => c.name || 'Cliente').join(', ');
    const extra = count > 3 ? ` y ${count - 3} más` : '';
    const bodyText = `Hoy se registraron ${count} persona(s)/cliente(s): ${names}${extra}.`;

    const message = {
      notification: {
        title: 'Gestor Pro · Resumen del día (8:30 p.m.)',
        body: bodyText
      },
      data: {
        type: 'daily_summary',
        date: localDateStr,
        count: String(count)
      },
      tokens: tokens
    };

    console.log(`Enviando notificación push a ${tokens.length} dispositivo(s)...`);
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Resultado: ${response.successCount} exitosas, ${response.failureCount} fallidas.`);

    // Eliminar tokens inválidos
    if (response.failureCount > 0) {
      const batch = db.batch();
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const failedToken = tokens[idx];
          console.log(`Eliminando token inválido: ${failedToken}`);
          batch.delete(db.collection('fcm_tokens').doc(failedToken));
        }
      });
      await batch.commit();
    }

    return null;
  }
);
