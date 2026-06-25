require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("./config/db");

function izracunajOcjenu(b) {
  if (b >= 90) return "A";
  if (b >= 80) return "B";
  if (b >= 70) return "C";
  if (b >= 60) return "D";
  if (b >= 50) return "E";
  return "F";
}

// Format YYYY-MM-DD bez UTC pomijeranja (izbjegava off-by-one bug oko ponoći)
function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function seedKompletno() {
  try {
    console.log("Pokrećem kompletan demo seed za testiranje svih filtera...\n");

    // ─── 0. Provjeri da je originalni seed.js već pokrenut ───────────────────
    const [[pmf]] = await db.query(`SELECT id FROM studentske_sluzbe WHERE naziv_fakulteta = 'PMF'`);
    if (!pmf) {
      console.log("GREŠKA: PMF studentska služba nije pronađena. Pokreni prvo originalni seed.js!");
      process.exit(1);
    }

    const [[ai]] = await db.query(`SELECT id FROM firme WHERE email = 'ai@firma.me'`);
    if (!ai) {
      console.log("GREŠKA: Firma 'Ai' nije pronađena. Pokreni prvo originalni seed.js!");
      process.exit(1);
    }

    const [studenti] = await db.query(
      `SELECT id, jedinstveni_id, ime, prezime FROM studenti WHERE studentska_sluzba_id = ?`,
      [pmf.id]
    );
    if (studenti.length === 0) {
      console.log("GREŠKA: Nema studenata. Pokreni prvo originalni seed.js!");
      process.exit(1);
    }

    const marko = studenti.find((s) => s.jedinstveni_id === "PMF001");
    const milos = studenti.find((s) => s.jedinstveni_id === "PMF002");
    const ana   = studenti.find((s) => s.jedinstveni_id === "PMF003");
    const luka  = studenti.find((s) => s.jedinstveni_id === "PMF004");

    // ─── 1. Dvije nove firme (za testiranje "Firma" filtera kod studenta) ───────
    const lozinkaFirma = await bcrypt.hash("firma123", 10);

    await db.query(
      `INSERT IGNORE INTO firme (uloga_id, naziv_firme, email, lozinka, pib, adresa, opis)
       VALUES (3, 'TechCorp', 'techcorp@firma.me', ?, '87654321', 'Bulevar Revolucije 5, Podgorica', 'IT kompanija za razvoj softvera.')`,
      [lozinkaFirma]
    );
    await db.query(
      `INSERT IGNORE INTO firme (uloga_id, naziv_firme, email, lozinka, pib, adresa, opis)
       VALUES (3, 'WebDev Solutions', 'webdev@firma.me', ?, '11223344', 'Njegoševa 22, Podgorica', 'Web development agencija.')`,
      [lozinkaFirma]
    );

    const [[techcorp]] = await db.query(`SELECT id FROM firme WHERE email = 'techcorp@firma.me'`);
    const [[webdev]]   = await db.query(`SELECT id FROM firme WHERE email = 'webdev@firma.me'`);

    console.log("✓ Firme: Ai, TechCorp (firma123), WebDev Solutions (firma123)");

    // ─── 2. Konkursi sa RAZNIM rokovima (za status/rok filtere) ─────────────────
    const danas   = new Date();
    const plus5   = new Date(danas); plus5.setDate(danas.getDate() + 5);
    const plus15  = new Date(danas); plus15.setDate(danas.getDate() + 15);
    const plus45  = new Date(danas); plus45.setDate(danas.getDate() + 45);
    const minus10 = new Date(danas); minus10.setDate(danas.getDate() - 10);

    const konkursiZaDodati = [
      { firma_id: ai.id,       naslov: "AI Praktikant - Ljeto 2026",     opis: "Tražimo motivisane studente za rad na AI projektima.", pozicija: "AI praktikant",        max: 5,  rok: fmtDate(plus5) },
      { firma_id: ai.id,       naslov: "Data Science Volontiranje",      opis: "Volontiraj na analizi podataka uz mentorstvo.",         pozicija: "Data Science volonter", max: 3,  rok: fmtDate(plus45) },
      { firma_id: techcorp.id, naslov: "Frontend Developer Praksa",      opis: "Praksa za studente zainteresovane za React/Vue.",       pozicija: "Frontend praktikant",   max: 4,  rok: fmtDate(plus15) },
      { firma_id: techcorp.id, naslov: "Backend Radionica - Node.js",    opis: "Jednodnevna radionica iz Node.js razvoja.",             pozicija: "Učesnik radionice",     max: 20, rok: fmtDate(plus5) },
      { firma_id: webdev.id,   naslov: "Junior Web Developer",           opis: "Plaćena praksa za junior web developere.",              pozicija: "Junior developer",      max: 2,  rok: fmtDate(plus15) },
      { firma_id: webdev.id,   naslov: "UI/UX Dizajn Konkurs (istekao)", opis: "Ovaj konkurs je već istekao - za testiranje filtera.",  pozicija: "UI/UX dizajner",        max: 3,  rok: fmtDate(minus10) },
    ];

    const konkursIds = {};
    for (const k of konkursiZaDodati) {
      const [[postojeci]] = await db.query(
        `SELECT id FROM konkursi WHERE naslov = ? AND firma_id = ?`,
        [k.naslov, k.firma_id]
      );
      if (postojeci) {
        konkursIds[k.naslov] = postojeci.id;
      } else {
        const [result] = await db.query(
          `INSERT INTO konkursi (firma_id, naslov, opis, pozicija, maksimalan_broj_prijava, rok_prijave)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [k.firma_id, k.naslov, k.opis, k.pozicija, k.max, k.rok]
        );
        konkursIds[k.naslov] = result.insertId;
      }
    }
    console.log(`✓ ${Object.keys(konkursIds).length} konkursa (uključujući jedan istekao, za testiranje filtera)`);

    // ─── 3. Prijave na konkurse (za broj_prijava i status filter kod studenta) ──
    const prijaveZaDodati = [
      { student: marko, konkurs: "AI Praktikant - Ljeto 2026" },
      { student: marko, konkurs: "Frontend Developer Praksa" },
      { student: milos, konkurs: "AI Praktikant - Ljeto 2026" },
      { student: ana,   konkurs: "Data Science Volontiranje" },
      { student: luka,  konkurs: "Junior Web Developer" },
      { student: luka,  konkurs: "Backend Radionica - Node.js" },
    ];

    let prijaveDodato = 0;
    for (const p of prijaveZaDodati) {
      if (!p.student) continue;
      const konkursId = konkursIds[p.konkurs];
      if (!konkursId) continue;
      const [result] = await db.query(
        `INSERT IGNORE INTO prijave_na_konkurse (konkurs_id, student_id) VALUES (?, ?)`,
        [konkursId, p.student.id]
      );
      if (result.affectedRows > 0) prijaveDodato++;
    }
    console.log(`✓ ${prijaveDodato} nove prijave na konkurse`);

    // ─── 4. Aktivnosti SA bodovima i vezom na konkurs (za Vannastavne filtere) ──
    const aktivnostiZaDodati = [
      { student: marko, firma_id: ai.id,       konkurs: "AI Praktikant - Ljeto 2026",  tip: "praksa",       naziv: "Praksa - AI projekat",            bodovi: 25, datum: fmtDate(new Date(danas.getFullYear(), danas.getMonth() - 1, 10)) },
      { student: marko, firma_id: techcorp.id, konkurs: "Frontend Developer Praksa",   tip: "praksa",       naziv: "Frontend praksa - React",         bodovi: 30, datum: fmtDate(new Date(danas.getFullYear(), danas.getMonth() - 2, 5)) },
      { student: marko, firma_id: webdev.id,   konkurs: null,                          tip: "dogadjaj",     naziv: "Hakaton - UniTrack Challenge",    bodovi: 18, datum: fmtDate(new Date(danas.getFullYear(), danas.getMonth() - 1, 28)) },
      { student: milos, firma_id: ai.id,       konkurs: "AI Praktikant - Ljeto 2026",  tip: "volontiranje", naziv: "Volontiranje na AI konferenciji", bodovi: 15, datum: fmtDate(new Date(danas.getFullYear(), danas.getMonth() - 1, 20)) },
      { student: ana,   firma_id: ai.id,       konkurs: "Data Science Volontiranje",   tip: "volontiranje", naziv: "Data Science volontiranje",       bodovi: 20, datum: fmtDate(new Date(danas.getFullYear(), danas.getMonth(), 2)) },
      { student: luka,  firma_id: webdev.id,   konkurs: "Junior Web Developer",        tip: "praksa",       naziv: "Web developer praksa",            bodovi: 28, datum: fmtDate(new Date(danas.getFullYear(), danas.getMonth() - 3, 15)) },
      { student: luka,  firma_id: techcorp.id, konkurs: "Backend Radionica - Node.js", tip: "radionica",    naziv: "Node.js radionica",                bodovi: 8,  datum: fmtDate(new Date(danas.getFullYear(), danas.getMonth(), 8)) },
    ];

    let aktivnostiDodato = 0;
    for (const a of aktivnostiZaDodati) {
      if (!a.student) continue;
      const konkursId = a.konkurs ? konkursIds[a.konkurs] : null;

      const [[postojeca]] = await db.query(
        `SELECT id FROM aktivnosti_studenata WHERE student_id = ? AND naziv = ?`,
        [a.student.id, a.naziv]
      );
      if (postojeca) continue;

      await db.query(
        `INSERT INTO aktivnosti_studenata (firma_id, student_id, tip, naziv, opis, bodovi, datum_aktivnosti, konkurs_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.firma_id, a.student.id, a.tip, a.naziv, null, a.bodovi, a.datum, konkursId]
      );
      aktivnostiDodato++;
    }
    console.log(`✓ ${aktivnostiDodato} nove vannastavne aktivnosti (sa bodovima i vezom na konkurs)`);

    // ─── 5. Predmeti + upis + bodovi_komponente (raspis za "Moji rezultati") ────
    await db.query(`INSERT IGNORE INTO upisni_period (id, aktivan) VALUES (1, 0)`);

    const predmetiZaDodati = [
      { naziv: "Računarske mreže",        sifra: "RM101", semestar: 3, godina: 2, espb: 6, obavezan: 1 },
      { naziv: "Programski jezici",       sifra: "PJ102", semestar: 3, godina: 2, espb: 6, obavezan: 1 },
      { naziv: "Vještačka inteligencija", sifra: "VI201", semestar: 5, godina: 3, espb: 6, obavezan: 0 },
    ];

    const predmetIds = {};
    for (const p of predmetiZaDodati) {
      const [[postojeci]] = await db.query(
        `SELECT id FROM predmeti WHERE naziv = ? AND studentska_sluzba_id = ?`,
        [p.naziv, pmf.id]
      );
      if (postojeci) {
        predmetIds[p.naziv] = postojeci.id;
      } else {
        const [result] = await db.query(
          `INSERT INTO predmeti (studentska_sluzba_id, naziv, sifra_predmeta, semestar, godina_studija, espb, obavezan)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [pmf.id, p.naziv, p.sifra, p.semestar, p.godina, p.espb, p.obavezan]
        );
        predmetIds[p.naziv] = result.insertId;
      }
    }

    for (const s of studenti) {
      for (const naziv of Object.keys(predmetIds)) {
        await db.query(
          `INSERT IGNORE INTO upisi_predmeta (student_id, predmet_id, akademska_godina, godina_studija)
           VALUES (?, ?, '2025/2026', 2)`,
          [s.id, predmetIds[naziv]]
        );
      }
    }

    const rezultatIds = {};
    for (const naziv of Object.keys(predmetIds)) {
      const [[postojeciRez]] = await db.query(
        `SELECT id FROM rezultati WHERE predmet_id = ? AND studentska_sluzba_id = ?`,
        [predmetIds[naziv], pmf.id]
      );
      if (postojeciRez) {
        rezultatIds[naziv] = postojeciRez.id;
      } else {
        const [result] = await db.query(
          `INSERT INTO rezultati (studentska_sluzba_id, tip, naziv, predmet_id) VALUES (?, 'ispit', ?, ?)`,
          [pmf.id, naziv, predmetIds[naziv]]
        );
        rezultatIds[naziv] = result.insertId;
      }
    }

    // Komponente bodova — raznovrsne kombinacije (testira sabiranje i "popravni zamjenjuje redovni")
    const komponenteZaDodati = [
      { student: marko, predmet: "Računarske mreže",        komponente: { prisustvo: 8,  test: 10, kolokvijum_redovni: 12, kolokvijum_popravni: 18, zavrsni_redovni: 32 } },
      { student: marko, predmet: "Programski jezici",       komponente: { prisustvo: 10, test: 12, kolokvijum_redovni: 20, zavrsni_redovni: 28 } },
      { student: milos, predmet: "Računarske mreže",        komponente: { prisustvo: 6,  test: 8,  kolokvijum_redovni: 22, zavrsni_redovni: 38 } },
      { student: ana,   predmet: "Vještačka inteligencija", komponente: { prisustvo: 9,  test: 9,  kolokvijum_redovni: 24, zavrsni_redovni: 30 } },
      { student: luka,  predmet: "Programski jezici",       komponente: { prisustvo: 4,  test: 5,  kolokvijum_redovni: 10, zavrsni_redovni: 15 } }, // F - nije položio
    ];

    let komponenteDodato = 0;
    for (const k of komponenteZaDodati) {
      if (!k.student) continue;
      const rezultatId = rezultatIds[k.predmet];

      for (const [tip, bodovi] of Object.entries(k.komponente)) {
        await db.query(
          `INSERT INTO bodovi_komponente (rezultat_id, student_id, tip_boda, bodovi)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE bodovi = VALUES(bodovi)`,
          [rezultatId, k.student.id, tip, bodovi]
        );
      }

      const kolokvijum = k.komponente.kolokvijum_popravni ?? k.komponente.kolokvijum_redovni ?? 0;
      const zavrsni    = k.komponente.zavrsni_popravni ?? k.komponente.zavrsni_redovni ?? 0;
      const osnovni    = (k.komponente.prisustvo || 0) + (k.komponente.test || 0);
      const ukupno     = osnovni + kolokvijum + zavrsni;
      const ocjena     = izracunajOcjenu(ukupno);
      const polozen    = ukupno >= 50 ? 1 : 0;

      await db.query(
        `INSERT INTO rezultat_studenta (rezultat_id, student_id, bodovi, ocjena, polozen)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE bodovi=VALUES(bodovi), ocjena=VALUES(ocjena), polozen=VALUES(polozen)`,
        [rezultatId, k.student.id, ukupno, ocjena, polozen]
      );

      console.log(`  ${k.student.ime} ${k.student.prezime} — ${k.predmet}: ${ukupno} bodova → ${ocjena}`);
      komponenteDodato++;
    }

    console.log(`\n✅ Seed završen uspješno!`);
    console.log(`   - 2 nove firme (TechCorp, WebDev Solutions) — lozinka za obje: firma123`);
    console.log(`   - ${Object.keys(konkursIds).length} konkursa (aktivni + 1 istekao)`);
    console.log(`   - ${prijaveDodato} prijave na konkurse`);
    console.log(`   - ${aktivnostiDodato} vannastavne aktivnosti (sa bodovima + konkursom)`);
    console.log(`   - ${komponenteDodato} predmeta sa raspisom bodova po komponentama`);
    console.log(`\nSad možeš testirati SVE filtere: Sluzba/Studenti, Student/Konkursi, Student/Vannastavne, Firma/Konkursi.`);

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

seedKompletno();