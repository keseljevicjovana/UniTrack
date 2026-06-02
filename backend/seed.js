const db = require("./config/db");
const bcrypt = require("bcrypt");

async function seed() {
  try {
    const lozinkaSluzba = await bcrypt.hash("sluzba123", 10);
    const lozinkaFirma = await bcrypt.hash("firma123", 10);
    const lozinkaStudent = await bcrypt.hash("student123", 10);

    await db.query(`
      ALTER TABLE studenti
      ADD COLUMN prikaz_na_rang_listi ENUM('ime_prezime', 'jedinstveni_id')
      DEFAULT 'ime_prezime'
    `).catch(() => {});

    await db.query(`
      CREATE TABLE IF NOT EXISTS bodovi_studenata (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL UNIQUE,

        akademski_bodovi DECIMAL(8,2) DEFAULT 0,
        vannastavne_aktivnosti_bodovi DECIMAL(8,2) DEFAULT 0,
        drustveni_doprinos_bodovi DECIMAL(8,2) DEFAULT 0,
        posebna_postignuca_bodovi DECIMAL(8,2) DEFAULT 0,

        ukupno_bodova DECIMAL(8,2) GENERATED ALWAYS AS (
          akademski_bodovi * 0.40 +
          vannastavne_aktivnosti_bodovi * 0.25 +
          drustveni_doprinos_bodovi * 0.20 +
          posebna_postignuca_bodovi * 0.15
        ) STORED,

        datum_azuriranja TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (student_id)
          REFERENCES studenti(id)
          ON DELETE CASCADE
      )
    `);

    await db.query(
      `
      INSERT IGNORE INTO studentske_sluzbe
      (uloga_id, naziv_fakulteta, email, lozinka)
      VALUES (2, 'PMF', 'pmf@unitrack.me', ?)
      `,
      [lozinkaSluzba]
    );

    const [[pmf]] = await db.query(
      `SELECT id FROM studentske_sluzbe WHERE naziv_fakulteta = 'PMF'`
    );

    await db.query(
      `
      INSERT IGNORE INTO firme
      (uloga_id, naziv_firme, email, lozinka, pib, adresa, opis)
      VALUES
      (3, 'Ai', 'ai@firma.me', ?, '12345678', 'Bulevar AI 10, Podgorica',
      'Firma koja se bavi razvojem AI rješenja i praksama za studente.')
      `,
      [lozinkaFirma]
    );

    const [[firma]] = await db.query(
      `SELECT id FROM firme WHERE email = 'ai@firma.me'`
    );

    await db.query(
      `
      INSERT IGNORE INTO studenti
      (uloga_id, studentska_sluzba_id, ime, prezime, jmbg, jedinstveni_id,
       studentski_email, lozinka, broj_indeksa, godina_studija, smjer, prikaz_na_rang_listi)
      VALUES
      (4, ?, 'Marko', 'Marković', '0101000210001', 'PMF001', 'marko.markovic@student.me', ?, '12/21', 3, 'Računarstvo', 'ime_prezime'),
      (4, ?, 'Miloš', 'Popović', '0202000210002', 'PMF002', 'milos.popovic@student.me', ?, '18/21', 3, 'Matematika', 'jedinstveni_id'),
      (4, ?, 'Ana', 'Perović', '0303000210003', 'PMF003', 'ana.perovic@student.me', ?, '25/22', 2, 'Biologija', 'ime_prezime'),
      (4, ?, 'Luka', 'Jovanović', '0404000210004', 'PMF004', 'luka.jovanovic@student.me', ?, '31/22', 2, 'Računarstvo', 'jedinstveni_id')
      `,
      [
        pmf.id, lozinkaStudent,
        pmf.id, lozinkaStudent,
        pmf.id, lozinkaStudent,
        pmf.id, lozinkaStudent,
      ]
    );

    await db.query(
      `
      INSERT INTO konkursi
      (firma_id, naslov, opis, pozicija, maksimalan_broj_prijava, rok_prijave)
      VALUES
      (?, 'Praksa za AI asistenta',
      'Firma Ai traži studente za praksu iz oblasti vještačke inteligencije, web aplikacija i obrade podataka.',
      'AI praktikant', 10, DATE_ADD(CURDATE(), INTERVAL 30 DAY))
      `,
      [firma.id]
    );

    await db.query(
      `
      INSERT INTO rezultati
      (studentska_sluzba_id, tip, naziv, opis)
      VALUES
      (?, 'ispit', 'Programiranje 1', 'Rezultati završnog ispita iz Programiranja 1'),
      (?, 'kolokvijum', 'Baze podataka', 'Rezultati kolokvijuma iz Baza podataka')
      `,
      [pmf.id, pmf.id]
    );

    const [studenti] = await db.query(
      `SELECT id, jedinstveni_id FROM studenti WHERE studentska_sluzba_id = ?`,
      [pmf.id]
    );

    const [rezultati] = await db.query(
      `SELECT id, naziv FROM rezultati WHERE studentska_sluzba_id = ?`,
      [pmf.id]
    );

    for (const student of studenti) {
      await db.query(
        `
        INSERT IGNORE INTO bodovi_studenata
        (student_id, akademski_bodovi, vannastavne_aktivnosti_bodovi,
         drustveni_doprinos_bodovi, posebna_postignuca_bodovi)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          student.id,
          Math.floor(Math.random() * 30) + 70,
          Math.floor(Math.random() * 40) + 50,
          Math.floor(Math.random() * 40) + 45,
          Math.floor(Math.random() * 50) + 30,
        ]
      );

      for (const rezultat of rezultati) {
        await db.query(
          `
          INSERT IGNORE INTO rezultat_studenta
          (rezultat_id, student_id, bodovi, ocjena, napomena)
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            rezultat.id,
            student.id,
            Math.floor(Math.random() * 30) + 60,
            Math.floor(Math.random() * 4) + 7,
            "Uspješno položen predmet.",
          ]
        );
      }
    }

    console.log("Seed podaci su uspješno ubačeni.");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

seed();