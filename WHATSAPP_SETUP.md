# 📱 Guía: Integración de WhatsApp

## Descripción
La funcionalidad permite enviar cotizaciones y facturas en PDF directamente a WhatsApp desde el sistema.

## Flujo de Envío

1. El usuario completa los datos del cliente en el modal de checkout
2. Hace clic en "Cotizar" o "Facturar"
3. El sistema genera un PDF basado en la vista previa
4. El PDF se envía a:
   - **Teléfono del negocio**: +573177719249
   - **Teléfono del cliente**: Campo `telefono` de la tabla clientes

## Configuración

### Modo Desarrollo (Mock)

Por defecto, el sistema funciona en **modo mock** (simulado). Esto significa que:
- No requiere API externa
- Los mensajes se registran en la consola del servidor
- Ideal para desarrollo y testing

Para usar esta modalidad, asegúrate que tu `.env` contenga:

```env
WHATSAPP_API_URL=https://api.example.com/send
# Dejar WHATSAPP_TOKEN con cualquier valor
```

### Integración con API Real

Para enviar mensajes reales a WhatsApp, tienes varias opciones:

#### Opción 1: Twilio (Recomendado)
1. Crear cuenta en https://www.twilio.com
2. Obtener `ACCOUNT_SID` y `AUTH_TOKEN`
3. Obtener número de teléfono Twilio verificado
4. Configurar en `.env`:

```env
WHATSAPP_API_URL=https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/Messages.json
WHATSAPP_TOKEN={AUTH_TOKEN}
```

#### Opción 2: WhatsApp Business API
1. Registrarse en https://www.whatsapp.com/business/
2. Obtener token de acceso
3. Configurar en `.env`:

```env
WHATSAPP_API_URL=https://graph.instagram.com/v18.0/{PHONE_NUMBER_ID}/messages
WHATSAPP_TOKEN={YOUR_ACCESS_TOKEN}
```

#### Opción 3: whatsapp-web.js (Open Source)
1. Instalar: `npm install whatsapp-web.js`
2. Implementar lógica en el controlador
3. Ideal para automatización simple

## Estructura del Endpoint

**POST** `/api/whatsapp/send`

```json
{
  "clientPhone": "3001234567",
  "clientName": "Juan Pérez",
  "pdfBase64": "JVBERi0xLjQKJ...",
  "type": "quotation" // o "invoice"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Cotización enviada exitosamente a 2 número(s)",
  "details": {
    "business": true,
    "client": true,
    "failureCount": 0
  },
  "timestamp": "2025-05-23T10:30:00.000Z"
}
```

## Logs y Debugging

Para ver los mensajes de debug en modo mock:

```bash
# En terminal del servidor, deberías ver:
[WHATSAPP_MOCK] Enviando a 573177719249: Nueva cotización para María García
[WHATSAPP_MOCK] PDF size: 45832 bytes
```

## Números Soportados

- **Negocio**: +573177719249 (configurable en `whatsappController.js`)
- **Cliente**: Del campo `telefono` en la tabla `clientes`

Ambos números deben estar en formato internacional (+57...) para APIs reales.

## Limitaciones Conocidas

- El PDF debe ser menor a 100MB (límite de WhatsApp Business API)
- Los números deben estar previamente registrados en WhatsApp
- Las APIs comerciales requieren créditos/suscripción

## Soporte

Para más información, consulta:
- [Documentación de Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [whatsapp-web.js GitHub](https://github.com/pedrosans/whatsapp-web.js)
