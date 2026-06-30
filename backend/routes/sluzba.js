const express = require("express");
const router = express.Router();

const db = require("../config/db");
const bcrypt = require("bcrypt");
const multer = require("multer");
const XLSX = require("xlsx");

const requireSluzba = require("../middleware/requireSluzba");
const { generisiCvPdf } = require("../utils/pdfGenerator");

const upload = multer({ storage: multer.memoryStorage() });

// ─── Iste funkcije kao u student.js — potrebne da bismo generisali identičan
// CV sadržaj kad sluzba preuzima PDF (mora se poklapati sa onim što student
// vidi u svom Digitalnom CV-u) ────────────────────────────────────────────────
function generisiKompetencije(student, aktivnosti) {
  const kompetencije = new Set();
  const interesovanja = new Set();
  const preporuceneOblasti = new Set();

  const smjer = (student.smjer || "").toLowerCase();

  if (smjer.includes("računar") || smjer.includes("racunar")) {
    kompetencije.add("Programiranje");
    kompetencije.add("Rješavanje problema");
    kompetencije.add("Analitičko razmišljanje");
    kompetencije.add("Baze podataka");
    kompetencije.add("Web razvoj");
    preporuceneOblasti.add("Softverski razvoj");
    preporuceneOblasti.add("Backend razvoj");
    preporuceneOblasti.add("Data analiza");
  }

  if (smjer.includes("matemat")) {
    kompetencije.add("Matematičko modelovanje");
    kompetencije.add("Logičko razmišljanje");
    kompetencije.add("Statistička analiza");
    preporuceneOblasti.add("Analitika podataka");
    preporuceneOblasti.add("Finansijska analiza");
  }

  if (smjer.includes("biolog")) {
    kompetencije.add("Istraživački rad");
    kompetencije.add("Analiza podataka");
    kompetencije.add("Naučna metodologija");
    preporuceneOblasti.add("Laboratorijski rad");
    preporuceneOblasti.add("Istraživanje");
  }

  aktivnosti.forEach((aktivnost) => {
    const tekst = `${aktivnost.tip || ""} ${aktivnost.naziv || ""} ${aktivnost.opis || ""}`.toLowerCase();

    if (aktivnost.tip === "praksa") {
      kompetencije.add("Praktično iskustvo");
      kompetencije.add("Profesionalna odgovornost");
      interesovanja.add("Praksa i profesionalni razvoj");
    }
    if (aktivnost.tip === "radionica") {
      kompetencije.add("Spremnost na učenje");
      kompetencije.add("Usavršavanje");
      interesovanja.add("Edukacija i razvoj vještina");
    }
    if (aktivnost.tip === "dogadjaj") {
      kompetencije.add("Organizacione vještine");
      kompetencije.add("Komunikacija");
      interesovanja.add("Događaji i timski rad");
    }
    if (aktivnost.tip === "volontiranje") {
      kompetencije.add("Timski rad");
      kompetencije.add("Društvena odgovornost");
      kompetencije.add("Komunikacione vještine");
      interesovanja.add("Društveni doprinos");
    }
    if (tekst.includes("ai") || tekst.includes("vještačka") || tekst.includes("vestacka")) {
      interesovanja.add("Vještačka inteligencija");
      preporuceneOblasti.add("AI rješenja");
    }
    if (tekst.includes("web")) {
      interesovanja.add("Web razvoj");
      preporuceneOblasti.add("Frontend/Backend razvoj");
    }
    if (tekst.includes("data") || tekst.includes("podaci")) {
      interesovanja.add("Analiza podataka");
      preporuceneOblasti.add("Data Science");
    }
    if (tekst.includes("hakaton") || tekst.includes("takmičenje") || tekst.includes("takmicenje")) {
      kompetencije.add("Rad pod pritiskom");
      kompetencije.add("Kreativno rješavanje problema");
      interesovanja.add("Takmičenja i inovacije");
    }
    if (tekst.includes("projekat") || tekst.includes("projekt")) {
      kompetencije.add("Projektni rad");
      kompetencije.add("Samostalnost u radu");
    }
  });

  return {
    kompetencije: Array.from(kompetencije),
    interesovanja: Array.from(interesovanja),
    preporuceneOblasti: Array.from(preporuceneOblasti),
  };
}

