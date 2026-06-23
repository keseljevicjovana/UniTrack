const express = require("express");
const router = express.Router();

const db = require("../config/db");
const bcrypt = require("bcrypt");
const multer = require("multer");
const XLSX = require("xlsx");

const requireSluzba = require("../middleware/requireSluzba");

const upload = multer({ storage: multer.memoryStorage() });

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
        id,
        ime,
        prezime,
        jedinstveni_id,
        studentski_email,
        broj_indeksa,
        godina_studija,
        smjer
      FROM studenti
      WHERE studentska_sluzba_id = ?
      ORDER BY prezime, ime
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

router.put("/cv-zahtjev/:id", requireSluzba, async (req, res) => {
  try {
    const { status } = req.body;

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

router.post("/bodovi", requireSluzba, async (req, res) => {
  try {
    const {
      student_id,
      akademski_bodovi,
      vannastavne_aktivnosti_bodovi,
      drustveni_doprinos_bodovi,
      posebna_postignuca_bodovi
    } = req.body;

    const [rows] = await db.query(
      `
      SELECT id
      FROM bodovi_studenata
      WHERE student_id = ?
      `,
      [student_id]
    );

    if (rows.length === 0) {
      await db.query(
        `
        INSERT INTO bodovi_studenata
        (
          student_id,
          akademski_bodovi,
          vannastavne_aktivnosti_bodovi,
          drustveni_doprinos_bodovi,
          posebna_postignuca_bodovi
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          student_id,
          akademski_bodovi || 0,
          vannastavne_aktivnosti_bodovi || 0,
          drustveni_doprinos_bodovi || 0,
          posebna_postignuca_bodovi || 0
        ]
      );
    } else {
      await db.query(
        `
        UPDATE bodovi_studenata
        SET
          akademski_bodovi = ?,
          vannastavne_aktivnosti_bodovi = ?,
          drustveni_doprinos_bodovi = ?,
          posebna_postignuca_bodovi = ?
        WHERE student_id = ?
        `,
        [
          akademski_bodovi || 0,
          vannastavne_aktivnosti_bodovi || 0,
          drustveni_doprinos_bodovi || 0,
          posebna_postignuca_bodovi || 0,
          student_id
        ]
      );
    }

    res.json({
      success: true,
      message: "Bodovi uspješno sačuvani"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška na serveru"
    });
  }
});

router.get("/bodovi/:studentId", requireSluzba, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM bodovi_studenata
      WHERE student_id = ?
      `,
      [req.params.studentId]
    );

    res.json({
      success: true,
      bodovi: rows[0] || null
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška na serveru"
    });
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

module.exports = router;