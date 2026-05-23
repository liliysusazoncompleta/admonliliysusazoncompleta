import axios from 'axios';

const BUSINESS_PHONE = '+573177719249';
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://api.example.com/send';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || 'mock_token';

export async function sendQuotationViaWhatsApp(req, res) {
  try {
    const { clientPhone, clientName, pdfBase64, type = 'quotation' } = req.body;

    if (!clientPhone || !pdfBase64 || !clientName) {
      return res.status(400).json({
        error: 'clientPhone, clientName y pdfBase64 son requeridos'
      });
    }

    const cleanPhone = clientPhone.replace(/\D/g, '');
    const businessPhoneClean = BUSINESS_PHONE.replace(/\D/g, '');

    const messageType = type === 'invoice' ? 'Factura' : 'Cotización';
    const message = `Hola ${clientName}, te envío la ${messageType.toLowerCase()} de Lili y su Sazón Completa.`;

    const requests = [];

    requests.push(
      sendToWhatsApp(businessPhoneClean, `Nueva ${messageType.toLowerCase()} para ${clientName}`, pdfBase64)
    );

    requests.push(
      sendToWhatsApp(cleanPhone, message, pdfBase64)
    );

    const results = await Promise.allSettled(requests);

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: successCount > 0,
      message: `${messageType} enviada exitosamente a ${successCount} número(s)`,
      details: {
        business: results[0].status === 'fulfilled',
        client: results[1].status === 'fulfilled',
        failureCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[WHATSAPP_ERROR]', error);
    res.status(500).json({
      error: 'Error al enviar por WhatsApp',
      details: error.message,
    });
  }
}

async function sendToWhatsApp(phoneNumber, message, pdfBase64) {
  if (WHATSAPP_API_URL.includes('example.com')) {
    console.log(`[WHATSAPP_MOCK] Enviando a ${phoneNumber}: ${message}`);
    console.log(`[WHATSAPP_MOCK] PDF size: ${pdfBase64.length} bytes`);
    return { status: 'sent_mock', phone: phoneNumber };
  }

  const payload = {
    phone: phoneNumber,
    message,
    document: {
      data: pdfBase64,
      filename: 'documento.pdf',
      mimetype: 'application/pdf',
    },
  };

  try {
    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error(`[WHATSAPP_ERROR] Fallo enviando a ${phoneNumber}:`, error.message);
    throw error;
  }
}

export async function testWhatsAppConfig(req, res) {
  try {
    const configStatus = {
      businessPhone: BUSINESS_PHONE,
      apiUrl: WHATSAPP_API_URL,
      hasToken: !!WHATSAPP_TOKEN && WHATSAPP_TOKEN !== 'mock_token',
      mode: WHATSAPP_API_URL.includes('example.com') ? 'mock' : 'production',
      timestamp: new Date().toISOString(),
    };

    res.json({
      status: 'ok',
      whatsapp: configStatus,
      message: 'Configuración de WhatsApp verificada',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
