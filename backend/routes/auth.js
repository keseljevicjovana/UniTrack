const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

/* ---------------- LOGIN ---------------- */
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

    // ---------------- ADMIN ----------------
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
        password: admin.lozinka,
      };
    }

    // ---------------- FIRMA ----------------
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
          password: firma.lozinka,
        };
      }
    }

    // ---------------- STUDENTSKA SLUŽBA ----------------
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
          password: sluzba.lozinka,
        };
      }
    }

    // ---------------- STUDENT ----------------
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
          password: student.lozinka,
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Netačna lozinka ili username",
      });
    }

    // ---------------- PASSWORD CHECK ----------------
    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Netačna lozinka ili username",
      });
    }

    // ---------------- SESSION (OLD STYLE) ----------------
    req.session.user = {
      id: user.id,
      role: user.role,
      email: user.email
    };

    if (rememberMe) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
    } else {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 2;
    }

    const redirectMap = {
      admin: "/admin/dashboard",
      firma: "/firma/dashboard",
      studentska_sluzba: "/sluzba/dashboard",
      student: "/student/dashboard",
    };

    return res.json({
      success: true,
      message: "Uspješna prijava",
      redirectTo: redirectMap[user.role],
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

/* ---------------- LOGOUT ---------------- */
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");

    return res.json({
      success: true,
      message: "Uspješno ste se odjavili",
    });
  });
});

/* ---------------- ME (OLD STYLE FIXED) ---------------- */
router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Niste prijavljeni",
    });
  }

  const role = req.session.role;

  try {
    let user = null;

    if (role === "admin") {
      const [rows] = await db.query(
        "SELECT id, ime, prezime, email FROM admini WHERE id = ?",
        [req.session.userId]
      );
      user = rows[0];
    }

    if (role === "firma") {
      const [rows] = await db.query(
        "SELECT id, naziv_firme, email FROM firme WHERE id = ?",
        [req.session.userId]
      );
      user = rows[0];
    }

    if (role === "studentska_sluzba") {
      const [rows] = await db.query(
        "SELECT id, naziv_fakulteta, email FROM studentske_sluzbe WHERE id = ?",
        [req.session.userId]
      );
      user = rows[0];
    }

    if (role === "student") {
      const [rows] = await db.query(
        "SELECT id, ime, prezime, studentski_email FROM studenti WHERE id = ?",
        [req.session.userId]
      );
      user = rows[0];
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Greška na serveru",
    });
  }
});

module.exports = router;