const express = require("express");
const router = express.Router();
const db = require("../config/db");

const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

function requireFirma(req, res, next) {
  if (!req.session.user || req.session.user.role !== "firma") {
    return res.status(403).json({
      success: false,
      message: "Nemate pristup firme.",
    });
  }

  next();
}

router.get("/dashboard", requireFirma, async (req, res) => {
  try {
    const firmaId = req.session.user.id;

    const [[firma]] = await db.query(
      `
      SELECT id, naziv_firme, email, pib, adresa, opis
      FROM firme
      WHERE id = ?
      `,
      [firmaId]
    );

    if (!firma) {
      return res.status(404).json({
        success: false,
        message: "Firma nije pronađena.",
      });
    }

    const [[brojKonkursa]] = await db.query(
      `
      SELECT COUNT(*) AS ukupno
      FROM konkursi
      WHERE firma_id = ?
      `,
      [firmaId]
    );

    const [[brojPrijava]] = await db.query(
      `
      SELECT COUNT(*) AS ukupno
      FROM prijave_na_konkurse p
      JOIN konkursi k ON p.konkurs_id = k.id
      WHERE k.firma_id = ?
      `,
      [firmaId]
    );

    const [[brojAktivnosti]] = await db.query(
      `
      SELECT COUNT(*) AS ukupno
      FROM aktivnosti_studenata
      WHERE firma_id = ?
      `,
      [firmaId]
    );

    return res.json({
      success: true,
      message: "Firma dashboard",
      firma,
      statistika: {
        konkursi: brojKonkursa.ukupno,
        prijave: brojPrijava.ukupno,
        aktivnosti: brojAktivnosti.ukupno,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Greška pri učitavanju dashboarda firme.",
    });
  }
});

router.post("/konkurs", requireFirma, async (req, res) => {
  try {
    const firmaId = req.session.user.id;

    const {
      naslov,
      opis,
      pozicija,
      maksimalan_broj_prijava,
      rok_prijave,
    } = req.body;

    if (!naslov || !opis || !maksimalan_broj_prijava || !rok_prijave) {
      return res.status(400).json({
        success: false,
        message: "Naslov, opis, maksimalan broj prijava i rok prijave su obavezni.",
      });
    }

    await db.query(
      `
      INSERT INTO konkursi
      (
        firma_id,
        naslov,
        opis,
        pozicija,
        maksimalan_broj_prijava,
        rok_prijave
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        firmaId,
        naslov,
        opis,
        pozicija || null,
        maksimalan_broj_prijava,
        rok_prijave,
      ]
    );

    return res.json({
      success: true,
      message: "Konkurs je uspješno kreiran.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Greška pri kreiranju konkursa.",
    });
  }
});

router.get("/konkursi", requireFirma, async (req, res) => {
  try {
    const firmaId = req.session.user.id;

    const [konkursi] = await db.query(
      `
      SELECT 
        id,
        naslov,
        opis,
        pozicija,
        maksimalan_broj_prijava,
        rok_prijave,
        datum_objave
      FROM konkursi
      WHERE firma_id = ?
      ORDER BY datum_objave DESC
      `,
      [firmaId]
    );

    return res.json({
      success: true,
      count: konkursi.length,
      konkursi,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Greška pri učitavanju konkursa.",
    });
  }
});

router.get("/konkurs/:id", requireFirma, async (req, res) => {
  try {
    const firmaId = req.session.user.id;
    const { id } = req.params;

    const [[konkurs]] = await db.query(
      `
      SELECT 
        id,
        naslov,
        opis,
        pozicija,
        maksimalan_broj_prijava,
        rok_prijave,
        datum_objave
      FROM konkursi
      WHERE id = ?
        AND firma_id = ?
      `,
      [id, firmaId]
    );

    if (!konkurs) {
      return res.status(404).json({
        success: false,
        message: "Konkurs ne postoji ili ne pripada vašoj firmi.",
      });
    }

    return res.json({
      success: true,
      konkurs,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Greška pri učitavanju konkursa.",
    });
  }
});

router.put("/konkurs/:id", requireFirma, async (req, res) => {
  try {
    const firmaId = req.session.user.id;
    const { id } = req.params;

    const {
      naslov,
      opis,
      pozicija,
      maksimalan_broj_prijava,
      rok_prijave,
    } = req.body;

    const [[konkurs]] = await db.query(
      `
      SELECT id
      FROM konkursi
      WHERE id = ?
        AND firma_id = ?
      `,
      [id, firmaId]
    );

    if (!konkurs) {
      return res.status(404).json({
        success: false,
        message: "Konkurs ne postoji ili ne pripada vašoj firmi.",
      });
    }

    if (!naslov || !opis || !maksimalan_broj_prijava || !rok_prijave) {
      return res.status(400).json({
        success: false,
        message: "Naslov, opis, maksimalan broj prijava i rok prijave su obavezni.",
      });
    }

    await db.query(
      `
      UPDATE konkursi
      SET 
        naslov = ?,
        opis = ?,
        pozicija = ?,
        maksimalan_broj_prijava = ?,
        rok_prijave = ?
      WHERE id = ?
        AND firma_id = ?
      `,
      [
        naslov,
        opis,
        pozicija || null,
        maksimalan_broj_prijava,
        rok_prijave,
        id,
        firmaId,
      ]
    );

    return res.json({
      success: true,
      message: "Konkurs je uspješno ažuriran.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Greška pri ažuriranju konkursa.",
    });
  }
});

router.delete("/konkurs/:id", requireFirma, async (req, res) => {
  try {
    const firmaId = req.session.user.id;
    const { id } = req.params;

    const [[konkurs]] = await db.query(
      `
      SELECT id
      FROM konkursi
      WHERE id = ?
        AND firma_id = ?
      `,
      [id, firmaId]
    );

    if (!konkurs) {
      return res.status(404).json({
        success: false,
        message: "Konkurs ne postoji ili ne pripada vašoj firmi.",
      });
    }

    await db.query(
      `
      DELETE FROM konkursi
      WHERE id = ?
        AND firma_id = ?
      `,
      [id, firmaId]
    );

    return res.json({
      success: true,
      message: "Konkurs je uspješno obrisan.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Greška pri brisanju konkursa.",
    });
  }
});

router.get("/prijave", requireFirma, async (req, res) => {
  try {
    const firmaId = req.session.user.id;

    const [prijave] = await db.query(
      `
      SELECT 
        p.id,
        p.datum_prijave,
        k.id AS konkurs_id,
        k.naslov AS konkurs,
        k.pozicija,
        s.id AS student_id,
        s.ime,
        s.prezime,
        s.studentski_email,
        s.jedinstveni_id,
        s.broj_indeksa,
        s.godina_studija,
        s.smjer
      FROM prijave_na_konkurse p
      JOIN konkursi k ON p.konkurs_id = k.id
      JOIN studenti s ON p.student_id = s.id
      WHERE k.firma_id = ?
      ORDER BY p.datum_prijave DESC
      `,
      [firmaId]
    );

    return res.json({
      success: true,
      count: prijave.length,
      prijave,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Greška pri učitavanju prijava.",
    });
  }
});

router.get("/aktivnosti", requireFirma, async (req, res) => {
  try {
    const firmaId = req.session.user.id;

    const [aktivnosti] = await db.query(
      `
      SELECT 
        a.id,
        a.tip,
        a.naziv,
        a.opis,
        a.datum_aktivnosti,
        a.datum_unosa,
        s.id AS student_id,
        s.ime,
        s.prezime,
        s.jedinstveni_id,
        s.studentski_email
      FROM aktivnosti_studenata a
      JOIN studenti s ON a.student_id = s.id
      WHERE a.firma_id = ?
      ORDER BY a.datum_aktivnosti DESC
      `,
      [firmaId]
    );

    return res.json({
      success: true,
      count: aktivnosti.length,
      aktivnosti,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Greška pri učitavanju aktivnosti.",
    });
  }
});

router.post("/aktivnost", requireFirma, async (req, res) => {
  try {
    const firmaId = req.session.user.id;

    const { student_id, tip, naziv, opis, datum_aktivnosti } = req.body;

    if (!student_id || !tip || !naziv) {
      return res.status(400).json({
        success: false,
        message: "Student, tip i naziv su obavezni.",
      });
    }

    const dozvoljeniTipovi = [
      "dogadjaj",
      "volontiranje",
      "praksa",
      "radionica",
      "drugo",
    ];

    if (!dozvoljeniTipovi.includes(tip)) {
      return res.status(400).json({
        success: false,
        message: "Neispravan tip aktivnosti.",
      });
    }

    const [[student]] = await db.query(
      `
      SELECT id
      FROM studenti
      WHERE id = ?
      `,
      [student_id]
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student nije pronađen.",
      });
    }

    await db.query(
      `
      INSERT INTO aktivnosti_studenata
      (firma_id, student_id, tip, naziv, opis, datum_aktivnosti)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        firmaId,
        student_id,
        tip,
        naziv,
        opis || null,
        datum_aktivnosti || null,
      ]
    );

    return res.json({
      success: true,
      message: "Aktivnost je uspješno kreirana.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Greška pri kreiranju aktivnosti.",
    });
  }
});

