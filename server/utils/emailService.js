const nodemailer = require('nodemailer');

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

module.exports = { sendInvitationEmail, isEmailConfigured };
