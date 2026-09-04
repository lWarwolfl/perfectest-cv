import nodemailer from 'nodemailer'

const GRADIENT = 'linear-gradient(135deg,#4f46e5,#8b5cf6)'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function sendBrandEmail({
  to,
  subject,
  heading,
  body,
  ctaLabel,
  ctaUrl,
  footer,
}: {
  to: string
  subject: string
  heading: string
  body: string
  ctaLabel: string
  ctaUrl: string
  footer: string
}) {
  const html = `<!doctype html>
<html><body style="margin:0;background:#f4f4f5;">
<div style="padding:32px 12px;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
    <div style="background:${GRADIENT};padding:28px 32px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="width:44px;"><div style="width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.2);text-align:center;line-height:44px;font-size:24px;font-weight:bold;color:#ffffff;">&#10003;</div></td>
        <td style="padding-left:12px;font-size:20px;font-weight:600;color:#ffffff;">Perfectest CV</td>
      </tr></table>
    </div>
    <div style="padding:32px;">
      <h1 style="margin:0 0 12px;font-size:20px;color:#18181b;">${esc(heading)}</h1>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#52525b;">${esc(body)}</p>
      <a href="${ctaUrl}" style="display:inline-block;background:${GRADIENT};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;">${esc(ctaLabel)}</a>
      <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#a1a1aa;">Button not working? Paste this link into your browser:<br><a href="${ctaUrl}" style="color:#4f46e5;word-break:break-all;">${ctaUrl}</a></p>
    </div>
    <div style="padding:16px 32px;background:#fafafa;border-top:1px solid #e4e4e7;font-size:12px;color:#a1a1aa;">${esc(footer)}</div>
  </div>
</div>
</body></html>`

  await transporter.sendMail({
    from: `"Perfectest CV" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text: `${heading}\n\n${body}\n\n${ctaUrl}\n\n${footer}`,
  })
}
