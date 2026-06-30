const PDFDocument = require("pdfkit");
const path = require("path");

// ─── BOJE (iste kao u web dizajnu aplikacije) ────────────────────────────────
const BOJA_BRAON      = "#4A3628";
const BOJA_BRAON_TAMNA= "#2C1A0E";
const BOJA_ZLATNA     = "#A0784A";
const BOJA_TEKST_SIVA = "#5C4033";
const BOJA_SVIJETLA   = "#8B7355";
const BOJA_OKVIR      = "#DDD0BE";
const BOJA_POZADINA   = "#FAF7F3";

// ─── PUTANJE DO FONTOVA — moraju postojati ova dva fajla (vidi instrukcije) ──
const FONT_REGULAR = path.join(__dirname, "..", "fonts", "Roboto-Regular.ttf");
const FONT_BOLD    = path.join(__dirname, "..", "fonts", "Roboto-Bold.ttf");

const MJESECI = [
  "januara", "februara", "marta", "aprila", "maja", "juna",
  "jula", "avgusta", "septembra", "oktobra", "novembra", "decembra",
];

function formatirajDatum(datum) {
  const d = datum ? new Date(datum) : new Date();
  return `${d.getDate()}. ${MJESECI[d.getMonth()]} ${d.getFullYear()}.`;
}

// ─── POMOĆNE FUNKCIJE ZA CRTANJE ──────────────────────────────────────────────

function nacrtajZaglavlje(doc, naziv_fakulteta) {
  doc
    .font(FONT_BOLD)
    .fontSize(16)
    .fillColor(BOJA_BRAON_TAMNA)
    .text("UNIVERZITET CRNE GORE", { align: "center" });

  doc
    .font(FONT_REGULAR)
    .fontSize(12)
    .fillColor(BOJA_TEKST_SIVA)
    .text(naziv_fakulteta || "Fakultet", { align: "center" });

  doc.moveDown(0.6);

  // Linija ispod zaglavlja
  const y = doc.y;
  doc
    .moveTo(50, y)
    .lineTo(545, y)
    .lineWidth(1.5)
    .strokeColor(BOJA_ZLATNA)
    .stroke();

  doc.moveDown(1);

  doc
    .font(FONT_BOLD)
    .fontSize(18)
    .fillColor(BOJA_ZLATNA)
    .text("DIGITALNI CV STUDENTA", { align: "center" });

  doc.moveDown(1.2);
}

function nacrtajRedPodatka(doc, labela, vrijednost) {
  const xLabela = 50;
  const xVrijednost = 200;
  const yStart = doc.y;

  doc
    .font(FONT_BOLD)
    .fontSize(10.5)
    .fillColor(BOJA_TEKST_SIVA)
    .text(labela, xLabela, yStart, { width: 140 });

  doc
    .font(FONT_REGULAR)
    .fontSize(10.5)
    .fillColor(BOJA_BRAON_TAMNA)
    .text(vrijednost || "—", xVrijednost, yStart, { width: 345 });

  doc.moveDown(0.55);
}

function nacrtajNaslovSekcije(doc, naslov) {
  doc.moveDown(0.4);
  doc
    .font(FONT_BOLD)
    .fontSize(12.5)
    .fillColor(BOJA_BRAON)
    .text(naslov.toUpperCase());

  const y = doc.y + 2;
  doc
    .moveTo(50, y)
    .lineTo(545, y)
    .lineWidth(0.75)
    .strokeColor(BOJA_OKVIR)
    .stroke();

  doc.moveDown(0.6);
}