function generisiProfesionalniZakljucak(student, kompetencije, interesovanja, preporuceneOblasti) {
  const ime = student.ime;
  const smjer = student.smjer || "odabrane oblasti";

  const kompetencijeTekst = kompetencije.length > 0 ? kompetencije.slice(0, 4).join(", ") : "odgovornost, spremnost na učenje i profesionalni razvoj";
  const interesovanjaTekst = interesovanja.length > 0 ? interesovanja.slice(0, 4).join(", ") : "stručno usavršavanje i razvoj karijere";
  const oblastiTekst = preporuceneOblasti.length > 0 ? preporuceneOblasti.slice(0, 4).join(", ") : "oblasti povezane sa studijskim programom";

  return `${ime} je student smjera ${smjer} koji kroz akademski rad, aktivnosti i dodatna angažovanja pokazuje razvijene kompetencije kao što su ${kompetencijeTekst}. Na osnovu zabilježenih podataka, posebno se ističu interesovanja u oblastima: ${interesovanjaTekst}. Student se preporučuje za oblasti kao što su: ${oblastiTekst}.`;
}

// ─── OCJENA na osnovu bodova: F<50, E 50-59, D 60-69, C 70-79, B 80-89, A 90-100
function izracunajOcjenu(bodovi) {
  const b = Number(bodovi) || 0;
  if (b >= 90) return "A";
  if (b >= 80) return "B";
  if (b >= 70) return "C";
  if (b >= 60) return "D";
  if (b >= 50) return "E";
  return "F";
}

// ─── DASHBOARD — AŽURIRANO: dodato naziv_fakulteta/email u "user" objekat ───
router.get("/dashboard", requireSluzba, async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;

    const [[sluzbaInfo]] = await db.query(
      "SELECT naziv_fakulteta, email FROM studentske_sluzbe WHERE id = ?",
      [sluzbaId]
    );

    const [[brojStudenata]] = await db.query(
      `
      SELECT COUNT(*) AS ukupno
      FROM studenti
      WHERE studentska_sluzba_id = ?
      `,
      [sluzbaId]
    );

    const [[brojPredmeta]] = await db.query(
      `
      SELECT COUNT(*) AS ukupno
      FROM predmeti
      WHERE studentska_sluzba_id = ?
      `,
      [sluzbaId]
    );

    const [[brojZahtjeva]] = await db.query(
      `
      SELECT COUNT(*) AS ukupno
      FROM zahtjevi_za_stampanje_cv
      WHERE studentska_sluzba_id = ?
      `,
      [sluzbaId]
    );

    res.json({
      success: true,
      statistika: {
        studenti: brojStudenata.ukupno,
        predmeti: brojPredmeta.ukupno,
        zahtjevi: brojZahtjeva.ukupno
      },
      user: {
        ...req.session.user,
        naziv_fakulteta: sluzbaInfo?.naziv_fakulteta,
        email: sluzbaInfo?.email,
      }
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška na serveru"
    });
  }
});

router.get("/studenti", requireSluzba, async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;

    const [studenti] = await db.query(
      `
      SELECT
        s.id,
        s.ime,
        s.prezime,
        s.jedinstveni_id,
        s.studentski_email,
        s.broj_indeksa,
        s.godina_studija,
        s.smjer,
        s.jmbg,
        bs.ukupno_bodova
      FROM studenti s
      LEFT JOIN bodovi_studenata bs ON bs.student_id = s.id
      WHERE s.studentska_sluzba_id = ?
      ORDER BY s.prezime, s.ime
      `,
      [sluzbaId]
    );

    res.json({
      success: true,
      count: studenti.length,
      studenti
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška na serveru"
    });
  }
});

router.get("/cv-zahtjevi", requireSluzba, async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;

    const [zahtjevi] = await db.query(
      `
      SELECT
        z.id,
        z.status,
        z.poruka,
        z.datum_zahtjeva,
        s.id AS student_id,
        s.ime,
        s.prezime,
        s.jedinstveni_id
      FROM zahtjevi_za_stampanje_cv z
      JOIN studenti s
        ON z.student_id = s.id
      WHERE z.studentska_sluzba_id = ?
      ORDER BY z.datum_zahtjeva DESC
      `,
      [sluzbaId]
    );

    res.json({
      success: true,
      count: zahtjevi.length,
      zahtjevi
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška na serveru"
    });
  }
});

