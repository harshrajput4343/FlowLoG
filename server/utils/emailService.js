const nodemailer = require('nodemailer');
const dns = require('dns');

// Force IPv4 DNS resolution — most cloud hosts (Render, Railway, etc.)
// lack IPv6 outbound, causing ENETUNREACH / ETIMEDOUT to smtp.gmail.com
dns.setDefaultResultOrder('ipv4first');

const isEmailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

let transporter = null;

if (isEmailConfigured) {
  try {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    // Verify connection on startup
    transporter.verify((error, success) => {
      if (error) {
        console.error('[Email] Connection verification failed:', error.message);
      } else {
        console.log('[Email] Server is ready to take our messages');
      }
    });

    console.log('[Email] Service configured for:', process.env.EMAIL_USER);
  } catch (err) {
    console.error('[Email] Failed to create transporter:', err.message);
  }
} else {
  console.warn('[Email] Not configured. Set EMAIL_USER and EMAIL_PASS in environment variables.');
}

const sendInvitationEmail = async ({ toEmail, inviterName, workspaceName, inviteLink }) => {
  if (!transporter) {
    throw new Error('Email transporter not configured');
  }

  const mailOptions = {
    from: `"${workspaceName}" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `You've been invited to join ${workspaceName} on FlowLoG`,
    html: `
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
    `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('[Email] Error details:', {
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
  if (!transporter) {
    console.warn('[Email] Transporter not configured — skipping card assignment email');
    return;
  }

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

  const mailOptions = {
    from: `"FlowLoG" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `You've been assigned a task on ${boardTitle}`,
    html: `
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
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Card assignment notification sent: %s', info.messageId);
  } catch (error) {
    console.error('[Email] Failed to send card assignment email:', {
      message: error.message,
      code: error.code,
    });
    // Intentionally swallowed — card assignment must not fail due to email
  }
};

module.exports = { sendInvitationEmail, sendCardAssignmentEmail, isEmailConfigured };
