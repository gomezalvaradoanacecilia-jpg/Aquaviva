# Guía de Activación: Notificaciones Push, VAPID y Cloud Functions (Gestor Pro)
**Proyecto Firebase:** `aquaviva-crm-rpm`

---

## 1. Obtener la Clave Pública VAPID en Firebase Console

1. Abre [Firebase Console](https://console.firebase.google.com/) e ingresa a tu proyecto **`aquaviva-crm-rpm`**.
2. Haz clic en el ícono de engranaje ⚙️ junto a *Descripción general del proyecto* y selecciona **Configuración del proyecto** (Project settings).
3. Ve a la pestaña **Cloud Messaging**.
4. Desplázate hacia abajo hasta la sección **Configuración web** (Web configuration) / **Certificados push web** (Web Push certificates).
5. Si no aparece ninguna clave, haz clic en el botón **Generar par de claves** (Generate key pair).
6. Copia la cadena generada bajo **Clave de clave** (comienza usualmente con `B...`). Esa es tu **Clave Pública VAPID**.

---

## 2. Activar las Notificaciones Push en el Sistema

1. Abre tu archivo `index.html` en tu navegador o dispositivo.
2. Ve al menú lateral y entra a **Configuración**.
3. En la sección **Firebase Cloud Messaging**, pega tu Clave Pública VAPID en el campo correspondiente.
4. Pulsa el botón **Guardar VAPID y Registrar Dispositivo**.
5. Tu navegador solicitará permiso: pulsa **Permitir**.
6. El token único de tu dispositivo se guardará automáticamente en tu base de datos Firestore dentro de la colección `/fcm_tokens/{token}`.

---

## 3. Modalidades de Notificaciones Disponibles (Sección Configuración)

En la sección de **Configuración**, puedes cambiar entre 4 modalidades en cualquier momento:

- **Encendido todo (`all`):** Notificaciones push al dispositivo y ventanas dentro del sistema.
- **Formato ventana (`window`):** Muestra alertas únicamente dentro de la aplicación sin emitir push nativo.
- **Suspender a solo una al día (`once_daily`):** Limita las alertas a un máximo de 1 notificación por día natural.
- **Apagar notificaciones (`off`):** Silencia completamente todas las alertas del sistema.

---

## 4. Alerta de las 8:30 p.m. (Resumen Diario de Personas Registradas)

- **Regla cumplida:** Si en el día se registraron personas o clientes, a las **8:30 p.m.** se enviará la notificación con la cantidad y nombres.
- **Regla de silencio:** Si en ese día **no hubo ningún registro**, el sistema y la función **no envían nada**.
- Puedes probar el formato de esta alerta en cualquier momento con el botón **Simular alerta 8:30 p.m.** en la pantalla de Configuración.

---

## 5. Ventana Flotante del Instalador PWA (Límite de 3 veces por IP)

- La ventana emergente para instalar la aplicación PWA detecta automáticamente la dirección IP del visitante mediante el servicio IPify.
- Se mostrará exactamente en **3 ocasiones por IP**. A partir de la cuarta visita, no volverá a aparecer.
- Puedes reabrirla manualmente con el botón **Abrir ventana PWA** o reiniciar el contador de visitas a 0 con el botón **Reiniciar contador IP (0/3)**.

---

## 6. Despliegue de Cloud Functions (Para alertas con la app cerrada)

Para que el resumen de las 8:30 p.m. se ejecute incluso cuando todos los teléfonos y computadoras tengan la aplicación cerrada:

1. Abre tu terminal en la carpeta donde tienes estos archivos.
2. Inicia sesión en Firebase CLI si aún no lo has hecho:
   ```bash
   firebase login
   ```
3. Asegúrate de tener seleccionado el proyecto:
   ```bash
   firebase use aquaviva-crm-rpm
   ```
4. Instala las dependencias de la carpeta `functions`:
   ```bash
   cd functions
   npm install
   cd ..
   ```
5. Despliega las funciones y las reglas de seguridad:
   ```bash
   firebase deploy --only functions,firestore:rules
   ```

¡Listo! A partir de ese momento, Cloud Scheduler se encargará de verificar automáticamente todos los días a las 8:30 p.m. los registros y emitir las notificaciones push.
