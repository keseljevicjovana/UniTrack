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

async function main() {
  try {
    const [[student]] = await db.query(
      `SELECT id, ime, prezime FROM studenti WHERE jedinstveni_id = 'PMF001'`
    );

    if (!student) {
      console.log("PMF001 nije pronađen.");
      process.exit(1);
    }

    console.log(`Popravljam ocjene za: ${student.ime} ${student.prezime} (PMF001)\n`);

    const [predmeti] = await db.query(
      `
      SELECT p.id, p.naziv
      FROM upisi_predmeta up
      JOIN predmeti p ON up.predmet_id = p.id
      WHERE up.student_id = ? AND p.obavezan = 1
      `,
      [student.id]
    );

    console.log(`Pronađeno ${predmeti.length} obaveznih predmeta na koje je upisan/a.\n`);

    for (const p of predmeti) {
      const [[rez]] = await db.query(`SELECT id FROM rezultati WHERE predmet_id = ?`, [p.id]);

      let rezultatId;
      if (rez) {
        rezultatId = rez.id;
      } else {
        const [result] = await db.query(
          `INSERT INTO rezultati (studentska_sluzba_id, tip, naziv, predmet_id)
           SELECT studentska_sluzba_id, 'ispit', naziv, id FROM predmeti WHERE id = ?`,
          [p.id]
        );
        rezultatId = result.insertId;
      }

      // FORSIRANO prepisivanje (ne preskace ni ako vec postoji - bas to je bio bug)
      const komponente = { prisustvo: 8, test: 10, kolokvijum_redovni: 20, zavrsni_redovni: 30 };

      for (const [tip, bodovi] of Object.entries(komponente)) {
        await db.query(
          `INSERT INTO bodovi_komponente (rezultat_id, student_id, tip_boda, bodovi)
           VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE bodovi = VALUES(bodovi)`,
          [rezultatId, student.id, tip, bodovi]
        );
      }

      const ukupno = 8 + 10 + 20 + 30; // 68 -> D
      const ocjena = izracunajOcjenu(ukupno);

      await db.query(
        `INSERT INTO rezultat_studenta (rezultat_id, student_id, bodovi, ocjena, polozen)
         VALUES (?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE bodovi = VALUES(bodovi), ocjena = VALUES(ocjena), polozen = 1`,
        [rezultatId, student.id, ukupno, ocjena]
      );

      console.log(`  ✓ ${p.naziv} -> ${ukupno} bodova (${ocjena})`);
    }

    console.log(`\n✅ Gotovo - svi obavezni predmeti su sad sigurno položeni (68 bodova, D).`);
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();