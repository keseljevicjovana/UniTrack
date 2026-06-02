const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

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

module.exports = router;