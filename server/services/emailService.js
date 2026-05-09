/**
 * @fileoverview Servicio de Email — Mailtrap (Testing & Sending)
 * @module server/services/emailService
 *
 * Soporta dos modos de Mailtrap:
 *   TESTING:  sandbox.smtp.mailtrap.io:2525  → correos van al inbox virtual
 *   SENDING:  live.smtp.mailtrap.io:587      → correos reales (producción)
 */

import nodemailer from 'nodemailer';
import 'dotenv/config';

const EXPIRES_MIN   = parseInt(process.env.RESET_TOKEN_EXPIRES_MINUTES || '30');
const SMTP_HOST     = process.env.SMTP_HOST;
const SMTP_PORT     = parseInt(process.env.SMTP_PORT || '2525');
const SMTP_SECURE   = process.env.SMTP_SECURE === 'true';
const SMTP_USER     = process.env.SMTP_USER;
const SMTP_PASS     = process.env.SMTP_PASS;
const EMAIL_FROM    = process.env.EMAIL_FROM || '"Lili y su Sazón Completa" <no-reply@liliysazon.com>';

// ── Verificar configuración al arrancar ───────────────────────────────────────
const logMailtrapMode = () => {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[Email] ⚠️  SMTP no configurado. Revisa server/.env (SMTP_HOST, SMTP_USER, SMTP_PASS)');
    return;
  }
  const modo = SMTP_HOST.includes('sandbox') ? '🧪 TESTING (sandbox)' : '🚀 SENDING (producción)';
  console.log(`[Email] ✅  Mailtrap modo ${modo} → ${SMTP_HOST}:${SMTP_PORT}`);
};
logMailtrapMode();

// ── Crear transporter Mailtrap ─────────────────────────────────────────────────
const createTransporter = () => {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      'SMTP no configurado. Agrega SMTP_HOST, SMTP_USER y SMTP_PASS en server/.env\n' +
      'Valores de Mailtrap Testing:\n' +
      '  SMTP_HOST=sandbox.smtp.mailtrap.io\n' +
      '  SMTP_PORT=2525\n' +
      '  SMTP_USER=<tu_username_de_mailtrap>\n' +
      '  SMTP_PASS=<tu_password_de_mailtrap>',
    );
  }

  return nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    // Mailtrap no requiere TLS estricto
    tls: { rejectUnauthorized: false },
  });
};

