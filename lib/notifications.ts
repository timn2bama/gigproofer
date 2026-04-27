// Email notification helper for admin alerts

interface NotificationOptions {
  notificationId: string;
  subject: string;
  htmlBody: string;
}

export async function sendAdminNotification(options: NotificationOptions): Promise<boolean> {
  try {
    const appUrl = process.env.NEXTAUTH_URL || 'https://gigproofer.com';
    const appName = 'GigProofer';

    const response = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        app_id: process.env.WEB_APP_ID,
        notification_id: options.notificationId,
        subject: options.subject,
        body: options.htmlBody,
        is_html: true,
        recipient_email: 'lemskysholdings@gmail.com',
        sender_email: `noreply@gigproofer.com`,
        sender_alias: appName,
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      if (result.notification_disabled) {
        console.log('Notification disabled by user, skipping email');
        return true; // Not an error, just disabled
      }
      console.error('Failed to send notification:', result.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false; // Don't throw - emails failing shouldn't break the app
  }
}

// Email templates
export function getSignupNotificationHtml(data: { name: string; email: string; role: string }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🎉 New User Signup!</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
          A new ${data.role.toLowerCase()} has joined GigProofer!
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
          <p style="margin: 8px 0; color: #374151;"><strong>Name:</strong> ${data.name}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #2563eb;">${data.email}</a></p>
          <p style="margin: 8px 0; color: #374151;"><strong>Role:</strong> <span style="background: ${data.role === 'Lender' ? '#fef3c7' : '#dbeafe'}; color: ${data.role === 'Lender' ? '#92400e' : '#1e40af'}; padding: 2px 8px; border-radius: 4px; font-size: 14px;">${data.role}</span></p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          Signed up at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}
        </p>
      </div>
    </div>
  `;
}

export function getPurchaseNotificationHtml(data: { name: string; email: string; amount: string }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">💰 New Purchase!</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
          Someone just purchased lifetime access!
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #059669;">
          <p style="margin: 8px 0; color: #374151;"><strong>Customer:</strong> ${data.name || 'N/A'}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #059669;">${data.email}</a></p>
          <p style="margin: 8px 0; color: #374151;"><strong>Amount:</strong> <span style="color: #059669; font-size: 20px; font-weight: bold;">${data.amount}</span></p>
        </div>
        <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; color: #065f46; font-weight: 500;">✅ User now has lifetime access to GigProofer!</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          Purchased at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}
        </p>
      </div>
    </div>
  `;
}

export function getFundedLoanNotificationHtml(data: {
  lenderName: string;
  lenderEmail: string;
  workerName: string;
  loanAmount: string;
  commission: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🏦 Funded Loan Commission!</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
          A lender has reported a funded loan - you earned a commission!
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed;">
          <p style="margin: 8px 0; color: #374151;"><strong>Lender:</strong> ${data.lenderName} (<a href="mailto:${data.lenderEmail}" style="color: #7c3aed;">${data.lenderEmail}</a>)</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Worker:</strong> ${data.workerName}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Loan Amount:</strong> ${data.loanAmount}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Your Commission:</strong> <span style="color: #059669; font-size: 24px; font-weight: bold;">${data.commission}</span></p>
        </div>
        <div style="background: #ede9fe; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; color: #5b21b6; font-weight: 500;">💜 Another successful loan funded through GigProofer!</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          Reported at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}
        </p>
      </div>
    </div>
  `;
}
