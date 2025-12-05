// server.js
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// TODO: अपनी SMTP settings भरो
const transporter = nodemailer.createTransport({
  host: "smtp.yourprovider.com",
  port: 587,
  secure: false,
  auth: {
    user: "your-smtp-user@example.com",
    pass: "your-smtp-password",
  },
});

const NEZE_EMAIL = "sales@neze.example.com"; // company email (change this)

// health
app.get("/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.post("/api/contact", async (req, res) => {
  const { name, email, organisation, interest, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email and message are required." });
  }

  try {
    // 1) Email to NEZE
    await transporter.sendMail({
      from: `"NEZE Website" <${NEZE_EMAIL}>`,
      to: NEZE_EMAIL,
      subject: `New client request from ${name}`,
      html: `
        <h3>New client request</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Organisation:</b> ${organisation || "-"}</p>
        <p><b>Interested in:</b> ${interest || "-"}</p>
        <p><b>Message:</b><br>${message.replace(/\n/g,"<br>")}</p>
      `,
    });

    // 2) Thank-you email to client
    await transporter.sendMail({
      from: `"NEZE" <${NEZE_EMAIL}>`,
      to: email,
      subject: "Thank you for reaching out to NEZE",
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out to NEZE. We have received your request and our team will get back to you shortly.</p>
        <p><b>Your details:</b></p>
        <ul>
          <li>Organisation: ${organisation || "-"}</li>
          <li>Interested in: ${interest || "-"}</li>
        </ul>
        <p>Regards,<br>Team NEZE</p>
      `,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send email. Check server logs." });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`NEZE server running on http://localhost:${PORT}`);
});
