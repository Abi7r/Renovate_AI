const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendWelcomeEmail = async (userName, userEmail) => {
  try {
    console.log("📧 sendWelcomeEmail called with:");
    console.log("  - userName:", userName);
    console.log("  - userEmail:", userEmail);
    if (!userEmail || !userEmail.includes("@")) {
      console.error("❌ Invalid email address:", userEmail);
      throw new Error("Invalid email address");
    }
    const data = await resend.emails.send({
      from: "BuildArt AI <onboarding@resend.dev>",
      to: userEmail,
      subject: "Welcome to BuildArt AI",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>.container{
        width:600px;margin:0 auto;padding:20px;}
         .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }</style>
      .button { display: inline-block; padding: 12px 30px; background-color: #f97316; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; }
         </head>
      <body>
      <div class="container">
      <div class="header">
      <h1>Welcome to BuildArt AI</h1>
      </div>
      <p>Dear ${userName}</p>
      <p>Thank you for signing up to BuildArt AI.We are excited to have you on board.</p>
      <p>Here is what we can do for you</p>
     <div class="feature">
                <strong>AI-Powered Design</strong><br>
                Generate stunning interior designs with our AI technology
              </div>
              
              <div class="feature">
                <strong> Project Management</strong><br>
                Track your renovation projects from start to finish
              </div>
              
              <div class="feature">
                <strong>Real-time Updates</strong><br>
                Get updates and communicate with our design team
              </div>
      <p>Best regards<br>BuildArt AI Team</p>
        <p>Ready to get started?</p>
      </div>
        
      </body>
      </html>`,
    });
    console.log("Email sent", data);
  } catch (error) {
    console.log("Email not sent", error);
    throw error;
  }
};

exports.notifyAdminNewUser = async (userName, userEmail) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  try {
    console.log("📧 notifyAdminNewUser called with:");
    console.log("  - userName:", userName);
    console.log("  - userEmail:", userEmail);
    console.log("  - ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
    if (!adminEmail) {
      console.warn("⚠️ ADMIN_EMAIL not set in .env");
      return;
    }
    const data = await resend.emails.send({
      from: "BuildArt AI <onboarding@resend.dev>",
      to: adminEmail,
      subject: "New User Registration",
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background-color: #f9fafb; }
            .info-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          </style>
      </head>
      <body>
        <div class="container">
        <div class="header">
        <h1>New User Registration</h1>
        </div>
        <div class="info-box">
        <p><strong>Name</strong>${userName}</p>
        <p><strong>Email</strong>${userEmail}</p>
        <p><strong>Registered</strong>${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
      
      `,
    });
    console.log("Admin notified about new user", data);
  } catch (error) {
    console.log("Error notifying Admin", error);
  }
};
