const mysql = require("mysql2/promise");
require("dotenv").config();

// DB_SSL=true se postavlja SAMO u produkciji (cloud baza zahtijeva SSL).
// Lokalno (XAMPP/Workbench) ostaje bez SSL, nista se ne mijenja za lokalni rad.
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  ssl: process.env.DB_SSL === "true"
    ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
    : undefined,
});

module.exports = db;