function nacrtajTagove(doc, lista) {
  if (!lista || lista.length === 0) {
    doc.font(FONT_REGULAR).fontSize(10).fillColor(BOJA_SVIJETLA).text("Nema dovoljno podataka.");
    doc.moveDown(0.5);
    return;
  }

  let x = 50;
  let y = doc.y;
  const visinaTaga = 20;
  const razmak = 6;

  lista.forEach((tekst) => {
    const sirinaTaga = doc.font(FONT_REGULAR).fontSize(9.5).widthOfString(tekst) + 16;

    if (x + sirinaTaga > 545) {
      x = 50;
      y += visinaTaga + razmak;
    }

    doc
      .roundedRect(x, y, sirinaTaga, visinaTaga, 10)
      .fillColor(BOJA_POZADINA)
      .fillAndStroke(BOJA_POZADINA, BOJA_OKVIR);

    doc
      .font(FONT_REGULAR)
      .fontSize(9.5)
      .fillColor(BOJA_TEKST_SIVA)
      .text(tekst, x + 8, y + 5.5, { width: sirinaTaga - 16, align: "center" });

    x += sirinaTaga + razmak;
  });

  doc.y = y + visinaTaga + 8;
  doc.x = 50;
}

function nacrtajBodoviTabelu(doc, score) {
  const kolone = [
    { naziv: "Akademski (40%)", vrijednost: score?.akademski_bodovi },
    { naziv: "Vannastavni (25%)", vrijednost: score?.vannastavne_aktivnosti_bodovi },
    { naziv: "Društveni (20%)", vrijednost: score?.drustveni_doprinos_bodovi },
    { naziv: "Posebna (15%)", vrijednost: score?.posebna_postignuca_bodovi },
    { naziv: "UKUPNO", vrijednost: score?.ukupno_bodova },
  ];

  const sirinaKolone = 99;
  const startX = 50;
  const startY = doc.y;
  const visina = 42;

  kolone.forEach((k, i) => {
    const x = startX + i * sirinaKolone;
    const istaknuto = k.naziv === "UKUPNO";

    doc
      .rect(x, startY, sirinaKolone - 4, visina)
      .fillAndStroke(istaknuto ? BOJA_ZLATNA : BOJA_POZADINA, BOJA_OKVIR);

    doc
      .font(FONT_REGULAR)
      .fontSize(8)
      .fillColor(istaknuto ? "#FFFFFF" : BOJA_SVIJETLA)
      .text(k.naziv, x + 4, startY + 6, { width: sirinaKolone - 12, align: "center" });

    doc
      .font(FONT_BOLD)
      .fontSize(15)
      .fillColor(istaknuto ? "#FFFFFF" : BOJA_BRAON_TAMNA)
      .text(k.vrijednost ?? "—", x + 4, startY + 20, { width: sirinaKolone - 12, align: "center" });
  });

  doc.y = startY + visina + 14;
  doc.x = 50;
}

function nacrtajListu(doc, stavke, formatFn) {
  if (!stavke || stavke.length === 0) {
    doc.font(FONT_REGULAR).fontSize(10).fillColor(BOJA_SVIJETLA).text("Nema unesenih podataka.");
    doc.moveDown(0.5);
    return;
  }

  stavke.forEach((stavka) => {
    doc
      .font(FONT_REGULAR)
      .fontSize(10)
      .fillColor(BOJA_BRAON_TAMNA)
      .text(`•  ${formatFn(stavka)}`, { width: 495 });
    doc.moveDown(0.25);
  });

  doc.moveDown(0.4);
}

