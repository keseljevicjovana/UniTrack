const express = require("express");
const router = express.Router();

const db = require("../config/db");
const bcrypt = require("bcrypt");

const requireSluzba = require("../middleware/requireSluzba");

router.get("/dashboard", requireSluzba, async (req, res) => {
  try {
    const sluzbaId = req.session.user.id;

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
      user: req.session.user
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