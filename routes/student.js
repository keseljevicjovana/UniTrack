const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const { generisiAiZakljucak } = require("../utils/aiProfil");

function requireStudent(req, res, next) {
  if (!req.session.user || req.session.user.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Nemate studentski pristup.",
    });
  }

  next();
}

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
    const tekst = `${aktivnost.tip || ""} ${aktivnost.naziv || ""} ${
      aktivnost.opis || ""
    }`.toLowerCase();

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

    if (
      tekst.includes("ai") ||
      tekst.includes("vještačka") ||
      tekst.includes("vestacka")
    ) {
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

    if (
      tekst.includes("hakaton") ||
      tekst.includes("takmičenje") ||
      tekst.includes("takmicenje")
    ) {
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

function generisiProfesionalniZakljucak(
  student,
  kompetencije,
  interesovanja,
  preporuceneOblasti
) {
  const ime = student.ime;
  const smjer = student.smjer || "odabrane oblasti";

  const kompetencijeTekst =
    kompetencije.length > 0
      ? kompetencije.slice(0, 4).join(", ")
      : "odgovornost, spremnost na učenje i profesionalni razvoj";

  const interesovanjaTekst =
    interesovanja.length > 0
      ? interesovanja.slice(0, 4).join(", ")
      : "stručno usavršavanje i razvoj karijere";

  const oblastiTekst =
    preporuceneOblasti.length > 0
      ? preporuceneOblasti.slice(0, 4).join(", ")
      : "oblasti povezane sa studijskim programom";

  return `${ime} je student smjera ${smjer} koji kroz akademski rad, aktivnosti i dodatna angažovanja pokazuje razvijene kompetencije kao što su ${kompetencijeTekst}. Na osnovu zabilježenih podataka, posebno se ističu interesovanja u oblastima: ${interesovanjaTekst}. Student se preporučuje za oblasti kao što su: ${oblastiTekst}.`;
}

// ─── DASHBOARD — AŽURIRANO: dodat naziv_fakulteta, statistika, is_current_student ──
router.get("/dashboard", requireStudent, async (req, res) => {
  try {
    const studentId = req.session.user.id;

    const [[student]] = await db.query(
      `
      SELECT s.id, s.ime, s.prezime, s.jedinstveni_id, s.studentski_email,
             s.broj_indeksa, s.godina_studija, s.smjer, s.studentska_sluzba_id,
             s.prikaz_na_rang_listi, ss.naziv_fakulteta
      FROM studenti s
      JOIN studentske_sluzbe ss
        ON s.studentska_sluzba_id = ss.id
      WHERE s.id = ?
      `,
      [studentId]
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student nije pronađen.",
      });
    }

    const [rezultati] = await db.query(
      `
      SELECT 
        r.id,
        r.tip,
        r.naziv,
        r.opis,
        r.datum_objave,
        rs.bodovi,
        rs.ocjena,
        rs.napomena
      FROM rezultat_studenta rs
      JOIN rezultati r ON rs.rezultat_id = r.id
      WHERE rs.student_id = ?
      ORDER BY r.datum_objave DESC
      `,
      [studentId]
    );

    const [konkursi] = await db.query(
      `
      SELECT 
        k.id,
        k.naslov,
        k.opis,
        k.pozicija,
        k.maksimalan_broj_prijava,
        k.rok_prijave,
        k.datum_objave,
        f.naziv_firme,
        CASE 
          WHEN p.id IS NULL THEN 0
          ELSE 1
        END AS prijavljen
      FROM konkursi k
      JOIN firme f ON k.firma_id = f.id
      LEFT JOIN prijave_na_konkurse p
        ON p.konkurs_id = k.id AND p.student_id = ?
      WHERE k.rok_prijave >= CURDATE()
      ORDER BY k.rok_prijave ASC
      `,
      [studentId]
    );

    // Rang lista — po CIJELOJ studentskoj službi (fakultetu), ne po smjeru.
    // Sadrži student_id po redu da znamo koji je trenutni korisnik
    const [rangListaRaw] = await db.query(
      `
      SELECT 
        s.id AS student_id,
        ROW_NUMBER() OVER (ORDER BY bs.ukupno_bodova DESC) AS mjesto,
        CASE 
          WHEN s.prikaz_na_rang_listi = 'jedinstveni_id'
          THEN s.jedinstveni_id
          ELSE CONCAT(s.ime, ' ', s.prezime)
        END AS prikaz_studenta,
        bs.akademski_bodovi,
        bs.vannastavne_aktivnosti_bodovi,
        bs.drustveni_doprinos_bodovi,
        bs.posebna_postignuca_bodovi,
        bs.ukupno_bodova
      FROM bodovi_studenata bs
      JOIN studenti s ON bs.student_id = s.id
      WHERE s.studentska_sluzba_id = ?
      ORDER BY bs.ukupno_bodova DESC
      `,
      [student.studentska_sluzba_id]
    );

    const rangLista = rangListaRaw.map((item) => ({
      ...item,
      is_current_student: item.student_id === studentId,
    }));

    const trenutniNaRangListi = rangLista.find((item) => item.is_current_student);

    const statistika = {
      ukupnoBodova: trenutniNaRangListi?.ukupno_bodova ?? 0,
      pozicijaNaRangListi: trenutniNaRangListi?.mjesto ?? null,
      akademski: trenutniNaRangListi?.akademski_bodovi ?? 0,
      vannastavne: trenutniNaRangListi?.vannastavne_aktivnosti_bodovi ?? 0,
      drustveni: trenutniNaRangListi?.drustveni_doprinos_bodovi ?? 0,
      posebna: trenutniNaRangListi?.posebna_postignuca_bodovi ?? 0,
    };

    res.json({
      success: true,
      student,
      rezultati,
      konkursi,
      rangLista,
      statistika,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri učitavanju studentskog dashboarda.",
    });
  }
});

