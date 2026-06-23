const express = require("express");
const router = express.Router();

const db = require("../config/db");
const bcrypt = require("bcrypt");

router.post("/reset-password", async (req, res) => {
  try {
    const {
      email,
      novaLozinka,
      potvrdaLozinke
    } = req.body;

    if (
      !email ||
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

    const hashedPassword = await bcrypt.hash(
      novaLozinka,
      10
    );

    let updated = false;

    const [student] = await db.query(
      "SELECT id FROM studenti WHERE studentski_email = ?",
      [email]
    );

    if (student.length > 0) {
      await db.query(
        "UPDATE studenti SET lozinka = ? WHERE id = ?",
        [hashedPassword, student[0].id]
      );

      updated = true;
    }

    const [firma] = await db.query(
      "SELECT id FROM firme WHERE email = ?",
      [email]
    );

    if (firma.length > 0) {
      await db.query(
        "UPDATE firme SET lozinka = ? WHERE id = ?",
        [hashedPassword, firma[0].id]
      );

      updated = true;
    }

    const [sluzba] = await db.query(
      "SELECT id FROM studentske_sluzbe WHERE email = ?",
      [email]
    );

    if (sluzba.length > 0) {
      await db.query(
        "UPDATE studentske_sluzbe SET lozinka = ? WHERE id = ?",
        [hashedPassword, sluzba[0].id]
      );

      updated = true;
    }

    const [admin] = await db.query(
      "SELECT id FROM admini WHERE email = ?",
      [email]
    );

    if (admin.length > 0) {
      await db.query(
        "UPDATE admini SET lozinka = ? WHERE id = ?",
        [hashedPassword, admin[0].id]
      );

      updated = true;
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Korisnik nije pronađen"
      });
    }

    return res.json({
      success: true,
      message: "Lozinka uspješno promijenjena"
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Greška na serveru"
    });
  }
});

module.exports = router;