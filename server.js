require('dotenv').config();

const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024
  }
});

app.use(express.static(path.join(__dirname)));

function cleanValue(value) {
  return String(value || '').trim();
}

function buildLeadText({ name, phone, distanceMeters, message }) {
  return [
    'Nueva solicitud desde la web EcoClima',
    `Nombre: ${name}`,
    `Telefono: ${phone}`,
    `Distancia estimada (m): ${distanceMeters}`,
    `Necesidad: ${message || 'No indicada'}`
  ].join('\n');
}

async function sendTelegramMessage(token, chatId, text) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram sendMessage failed: ${body}`);
  }
}

async function sendTelegramPhoto(token, chatId, file, caption) {
  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype || 'application/octet-stream' });

  formData.append('chat_id', String(chatId));
  formData.append('photo', blob, file.originalname || 'lead-photo.jpg');
  if (caption) formData.append('caption', caption);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram sendPhoto failed: ${body}`);
  }
}

async function sendToTelegram(lead, files) {
  const token = cleanValue(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = cleanValue(process.env.TELEGRAM_CHAT_ID);
  if (!token || !chatId) return;

  const text = buildLeadText(lead);
  await sendTelegramMessage(token, chatId, text);

  if (files.photoOutdoor) {
    await sendTelegramPhoto(token, chatId, files.photoOutdoor, 'Foto ubicacion unidad exterior');
  }
  if (files.photoIndoor) {
    await sendTelegramPhoto(token, chatId, files.photoIndoor, 'Foto ubicacion unidad interior');
  }
}

function buildMailTransport() {
  const host = cleanValue(process.env.SMTP_HOST);
  const port = Number(process.env.SMTP_PORT || 587);
  const user = cleanValue(process.env.SMTP_USER);
  const pass = cleanValue(process.env.SMTP_PASS);
  const from = cleanValue(process.env.MAIL_FROM);
  const to = cleanValue(process.env.MAIL_TO);

  if (!host || !user || !pass || !from || !to) return null;

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    }),
    from,
    to
  };
}

async function sendToEmail(lead, files) {
  const mail = buildMailTransport();
  if (!mail) return;

  const attachments = [];
  if (files.photoOutdoor) {
    attachments.push({
      filename: files.photoOutdoor.originalname || 'photo-outdoor.jpg',
      content: files.photoOutdoor.buffer,
      contentType: files.photoOutdoor.mimetype
    });
  }
  if (files.photoIndoor) {
    attachments.push({
      filename: files.photoIndoor.originalname || 'photo-indoor.jpg',
      content: files.photoIndoor.buffer,
      contentType: files.photoIndoor.mimetype
    });
  }

  await mail.transporter.sendMail({
    from: mail.from,
    to: mail.to,
    subject: `Nueva solicitud web: ${lead.name}`,
    text: buildLeadText(lead),
    attachments
  });
}

async function sendToCrmWebhook(lead) {
  const webhookUrl = cleanValue(process.env.CRM_WEBHOOK_URL);
  if (!webhookUrl) return;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'ecoclima-landing',
      createdAt: new Date().toISOString(),
      lead
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`CRM webhook failed: ${body}`);
  }
}

async function uploadWhatsAppMedia(accessToken, phoneNumberId, file) {
  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype || 'application/octet-stream' });

  formData.append('messaging_product', 'whatsapp');
  formData.append('type', file.mimetype || 'image/jpeg');
  formData.append('file', blob, file.originalname || 'lead-photo.jpg');

  const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/media`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: formData
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WhatsApp media upload failed: ${body}`);
  }

  const payload = await response.json();
  if (!payload?.id) {
    throw new Error('WhatsApp media upload failed: no media id returned.');
  }

  return payload.id;
}

async function sendWhatsAppMessage(accessToken, phoneNumberId, to, payload) {
  const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      ...payload
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WhatsApp message failed: ${body}`);
  }
}

async function sendToWhatsApp(lead, files) {
  const accessToken = cleanValue(process.env.WHATSAPP_ACCESS_TOKEN);
  const phoneNumberId = cleanValue(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const toRaw = cleanValue(process.env.WHATSAPP_TO_NUMBER);
  const to = toRaw.replace(/[^\d]/g, '');

  if (!accessToken || !phoneNumberId || !to) return;

  const text = buildLeadText(lead);
  await sendWhatsAppMessage(accessToken, phoneNumberId, to, {
    type: 'text',
    text: { body: text }
  });

  if (files.photoOutdoor) {
    const mediaId = await uploadWhatsAppMedia(accessToken, phoneNumberId, files.photoOutdoor);
    await sendWhatsAppMessage(accessToken, phoneNumberId, to, {
      type: 'image',
      image: {
        id: mediaId,
        caption: 'Foto ubicacion unidad exterior'
      }
    });
  }

  if (files.photoIndoor) {
    const mediaId = await uploadWhatsAppMedia(accessToken, phoneNumberId, files.photoIndoor);
    await sendWhatsAppMessage(accessToken, phoneNumberId, to, {
      type: 'image',
      image: {
        id: mediaId,
        caption: 'Foto ubicacion unidad interior'
      }
    });
  }
}

app.post(
  '/api/lead',
  upload.fields([
    { name: 'photoOutdoor', maxCount: 1 },
    { name: 'photoIndoor', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const name = cleanValue(req.body.name);
      const phone = cleanValue(req.body.phone);
      const distanceMeters = cleanValue(req.body.distanceMeters);
      const message = cleanValue(req.body.message);

      const files = {
        photoOutdoor: req.files?.photoOutdoor?.[0],
        photoIndoor: req.files?.photoIndoor?.[0]
      };

      if (!name || name.length < 2) {
        return res.status(400).json({ ok: false, error: 'Nombre inválido.' });
      }
      if (!phone || phone.replace(/\s+/g, '').length < 9) {
        return res.status(400).json({ ok: false, error: 'Teléfono inválido.' });
      }
      if (distanceMeters && Number(distanceMeters.replace(',', '.')) <= 0) {
        return res.status(400).json({ ok: false, error: 'Distancia inválida.' });
      }
      const lead = { name, phone, distanceMeters, message };

      await Promise.all([
        sendToTelegram(lead, files),
        sendToWhatsApp(lead, files),
        sendToEmail(lead, files),
        sendToCrmWebhook(lead)
      ]);

      return res.json({ ok: true });
    } catch (error) {
      console.error('Lead submit error:', error);
      return res.status(500).json({
        ok: false,
        error: 'No se pudo enviar la solicitud. Inténtalo de nuevo.'
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`EcoClima server running on http://localhost:${PORT}`);
});