// ─── POSEBNA POSTIGNUĆA — pojedinačni unos preko Student ID-a ──────────────
// Dodaje (ne resetuje!) bodove na postojeću posebna_postignuca_bodovi vrijednost.
// NE čita i NE prikazuje akademski/vannastavne/drustveni bodovi - sluzba ih
// ne smije vidjeti, ovo je SLIJEPO dodavanje samo na ovu jednu kategoriju.
router.post("/posebna-postignuca", requireSluzba, async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;
    const { jedinstveni_id, bodovi } = req.body;

    if (!jedinstveni_id || bodovi === undefined || bodovi === null || bodovi === "") {
      return res.status(400).json({
        success: false,
        message: "Jedinstveni ID studenta i bodovi su obavezni.",
      });
    }

    const [[student]] = await db.query(
      "SELECT id, ime, prezime FROM studenti WHERE jedinstveni_id = ? AND studentska_sluzba_id = ?",
      [jedinstveni_id, sluzbaId]
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student sa ID-om "${jedinstveni_id}" nije pronađen.`,
      });
    }

    const dodatniBodovi = Number(bodovi) || 0;

    await db.query(
      "INSERT IGNORE INTO bodovi_studenata (student_id) VALUES (?)",
      [student.id]
    );

    await db.query(
      "UPDATE bodovi_studenata SET posebna_postignuca_bodovi = posebna_postignuca_bodovi + ? WHERE student_id = ?",
      [dodatniBodovi, student.id]
    );

    res.json({
      success: true,
      message: `Dodato ${dodatniBodovi} bodova za posebna postignuća — ${student.ime} ${student.prezime}.`,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri unosu posebnih postignuća.",
    });
  }
});

router.put("/cv-zahtjev/:id", requireSluzba, async (req, res) => {
  try {
    const { status } = req.body;
    const sluzbaId = req.session.user.id;

    // Pronađi zahtjev i provjeri da pripada ovoj sluzbi
    const [[zahtjev]] = await db.query(
      `SELECT student_id, studentska_sluzba_id FROM zahtjevi_za_stampanje_cv WHERE id = ?`,
      [req.params.id]
    );

    if (!zahtjev || zahtjev.studentska_sluzba_id !== sluzbaId) {
      return res.status(404).json({
        success: false,
        message: "Zahtjev nije pronađen.",
      });
    }

    // Ako se zahtjev ODOBRAVA (status -> zavrseno), provjeri da je student
    // STVARNO položio sve obavezne predmete na koje je upisan (server-side,
    // ne vjerujemo samo frontend-u/ranijoj provjeri u trenutku slanja zahtjeva)
    if (status === "zavrseno") {
      const [[nepolozeni]] = await db.query(
        `
        SELECT COUNT(*) AS ukupno
        FROM upisi_predmeta up
        JOIN predmeti p ON up.predmet_id = p.id
        LEFT JOIN rezultati r ON r.predmet_id = p.id
        LEFT JOIN rezultat_studenta rs
          ON rs.rezultat_id = r.id AND rs.student_id = up.student_id
        WHERE up.student_id = ?
          AND p.obavezan = true
          AND (rs.bodovi IS NULL OR rs.bodovi < 50)
        `,
        [zahtjev.student_id]
      );

      if (nepolozeni.ukupno > 0) {
        return res.status(400).json({
          success: false,
          message: "STUDENT NIJE POLOŽIO SVE ISPITE",
          nepolozeni_predmeti: nepolozeni.ukupno,
        });
      }
    }

    await db.query(
      `
      UPDATE zahtjevi_za_stampanje_cv
      SET status = ?
      WHERE id = ?
      `,
      [status, req.params.id]
    );

    res.json({
      success: true,
      message: "Status zahtjeva ažuriran"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška na serveru"
    });
  }
});

// ─── PREUZIMANJE PDF-A ODOBRENOG DIGITALNOG CV-A ────────────────────────────
// Dostupno samo za zahtjeve čiji je status "zavrseno" (odobreno), i samo za
// zahtjeve koji pripadaju ovoj studentskoj službi.
router.get("/zahtjev/:id/pdf", requireSluzba, async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;

    const [[zahtjev]] = await db.query(
      `SELECT id, student_id, status FROM zahtjevi_za_stampanje_cv WHERE id = ? AND studentska_sluzba_id = ?`,
      [req.params.id, sluzbaId]
    );

    if (!zahtjev) {
      return res.status(404).json({ success: false, message: "Zahtjev nije pronađen." });
    }

    if (zahtjev.status !== "zavrseno") {
      return res.status(400).json({ success: false, message: "Dokument je dostupan samo za odobrene zahtjeve." });
    }

    const studentId = zahtjev.student_id;

    const [[student]] = await db.query(
      `
      SELECT s.id, s.ime, s.prezime, s.studentski_email, s.jedinstveni_id,
             s.broj_indeksa, s.smjer, s.profesionalni_profil_ai, ss.naziv_fakulteta
      FROM studenti s
      JOIN studentske_sluzbe ss ON s.studentska_sluzba_id = ss.id
      WHERE s.id = ?
      `,
      [studentId]
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student nije pronađen." });
    }

    const [aktivnosti] = await db.query(
      `
      SELECT a.id, a.tip, a.naziv, a.opis, a.datum_aktivnosti, f.naziv_firme
      FROM aktivnosti_studenata a
      LEFT JOIN firme f ON a.firma_id = f.id
      WHERE a.student_id = ?
      ORDER BY a.datum_aktivnosti DESC
      `,
      [studentId]
    );

    const [istaknutaPostignuca] = await db.query(
      `
      SELECT a.id, a.tip, a.naziv, a.opis, a.datum_aktivnosti, f.naziv_firme
      FROM aktivnosti_studenata a
      LEFT JOIN firme f ON a.firma_id = f.id
      WHERE a.student_id = ?
        AND (
          a.naziv LIKE '%nagrada%' OR a.naziv LIKE '%takmičenje%' OR a.naziv LIKE '%takmicenje%'
          OR a.naziv LIKE '%hakaton%' OR a.naziv LIKE '%sertifikat%'
          OR a.opis LIKE '%nagrada%' OR a.opis LIKE '%takmičenje%' OR a.opis LIKE '%takmicenje%'
          OR a.opis LIKE '%hakaton%' OR a.opis LIKE '%sertifikat%'
        )
      ORDER BY a.datum_aktivnosti DESC
      `,
      [studentId]
    );

    const [[unitrackScore]] = await db.query(
      `
      SELECT akademski_bodovi, vannastavne_aktivnosti_bodovi, drustveni_doprinos_bodovi, posebna_postignuca_bodovi, ukupno_bodova
      FROM bodovi_studenata
      WHERE student_id = ?
      `,
      [studentId]
    );

    const analiza = generisiKompetencije(student, aktivnosti);

    // Koristi ISTI tekst koji je student vidio (sačuvan kad je prvi put otvorio
    // svoj Digitalni CV). Ako iz nekog razloga ne postoji (rijedak slučaj -
    // npr. zahtjev je nekako stigao bez da je student ikad otvorio CV stranicu),
    // koristi kalup kao rezervu - nikad ne pucamo.
    const profesionalniZakljucak = student.profesionalni_profil_ai
      || generisiProfesionalniZakljucak(student, analiza.kompetencije, analiza.interesovanja, analiza.preporuceneOblasti);

    generisiCvPdf(res, {
      student: {
        ime: student.ime,
        prezime: student.prezime,
        email: student.studentski_email,
        jedinstveni_id: student.jedinstveni_id,
        broj_indeksa: student.broj_indeksa,
        smjer: student.smjer,
        fakultet: student.naziv_fakulteta,
      },
      unitrackScore: unitrackScore || null,
      kompetencije: analiza.kompetencije,
      interesovanja: analiza.interesovanja,
      preporuceneOblasti: analiza.preporuceneOblasti,
      profesionalniZakljucak,
      istaknutaPostignuca,
      aktivnosti,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Greška pri generisanju PDF dokumenta." });
  }
});

// ─── PRESJEK OCJENA — sluzba moze SAMO da vidi ocjene studenta (read-only) ──
router.get("/studenti/:id/ocjene", requireSluzba, async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;
    const { id } = req.params;

    const [[student]] = await db.query(
      "SELECT id, ime, prezime, jedinstveni_id FROM studenti WHERE id = ? AND studentska_sluzba_id = ?",
      [id, sluzbaId]
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student nije pronađen." });
    }

    const [ocjene] = await db.query(
      `
      SELECT
        COALESCE(p.naziv, r.naziv) AS predmet,
        rs.bodovi,
        rs.ocjena,
        rs.polozen,
        r.datum_objave AS datum
      FROM rezultat_studenta rs
      JOIN rezultati r ON rs.rezultat_id = r.id
      LEFT JOIN predmeti p ON r.predmet_id = p.id
      WHERE rs.student_id = ?
      ORDER BY r.datum_objave DESC
      `,
      [id]
    );

    res.json({
      success: true,
      student,
      ocjene,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Greška pri učitavanju ocjena." });
  }
});

// ─── NOVO: BULK UNOS BODOVA PUTEM EXCEL FAJLA ───────────────────────────────
// Excel mora imati kolone: jedinstveni_id, akademski_bodovi,
// vannastavne_aktivnosti_bodovi, drustveni_doprinos_bodovi, posebna_postignuca_bodovi
router.post("/upload-bodovi", requireSluzba, upload.single("file"), async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel fajl nije priložen.",
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let azurirano = 0;
    const greske = [];

    for (const row of rows) {
      const jedinstveniId = row.jedinstveni_id;

      if (!jedinstveniId) {
        greske.push("Red bez jedinstveni_id je propušten.");
        continue;
      }

      const [[student]] = await db.query(
        `
        SELECT id
        FROM studenti
        WHERE jedinstveni_id = ?
          AND studentska_sluzba_id = ?
        `,
        [jedinstveniId, sluzbaId]
      );

      if (!student) {
        greske.push(`Student sa ID ${jedinstveniId} nije pronađen.`);
        continue;
      }

      const akademski   = Number(row.akademski_bodovi) || 0;
      const vannastavne = Number(row.vannastavne_aktivnosti_bodovi) || 0;
      const drustveni   = Number(row.drustveni_doprinos_bodovi) || 0;
      const posebna     = Number(row.posebna_postignuca_bodovi) || 0;

      const [postojeci] = await db.query(
        "SELECT id FROM bodovi_studenata WHERE student_id = ?",
        [student.id]
      );

      if (postojeci.length === 0) {
        await db.query(
          `
          INSERT INTO bodovi_studenata
          (student_id, akademski_bodovi, vannastavne_aktivnosti_bodovi,
           drustveni_doprinos_bodovi, posebna_postignuca_bodovi)
          VALUES (?, ?, ?, ?, ?)
          `,
          [student.id, akademski, vannastavne, drustveni, posebna]
        );
      } else {
        await db.query(
          `
          UPDATE bodovi_studenata
          SET akademski_bodovi = ?,
              vannastavne_aktivnosti_bodovi = ?,
              drustveni_doprinos_bodovi = ?,
              posebna_postignuca_bodovi = ?
          WHERE student_id = ?
          `,
          [akademski, vannastavne, drustveni, posebna, student.id]
        );
      }

      azurirano++;
    }

    res.json({
      success: true,
      message: `Uspješno ažurirano ${azurirano} studenata.`,
      greske,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri obradi Excel fajla.",
    });
  }
});

// ─── REZULTATI ISPITA — lista postojećih (za pregled prije/poslije unosa) ────
router.get("/rezultati", requireSluzba, async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;

    const [rezultati] = await db.query(
      `
      SELECT 
        r.id, r.tip, r.naziv, r.opis, r.datum_objave,
        COUNT(rs.id) AS broj_unesenih
      FROM rezultati r
      LEFT JOIN rezultat_studenta rs ON rs.rezultat_id = r.id
      WHERE r.studentska_sluzba_id = ?
      GROUP BY r.id
      ORDER BY r.datum_objave DESC
      `,
      [sluzbaId]
    );

    res.json({
      success: true,
      rezultati,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri učitavanju rezultata.",
    });
  }
});

// ─── TIPOVI BODOVA — koriste se za komponente ocjene po predmetu ─────────────
const TIP_BODA_OPCIJE = [
  "prisustvo",
  "test",
  "kolokvijum_redovni",
  "kolokvijum_popravni",
  "zavrsni_redovni",
  "zavrsni_popravni",
];

// ─── NOVO: UNOS BODOVA PO PREDMETU PUTEM EXCEL FAJLA ────────────────────────
// Sluzba bira PREDMET i TIP BODOVA (prisustvo/test/kolokvijum.../zavrsni...),
// pa uploaduje Excel (jedinstveni_id, bodovi). Bodovi se čuvaju kao komponenta
// u "bodovi_komponente", a zatim se UKUPAN broj bodova za predmet preračunava:
// - prisustvo i test SE SABIRAJU
// - za kolokvijum i završni, računa se POSLJEDNJA urađena provjera
//   (popravni zamjenjuje redovni, ne sabiraju se)
// Konačan zbir se upisuje u rezultat_studenta (bodovi, ocjena, polozen).
router.post("/upload-ocjene", requireSluzba, upload.single("file"), async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;
    const { predmet_id, tip_boda, opis } = req.body;

    if (!predmet_id || !tip_boda) {
      return res.status(400).json({
        success: false,
        message: "Predmet i tip bodova su obavezni.",
      });
    }

    if (!TIP_BODA_OPCIJE.includes(tip_boda)) {
      return res.status(400).json({
        success: false,
        message: "Nepoznat tip bodova.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel fajl nije priložen.",
      });
    }

    // Provjeri da predmet pripada ovoj sluzbi
    const [[predmet]] = await db.query(
      "SELECT id, naziv FROM predmeti WHERE id = ? AND studentska_sluzba_id = ?",
      [predmet_id, sluzbaId]
    );

    if (!predmet) {
      return res.status(404).json({
        success: false,
        message: "Predmet nije pronađen.",
      });
    }

    // Pronađi postojeći "rezultat" (zbirni rezultat) za ovaj predmet, ili kreiraj novi
    const [[postojeciRezultat]] = await db.query(
      "SELECT id FROM rezultati WHERE predmet_id = ? AND studentska_sluzba_id = ?",
      [predmet_id, sluzbaId]
    );

    let rezultatId;
    if (postojeciRezultat) {
      rezultatId = postojeciRezultat.id;
      if (opis) {
        await db.query("UPDATE rezultati SET opis = ? WHERE id = ?", [opis, rezultatId]);
      }
    } else {
      const [insertResult] = await db.query(
        `
        INSERT INTO rezultati (studentska_sluzba_id, tip, naziv, opis, predmet_id)
        VALUES (?, 'ispit', ?, ?, ?)
        `,
        [sluzbaId, predmet.naziv, opis || null, predmet_id]
      );
      rezultatId = insertResult.insertId;
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let azurirano = 0;
    const greske = [];
    const pogodjeniStudenti = new Set();

    for (const row of rows) {
      const jedinstveniId = row.jedinstveni_id;

      if (!jedinstveniId) {
        greske.push("Red bez jedinstveni_id je propušten.");
        continue;
      }

      const [[student]] = await db.query(
        `
        SELECT id
        FROM studenti
        WHERE jedinstveni_id = ?
          AND studentska_sluzba_id = ?
        `,
        [jedinstveniId, sluzbaId]
      );

      if (!student) {
        greske.push(`Student sa ID ${jedinstveniId} nije pronađen.`);
        continue;
      }

      const bodovi = Number(row.bodovi) || 0;

      // Upiši/ažuriraj komponentu bodova za ovaj tip
      await db.query(
        `
        INSERT INTO bodovi_komponente (rezultat_id, student_id, tip_boda, bodovi)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE bodovi = VALUES(bodovi)
        `,
        [rezultatId, student.id, tip_boda, bodovi]
      );

      pogodjeniStudenti.add(student.id);
      azurirano++;
    }

    // ─── Preračunaj KONAČAN zbir bodova za svakog pogođenog studenta ──────────
    for (const studentId of pogodjeniStudenti) {
      const [komponente] = await db.query(
        "SELECT tip_boda, bodovi FROM bodovi_komponente WHERE rezultat_id = ? AND student_id = ?",
        [rezultatId, studentId]
      );

      let osnovniZbir = 0;
      let kolokvijumRedovni = null;
      let kolokvijumPopravni = null;
      let zavrsniRedovni = null;
      let zavrsniPopravni = null;

      komponente.forEach((k) => {
        const b = Number(k.bodovi) || 0;
        if (k.tip_boda === "prisustvo" || k.tip_boda === "test") osnovniZbir += b;
        if (k.tip_boda === "kolokvijum_redovni") kolokvijumRedovni = b;
        if (k.tip_boda === "kolokvijum_popravni") kolokvijumPopravni = b;
        if (k.tip_boda === "zavrsni_redovni") zavrsniRedovni = b;
        if (k.tip_boda === "zavrsni_popravni") zavrsniPopravni = b;
      });

      // Popravni (ako postoji) ZAMJENJUJE redovni — ne sabiraju se, računa se posljednji
      const kolokvijumFinalno = kolokvijumPopravni !== null ? kolokvijumPopravni : (kolokvijumRedovni || 0);
      const zavrsniFinalno = zavrsniPopravni !== null ? zavrsniPopravni : (zavrsniRedovni || 0);

      const ukupnoBodova = osnovniZbir + kolokvijumFinalno + zavrsniFinalno;
      const ocjena = izracunajOcjenu(ukupnoBodova);
      const polozen = ukupnoBodova >= 50 ? 1 : 0;

      await db.query(
        `
        INSERT INTO rezultat_studenta (rezultat_id, student_id, bodovi, ocjena, polozen)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          bodovi = VALUES(bodovi),
          ocjena = VALUES(ocjena),
          polozen = VALUES(polozen)
        `,
        [rezultatId, studentId, ukupnoBodova, ocjena, polozen]
      );
    }

    res.json({
      success: true,
      message: `Bodovi tipa "${tip_boda}" su uneseni za predmet "${predmet.naziv}". Ažurirano ${azurirano} studenata — ukupan rezultat je preračunat.`,
      greske,
      rezultat_id: rezultatId,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri obradi Excel fajla.",
    });
  }
});

router.put("/settings/password", requireSluzba, async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;

    const {
      staraLozinka,
      novaLozinka,
      potvrdaLozinke
    } = req.body;

    if (
      !staraLozinka ||
      !novaLozinka ||
      !potvrdaLozinke
    ) {
      return res.status(400).json({
        success: false,
        message: "Sva polja su obavezna"
      });
    }

    if (novaLozinka !== potvrdaLozinke) {
      return res.status(400).json({
        success: false,
        message: "Lozinke se ne poklapaju"
      });
    }

    const [[sluzba]] = await db.query(
      `
      SELECT lozinka
      FROM studentske_sluzbe
      WHERE id = ?
      `,
      [sluzbaId]
    );

    const validnaLozinka = await bcrypt.compare(
      staraLozinka,
      sluzba.lozinka
    );

    if (!validnaLozinka) {
      return res.status(400).json({
        success: false,
        message: "Stara lozinka nije tačna"
      });
    }

    const hashedPassword = await bcrypt.hash(
      novaLozinka,
      10
    );

    await db.query(
      `
      UPDATE studentske_sluzbe
      SET lozinka = ?
      WHERE id = ?
      `,
      [hashedPassword, sluzbaId]
    );

    res.json({
      success: true,
      message: "Lozinka promijenjena"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška na serveru"
    });
  }
});

// ─── UPISNI PERIOD — samo čitanje (sluzba ne može mijenjati, samo Admin) ────
router.get("/upisni-period", requireSluzba, async (req, res) => {
  try {
    const [[period]] = await db.query("SELECT * FROM upisni_period WHERE id = 1");

    res.json({
      success: true,
      period,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri učitavanju upisnog perioda.",
    });
  }
});

// ─── PREDMETI — lista i dodavanje (potrebno da bi se moglo upisivati) ───────
router.get("/predmeti", requireSluzba, async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;

    const [predmeti] = await db.query(
      `
      SELECT 
        p.id, p.naziv, p.sifra_predmeta, p.semestar, p.godina_studija, p.espb, p.obavezan,
        GROUP_CONCAT(ps.smjer ORDER BY ps.smjer SEPARATOR ', ') AS smjerovi
      FROM predmeti p
      LEFT JOIN predmet_smjerovi ps ON ps.predmet_id = p.id
      WHERE p.studentska_sluzba_id = ?
      GROUP BY p.id
      ORDER BY p.godina_studija ASC, p.semestar ASC, p.naziv ASC
      `,
      [sluzbaId]
    );

    res.json({
      success: true,
      predmeti,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri učitavanju predmeta.",
    });
  }
});

router.post("/predmeti", requireSluzba, async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;
    const { naziv, smjerovi, sifra_predmeta, semestar, godina_studija, espb, obavezan } = req.body;

    if (!naziv || !semestar || !godina_studija) {
      return res.status(400).json({
        success: false,
        message: "Naziv, semestar i godina studija su obavezni.",
      });
    }

    // smjerovi stize kao niz (moze biti i jedan element, ili prazan niz)
    const smjeroviNiz = Array.isArray(smjerovi) ? smjerovi.filter(Boolean) : [];

    // Provjeri da li predmet sa ISTIM nazivom već postoji za ovu sluzbu
    // (case-insensitive) - ako da, samo dodajemo nove veze na smjer, ne
    // pravimo duplikat predmeta.
    const [[postojeci]] = await db.query(
      `SELECT id FROM predmeti WHERE studentska_sluzba_id = ? AND LOWER(naziv) = LOWER(?)`,
      [sluzbaId, naziv]
    );

    let predmetId;
    if (postojeci) {
      predmetId = postojeci.id;
    } else {
      const [result] = await db.query(
        `
        INSERT INTO predmeti
        (studentska_sluzba_id, naziv, sifra_predmeta, semestar, godina_studija, espb, obavezan)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [sluzbaId, naziv, sifra_predmeta || null, semestar, godina_studija, espb || 0, obavezan ? 1 : 0]
      );
      predmetId = result.insertId;
    }

    for (const smjer of smjeroviNiz) {
      await db.query(
        `INSERT IGNORE INTO predmet_smjerovi (predmet_id, smjer) VALUES (?, ?)`,
        [predmetId, smjer]
      );
    }

    res.json({
      success: true,
      message: postojeci
        ? "Predmet već postoji - dodate su nove veze na smjer(ove)."
        : "Predmet je uspješno dodat.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri dodavanju predmeta.",
    });
  }
});

