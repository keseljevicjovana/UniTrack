const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
  const { identifier, password, rememberMe } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/ID i lozinka su obavezni",
      });
    }

    let user = null;

    const [adminRows] = await db.query(
      `SELECT id, ime, prezime, email, lozinka
       FROM admini
       WHERE email = ?
       LIMIT 1`,
      [identifier]
    );

    if (adminRows.length > 0) {
      const admin = adminRows[0];

      user = {
        id: admin.id,
        role: "admin",
        email: admin.email,
        ime: admin.ime,
        prezime: admin.prezime,
        lozinka: admin.lozinka,
      };
    }

    if (!user) {
      const [firmaRows] = await db.query(
        `SELECT id, naziv_firme, email, lozinka
         FROM firme
         WHERE email = ?
         LIMIT 1`,
        [identifier]
      );

      if (firmaRows.length > 0) {
        const firma = firmaRows[0];

        user = {
          id: firma.id,
          role: "firma",
          email: firma.email,
          naziv_firme: firma.naziv_firme,
          lozinka: firma.lozinka,
        };
      }
    }

    if (!user) {
      const [sluzbaRows] = await db.query(
        `SELECT id, naziv_fakulteta, email, lozinka
         FROM studentske_sluzbe
         WHERE email = ?
         LIMIT 1`,
        [identifier]
      );

      if (sluzbaRows.length > 0) {
        const sluzba = sluzbaRows[0];

        user = {
          id: sluzba.id,
          role: "studentska_sluzba",
          email: sluzba.email,
          naziv_fakulteta: sluzba.naziv_fakulteta,
          lozinka: sluzba.lozinka,
        };
      }
    }

    if (!user) {
      const [studentRows] = await db.query(
        `SELECT id, ime, prezime, studentski_email, jedinstveni_id, lozinka
         FROM studenti
         WHERE studentski_email = ? OR jedinstveni_id = ?
         LIMIT 1`,
        [identifier, identifier]
      );

      if (studentRows.length > 0) {
        const student = studentRows[0];

        user = {
          id: student.id,
          role: "student",
          email: student.studentski_email,
          ime: student.ime,
          prezime: student.prezime,
          jedinstveni_id: student.jedinstveni_id,
          lozinka: student.lozinka,
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Netačna lozinka ili username",
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.lozinka);

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Netačna lozinka ili username",
      });
    }

    req.session.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    if (rememberMe) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
    }

    const redirectMap = {
      admin: "/admin/dashboard",
      firma: "/firma/dashboard",
      studentska_sluzba: "/sluzba/dashboard",
      student: "/student/dashboard",
    };

    const redirectTo = redirectMap[user.role] || "/";

    return res.json({
      success: true,
      message: "Uspješna prijava",
      redirectTo,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Greška pri povezivanju sa bazom",
    });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");

    return res.json({
      success: true,
      message: "Uspješno ste se odjavili",
    });
  });
});

module.exports = router;