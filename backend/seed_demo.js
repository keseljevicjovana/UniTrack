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

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function nasumicno(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedOcjene() {
  console.log("Dodajem ocjene za studente (po njihovoj trenutnoj godini studija)...");

  const [studenti] = await db.query(`SELECT id, godina_studija, studentska_sluzba_id, smjer FROM studenti`);

  let predmetaOcijenjeno = 0;

  for (const s of studenti) {
    // Predmeti na koje je student upisan, ALI samo do njegove trenutne godine
    // (realnije - student 1. godine nema jos ocjene iz 3. godine predmeta)
    const [predmeti] = await db.query(
      `
      SELECT p.id, p.naziv
      FROM upisi_predmeta up
      JOIN predmeti p ON up.predmet_id = p.id
      WHERE up.student_id = ? AND p.godina_studija <= ?
      `,
      [s.id, s.godina_studija]
    );

    for (const p of predmeti) {
      // 75% sanse da je predmet ocijenjen (nije svaki predmet uvijek odmah ocijenjen)
      if (Math.random() > 0.75) continue;

      // Pronadji ili kreiraj "rezultat" za ovaj predmet
      const [[postojeciRezultat]] = await db.query(
        `SELECT id FROM rezultati WHERE predmet_id = ? AND studentska_sluzba_id = ?`,
        [p.id, s.studentska_sluzba_id]
      );

      let rezultatId;
      if (postojeciRezultat) {
        rezultatId = postojeciRezultat.id;
      } else {
        const [result] = await db.query(
          `INSERT INTO rezultati (studentska_sluzba_id, tip, naziv, predmet_id) VALUES (?, 'ispit', ?, ?)`,
          [s.studentska_sluzba_id, p.naziv, p.id]
        );
        rezultatId = result.insertId;
      }

      // Provjeri da student vec nema ocjenu za ovaj rezultat (idempotentno)
      const [[postojecaOcjena]] = await db.query(
        `SELECT id FROM rezultat_studenta WHERE rezultat_id = ? AND student_id = ?`,
        [rezultatId, s.id]
      );
      if (postojecaOcjena) continue;

      // Generisi komponente - prisustvo+test (ponekad), kolokvijum+zavrsni (uvijek)
      const komponente = {};
      if (Math.random() > 0.2) komponente.prisustvo = nasumicno(4, 10);
      if (Math.random() > 0.3) komponente.test = nasumicno(5, 15);

      const kolokvijumRedovni = nasumicno(8, 25);
      // 25% sanse da je radio popravni (i da je popravni bolji)
      if (Math.random() < 0.25) {
        komponente.kolokvijum_redovni = kolokvijumRedovni;
        komponente.kolokvijum_popravni = nasumicno(kolokvijumRedovni, 30);
      } else {
        komponente.kolokvijum_redovni = kolokvijumRedovni;
      }

      const zavrsniRedovni = nasumicno(10, 35);
      if (Math.random() < 0.2) {
        komponente.zavrsni_redovni = zavrsniRedovni;
        komponente.zavrsni_popravni = nasumicno(zavrsniRedovni, 40);
      } else {
        komponente.zavrsni_redovni = zavrsniRedovni;
      }

      for (const [tip, bodovi] of Object.entries(komponente)) {
        await db.query(
          `INSERT INTO bodovi_komponente (rezultat_id, student_id, tip_boda, bodovi)
           VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE bodovi = VALUES(bodovi)`,
          [rezultatId, s.id, tip, bodovi]
        );
      }

      const kolokvijumFinalno = komponente.kolokvijum_popravni ?? komponente.kolokvijum_redovni ?? 0;
      const zavrsniFinalno = komponente.zavrsni_popravni ?? komponente.zavrsni_redovni ?? 0;
      const osnovniZbir = (komponente.prisustvo || 0) + (komponente.test || 0);
      const ukupno = osnovniZbir + kolokvijumFinalno + zavrsniFinalno;
      const ocjena = izracunajOcjenu(ukupno);
      const polozen = ukupno >= 50 ? 1 : 0;

      await db.query(
        `INSERT INTO rezultat_studenta (rezultat_id, student_id, bodovi, ocjena, polozen)
         VALUES (?, ?, ?, ?, ?)`,
        [rezultatId, s.id, ukupno, ocjena, polozen]
      );

      predmetaOcijenjeno++;
    }
  }

  console.log(`✓ Uneseno ${predmetaOcijenjeno} ocjena ukupno.\n`);
}

async function seedKonkursi() {
  console.log("Dodajem konkurse od firmi...");

  const [firme] = await db.query(`SELECT id, naziv_firme FROM firme`);
  if (firme.length === 0) {
    console.log("Nema firmi - preskačem konkurse.\n");
    return;
  }

  const danas = new Date();
  const plus5 = new Date(danas); plus5.setDate(danas.getDate() + 5);
  const plus15 = new Date(danas); plus15.setDate(danas.getDate() + 15);
  const plus30 = new Date(danas); plus30.setDate(danas.getDate() + 30);
  const plus45 = new Date(danas); plus45.setDate(danas.getDate() + 45);

  const konkursiTemplejti = [
    { naslov: "Ljetnja praksa - IT odsjek", opis: "Tražimo motivisane studente za ljetnju praksu u IT timu.", pozicija: "IT praktikant", max: 5, rok: fmtDate(plus15) },
    { naslov: "Volontiranje - Edukativna radionica", opis: "Volontiraj na organizaciji edukativne radionice za srednjoškolce.", pozicija: "Volonter", max: 10, rok: fmtDate(plus30) },
    { naslov: "Junior Developer Praksa", opis: "Plaćena praksa za studente zainteresovane za razvoj softvera.", pozicija: "Junior developer", max: 3, rok: fmtDate(plus45) },
    { naslov: "Marketing asistent - sezonski rad", opis: "Pomoć u organizaciji marketinških kampanja.", pozicija: "Marketing asistent", max: 2, rok: fmtDate(plus5) },
    { naslov: "Data Entry i analiza", opis: "Rad sa podacima, unos i osnovna analiza.", pozicija: "Data asistent", max: 4, rok: fmtDate(plus30) },
  ];

  let dodato = 0;
  for (let i = 0; i < konkursiTemplejti.length; i++) {
    const k = konkursiTemplejti[i];
    const firma = firme[i % firme.length];

    const [[postoji]] = await db.query(
      `SELECT id FROM konkursi WHERE naslov = ? AND firma_id = ?`,
      [k.naslov, firma.id]
    );
    if (postoji) continue;

    await db.query(
      `INSERT INTO konkursi (firma_id, naslov, opis, pozicija, maksimalan_broj_prijava, rok_prijave)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [firma.id, k.naslov, k.opis, k.pozicija, k.max, k.rok]
    );
    dodato++;
  }

  console.log(`✓ Dodato ${dodato} konkursa.\n`);
}

async function seedAktivnosti() {
  console.log("Dodajem vannastavne aktivnosti...");

  const [firme] = await db.query(`SELECT id FROM firme`);
  const [studenti] = await db.query(`SELECT id FROM studenti ORDER BY id ASC LIMIT 40`);

  if (firme.length === 0 || studenti.length === 0) {
    console.log("Nema firmi ili studenata - preskačem aktivnosti.\n");
    return;
  }

  const tipovi = ["dogadjaj", "volontiranje", "praksa", "radionica"];
  const nazivi = [
    "Hakaton - Ljetnji Challenge", "Volontiranje na ekološkoj akciji", "Praksa - razvoj softvera",
    "Radionica - Javni govor", "Sportski turnir fakulteta", "Humanitarna akcija", "Konferencija - Karijerni dani",
  ];

  let dodato = 0;
  const danas = new Date();

  for (const s of studenti) {
    if (Math.random() > 0.5) continue; // ne svi studenti imaju aktivnosti

    const naziv = nazivi[nasumicno(0, nazivi.length - 1)];

    const [[postoji]] = await db.query(
      `SELECT id FROM aktivnosti_studenata WHERE student_id = ? AND naziv = ?`,
      [s.id, naziv]
    );
    if (postoji) continue;

    const firma = firme[nasumicno(0, firme.length - 1)];
    const tip = tipovi[nasumicno(0, tipovi.length - 1)];
    const bodovi = nasumicno(8, 30);
    const datum = new Date(danas);
    datum.setDate(datum.getDate() - nasumicno(5, 90));

    await db.query(
      `INSERT INTO aktivnosti_studenata (firma_id, student_id, tip, naziv, opis, bodovi, datum_aktivnosti)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firma.id, s.id, tip, naziv, null, bodovi, fmtDate(datum)]
    );
    dodato++;
  }

  console.log(`✓ Dodato ${dodato} aktivnosti.\n`);
}