router.get("/settings", requireStudent, async (req, res) => {
  try {
    const studentId = req.session.user.id;

    const [[student]] = await db.query(
      `
      SELECT 
        s.id,
        s.ime,
        s.prezime,
        s.studentski_email,
        s.jedinstveni_id,
        s.broj_indeksa,
        s.godina_studija,
        s.smjer,
        s.prikaz_na_rang_listi,
        ss.naziv_fakulteta
      FROM studenti s
      JOIN studentske_sluzbe ss
        ON s.studentska_sluzba_id = ss.id
      WHERE s.id = ?
      `,
      [studentId]
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student nije pronađen.",
      });
    }

    res.json({
      success: true,
      student,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri učitavanju podešavanja.",
    });
  }
});

// ─── MOJI REZULTATI — raspis po komponentama (prisustvo/test/kolokvijum/zavrsni) ──
// HAVING klauzula osigurava da se predmet prikaže SAMO ako postoji bar jedan
// kolokvijum ili završni unos (ne pišemo ocjenu bez stvarne provjere znanja).
router.get("/rezultati", requireStudent, async (req, res) => {
  try {
    const studentId = req.session.user.id;

    const [rezultati] = await db.query(
      `
      SELECT
        r.id,
        COALESCE(p.naziv, r.naziv) AS predmet,
        p.semestar,
        p.espb AS ects,
        rs.bodovi,
        rs.ocjena,
        rs.polozen,
        r.datum_objave AS datum,
        MAX(CASE WHEN bk.tip_boda = 'prisustvo'           THEN bk.bodovi END) AS prisustvo,
        MAX(CASE WHEN bk.tip_boda = 'test'                THEN bk.bodovi END) AS test,
        MAX(CASE WHEN bk.tip_boda = 'kolokvijum_redovni'  THEN bk.bodovi END) AS kolokvijum_redovni,
        MAX(CASE WHEN bk.tip_boda = 'kolokvijum_popravni' THEN bk.bodovi END) AS kolokvijum_popravni,
        MAX(CASE WHEN bk.tip_boda = 'zavrsni_redovni'     THEN bk.bodovi END) AS zavrsni_redovni,
        MAX(CASE WHEN bk.tip_boda = 'zavrsni_popravni'    THEN bk.bodovi END) AS zavrsni_popravni
      FROM rezultat_studenta rs
      JOIN rezultati r ON rs.rezultat_id = r.id
      LEFT JOIN predmeti p ON r.predmet_id = p.id
      LEFT JOIN bodovi_komponente bk ON bk.rezultat_id = r.id AND bk.student_id = rs.student_id
      WHERE rs.student_id = ?
      GROUP BY r.id, rs.id
      HAVING SUM(CASE WHEN bk.tip_boda IN ('kolokvijum_redovni','kolokvijum_popravni','zavrsni_redovni','zavrsni_popravni') THEN 1 ELSE 0 END) > 0
      ORDER BY r.datum_objave DESC
      `,
      [studentId]
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

router.get("/aktivnosti", requireStudent, async (req, res) => {
  try {
    const studentId = req.session.user.id;

    const [aktivnosti] = await db.query(
      `
      SELECT 
        a.id,
        a.tip,
        a.naziv,
        a.opis,
        a.bodovi,
        a.datum_aktivnosti,
        f.naziv_firme,
        k.naslov AS naziv_konkursa
      FROM aktivnosti_studenata a
      LEFT JOIN firme f ON a.firma_id = f.id
      LEFT JOIN konkursi k ON a.konkurs_id = k.id
      WHERE a.student_id = ?
      ORDER BY a.datum_aktivnosti DESC
      `,
      [studentId]
    );

    res.json({
      success: true,
      aktivnosti,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri učitavanju aktivnosti.",
    });
  }
});

router.get("/digitalni-cv", requireStudent, async (req, res) => {
  try {
    const studentId = req.session.user.id;

    const [[student]] = await db.query(
      `
      SELECT 
        s.id,
        s.ime,
        s.prezime,
        s.studentski_email,
        s.broj_indeksa,
        s.smjer,
        s.profesionalni_profil_ai,
        ss.id AS studentska_sluzba_id,
        ss.naziv_fakulteta
      FROM studenti s
      JOIN studentske_sluzbe ss
        ON s.studentska_sluzba_id = ss.id
      WHERE s.id = ?
      `,
      [studentId]
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student nije pronađen.",
      });
    }

    const [[nepolozeni]] = await db.query(
      `
      SELECT COUNT(*) AS ukupno
      FROM upisi_predmeta up
      JOIN predmeti p
        ON up.predmet_id = p.id
      LEFT JOIN rezultati r 
        ON r.predmet_id = p.id
      LEFT JOIN rezultat_studenta rs 
        ON rs.rezultat_id = r.id 
        AND rs.student_id = ?
      WHERE up.student_id = ?
        AND p.obavezan = true
        AND (rs.bodovi IS NULL OR rs.bodovi < 50)
      `,
      [studentId, studentId]
    );

    if (nepolozeni.ukupno > 0) {
      return res.status(403).json({
        success: false,
        imaPristup: false,
        message: `Još uvijek nemate pristup digitalnom CV-u. ${nepolozeni.ukupno} ispita vas dijeli od toga.`,
        nepolozeni_predmeti: nepolozeni.ukupno,
      });
    }

    const [aktivnosti] = await db.query(
      `
      SELECT 
        a.id,
        a.tip,
        a.naziv,
        a.opis,
        a.datum_aktivnosti,
        f.naziv_firme
      FROM aktivnosti_studenata a
      LEFT JOIN firme f ON a.firma_id = f.id
      WHERE a.student_id = ?
      ORDER BY a.datum_aktivnosti DESC
      `,
      [studentId]
    );

    const [postignuca] = await db.query(
      `
      SELECT 
        a.id,
        a.tip,
        a.naziv,
        a.opis,
        a.datum_aktivnosti,
        f.naziv_firme
      FROM aktivnosti_studenata a
      LEFT JOIN firme f ON a.firma_id = f.id
      WHERE a.student_id = ?
        AND (
          a.naziv LIKE '%nagrada%'
          OR a.naziv LIKE '%takmičenje%'
          OR a.naziv LIKE '%takmicenje%'
          OR a.naziv LIKE '%hakaton%'
          OR a.naziv LIKE '%sertifikat%'
          OR a.opis LIKE '%nagrada%'
          OR a.opis LIKE '%takmičenje%'
          OR a.opis LIKE '%takmicenje%'
          OR a.opis LIKE '%hakaton%'
          OR a.opis LIKE '%sertifikat%'
        )
      ORDER BY a.datum_aktivnosti DESC
      `,
      [studentId]
    );

    const [[bodovi]] = await db.query(
      `
      SELECT 
        akademski_bodovi,
        vannastavne_aktivnosti_bodovi,
        drustveni_doprinos_bodovi,
        posebna_postignuca_bodovi,
        ukupno_bodova
      FROM bodovi_studenata
      WHERE student_id = ?
      `,
      [studentId]
    );

    const analiza = generisiKompetencije(student, aktivnosti);

    // ─── AI profesionalni profil — generiše se SAMO JEDNOM po studentu,
    // čuva se u bazi. Sluzba kasnije koristi ISTI sačuvani tekst za PDF,
    // pa nema neslaganja i nema dodatnih troškova po pregledu. ───────────────
    let profesionalniZakljucak = student.profesionalni_profil_ai;

    if (!profesionalniZakljucak) {
      profesionalniZakljucak = await generisiAiZakljucak(
        student,
        analiza.kompetencije,
        analiza.interesovanja,
        analiza.preporuceneOblasti,
        aktivnosti
      );

      await db.query(
        `UPDATE studenti SET profesionalni_profil_ai = ? WHERE id = ?`,
        [profesionalniZakljucak, studentId]
      );
    }

    res.json({
      success: true,
      imaPristup: true,
      digitalniCV: {
        student: {
          ime: student.ime,
          prezime: student.prezime,
          email: student.studentski_email,
          broj_indeksa: student.broj_indeksa,
          fakultet: student.naziv_fakulteta,
          smjer: student.smjer,
        },
        aktivnosti,
        istaknutaPostignuca: postignuca,
        kompetencije: analiza.kompetencije,
        interesovanja: analiza.interesovanja,
        preporuceneOblasti: analiza.preporuceneOblasti,
        unitrackScore: bodovi || null,
        profesionalniZakljucak,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri učitavanju digitalnog CV-a.",
    });
  }
});

router.post("/digitalni-cv/stampanje", requireStudent, async (req, res) => {
  try {
    const studentId = req.session.user.id;

    const [[student]] = await db.query(
      `
      SELECT 
        s.id,
        s.ime,
        s.prezime,
        s.studentska_sluzba_id,
        ss.naziv_fakulteta
      FROM studenti s
      JOIN studentske_sluzbe ss
        ON s.studentska_sluzba_id = ss.id
      WHERE s.id = ?
      `,
      [studentId]
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student nije pronađen.",
      });
    }

    const [[nepolozeni]] = await db.query(
      `
      SELECT COUNT(*) AS ukupno
      FROM upisi_predmeta up
      JOIN predmeti p
        ON up.predmet_id = p.id
      LEFT JOIN rezultati r 
        ON r.predmet_id = p.id
      LEFT JOIN rezultat_studenta rs 
        ON rs.rezultat_id = r.id 
        AND rs.student_id = ?
      WHERE up.student_id = ?
        AND p.obavezan = true
        AND (rs.bodovi IS NULL OR rs.bodovi < 50)
      `,
      [studentId, studentId]
    );

    if (nepolozeni.ukupno > 0) {
      return res.status(403).json({
        success: false,
        message: `Ne možete zatražiti štampanje CV-a. ${nepolozeni.ukupno} ispita vas dijeli od pristupa digitalnom CV-u.`,
      });
    }

    const [[postojeciZahtjev]] = await db.query(
      `
      SELECT id
      FROM zahtjevi_za_stampanje_cv
      WHERE student_id = ?
        AND status IN ('poslato', 'u_obradi')
      LIMIT 1
      `,
      [studentId]
    );

    if (postojeciZahtjev) {
      return res.status(400).json({
        success: false,
        message:
          "Već imate aktivan zahtjev za štampanje digitalnog CV-a.",
      });
    }

    const poruka = `Student ${student.ime} ${student.prezime} je zatražio štampanje digitalnog CV-a.`;

    await db.query(
      `
      INSERT INTO zahtjevi_za_stampanje_cv
      (student_id, studentska_sluzba_id, poruka)
      VALUES (?, ?, ?)
      `,
      [studentId, student.studentska_sluzba_id, poruka]
    );

    res.json({
      success: true,
      message:
        "Zahtjev za štampanje digitalnog CV-a je poslat studentskoj službi. Tokom sljedeće nedjelje posjetite studentsku službu.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri slanju zahtjeva za štampanje CV-a.",
    });
  }
});

router.put("/settings/rang-prikaz", requireStudent, async (req, res) => {
  try {
    const studentId = req.session.user.id;
    const { prikaz_na_rang_listi } = req.body;

    if (!["ime_prezime", "jedinstveni_id"].includes(prikaz_na_rang_listi)) {
      return res.status(400).json({
        success: false,
        message: "Neispravan izbor prikaza.",
      });
    }

    await db.query(
      `
      UPDATE studenti
      SET prikaz_na_rang_listi = ?
      WHERE id = ?
      `,
      [prikaz_na_rang_listi, studentId]
    );

    res.json({
      success: true,
      message: "Podešavanje prikaza na rang listi je uspješno sačuvano.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri čuvanju podešavanja prikaza.",
    });
  }
});

router.put("/settings/password", requireStudent, async (req, res) => {
  try {
    const studentId = req.session.user.id;
    const { staraLozinka, novaLozinka, potvrdaLozinke } = req.body;

    if (!staraLozinka || !novaLozinka || !potvrdaLozinke) {
      return res.status(400).json({
        success: false,
        message: "Sva polja su obavezna.",
      });
    }

    if (novaLozinka !== potvrdaLozinke) {
      return res.status(400).json({
        success: false,
        message: "Nova lozinka i potvrda lozinke se ne poklapaju.",
      });
    }

    if (novaLozinka.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Nova lozinka mora imati najmanje 6 karaktera.",
      });
    }

    const [[student]] = await db.query(
      `
      SELECT id, lozinka
      FROM studenti
      WHERE id = ?
      `,
      [studentId]
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student nije pronađen.",
      });
    }

    const ispravnaStaraLozinka = await bcrypt.compare(
      staraLozinka,
      student.lozinka
    );

    if (!ispravnaStaraLozinka) {
      return res.status(400).json({
        success: false,
        message: "Stara lozinka nije tačna.",
      });
    }

    const hashedPassword = await bcrypt.hash(novaLozinka, 10);

    await db.query(
      `
      UPDATE studenti
      SET lozinka = ?
      WHERE id = ?
      `,
      [hashedPassword, studentId]
    );

    res.json({
      success: true,
      message: "Lozinka je uspješno promijenjena.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri promjeni lozinke.",
    });
  }
});

