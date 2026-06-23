const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Nemate admin pristup.",
    });
  }

  next();
}

// ─── DASHBOARD — AŽURIRANO: dodato ime/prezime admina u "user" objekat ──────
router.get("/dashboard", requireAdmin, async (req, res) => {
  try {
    const [[adminInfo]] = await db.query(
      "SELECT ime, prezime, email FROM admini WHERE id = ?",
      [req.session.user.id]
    );

    const [[brojFirmi]] = await db.query("SELECT COUNT(*) AS ukupno FROM firme");
    const [[brojStudenata]] = await db.query("SELECT COUNT(*) AS ukupno FROM studenti");
    const [[brojSluzbi]] = await db.query("SELECT COUNT(*) AS ukupno FROM studentske_sluzbe");
    const [[brojKonkursa]] = await db.query("SELECT COUNT(*) AS ukupno FROM konkursi");
    const [[brojPrijava]] = await db.query("SELECT COUNT(*) AS ukupno FROM prijave_na_konkurse");
    const [[brojObjava]] = await db.query("SELECT COUNT(*) AS ukupno FROM objave");

    const [firme] = await db.query(`
      SELECT id, naziv_firme, email, pib, adresa, opis, datum_kreiranja
      FROM firme
      ORDER BY datum_kreiranja DESC
    `);

    const [studentskeSluzbe] = await db.query(`
      SELECT id, naziv_fakulteta, email, datum_kreiranja
      FROM studentske_sluzbe
      ORDER BY naziv_fakulteta ASC
    `);

    const [studenti] = await db.query(`
      SELECT 
        studenti.id,
        studenti.ime,
        studenti.prezime,
        studenti.jmbg,
        studenti.jedinstveni_id,
        studenti.studentski_email,
        studenti.broj_indeksa,
        studenti.godina_studija,
        studenti.smjer,
        studentske_sluzbe.naziv_fakulteta
      FROM studenti
      JOIN studentske_sluzbe
      ON studenti.studentska_sluzba_id = studentske_sluzbe.id
      ORDER BY studenti.id DESC
    `);

    res.json({
      success: true,
      statistika: {
        firme: brojFirmi.ukupno,
        studenti: brojStudenata.ukupno,
        studentskeSluzbe: brojSluzbi.ukupno,
        konkursi: brojKonkursa.ukupno,
        prijave: brojPrijava.ukupno,
        objave: brojObjava.ukupno,
      },
      firme,
      studentskeSluzbe,
      studenti,
      user: {
        ...req.session.user,
        ime: adminInfo?.ime,
        prezime: adminInfo?.prezime,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri učitavanju admin dashboarda.",
    });
  }
});

router.post("/firme", requireAdmin, async (req, res) => {
  try {
    const { naziv_firme, email, lozinka, pib, adresa, opis } = req.body;

    if (!naziv_firme || !email || !lozinka) {
      return res.status(400).json({
        success: false,
        message: "Naziv firme, email i lozinka su obavezni.",
      });
    }

    const hashedPassword = await bcrypt.hash(lozinka, 10);

    await db.query(
      `
      INSERT INTO firme
      (uloga_id, naziv_firme, email, lozinka, pib, adresa, opis)
      VALUES (3, ?, ?, ?, ?, ?, ?)
      `,
      [
        naziv_firme,
        email,
        hashedPassword,
        pib || null,
        adresa || null,
        opis || null,
      ]
    );

    res.json({
      success: true,
      message: "Firma je uspješno dodata.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri dodavanju firme.",
    });
  }
});

router.post("/studentske-sluzbe", requireAdmin, async (req, res) => {
  try {
    const { naziv_fakulteta, email, lozinka } = req.body;

    if (!naziv_fakulteta || !email || !lozinka) {
      return res.status(400).json({
        success: false,
        message: "Naziv fakulteta, email i lozinka su obavezni.",
      });
    }

    const hashedPassword = await bcrypt.hash(lozinka, 10);

    await db.query(
      `
      INSERT INTO studentske_sluzbe
      (uloga_id, naziv_fakulteta, email, lozinka)
      VALUES (2, ?, ?, ?)
      `,
      [naziv_fakulteta, email, hashedPassword]
    );

    res.json({
      success: true,
      message: "Studentska služba je uspješno dodata.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri dodavanju studentske službe.",
    });
  }
});

router.delete("/firme/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM firme WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Firma je uspješno obrisana.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri brisanju firme.",
    });
  }
});

router.delete("/studentske-sluzbe/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM studentske_sluzbe WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Studentska služba je uspješno obrisana.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri brisanju studentske službe.",
    });
  }
});

router.get("/settings", requireAdmin, async (req, res) => {
  try {
    const adminId = req.session.user.id;

    const [[admin]] = await db.query(
      `
      SELECT id, ime, prezime, email
      FROM admini
      WHERE id = ?
      `,
      [adminId]
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin nije pronađen.",
      });
    }

    res.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri učitavanju podešavanja.",
    });
  }
});

router.put("/settings/password", requireAdmin, async (req, res) => {
  try {
    const adminId = req.session.user.id;
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

    const [[admin]] = await db.query(
      `
      SELECT id, lozinka
      FROM admini
      WHERE id = ?
      `,
      [adminId]
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin nije pronađen.",
      });
    }

    const ispravnaStaraLozinka = await bcrypt.compare(
      staraLozinka,
      admin.lozinka
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
      UPDATE admini
      SET lozinka = ?
      WHERE id = ?
      `,
      [hashedPassword, adminId]
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

module.exports = router;