async function seedVauceriScenario() {
  console.log("Postavljam vaučer scenario (Marko/PMF001)...");

  const [[marko]] = await db.query(`SELECT id, studentska_sluzba_id FROM studenti WHERE jedinstveni_id = 'PMF001'`);
  if (!marko) {
    console.log("PMF001 nije pronađen - preskačem vaučer scenario.\n");
    return;
  }

  const sada = new Date();
  const prosliMjesec = sada.getMonth() === 0 ? 12 : sada.getMonth();
  const prosliMjesecGodina = sada.getMonth() === 0 ? sada.getFullYear() - 1 : sada.getFullYear();
  const trenutniMjesec = sada.getMonth() + 1;
  const trenutnaGodina = sada.getFullYear();

  const istekDatum = new Date(sada);
  istekDatum.setMonth(istekDatum.getMonth() + 3);

  // ── Prošli mjesec - PMF001 je već osvojio (1. mjesto) ───────────────────
  const [[postojeciStari]] = await db.query(
    `SELECT id FROM vauceri WHERE naziv_partnera = 'Studentska teretana' AND mjesec = ? AND godina = ? AND studentska_sluzba_id = ?`,
    [prosliMjesec, prosliMjesecGodina, marko.studentska_sluzba_id]
  );

  let stariVaucerId;
  if (postojeciStari) {
    stariVaucerId = postojeciStari.id;
  } else {
    const [result] = await db.query(
      `INSERT INTO vauceri (studentska_sluzba_id, naziv_partnera, opis, procenat_popusta, pozicija, mjesec, godina, datum_isteka)
       VALUES (?, 'Studentska teretana', '50% popusta na članarinu, važi 3 mjeseca.', 50, 1, ?, ?, ?)`,
      [marko.studentska_sluzba_id, prosliMjesec, prosliMjesecGodina, fmtDate(istekDatum)]
    );
    stariVaucerId = result.insertId;
  }

  await db.query(
    `INSERT IGNORE INTO vauceri_dobitnici (vaucer_id, student_id) VALUES (?, ?)`,
    [stariVaucerId, marko.id]
  );

  // ── Trenutni mjesec - struktura nagrada (3., 2., 1. mjesto) ─────────────
  const nagrade = [
    { pozicija: 3, naziv: "Kernel", opis: "25% popusta na opremu u Kernel prodavnici.", procenat: 25 },
    { pozicija: 2, naziv: "Xiaomi Store", opis: "50% popusta na powerbankove.", procenat: 50 },
    { pozicija: 1, naziv: "Cineplexx", opis: "2 besplatne karte + velike kokice + 2 kole, za najnoviji Marvel film (Spider-Man), izlazi krajem jula.", procenat: null },
  ];

  for (const n of nagrade) {
    const [[postoji]] = await db.query(
      `SELECT id FROM vauceri WHERE naziv_partnera = ? AND mjesec = ? AND godina = ? AND studentska_sluzba_id = ?`,
      [n.naziv, trenutniMjesec, trenutnaGodina, marko.studentska_sluzba_id]
    );
    if (postoji) continue;

    await db.query(
      `INSERT INTO vauceri (studentska_sluzba_id, naziv_partnera, opis, procenat_popusta, pozicija, mjesec, godina)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [marko.studentska_sluzba_id, n.naziv, n.opis, n.procenat, n.pozicija, trenutniMjesec, trenutnaGodina]
    );
  }

  console.log("✓ Vaučer scenario postavljen — prošli mjesec (osvojeno) + trenutni mjesec (struktura nagrada).\n");
}

async function pokreniSve() {
  try {
    await seedOcjene();
    await seedKonkursi();
    await seedAktivnosti();
    await seedVauceriScenario();

    console.log("✅ Demo podaci su uspješno dodati.");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

pokreniSve();