import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// Email templates
const createUserEmail = (data: ContactFormData) => ({
  subject: "Thank you for contacting WeezIQ",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Thank You!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">We've received your message</p>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Dear <strong>${data.fullName}</strong>,
        </p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Thank you for contacting WeezIQ! We have received your message and will review it carefully.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p style="color: #666; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">Your Message:</p>
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">${data.message}</p>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          We typically respond to all inquiries within 24 hours during business days. If you have an urgent matter, please don't hesitate to reach out to us directly at <a href="mailto:support@weeziq.com" style="color: #667eea;">support@weeziq.com</a>.
        </p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Best regards,<br>
          <strong>The WeezIQ Team</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <div style="text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 5px 0;">WeezIQ - AI-Powered Chatbot Solutions</p>
          <p style="margin: 5px 0;">Gujarat, India</p>
          <p style="margin: 5px 0;">
            <a href="https://weeziq.com" style="color: #667eea;">www.weeziq.com</a> | 
            <a href="mailto:support@weeziq.com" style="color: #667eea;">support@weeziq.com</a>
          </p>
        </div>
      </div>
    </div>
  `,
});

const createAdminEmail = (data: ContactFormData) => ({
  subject: `New Contact Form Submission from ${data.fullName}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">New Contact Form Submission</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Action required</p>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Contact Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 8px 0; color: #333;">${data.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0; color: #333;">
                <a href="mailto:${data.email}" style="color: #dc3545;">${
    data.email
  }</a>
              </td>
            </tr>
            ${
              data.phone
                ? `
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0; color: #333;">${data.phone}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Date:</td>
              <td style="padding: 8px 0; color: #333;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Message:</h3>
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">${
            data.message
          }</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:${
            data.email
          }" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Reply to ${data.fullName}
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <div style="text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 5px 0;">WeezIQ Contact Form Notification</p>
          <p style="margin: 5px 0;">This is an automated message from your website contact form</p>
        </div>
      </div>
    </div>
  `,
});

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { fullName, email, message } = body;

    // Validate required fields
    if (!fullName || !email || !message) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("Missing email configuration");
      return NextResponse.json(
        { message: "Email service not configured" },
        { status: 500 }
      );
    }

    const transporter = createTransporter();

    // Send confirmation email to user
    const userEmail = createUserEmail(body);
    await transporter.sendMail({
      from: `"WeezIQ Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: userEmail.subject,
      html: userEmail.html,
    });

    // Send notification email to admin
    const adminEmail = createAdminEmail(body);
    await transporter.sendMail({
      from: `"WeezIQ Contact Form" <${process.env.GMAIL_USER}>`,
      to: "ghatakbits@gmail.com",
      subject: adminEmail.subject,
      html: adminEmail.html,
    });

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending contact form email:", error);
    return NextResponse.json(
      { message: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
