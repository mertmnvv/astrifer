import "server-only";

import { formatTRY } from "@/lib/pricing";
import type { OrderItemDoc, ShippingAddress } from "@/types/firestore";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends a transactional email using Resend API with standard fetch POST.
 */
async function sendResendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    console.error("Email aborted: RESEND_API_KEY environment variable is missing.");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Resend API call failed: HTTP ${res.status} - ${errText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    return false;
  }
}

/**
 * Sends a confirmation email to the customer after their payment succeeds.
 */
export async function sendOrderPaidCustomerEmail(params: {
  toEmail: string;
  customerName: string;
  orderNumber: string;
  items: OrderItemDoc[];
  totalAmount: number;
}): Promise<boolean> {
  const itemsHtml = params.items
    .map((item) => {
      const summaryLine = item.journalLetterOpeningDate
        ? `<br><small style="color: #6b7280;">Gelecek Mektubu Açılış Tarihi: ${new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date(item.journalLetterOpeningDate))}</small>`
        : "";
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; font-family: monospace; font-size: 13px; text-transform: uppercase;">
            ${item.label}
            ${summaryLine}
          </td>
          <td style="padding: 12px 0; text-align: right; font-family: monospace; font-size: 14px; font-weight: bold; color: #d97706;">
            ${formatTRY(item.price)}
          </td>
        </tr>
      `;
    })
    .join("");

  const digitalItem = params.items.find((item) => item.productType === "digital") || params.items[0];
  // Build direct digital link
  const digitalPageLink = `${process.env.NEXT_PUBLIC_SITE_URL || "https://astrifer.com"}/s/${digitalItem.starMapSlug}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Siparişiniz Onaylandı</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b0810; font-family: sans-serif; color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0f0b18; border: 1px solid #1f1a2e; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <!-- Header -->
        <div style="background-color: #0b0810; padding: 30px; text-align: center; border-bottom: 1px solid #2d263f;">
          <h1 style="margin: 0; font-family: serif; font-size: 26px; font-style: italic; color: #fbbf24; letter-spacing: 0.1em;">Hatırname</h1>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 30px;">
          <h2 style="margin-top: 0; font-family: serif; font-size: 22px; font-style: italic; font-weight: 300; color: #ffffff;">Merhaba ${params.customerName},</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #9ca3af;">
            Ödemeniz başarıyla alındı ve siparişiniz onaylandı. Bu özel anı sizin için hazırlamaktan büyük heyecan duyuyoruz.
          </p>
          
          <div style="margin: 30px 0; background-color: #151022; border: 1px solid #2d263f; border-radius: 12px; padding: 20px;">
            <p style="margin: 0 0 10px 0; font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af;">Sipariş Numarası</p>
            <p style="margin: 0; font-family: monospace; font-size: 16px; font-weight: bold; color: #fbbf24;">${params.orderNumber}</p>
          </div>
          
          <!-- Dijital Sayfa Butonu -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${digitalPageLink}" style="display: inline-block; background: linear-gradient(135deg, #fcd34d, #d97706); color: #0b0810; font-family: monospace; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; padding: 14px 30px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.4);">
              Yaşayan Sayfanıza Gidin →
            </a>
            <p style="margin: 10px 0 0 0; font-size: 11px; color: #6b7280;">Bu link üzerinden fotoğraf galerisine ve sesli mesajınıza ulaşabilirsiniz.</p>
          </div>

          <!-- Sipariş Detayları -->
          <h3 style="font-family: serif; font-size: 16px; font-style: italic; border-bottom: 1px solid #2d263f; padding-bottom: 8px; color: #ffffff; margin-top: 40px;">Sipariş Özeti</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${itemsHtml}
              <tr>
                <td style="padding: 16px 0; font-family: monospace; font-size: 13px; text-transform: uppercase; color: #9ca3af; border-top: 1px solid #2d263f;">Toplam</td>
                <td style="padding: 16px 0; text-align: right; font-family: serif; font-size: 20px; font-style: italic; color: #fbbf24; border-top: 1px solid #2d263f;">
                  ${formatTRY(params.totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          <p style="font-size: 13px; line-height: 1.6; color: #9ca3af; margin-top: 40px; border-top: 1px solid #2d263f; pt: 20px;">
            Herhangi bir sorunuz olursa bizimle her zaman bu e-posta adresi üzerinden ya da WhatsApp destek hattımızdan iletişime geçebilirsiniz.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #0b0810; padding: 20px 30px; text-align: center; border-top: 1px solid #2d263f;">
          <p style="margin: 0; font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #6b7280;">© ${new Date().getFullYear()} Hatırname · Yıldızları Yanında Taşı</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendResendEmail({
    to: params.toEmail,
    subject: `Siparişiniz Onaylandı: ${params.orderNumber}`,
    html,
  });
}

/**
 * Sends a notification email to the admin when a payment succeeds.
 */
export async function sendOrderPaidAdminEmail(params: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress | null;
  orderNumber: string;
  items: OrderItemDoc[];
  totalAmount: number;
}): Promise<boolean> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    console.error("Admin Notification aborted: ADMIN_NOTIFICATION_EMAIL environment variable is missing.");
    return false;
  }

  const itemsHtml = params.items
    .map((item) => {
      const details = [];
      if (item.journalLetterText) details.push(`Mektup: "${item.journalLetterText}"`);
      if (item.journalLetterOpeningDate) details.push(`Açılış Tarihi: ${item.journalLetterOpeningDate}`);
      const detailsStr = details.length > 0 ? `<br><small style="color: #666;">${details.join(" | ")}</small>` : "";
      return `
        <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
          <strong>${item.label}</strong> (Tutar: ${formatTRY(item.price)}) - StarMap: <code>${item.starMapSlug}</code>
          ${detailsStr}
        </li>
      `;
    })
    .join("");

  const addressHtml = params.shippingAddress
    ? `
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0 0 5px 0;"><strong>Alıcı Ad Soyad:</strong> ${params.shippingAddress.name}</p>
        <p style="margin: 0 0 5px 0;"><strong>Adres:</strong> ${params.shippingAddress.address}</p>
        <p style="margin: 0;"><strong>İl / İlçe:</strong> ${params.shippingAddress.city} / ${params.shippingAddress.district}</p>
      </div>
    `
    : "<p style='color: #666;'>Dijital Ürün (Kargo Adresi Yok)</p>";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Yeni Sipariş Geldi</title>
    </head>
    <body style="font-family: sans-serif; color: #333; line-height: 1.5; padding: 20px;">
      <h2 style="color: #2b1c40;">Yeni Ödenmiş Sipariş Alındı!</h2>
      <p>Aşağıdaki sipariş PayTR üzerinden başarıyla ödendi. Üretime veya işlemlere başlayabilirsiniz.</p>
      
      <h3 style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">Müşteri Bilgileri</h3>
      <p style="margin: 5px 0;"><strong>Ad Soyad:</strong> ${params.customerName}</p>
      <p style="margin: 5px 0;"><strong>E-posta:</strong> <a href="mailto:${params.customerEmail}">${params.customerEmail}</a></p>
      <p style="margin: 5px 0;"><strong>Telefon:</strong> ${params.customerPhone}</p>
      
      <h3 style="border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 25px;">Teslimat Adresi</h3>
      ${addressHtml}
      
      <h3 style="border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 25px;">Sipariş Bilgileri</h3>
      <p style="margin: 5px 0;"><strong>Sipariş No:</strong> <code>${params.orderNumber}</code></p>
      <p style="margin: 5px 0;"><strong>Toplam Tutar:</strong> ${formatTRY(params.totalAmount)}</p>
      
      <h4 style="margin-top: 15px; margin-bottom: 5px;">Ürünler:</h4>
      <ul style="margin: 0; padding-left: 20px;">
        ${itemsHtml}
      </ul>
      
      <div style="margin-top: 30px; padding: 15px; background-color: #fff8e1; border: 1px solid #ffe082; border-radius: 8px;">
        <strong>Admin Aksiyonu:</strong> Defter siparişi ise baskı dosyalarını indirmek ve durumu "Kargolandı" yapmak için <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://astrifer.com"}/admin">Admin Paneli</a>'ne gidin.
      </div>
    </body>
    </html>
  `;

  return sendResendEmail({
    to: adminEmail,
    subject: `Yeni Sipariş Alındı: ${params.orderNumber} (${params.customerName})`,
    html,
  });
}
