require("dotenv").config();
const db = require("./config/db");

const SMJEROVI = {
  MATEMATIKA: "MATEMATIKA",
  MRN: "MATEMATIKA I RAČUNARSKE NAUKE",
  RN: "RAČUNARSKE NAUKE",
  RIT: "RAČUNARSTVO I INFORMACIONE TEHNOLOGIJE",
  BIOLOGIJA: "BIOLOGIJA",
  FIZIKA: "FIZIKA",
  HEMIJA: "HEMIJA",
};

async function seedPredmetiPMF() {
  try {
    console.log("Pokrećem proširenje predmeta za sve smjerove PMF-a...\n");

    const [[pmf]] = await db.query(
      `SELECT id FROM studentske_sluzbe WHERE naziv_fakulteta = 'PMF'`
    );
    if (!pmf) {
      console.log("GREŠKA: PMF studentska služba nije pronađena. Pokreni prvo seed.js!");
      process.exit(1);
    }

    // ─── 1. Ažuriraj smjerove postojećih 4 studenta na zvanične nazive ─────────
    const azuriranjaStudenata = [
      { jedinstveni_id: "PMF001", novi_smjer: SMJEROVI.RIT },        // Marko
      { jedinstveni_id: "PMF002", novi_smjer: SMJEROVI.MATEMATIKA }, // Miloš
      { jedinstveni_id: "PMF003", novi_smjer: SMJEROVI.BIOLOGIJA },  // Ana
      { jedinstveni_id: "PMF004", novi_smjer: SMJEROVI.RIT },        // Luka
    ];

    for (const a of azuriranjaStudenata) {
      await db.query(
        `UPDATE studenti SET smjer = ? WHERE jedinstveni_id = ?`,
        [a.novi_smjer, a.jedinstveni_id]
      );
    }
    console.log("✓ Smjerovi postojećih studenata ažurirani na zvanične nazive.");

    // ─── 2. Poveži postojeća 3 predmeta sa smjerom RIT ──────────────────────────
    await db.query(
      `UPDATE predmeti SET smjer = ? WHERE naziv IN ('Računarske mreže', 'Programski jezici', 'Vještačka inteligencija') AND studentska_sluzba_id = ?`,
      [SMJEROVI.RIT, pmf.id]
    );
    console.log("✓ Postojeća 3 predmeta povezana sa smjerom RIT.");

    // ─── 3. Novi predmeti po smjeru (standardni kursevi za ove programe) ───────
    const noviPredmeti = [
      // MATEMATIKA
      { naziv: "Matematička analiza 1",        smjer: SMJEROVI.MATEMATIKA, sifra: "MAT101", semestar: 1, godina: 1, espb: 8, obavezan: 1 },
      { naziv: "Linearna algebra",              smjer: SMJEROVI.MATEMATIKA, sifra: "MAT102", semestar: 1, godina: 1, espb: 7, obavezan: 1 },
      { naziv: "Algebra",                       smjer: SMJEROVI.MATEMATIKA, sifra: "MAT201", semestar: 3, godina: 2, espb: 7, obavezan: 1 },
      { naziv: "Diferencijalne jednačine",      smjer: SMJEROVI.MATEMATIKA, sifra: "MAT202", semestar: 4, godina: 2, espb: 6, obavezan: 1 },
      { naziv: "Vjerovatnoća i statistika",     smjer: SMJEROVI.MATEMATIKA, sifra: "MAT301", semestar: 5, godina: 3, espb: 6, obavezan: 1 },
      { naziv: "Topologija",                    smjer: SMJEROVI.MATEMATIKA, sifra: "MAT302", semestar: 6, godina: 3, espb: 6, obavezan: 0 },

      // MATEMATIKA I RAČUNARSKE NAUKE
      { naziv: "Matematička analiza 1",         smjer: SMJEROVI.MRN, sifra: "MRN101", semestar: 1, godina: 1, espb: 7, obavezan: 1 },
      { naziv: "Uvod u programiranje",          smjer: SMJEROVI.MRN, sifra: "MRN102", semestar: 1, godina: 1, espb: 7, obavezan: 1 },
      { naziv: "Diskretna matematika",          smjer: SMJEROVI.MRN, sifra: "MRN103", semestar: 2, godina: 1, espb: 6, obavezan: 1 },
      { naziv: "Algoritmi i strukture podataka",smjer: SMJEROVI.MRN, sifra: "MRN201", semestar: 3, godina: 2, espb: 7, obavezan: 1 },
      { naziv: "Numerička matematika",          smjer: SMJEROVI.MRN, sifra: "MRN301", semestar: 5, godina: 3, espb: 6, obavezan: 1 },
      { naziv: "Baze podataka",                 smjer: SMJEROVI.MRN, sifra: "MRN302", semestar: 5, godina: 3, espb: 6, obavezan: 0 },

      // RAČUNARSKE NAUKE
      { naziv: "Uvod u programiranje",          smjer: SMJEROVI.RN, sifra: "RN101", semestar: 1, godina: 1, espb: 7, obavezan: 1 },
      { naziv: "Diskretna matematika",          smjer: SMJEROVI.RN, sifra: "RN102", semestar: 1, godina: 1, espb: 6, obavezan: 1 },
      { naziv: "Algoritmi i strukture podataka",smjer: SMJEROVI.RN, sifra: "RN201", semestar: 3, godina: 2, espb: 7, obavezan: 1 },
      { naziv: "Operativni sistemi",            smjer: SMJEROVI.RN, sifra: "RN202", semestar: 4, godina: 2, espb: 6, obavezan: 1 },
      { naziv: "Baze podataka",                 smjer: SMJEROVI.RN, sifra: "RN301", semestar: 5, godina: 3, espb: 6, obavezan: 1 },
      { naziv: "Softversko inženjerstvo",       smjer: SMJEROVI.RN, sifra: "RN302", semestar: 6, godina: 3, espb: 6, obavezan: 0 },

      // RAČUNARSTVO I INFORMACIONE TEHNOLOGIJE (dodatno, pored postojeća 3)
      { naziv: "Operativni sistemi",            smjer: SMJEROVI.RIT, sifra: "RIT201", semestar: 4, godina: 2, espb: 6, obavezan: 1 },
      { naziv: "Web programiranje",             smjer: SMJEROVI.RIT, sifra: "RIT301", semestar: 5, godina: 3, espb: 6, obavezan: 0 },

      // BIOLOGIJA
      { naziv: "Opšta biologija",               smjer: SMJEROVI.BIOLOGIJA, sifra: "BIO101", semestar: 1, godina: 1, espb: 7, obavezan: 1 },
      { naziv: "Botanika",                      smjer: SMJEROVI.BIOLOGIJA, sifra: "BIO102", semestar: 2, godina: 1, espb: 6, obavezan: 1 },
      { naziv: "Zoologija",                     smjer: SMJEROVI.BIOLOGIJA, sifra: "BIO201", semestar: 3, godina: 2, espb: 6, obavezan: 1 },
      { naziv: "Biohemija",                     smjer: SMJEROVI.BIOLOGIJA, sifra: "BIO202", semestar: 4, godina: 2, espb: 6, obavezan: 1 },
      { naziv: "Genetika",                      smjer: SMJEROVI.BIOLOGIJA, sifra: "BIO301", semestar: 5, godina: 3, espb: 6, obavezan: 1 },
      { naziv: "Ekologija",                     smjer: SMJEROVI.BIOLOGIJA, sifra: "BIO302", semestar: 6, godina: 3, espb: 6, obavezan: 0 },

      // FIZIKA
      { naziv: "Mehanika",                      smjer: SMJEROVI.FIZIKA, sifra: "FIZ101", semestar: 1, godina: 1, espb: 7, obavezan: 1 },
      { naziv: "Elektromagnetizam",             smjer: SMJEROVI.FIZIKA, sifra: "FIZ201", semestar: 3, godina: 2, espb: 7, obavezan: 1 },
      { naziv: "Termodinamika",                 smjer: SMJEROVI.FIZIKA, sifra: "FIZ202", semestar: 4, godina: 2, espb: 6, obavezan: 1 },
      { naziv: "Optika",                        smjer: SMJEROVI.FIZIKA, sifra: "FIZ301", semestar: 5, godina: 3, espb: 6, obavezan: 1 },
      { naziv: "Kvantna mehanika",               smjer: SMJEROVI.FIZIKA, sifra: "FIZ302", semestar: 6, godina: 3, espb: 6, obavezan: 0 },
      { naziv: "Matematičke metode fizike",     smjer: SMJEROVI.FIZIKA, sifra: "FIZ203", semestar: 2, godina: 1, espb: 6, obavezan: 1 },

      // HEMIJA
      { naziv: "Opšta hemija",                  smjer: SMJEROVI.HEMIJA, sifra: "HEM101", semestar: 1, godina: 1, espb: 7, obavezan: 1 },
      { naziv: "Neorganska hemija",             smjer: SMJEROVI.HEMIJA, sifra: "HEM102", semestar: 2, godina: 1, espb: 6, obavezan: 1 },
      { naziv: "Organska hemija",               smjer: SMJEROVI.HEMIJA, sifra: "HEM201", semestar: 3, godina: 2, espb: 7, obavezan: 1 },
      { naziv: "Analitička hemija",             smjer: SMJEROVI.HEMIJA, sifra: "HEM202", semestar: 4, godina: 2, espb: 6, obavezan: 1 },
      { naziv: "Fizička hemija",                smjer: SMJEROVI.HEMIJA, sifra: "HEM301", semestar: 5, godina: 3, espb: 6, obavezan: 1 },
      { naziv: "Biohemija",                     smjer: SMJEROVI.HEMIJA, sifra: "HEM302", semestar: 6, godina: 3, espb: 6, obavezan: 0 },
    ];

    let dodato = 0, preskoceno = 0;
    for (const p of noviPredmeti) {
      const [[postojeci]] = await db.query(
        `SELECT id FROM predmeti WHERE naziv = ? AND smjer = ? AND studentska_sluzba_id = ?`,
        [p.naziv, p.smjer, pmf.id]
      );
      if (postojeci) {
        preskoceno++;
        continue;
      }
      await db.query(
        `
        INSERT INTO predmeti
        (studentska_sluzba_id, naziv, smjer, sifra_predmeta, semestar, godina_studija, espb, obavezan)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [pmf.id, p.naziv, p.smjer, p.sifra, p.semestar, p.godina, p.espb, p.obavezan]
      );
      dodato++;
    }
    console.log(`✓ Dodato ${dodato} novih predmeta (${preskoceno} već postojalo).`);

    // ─── 4. Upiši svaki student na predmete NJEGOVOG (ažuriranog) smjera ───────
    const [studenti] = await db.query(
      `SELECT id, jedinstveni_id, smjer FROM studenti WHERE studentska_sluzba_id = ?`,
      [pmf.id]
    );

    let upisano = 0;
    for (const s of studenti) {
      const [predmetiZaSmjer] = await db.query(
        `SELECT id FROM predmeti WHERE smjer = ? AND studentska_sluzba_id = ?`,
        [s.smjer, pmf.id]
      );
      for (const p of predmetiZaSmjer) {
        const [result] = await db.query(
          `
          INSERT IGNORE INTO upisi_predmeta (student_id, predmet_id, akademska_godina, godina_studija)
          VALUES (?, ?, '2025/2026', 2)
          `,
          [s.id, p.id]
        );
        if (result.affectedRows > 0) upisano++;
      }
    }
    console.log(`✓ ${upisano} novih upisa na predmete (po smjeru svakog studenta).`);

    console.log("\n✅ Gotovo! Predmeti su sada raspoređeni po svih 7 smjerova, sa pravim smjer-filterom u Sluzba dashboard-u.");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

seedPredmetiPMF();