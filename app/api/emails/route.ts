import nodemailer from "nodemailer";

export async function GET(req: Request) {
  try {
    // Get query params from the request URL
    const { searchParams } = new URL(req.url);
    const to = searchParams.get("to") || "ibrahimabdulkarim193@gmail.com";
    const subject = searchParams.get("subject") || "Test Email";
    const text = searchParams.get("text") || "Hey, we're just testing this email!";

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your app password
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Next.js App" <${process.env.EMAIL}>`,
      to,
      subject,
      text,
    });

    return Response.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
