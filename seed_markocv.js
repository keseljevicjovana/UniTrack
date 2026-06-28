require("dotenv").config();
const db = require("./config/db");

function izracunajOcjenu(b) {
  if (b >= 90) return "A";
  if (b >= 80) return "B";
  if (b >= 70) return "C";
  if (b >= 60) return "D";
  if (b >= 50) return "E";
  return "F";
}

async function popuniMarka() {
  try {
    const [[marko]] = await db.query(
      `SELECT id, studentska_sluzba_id FROM studenti WHERE jedinstveni_id = 'PMF001'`
    );

    if (!marko) {
      console.log("Marko (PMF001) nije pronađen.");
      process.exit(1);
    }

    const [[predmet]] = await db.query(
      `SELECT id, naziv FROM predmeti WHERE naziv = 'Operativni sistemi' AND studentska_sluzba_id = ?`,
      [marko.studentska_sluzba_id]
    );

    if (!predmet) {
      console.log("Predmet 'Operativni sistemi' nije pronađen - pokreni prvo seed_predmeti_pmf.js");
      process.exit(1);
    }

    // Pronađi ili kreiraj "rezultat" za ovaj predmet
    const [[postojeciRezultat]] = await db.query(
      `SELECT id FROM rezultati WHERE predmet_id = ? AND studentska_sluzba_id = ?`,
      [predmet.id, marko.studentska_sluzba_id]
    );

    let rezultatId;
    if (postojeciRezultat) {
      rezultatId = postojeciRezultat.id;
    } else {
      const [result] = await db.query(
        `INSERT INTO rezultati (studentska_sluzba_id, tip, naziv, predmet_id) VALUES (?, 'ispit', ?, ?)`,
        [marko.studentska_sluzba_id, predmet.naziv, predmet.id]
      );
      rezultatId = result.insertId;
    }

    // Pun raspis komponenti - prisustvo + test + kolokvijum + zavrsni
    const komponente = [
      { tip: "prisustvo",       bodovi: 9 },
      { tip: "test",            bodovi: 11 },
      { tip: "kolokvijum_redovni", bodovi: 22 },
      { tip: "zavrsni_redovni", bodovi: 35 },
    ];

    for (const k of komponente) {
      await db.query(
        `INSERT INTO bodovi_komponente (rezultat_id, student_id, tip_boda, bodovi)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE bodovi = VALUES(bodovi)`,
        [rezultatId, marko.id, k.tip, k.bodovi]
      );
    }

    const ukupno = komponente.reduce((zbir, k) => zbir + k.bodovi, 0); // 9+11+22+35 = 77
    const ocjena = izracunajOcjenu(ukupno);
    const polozen = ukupno >= 50 ? 1 : 0;

    await db.query(
      `INSERT INTO rezultat_studenta (rezultat_id, student_id, bodovi, ocjena, polozen)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE bodovi=VALUES(bodovi), ocjena=VALUES(ocjena), polozen=VALUES(polozen)`,
      [rezultatId, marko.id, ukupno, ocjena, polozen]
    );

    console.log(`✅ Operativni sistemi za Marka: ${ukupno} bodova → ocjena ${ocjena}.`);
    console.log("Marko bi sada trebao moći da zatraži digitalni CV.");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

popuniMarka();