// ─── DODAJ NOVOG STUDENTA (za upis na 1. godinu, student još ne postoji) ────
function generisiNasumicnuLozinku() {
  const karakteri = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let lozinka = "";
  for (let i = 0; i < 10; i++) {
    lozinka += karakteri[Math.floor(Math.random() * karakteri.length)];
  }
  return lozinka;
}

router.post("/studenti", requireSluzba, async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;
    const { ime, prezime, jmbg, studentski_email, broj_indeksa, smjer } = req.body;

    if (!ime || !prezime || !jmbg || !studentski_email || !broj_indeksa || !smjer) {
      return res.status(400).json({
        success: false,
        message: "Sva polja su obavezna.",
      });
    }

    // ─── Auto-generiši jedinstveni_id — pronađi prefiks i sledeći broj na
    // osnovu postojećih ID-jeva ove sluzbe (npr. PMF187 -> PMF188) ──────────
    const [postojeci] = await db.query(
      `SELECT jedinstveni_id FROM studenti WHERE studentska_sluzba_id = ?`,
      [sluzbaId]
    );

    let prefiks = "STU";
    let maxBroj = 0;
    for (const p of postojeci) {
      const match = (p.jedinstveni_id || "").match(/^([A-Za-z]+)(\d+)$/);
      if (match) {
        prefiks = match[1];
        maxBroj = Math.max(maxBroj, parseInt(match[2], 10));
      }
    }
    const jedinstveniId = `${prefiks}${String(maxBroj + 1).padStart(3, "0")}`;

    // ─── Auto-generiši nasumičnu lozinku ────────────────────────────────────
    const lozinka = generisiNasumicnuLozinku();
    const hashedPassword = await bcrypt.hash(lozinka, 10);

    // Sluzba moze dodavati SAMO nove studente prve godine (brucose) - bez
    // obzira sta stigne u req.body, godina_studija je uvijek fiksirana na 1.
    const [result] = await db.query(
      `
      INSERT INTO studenti
      (uloga_id, studentska_sluzba_id, ime, prezime, jmbg, jedinstveni_id,
       studentski_email, lozinka, broj_indeksa, godina_studija, smjer)
      VALUES (4, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `,
      [sluzbaId, ime, prezime, jmbg, jedinstveniId, studentski_email, hashedPassword, broj_indeksa, smjer]
    );

    res.json({
      success: true,
      message: "Student je uspješno dodat.",
      student_id: result.insertId,
      jedinstveni_id: jedinstveniId,
      lozinka,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri dodavanju studenta (JMBG ili email možda već postoje).",
    });
  }
});