router.post("/konkursi/:id/prijava", requireStudent, async (req, res) => {
  try {
    const studentId = req.session.user.id;
    const { id } = req.params;

    const [[konkurs]] = await db.query(
      `
      SELECT id, maksimalan_broj_prijava, rok_prijave
      FROM konkursi
      WHERE id = ?
      `,
      [id]
    );

    if (!konkurs) {
      return res.status(404).json({
        success: false,
        message: "Konkurs nije pronađen.",
      });
    }

    const [[postojecaPrijava]] = await db.query(
      `
      SELECT id
      FROM prijave_na_konkurse
      WHERE konkurs_id = ?
      AND student_id = ?
      LIMIT 1
      `,
      [id, studentId]
    );

    if (postojecaPrijava) {
      await db.query(
        `
        DELETE FROM prijave_na_konkurse
        WHERE konkurs_id = ?
        AND student_id = ?
        `,
        [id, studentId]
      );

      return res.json({
        success: true,
        prijavljen: false,
        message: "Uspješno ste se odjavili sa konkursa.",
      });
    }

    if (new Date(konkurs.rok_prijave) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Rok za prijavu na konkurs je istekao.",
      });
    }

    const [[brojPrijava]] = await db.query(
      `
      SELECT COUNT(*) AS ukupno
      FROM prijave_na_konkurse
      WHERE konkurs_id = ?
      `,
      [id]
    );

    if (
      konkurs.maksimalan_broj_prijava &&
      brojPrijava.ukupno >= konkurs.maksimalan_broj_prijava
    ) {
      return res.status(400).json({
        success: false,
        message: "Popunjen je maksimalan broj prijava za ovaj konkurs.",
      });
    }

    await db.query(
      `
      INSERT INTO prijave_na_konkurse
      (konkurs_id, student_id)
      VALUES (?, ?)
      `,
      [id, studentId]
    );

    res.json({
      success: true,
      prijavljen: true,
      message: "Uspješno ste se prijavili na konkurs.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri prijavi/odjavi sa konkursa.",
    });
  }
});