function nacrtajPotpisIPecat(doc, naziv_fakulteta) {
  // Treba nam oko 140pt prostora za cijeli blok (datum + krug + linija + labele).
  // Ako nema dovoljno mjesta do dna stranice, prebaci CIJELI blok na novu stranicu
  // (umjesto da se razbija na komade kao prije).
  const potrebnaVisina = 140;
  const dnoStranice = doc.page.height - doc.page.margins.bottom;

  if (doc.y > dnoStranice - potrebnaVisina) {
    doc.addPage();
    doc.y = doc.page.margins.top;
  }

  const y = doc.y + 20;

  doc
    .font(FONT_REGULAR)
    .fontSize(10)
    .fillColor(BOJA_TEKST_SIVA)
    .text(`Podgorica, ${formatirajDatum()}`, 50, y);

  // ── Mjesto pečata (M.P.) — lijevo, isprekidan krug ──
  const centarX = 110;
  const centarY = y + 55;
  const radijus = 30;

  doc
    .save()
    .dash(3, { space: 3 })
    .circle(centarX, centarY, radijus)
    .lineWidth(1)
    .strokeColor(BOJA_OKVIR)
    .stroke()
    .undash()
    .restore();

  doc
    .font(FONT_REGULAR)
    .fontSize(9)
    .fillColor(BOJA_SVIJETLA)
    .text("M.P.", centarX - radijus, centarY - 5, { width: radijus * 2, align: "center" });

  // ── Potpis dekana — desno, linija + labela ──
  const linijaX1 = 350;
  const linijaX2 = 545;
  const linijaY = y + 45;

  doc
    .moveTo(linijaX1, linijaY)
    .lineTo(linijaX2, linijaY)
    .lineWidth(1)
    .strokeColor(BOJA_BRAON_TAMNA)
    .stroke();

  doc
    .font(FONT_REGULAR)
    .fontSize(10)
    .fillColor(BOJA_TEKST_SIVA)
    .text("Dekan", linijaX1, linijaY + 6, { width: linijaX2 - linijaX1, align: "center" });

  doc
    .font(FONT_REGULAR)
    .fontSize(8.5)
    .fillColor(BOJA_SVIJETLA)
    .text(naziv_fakulteta || "", linijaX1, linijaY + 20, { width: linijaX2 - linijaX1, align: "center" });
}

// ─── GLAVNA FUNKCIJA — poziva se iz rute, stream-uje PDF direktno u response ──
function generisiCvPdf(res, podaci) {
  const { student, unitrackScore, kompetencije, interesovanja, preporuceneOblasti, profesionalniZakljucak, istaknutaPostignuca, aktivnosti } = podaci;

  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Digitalni_CV_${(student.jedinstveni_id || student.ime).replace(/\s+/g, "_")}.pdf"`
  );

  doc.pipe(res);

  // Registruj font koji podržava č/ć/š/ž/đ
  doc.registerFont("Roboto", FONT_REGULAR);
  doc.registerFont("Roboto-Bold", FONT_BOLD);

  nacrtajZaglavlje(doc, student.fakultet || student.naziv_fakulteta);

  nacrtajRedPodatka(doc, "Ime i prezime:", `${student.ime} ${student.prezime}`);
  nacrtajRedPodatka(doc, "Jedinstveni ID:", student.jedinstveni_id);
  nacrtajRedPodatka(doc, "Broj indeksa:", student.broj_indeksa);
  nacrtajRedPodatka(doc, "Email:", student.email || student.studentski_email);
  nacrtajRedPodatka(doc, "Smjer:", student.smjer);

  nacrtajNaslovSekcije(doc, "UniTrack bodovi");
  nacrtajBodoviTabelu(doc, unitrackScore);

  nacrtajNaslovSekcije(doc, "Kompetencije");
  nacrtajTagove(doc, kompetencije);

  nacrtajNaslovSekcije(doc, "Interesovanja");
  nacrtajTagove(doc, interesovanja);

  nacrtajNaslovSekcije(doc, "Preporučene oblasti");
  nacrtajTagove(doc, preporuceneOblasti);

  nacrtajNaslovSekcije(doc, "Profesionalni profil");
  doc
    .font(FONT_REGULAR)
    .fontSize(10.5)
    .fillColor(BOJA_BRAON_TAMNA)
    .text(profesionalniZakljucak, { width: 495, align: "justify" });
  doc.moveDown(0.6);

  nacrtajNaslovSekcije(doc, "Istaknuta postignuća");
  nacrtajListu(doc, istaknutaPostignuca, (p) => `${p.naziv}${p.naziv_firme ? ` — ${p.naziv_firme}` : ""} (${formatirajDatum(p.datum_aktivnosti)})`);

  nacrtajNaslovSekcije(doc, "Vannastavne aktivnosti");
  nacrtajListu(doc, aktivnosti, (a) => `${a.naziv}${a.naziv_firme ? ` — ${a.naziv_firme}` : ""} (${formatirajDatum(a.datum_aktivnosti)})`);

  nacrtajPotpisIPecat(doc, student.fakultet || student.naziv_fakulteta);

  doc.end();
}

module.exports = { generisiCvPdf };