// skills/better-auth/assets/templates/better-auth-nextjs-template/lib/email.ts
import { Resend } from "resend";

// Ensure the RESEND_API_KEY is set in your environment variables
if (!process.env.RESEND_API_KEY) {
  // In a real app, you might want to throw an error or log a warning
  // For the template, we'll log a warning to the console.
  console.warn(
    "RESEND_API_KEY is not set. Email sending will be disabled."
  );
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async ({ to, subject, text, html }: SendEmailParams) => {
  if (!resend) {
    console.warn(
      `Email not sent to ${to} because RESEND_API_KEY is not configured.`
    );
    // Return a success-like object to prevent breaking the auth flow
    return { success: true, data: { id: "mock_id" } };
  }

  // The 'from' address must be a verified domain on your Resend account.
  // For development, 'onboarding@resend.dev' is available.
  const from = "onboarding@resend.dev";

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log(`Email sent successfully: ${result.id}`);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};