router.post(
  "/upload-aktivnosti",
  requireFirma,
  upload.single("file"),
  async (req, res) => {
    try {
      const firmaId = req.session.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Fajl nije uploadovan.",
        });
      }

      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data = xlsx.utils.sheet_to_json(sheet);

      let uspjesno = 0;
      let preskoceno = 0;

      for (const row of data) {
        const studentIdentifier = row.student_identifier;
        const aktivnost = row.aktivnost;
        const bodovi = row.bodovi;
        const tip = row.tip || "dogadjaj";

        if (!studentIdentifier || !aktivnost) {
          preskoceno++;
          continue;
        }

        const dozvoljeniTipovi = [
          "dogadjaj",
          "volontiranje",
          "praksa",
          "radionica",
          "drugo",
        ];

        if (!dozvoljeniTipovi.includes(tip)) {
          preskoceno++;
          continue;
        }

        const [studentRows] = await db.query(
          `
          SELECT id
          FROM studenti
          WHERE jedinstveni_id = ?
             OR studentski_email = ?
          LIMIT 1
          `,
          [studentIdentifier, studentIdentifier]
        );

        if (studentRows.length === 0) {
          preskoceno++;
          continue;
        }

        await db.query(
          `
          INSERT INTO aktivnosti_studenata
          (firma_id, student_id, tip, naziv, opis, datum_aktivnosti)
          VALUES (?, ?, ?, ?, ?, CURDATE())
          `,
          [
            firmaId,
            studentRows[0].id,
            tip,
            aktivnost,
            bodovi ? `Bodovi: ${bodovi}` : null,
          ]
        );

        uspjesno++;
      }

      if (req.file && req.file.path) {
        fs.unlink(req.file.path, () => {});
      }

      return res.json({
        success: true,
        message: "Excel fajl je uspješno obrađen.",
        uspjesno,
        preskoceno,
      });
    } catch (error) {
      console.log(error);

      if (req.file && req.file.path) {
        fs.unlink(req.file.path, () => {});
      }

      return res.status(500).json({
        success: false,
        message: "Greška pri obradi Excel fajla.",
      });
    }
  }
);

module.exports = router;