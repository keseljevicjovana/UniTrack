const nodemailer = require("nodemailer");

// ─── Gmail SMTP — treba GMAIL_USER i GMAIL_APP_PASSWORD u .env ─────────────
const transporter = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      family: 4,
      connectionTimeout: 10000,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  : null;

function generisiNasumicnuLozinku() {
  const karakteri = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let lozinka = "";
  for (let i = 0; i < 10; i++) {
    lozinka += karakteri[Math.floor(Math.random() * karakteri.length)];
  }
  return lozinka;
}

async function posaljiPocetnuLozinku(email, naziv, lozinka, vrstaNaloga) {
  if (!transporter) {
    console.log(`⚠️  Mejl servis nije podešen (GMAIL_USER/GMAIL_APP_PASSWORD). Lozinka za ${email}: ${lozinka}`);
    return { uspjesno: false, razlog: "Mejl servis nije podešen." };
  }

  try {
    await transporter.sendMail({
      from: `"UniTrack" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Vaš UniTrack nalog je kreiran",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #DDD0BE; border-radius: 12px;">
          <h2 style="color: #2C1A0E;">Zdravo, ${naziv}!</h2>
          <p style="color: #5C4033;">Vaš nalog na <strong>UniTrack</strong> platformi (${vrstaNaloga}) je uspješno kreiran.</p>
          <div style="background: #F5EFE7; border: 1px solid #DDD0BE; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #8B7355; font-size: 13px;">Email:</p>
            <p style="margin: 4px 0 12px; color: #2C1A0E; font-weight: bold;">${email}</p>
            <p style="margin: 0; color: #8B7355; font-size: 13px;">Privremena lozinka:</p>
            <p style="margin: 4px 0; color: #2C1A0E; font-weight: bold; font-size: 18px;">${lozinka}</p>
          </div>
          <p style="color: #5C4033; font-size: 13px;">Preporučujemo da promijenite lozinku nakon prvog logovanja (Podešavanja → Promjena lozinke).</p>
        </div>
      `,
    });
    return { uspjesno: true };
  } catch (error) {
    console.log("Greška pri slanju mejla:", error.message);
    return { uspjesno: false, razlog: error.message };
  }
}

module.exports = { generisiNasumicnuLozinku, posaljiPocetnuLozinku };