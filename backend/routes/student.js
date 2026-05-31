const express = require("express");
const router = express.Router();
const db = require("../config/db");

function requireStudent(req, res, next) {
  if (!req.session.user || req.session.user.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Nemate studentski pristup.",
    });
  }

  next();
}

router.get("/dashboard", requireStudent, async (req, res) => {
  try {
    const studentId = req.session.user.id;

    const [[student]] = await db.query(
      `
      SELECT id, ime, prezime, jedinstveni_id, studentski_email,
             broj_indeksa, godina_studija, smjer, studentska_sluzba_id,
             prikaz_na_rang_listi
      FROM studenti
      WHERE id = ?
      `,
      [studentId]
    );

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
          WHEN p.id IS NULL THEN false
          ELSE true
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

    const [rangLista] = await db.query(
      `
      SELECT 
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

    res.json({
      success: true,
      student,
      rezultati,
      konkursi,
      rangLista,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri učitavanju studentskog dashboarda.",
    });
  }
});

router.post("/konkursi/:id/prijava", requireStudent, async (req, res) => {
  try {
    const studentId = req.session.user.id;
    const { id } = req.params;

    await db.query(
      `
      INSERT INTO prijave_na_konkurse (konkurs_id, student_id)
      VALUES (?, ?)
      `,
      [id, studentId]
    );

    res.json({
      success: true,
      message: "Uspješno ste se prijavili na konkurs.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri prijavi na konkurs.",
    });
  }
});

router.put("/rang-prikaz", requireStudent, async (req, res) => {
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
      message: "Podešavanje prikaza je uspješno sačuvano.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri čuvanju podešavanja.",
    });
  }
});

module.exports = router;