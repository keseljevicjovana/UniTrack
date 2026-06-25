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

// ─── UPISNI PERIOD — globalni prekidač, otvara/zatvara upis za sve sluzbe ────
router.get("/upisni-period", requireAdmin, async (req, res) => {
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

router.put("/upisni-period", requireAdmin, async (req, res) => {
  try {
    const { aktivan, akademska_godina } = req.body;

    if (aktivan) {
      if (!akademska_godina) {
        return res.status(400).json({
          success: false,
          message: "Naziv akademske godine je obavezan (npr. 2026/2027).",
        });
      }

      await db.query(
        `
        UPDATE upisni_period
        SET aktivan = 1, akademska_godina = ?, datum_otvaranja = NOW(), datum_zatvaranja = NULL
        WHERE id = 1
        `,
        [akademska_godina]
      );

      return res.json({
        success: true,
        message: `Upisni period za ${akademska_godina}. godinu je otvoren za sve studentske službe.`,
      });
    }

    await db.query(
      `UPDATE upisni_period SET aktivan = 0, datum_zatvaranja = NOW() WHERE id = 1`
    );

    res.json({
      success: true,
      message: "Upisni period je zatvoren.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri ažuriranju upisnog perioda.",
    });
  }
});

// ─── PRIVREMENA RUTA — samo za kreiranje PRVOG admina. OBRIŠI OVU RUTU NAKON
// ŠTO JE ISKORISTIŠ JEDNOM (nije zaštićena, jer još ne postoji admin koji bi
// je zaštitio) ─────────────────────────────────────────────────────────────
router.post("/setup-prvi-admin", async (req, res) => {
  try {
    const { ime, prezime, email, lozinka } = req.body;

    if (!ime || !prezime || !email || !lozinka) {
      return res.status(400).json({
        success: false,
        message: "Sva polja su obavezna.",
      });
    }

    const hashedPassword = await bcrypt.hash(lozinka, 10);

    await db.query(
      `
      INSERT INTO admini
      (uloga_id, ime, prezime, email, lozinka)
      VALUES (1, ?, ?, ?, ?)
      `,
      [ime, prezime, email, hashedPassword]
    );

    res.json({
      success: true,
      message: "Admin je uspješno dodat.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Greška pri dodavanju admina.",
    });
  }
});

// ─── RANG LISTA — svi studenti, sa svih fakulteta, rangirani po bodovima ────
router.get("/rang-lista", requireAdmin, async (req, res) => {
  try {
    const [rangLista] = await db.query(`
      SELECT 
        ROW_NUMBER() OVER (ORDER BY bs.ukupno_bodova DESC) AS mjesto,
        CASE 
          WHEN s.prikaz_na_rang_listi = 'jedinstveni_id'
          THEN s.jedinstveni_id
          ELSE CONCAT(s.ime, ' ', s.prezime)
        END AS prikaz_studenta,
        s.smjer,
        ss.naziv_fakulteta,
        bs.akademski_bodovi,
        bs.vannastavne_aktivnosti_bodovi,
        bs.drustveni_doprinos_bodovi,
        bs.posebna_postignuca_bodovi,
        bs.ukupno_bodova
      FROM bodovi_studenata bs
      JOIN studenti s ON bs.student_id = s.id
      JOIN studentske_sluzbe ss ON s.studentska_sluzba_id = ss.id
      ORDER BY bs.ukupno_bodova DESC
    `);

    res.json({
      success: true,
      rangLista,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Greška pri učitavanju rang liste.",
    });
  }
});

module.exports = router;