// ─── VAUČERI — osvojeni (istorija) + struktura nagrada za trenutni mjesec ──
router.get("/vauceri", requireStudent, async (req, res) => {
  try {
    const studentId = req.session.user.id;

    const [[student]] = await db.query(
      "SELECT studentska_sluzba_id FROM studenti WHERE id = ?",
      [studentId]
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student nije pronađen." });
    }

    const sada = new Date();
    const mjesec = sada.getMonth() + 1;
    const godina = sada.getFullYear();

    // Vaučeri koje je OVAJ student stvarno osvojio (bilo kad)
    const [osvojeni] = await db.query(
      `
      SELECT v.id, v.naziv_partnera, v.opis, v.procenat_popusta, v.pozicija, v.mjesec, v.godina, v.datum_isteka, d.datum_dodjele
      FROM vauceri_dobitnici d
      JOIN vauceri v ON d.vaucer_id = v.id
      WHERE d.student_id = ?
      ORDER BY v.godina DESC, v.mjesec DESC
      `,
      [studentId]
    );

    // Struktura nagrada (1./2./3. mjesto) za trenutni mjesec, na fakultetu studenta
    const [trenutneNagrade] = await db.query(
      `
      SELECT id, naziv_partnera, opis, procenat_popusta, pozicija, mjesec, godina, datum_isteka
      FROM vauceri
      WHERE studentska_sluzba_id = ? AND mjesec = ? AND godina = ?
      ORDER BY pozicija ASC
      `,
      [student.studentska_sluzba_id, mjesec, godina]
    );

    res.json({ success: true, osvojeni, trenutneNagrade });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Greška pri učitavanju vaučera." });
  }
});

module.exports = router;