// ─── UPIS NA PREDMETE — samo kad je upisni period aktivan ───────────────────
router.post("/upisi", requireSluzba, async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;
    const { student_id, godina_studija, predmet_ids } = req.body;

    const [[period]] = await db.query(
      "SELECT aktivan, akademska_godina FROM upisni_period WHERE id = 1"
    );

    if (!period?.aktivan) {
      return res.status(403).json({
        success: false,
        message: "Upisni period nije aktivan. Obratite se administratoru.",
      });
    }

    if (!student_id || !godina_studija || !Array.isArray(predmet_ids) || predmet_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Student, godina studija i bar jedan predmet su obavezni.",
      });
    }

    const [[student]] = await db.query(
      "SELECT id FROM studenti WHERE id = ? AND studentska_sluzba_id = ?",
      [student_id, sluzbaId]
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student nije pronađen.",
      });
    }

    let upisano = 0;
    for (const predmetId of predmet_ids) {
      const [result] = await db.query(
        `
        INSERT IGNORE INTO upisi_predmeta
        (student_id, predmet_id, akademska_godina, godina_studija)
        VALUES (?, ?, ?, ?)
        `,
        [student_id, predmetId, period.akademska_godina, godina_studija]
      );
      if (result.affectedRows > 0) upisano++;
    }

    await db.query(
      "UPDATE studenti SET godina_studija = ? WHERE id = ? AND godina_studija < ?",
      [godina_studija, student_id, godina_studija]
    );

    res.json({
      success: true,
      message: `Student je upisan na ${upisano} predmeta za ${period.akademska_godina}. akademsku godinu.`,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri upisu predmeta.",
    });
  }
});

module.exports = router;