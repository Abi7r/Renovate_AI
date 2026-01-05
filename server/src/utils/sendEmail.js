import { Resend } from "resend";
const resend = new Resend(Process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, text, html, react }) => {
  try {
    const data = await resend.emails.send({
      from: "BuildArt Ai <onboarding@buildartai.com>",
      to,
      subject,
      react,
    });
    console.log("Email sent", data);
    return data;
  } catch (error) {
    console.log("Email not sent", error);
    throw error;
  }
};
