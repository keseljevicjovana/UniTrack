const BREVO_API_KEY = process.env.BREVO_API_KEY;
const POSILJALAC = process.env.GMAIL_USER || "jovanakeseljevic51@gmail.com";

function generisiNasumicnuLozinku() {
  const karakteri = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let lozinka = "";
  for (let i = 0; i < 10; i++) {
    lozinka += karakteri[Math.floor(Math.random() * karakteri.length)];
  }
  return lozinka;
}

async function posaljiPocetnuLozinku(email, naziv, lozinka, vrstaNaloga) {
  if (!BREVO_API_KEY) {
    console.log(`Mejl servis nije podesen (BREVO_API_KEY). Lozinka za ${email}: ${lozinka}`);
    return { uspjesno: false, razlog: "Mejl servis nije podesen." };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "UniTrack", email: POSILJALAC },
        to: [{ email }],
        subject: "Vas UniTrack nalog je kreiran",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #DDD0BE; border-radius: 12px;">
            <h2 style="color: #2C1A0E;">Zdravo, ${naziv}!</h2>
            <p style="color: #5C4033;">Vas nalog na <strong>UniTrack</strong> platformi (${vrstaNaloga}) je uspjesno kreiran.</p>
            <div style="background: #F5EFE7; border: 1px solid #DDD0BE; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; color: #8B7355; font-size: 13px;">Email:</p>
              <p style="margin: 4px 0 12px; color: #2C1A0E; font-weight: bold;">${email}</p>
              <p style="margin: 0; color: #8B7355; font-size: 13px;">Privremena lozinka:</p>
              <p style="margin: 4px 0; color: #2C1A0E; font-weight: bold; font-size: 18px;">${lozinka}</p>
            </div>
            <p style="color: #5C4033; font-size: 13px;">Preporucujemo da promijenite lozinku nakon prvog logovanja.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const greska = await response.text();
      throw new Error(`Brevo API ${response.status}: ${greska}`);
    }

    return { uspjesno: true };
  } catch (error) {
    console.log("Greska pri slanju mejla:", error.message);
    return { uspjesno: false, razlog: error.message };
  }
}

module.exports = { generisiNasumicnuLozinku, posaljiPocetnuLozinku };