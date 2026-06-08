const nodemailer = require('nodemailer');
const dns = require('dns');

// Force IPv4 DNS resolution for the SMTP fallback
dns.setDefaultResultOrder('ipv4first');

// Resend Configuration
// Fallback: If EMAIL_PASS starts with 're_', treat it as the Resend API Key.
const resendApiKey = process.env.RESEND_API_KEY || (process.env.EMAIL_PASS && process.env.EMAIL_PASS.startsWith('re_') ? process.env.EMAIL_PASS : null);
const emailFrom = process.env.EMAIL_FROM || 'FlowLoG <onboarding@resend.dev>';

const isEmailConfigured = !!(resendApiKey || (process.env.EMAIL_USER && process.env.EMAIL_PASS));

let transporter = null;

if (isEmailConfigured && !resendApiKey) {
  try {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Force IPv4 DNS resolution for nodemailer connections
      lookup: (hostname, options, callback) => {
        dns.lookup(hostname, { ...options, family: 4 }, callback);
      },
    });
    
    // Verify connection on startup
    transporter.verify((error, success) => {
      if (error) {
        console.error('[Email] SMTP Connection verification failed:', error.message);
      } else {
        console.log('[Email] SMTP Server is ready to take our messages');
      }
    });

    console.log('[Email] SMTP Service configured for:', process.env.EMAIL_USER);
  } catch (err) {
    console.error('[Email] Failed to create SMTP transporter:', err.message);
  }
} else if (resendApiKey) {
  console.log('[Email] Service configured via Resend HTTP API');
} else {
  console.warn('[Email] Not configured. Set EMAIL_USER and EMAIL_PASS or RESEND_API_KEY.');
}

// HTTP POST delivery method to bypass Render SMTP port blocking
const sendViaResend = async ({ to, subject, html }) => {
  const bodyData = JSON.stringify({
    from: emailFrom,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });

  if (typeof fetch === 'function') {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: bodyData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Resend API returned status ${response.status}`);
    }

    const data = await response.json();
    return { messageId: data.id };
  } else {
    // HTTPS module fallback for older Node environments
    const https = require('https');
    return new Promise((resolve, reject) => {
      const req = https.request('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyData),
        }
      }, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
          let parsed = {};
          try { parsed = JSON.parse(responseBody); } catch (e) {}
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ messageId: parsed.id });
          } else {
            reject(new Error(parsed.message || `Resend API returned status ${res.statusCode}`));
          }
        });
      });

      req.on('error', (err) => { reject(err); });
      req.write(bodyData);
      req.end();
    });
  }
};

const sendInvitationEmail = async ({ toEmail, inviterName, workspaceName, inviteLink }) => {
  const subject = `You've been invited to join ${workspaceName} on FlowLoG`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Flow<span style="color: #22c55e;">LoG</span></h1>
      </div>
      <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1f2937;">You are invited! 🎉</h2>
        <p style="color: #4b5563; font-size: 16px;">
          <strong>${inviterName}</strong> has invited you to join 
          <strong>${workspaceName}</strong> on FlowLoG.
        </p>
        <p style="color: #4b5563;">
          FlowLoG is a Kanban-style project management tool to help you 
          organize, prioritize, and deliver your work.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}"
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 14px 32px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-size: 16px;
                    font-weight: bold;
                    display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; text-align: center;">
          Or copy this link: 
          <a href="${inviteLink}" style="color: #667eea;">${inviteLink}</a>
        </p>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          If you did not expect this invitation, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  if (resendApiKey) {
    try {
      const info = await sendViaResend({ to: toEmail, subject, html });
      console.log('[Email] Message sent via Resend: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('[Email] Resend error details:', error.message);
      throw error;
    }
  }

  if (!transporter) {
    throw new Error('Email transporter not configured');
  }

  const mailOptions = {
    from: `"${workspaceName}" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Message sent via SMTP: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('[Email] SMTP Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw error;
  }
};

const sendCardAssignmentEmail = async ({
  toEmail,
  toName,
  cardTitle,
  cardDescription,
  dueDate,
  boardTitle,
  boardId,
  listTitle,
  assignerName,
}) => {
  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No due date set';

  const descriptionText = cardDescription || 'No description added';
  const taskUrl = `${process.env.FRONTEND_URL}/b/${boardId}`;
  const greeting = toName ? toName : 'there';
  const subject = `You've been assigned a task on ${boardTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0079bf 0%, #0063a0 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Flow<span style="color: #22c55e;">LoG</span></h1>
      </div>
      <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1f2937; margin-top: 0;">You have a new task assigned 📋</h2>
        <p style="color: #4b5563; font-size: 16px;">
          Hi <strong>${greeting}</strong>, <strong>${assignerName}</strong> assigned you to a card.
        </p>
        <div style="background: white; border-left: 4px solid #0079bf; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #0079bf; margin: 0 0 12px 0; font-size: 20px;">${cardTitle}</h3>
          <p style="color: #4b5563; margin: 0 0 12px 0;">
            <strong>Description:</strong> ${descriptionText}
          </p>
          <p style="color: #4b5563; margin: 0 0 8px 0;">
            <strong>📅 Due Date:</strong> ${formattedDate}
          </p>
          <p style="color: #4b5563; margin: 0 0 8px 0;">
            <strong>📋 List:</strong> ${listTitle}
          </p>
          <p style="color: #4b5563; margin: 0;">
            <strong>📁 Board:</strong> ${boardTitle}
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${taskUrl}"
             style="background: #0079bf;
                    color: white;
                    padding: 14px 32px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-size: 16px;
                    font-weight: bold;
                    display: inline-block;">
            View Task
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          This is an automated notification from FlowLoG
        </p>
      </div>
    </div>
  `;

  if (resendApiKey) {
    try {
      const info = await sendViaResend({ to: toEmail, subject, html });
      console.log('[Email] Card assignment notification sent via Resend: %s', info.messageId);
      return;
    } catch (error) {
      console.error('[Email] Failed to send card assignment email via Resend:', error.message);
      return;
    }
  }

  if (!transporter) {
    console.warn('[Email] Transporter not configured — skipping card assignment email');
    return;
  }

  const mailOptions = {
    from: `"FlowLoG" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Card assignment notification sent via SMTP: %s', info.messageId);
  } catch (error) {
    console.error('[Email] Failed to send card assignment email via SMTP:', error.message);
  }
};

module.exports = { sendInvitationEmail, sendCardAssignmentEmail, isEmailConfigured };
