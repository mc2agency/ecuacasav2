import { Resend } from 'resend';

interface RegistrationData {
  name: string;
  phone: string;
  email?: string | null;
  services: string[];
  speaks_english: boolean;
  message?: string | null;
}

export async function sendRegistrationNotification(data: RegistrationData) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping email notification');
    return;
  }

  if (!adminEmail) {
    console.warn('ADMIN_EMAIL not set, skipping email notification');
    return;
  }

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'EcuaCasa <noreply@ecuacasa.com>',
      to: adminEmail,
      subject: `🏠 Nuevo profesional: ${data.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #9333ea, #ec4899); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nueva Solicitud de Registro</h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Nombre:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  ${data.name}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">WhatsApp:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}" style="color: #9333ea; text-decoration: none;">
                    ${data.phone}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Email:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  ${data.email || 'No proporcionado'}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Servicios:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  ${data.services.join(', ')}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Habla inglés:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  ${data.speaks_english ? '✅ Sí' : '❌ No'}
                </td>
              </tr>
              ${data.message ? `
              <tr>
                <td style="padding: 12px 0;">
                  <strong style="color: #6b7280;">Mensaje:</strong>
                </td>
                <td style="padding: 12px 0; color: #111827;">
                  ${data.message}
                </td>
              </tr>
              ` : ''}
            </table>
            <div style="margin-top: 24px; text-align: center;">
              <a href="https://ecuacasa.com/admin/registrations"
                 style="display: inline-block; background: linear-gradient(135deg, #9333ea, #ec4899); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Ver en Admin
              </a>
            </div>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
            EcuaCasa - Servicios para el hogar en Cuenca
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
    } else {
      console.log('Email sent successfully, ID:', result.data?.id);
    }
  } catch (error) {
    console.error('Failed to send registration email:', error);
    // Don't throw - email is non-critical
  }
}

interface ServiceRequestData {
  request_number: string;
  service_slug: string;
  service_other?: string | null;
  description?: string | null;
  sector: string;
  urgency: string;
  client_name: string;
  client_whatsapp: string;
  client_email?: string | null;
}

export async function sendServiceRequestNotification(data: ServiceRequestData) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping email notification');
    return;
  }

  if (!adminEmail) {
    console.warn('ADMIN_EMAIL not set, skipping email notification');
    return;
  }

  const resend = new Resend(apiKey);
  const serviceName = data.service_slug === 'otro' ? (data.service_other || 'Otro') : data.service_slug;

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'EcuaCasa <noreply@ecuacasa.com>',
      to: adminEmail,
      subject: `🔔 Nueva Solicitud: ${serviceName} - ${data.request_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #9333ea, #ec4899); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nueva Solicitud de Servicio</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0; font-size: 14px;">${data.request_number}</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Servicio:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  ${serviceName}
                </td>
              </tr>
              ${data.description ? `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Descripción:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  ${data.description}
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Sector:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  ${data.sector}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Urgencia:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  ${data.urgency}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Cliente:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  ${data.client_name}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">WhatsApp:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <a href="https://wa.me/${data.client_whatsapp.replace(/[^0-9]/g, '')}" style="color: #9333ea; text-decoration: none;">
                    ${data.client_whatsapp}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0;">
                  <strong style="color: #6b7280;">Email:</strong>
                </td>
                <td style="padding: 12px 0; color: #111827;">
                  ${data.client_email || 'No proporcionado'}
                </td>
              </tr>
            </table>
            <div style="margin-top: 24px; text-align: center;">
              <a href="https://wa.me/${data.client_whatsapp.replace(/[^0-9]/g, '')}"
                 style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 8px;">
                Contactar por WhatsApp
              </a>
            </div>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
            EcuaCasa - Servicios para el hogar en Cuenca
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
    } else {
      console.log('Service request email sent, ID:', result.data?.id);
    }
  } catch (error) {
    console.error('Failed to send service request email:', error);
  }
}

interface RecommendationData {
  pro_name: string;
  pro_service_type: string;
  pro_phone: string;
  relationship: string;
  why_recommend: string;
  recommender_name?: string | null;
  recommender_email?: string | null;
}

export async function sendRecommendationNotification(data: RecommendationData) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping email notification');
    return;
  }

  if (!adminEmail) {
    console.warn('ADMIN_EMAIL not set, skipping email notification');
    return;
  }

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'EcuaCasa <noreply@ecuacasa.com>',
      to: adminEmail,
      subject: `⭐ Nueva Recomendación: ${data.pro_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #9333ea, #ec4899); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nueva Recomendación de Profesional</h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Profesional:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  ${data.pro_name}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Servicio:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  ${data.pro_service_type}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Teléfono:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <a href="https://wa.me/593${data.pro_phone.replace(/^0/, '')}" style="color: #9333ea; text-decoration: none;">
                    ${data.pro_phone}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Relación:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  ${data.relationship}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Por qué lo recomienda:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  ${data.why_recommend}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #6b7280;">Recomendado por:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  ${data.recommender_name || 'Anónimo'}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0;">
                  <strong style="color: #6b7280;">Email del recomendador:</strong>
                </td>
                <td style="padding: 12px 0; color: #111827;">
                  ${data.recommender_email || 'No proporcionado'}
                </td>
              </tr>
            </table>
            <div style="margin-top: 24px; text-align: center;">
              <a href="https://wa.me/593${data.pro_phone.replace(/^0/, '')}"
                 style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Contactar Profesional
              </a>
            </div>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
            EcuaCasa - Servicios para el hogar en Cuenca
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
    } else {
      console.log('Recommendation email sent, ID:', result.data?.id);
    }
  } catch (error) {
    console.error('Failed to send recommendation email:', error);
  }
}