// ── Template HTML del correo ───────────────────────────────────────────────────
const buildHTML = (resetUrl) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Recuperación de contraseña</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;background:#f4f5e7;color:#1a1c15;padding:20px}
    .wrap{max-width:580px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.10)}
    .hdr{background:linear-gradient(135deg,#476500 0%,#5d7f13 100%);padding:36px 40px;text-align:center}
    .emoji{font-size:40px;display:block;margin-bottom:12px}
    .hdr h1{color:#ffffff;font-size:20px;font-weight:800;margin:0}
    .hdr p{color:rgba(255,255,255,.75);font-size:13px;margin-top:5px}
    .body{padding:36px 40px}
    .title{font-size:17px;font-weight:700;margin-bottom:14px;color:#1a1c15}
    .text{font-size:14px;line-height:1.75;color:#444939;margin-bottom:18px}
    .btn-wrap{text-align:center;margin:28px 0}
    .btn{display:inline-block;background:#476500;color:#ffffff!important;text-decoration:none;
         padding:15px 40px;border-radius:10px;font-size:15px;font-weight:700;
         box-shadow:0 4px 14px rgba(71,101,0,.35)}
    .warn{background:#fffbeb;border-left:4px solid #d97706;border-radius:6px;
          padding:14px 16px;font-size:13px;color:#92400e;margin-bottom:20px}
    .divider{border:none;border-top:1px solid #e8e9dc;margin:24px 0}
    .url-box{background:#f4f5e7;border:1px solid #e2e3d6;border-radius:8px;
             padding:12px 14px;word-break:break-all;font-size:12px;color:#747967;margin-bottom:18px}
    .footer{background:#f4f5e7;padding:20px 40px;text-align:center;font-size:11px;color:#747967;line-height:1.6}
  </style>
</head>
<body>
<div class="wrap">

  <div class="hdr">
    <span class="emoji">🍽️</span>
    <h1>Lili y su Sazón Completa</h1>
    <p>Sistema de Gestión de Catering Artesanal</p>
  </div>

  <div class="body">
    <p class="title">Recuperación de contraseña</p>

    <p class="text">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta.
      Si fuiste tú quien la solicitó, haz clic en el botón de abajo para continuar.
    </p>

    <div class="btn-wrap">
      <a href="${resetUrl}" class="btn">🔑 &nbsp; Restablecer mi contraseña</a>
    </div>

    <div class="warn">
      <strong>⏱ Este enlace expira en ${EXPIRES_MIN} minutos</strong> y solo puede usarse una vez por razones de seguridad.
    </div>

    <hr class="divider"/>

    <p class="text" style="font-size:13px;">
      Si el botón no funciona, copia y pega este enlace directamente en tu navegador:
    </p>
    <div class="url-box">${resetUrl}</div>

    <p class="text" style="font-size:12px;color:#9ca3af;">
      Si <strong>no solicitaste</strong> este cambio de contraseña, puedes ignorar este correo de forma segura.
      Tu contraseña actual seguirá siendo la misma.
    </p>
  </div>

  <div class="footer">
    © ${new Date().getFullYear()} Lili y su Sazón Completa &nbsp;·&nbsp; Todos los derechos reservados<br/>
    Este es un mensaje automático, por favor no respondas a este correo.
  </div>

</div>
</body>
</html>`;

// ── Función principal ──────────────────────────────────────────────────────────
/**
 * Envía el correo de recuperación de contraseña via Mailtrap.
 *
 * @param {string} to        - Correo destinatario
 * @param {string} resetUrl  - URL con el token de recuperación
 * @returns {Promise<{success: boolean, messageId?: string, preview?: string, error?: string}>}
 */
export const sendPasswordResetEmail = async (to, resetUrl) => {
  try {
    const transporter = createTransporter();

    // Verificar conexión SMTP antes de enviar
    await transporter.verify();
    console.log('[Email] 🔗 Conexión SMTP verificada con Mailtrap');

    const info = await transporter.sendMail({
      from:    EMAIL_FROM,
      to,
      subject: '🔑 Recuperación de contraseña — Lili y su Sazón Completa',
      html:    buildHTML(resetUrl),
      text:    `Restablece tu contraseña en el siguiente enlace:\n${resetUrl}\n\nEste enlace expira en ${EXPIRES_MIN} minutos.\n\nSi no solicitaste este cambio, ignora este correo.`,
    });

    // Mailtrap Testing devuelve una URL de previsualización
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log(`[Email] ✅  Correo enviado a: ${to}`);
    console.log(`[Email] 📨  Message ID: ${info.messageId}`);
    if (SMTP_HOST?.includes('sandbox')) {
      console.log(`[Email] 🔍  Ver en Mailtrap → https://mailtrap.io/inboxes`);
    }

    return {
      success:   true,
      messageId: info.messageId,
      preview:   previewUrl || null,
    };

  } catch (err) {
    console.error('[Email] ❌ Error al enviar:', err.message);

    // Mensajes de error amigables según el tipo de fallo
    let friendlyError = err.message;
    if (err.message.includes('Invalid login') || err.message.includes('535')) {
      friendlyError = 'Credenciales SMTP incorrectas. Verifica SMTP_USER y SMTP_PASS en server/.env';
    } else if (err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')) {
      friendlyError = `No se pudo conectar a ${SMTP_HOST}:${SMTP_PORT}. Verifica SMTP_HOST y SMTP_PORT.`;
    } else if (err.message.includes('not configured')) {
      friendlyError = 'SMTP no configurado. Revisa las variables SMTP_* en server/.env';
    }

    return { success: false, error: friendlyError };
  }
};
