import { Resend } from 'resend';
import twilio from 'twilio';

export type NotifyInput = {
  toEmail: string;
  toPhone: string;
  leadId: string;
  summary: string;
};

export async function sendEmailIfConfigured(input: NotifyInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) return;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: input.toEmail,
    subject: `DecideCasa: lead #${input.leadId}`,
    text: input.summary,
  });
}

export async function sendWhatsAppIfConfigured(input: NotifyInput) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // ex: "whatsapp:+14155238886"
  if (!sid || !token || !from) return;

  const client = twilio(sid, token);
  const to = input.toPhone.startsWith('whatsapp:') ? input.toPhone : `whatsapp:${input.toPhone}`;

  await client.messages.create({
    from,
    to,
    body: input.summary,
  });
}
