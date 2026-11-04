import "server-only";
import nodemailer from "nodemailer";

/**
 * SMTP mailer. Server only.
 * Works with Gmail (App Password), Brevo, Mailgun SMTP, Zoho, Outlook, etc.
 */
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error("Missing SMTP_HOST / SMTP_USER / SMTP_PASS in environment.");
  }
  const port = Number(process.env.SMTP_PORT ?? 465);
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: { user, pass },
  });
  return transporter;
}

export type MailInput = { to: string | string[]; subject: string; html: string; text: string };

export async function sendMail({ to, subject, html, text }: MailInput) {
  const from = process.env.MAIL_FROM || `Bloom for You <${process.env.SMTP_USER}>`;
  await getTransporter().sendMail({ from, to, subject, html, text });
}