const express = require("express");
const router = express.Router();

const db = require("../config/db");

const requireFirma = require("../middleware/requireFirma");

const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");

const upload = multer({ dest: "uploads/" });

router.get("/dashboard", requireFirma, (req, res) => {
  return res.json({
    success: true,
    message: "Firma dashboard",
    firma: req.session.user
  });
});

router.post("/konkurs", requireFirma, async (req, res) => {
  try {
    const {
      naslov,
      opis,
      pozicija,
      maksimalan_broj_prijava,
      rok_prijave
    } = req.body;

    if (
      !naslov ||
      !opis ||
      !maksimalan_broj_prijava ||
      !rok_prijave
    ) {
      return res.status(400).json({
        success: false,
        message: "Sva polja su obavezna"
      });
    }

    await db.query(
      `INSERT INTO konkursi
      (
        firma_id,
        naslov,
        opis,
        pozicija,
        maksimalan_broj_prijava,
        rok_prijave
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.session.user.id,
        naslov,
        opis,
        pozicija,
        maksimalan_broj_prijava,
        rok_prijave
      ]
    );

    return res.json({
      success: true,
      message: "Konkurs uspješno kreiran"
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Greška na serveru"
    });
  }
});

router.get("/konkursi", requireFirma, async (req, res) => {
  try {
    const firmaId = req.session.user.id;

    const [rows] = await db.query(
      `SELECT id, naslov, opis, pozicija, maksimalan_broj_prijava, rok_prijave, datum_objave
       FROM konkursi
       WHERE firma_id = ?
       ORDER BY datum_objave DESC`,
      [firmaId]
    );

    res.json({
      success: true,
      count: rows.length,
      konkursi: rows
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Greška na serveru"
    });
  }
});

router.delete("/konkurs/:id", requireFirma, async (req, res) => {
  try {
    const firmaId = req.session.user.id;
    const konkursId = req.params.id;

    // make sure firma owns this konkurs
    const [rows] = await db.query(
      "SELECT * FROM konkursi WHERE id = ? AND firma_id = ?",
      [konkursId, firmaId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Konkurs ne postoji ili nije vaš"
      });
    }

    await db.query(
      "DELETE FROM konkursi WHERE id = ?",
      [konkursId]
    );

    res.json({
      success: true,
      message: "Konkurs obrisan"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Greška na serveru"
    });
  }
});

router.put("/konkurs/:id", requireFirma, async (req, res) => {
  try {
    const firmaId = req.session.user.id;
    const konkursId = req.params.id;

    const {
      naslov,
      opis,
      pozicija,
      maksimalan_broj_prijava,
      rok_prijave
    } = req.body;

    // check ownership
    const [rows] = await db.query(
      "SELECT * FROM konkursi WHERE id = ? AND firma_id = ?",
      [konkursId, firmaId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Konkurs ne postoji ili nije vaš"
      });
    }

    await db.query(
      `UPDATE konkursi
       SET naslov = ?,
           opis = ?,
           pozicija = ?,
           maksimalan_broj_prijava = ?,
           rok_prijave = ?
       WHERE id = ?`,
      [
        naslov,
        opis,
        pozicija,
        maksimalan_broj_prijava,
        rok_prijave,
        konkursId
      ]
    );

    res.json({
      success: true,
      message: "Konkurs ažuriran"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Greška na serveru"
    });
  }
});

router.post("/aktivnost", requireFirma, async (req, res) => {
  try {
    const {
      student_id,
      tip,
      naziv,
      opis,
      datum_aktivnosti
    } = req.body;

    if (!student_id || !tip || !naziv) {
      return res.status(400).json({
        success: false,
        message: "Student, tip i naziv su obavezni"
      });
    }

    await db.query(
      `INSERT INTO aktivnosti_studenata
      (firma_id, student_id, tip, naziv, opis, datum_aktivnosti)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.session.user.id,
        student_id,
        tip,
        naziv,
        opis || null,
        datum_aktivnosti || null
      ]
    );

    return res.json({
      success: true,
      message: "Aktivnost uspješno kreirana"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Greška na serveru"
    });
  }
});

router.post(
  "/upload-aktivnosti",
  requireFirma,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Fajl nije uploadovan"
        });
      }

      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data = xlsx.utils.sheet_to_json(sheet);

      for (const row of data) {
        const {
          student_identifier,
          aktivnost,
          bodovi
        } = row;

        const [student] = await db.query(
          "SELECT id FROM studenti WHERE jedinstveni_id = ?",
          [student_identifier]
        );

        if (student.length === 0) continue;

        await db.query(
          `INSERT INTO aktivnosti_studenata
          (firma_id, student_id, tip, naziv, opis, datum_aktivnosti)
          VALUES (?, ?, 'dogadjaj', ?, ?, NOW())`,
          [
            req.session.user.id,
            student[0].id,
            aktivnost,
            `Bodovi: ${bodovi}`
          ]
        );
      }

      return res.json({
        success: true,
        message: "Excel uspješno obrađen"
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Greška pri obradi Excel fajla"
      });
    }
  }
);

module.exports = router;