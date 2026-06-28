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

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ════════════════════════════════════════════════════════════════════════════
// 1) POPRAVKA PRAV001 — isti bug kao kod Sare (forsirano prepisivanje ocjena,
//    ne preskace ako vec postoji nesto - moglo je biti slucajno palo)
// ════════════════════════════════════════════════════════════════════════════
async function popraviStudenta(jedinstveniId) {
  const [[student]] = await db.query(
    `SELECT id, ime, prezime FROM studenti WHERE jedinstveni_id = ?`,
    [jedinstveniId]
  );

  if (!student) {
    console.log(`${jedinstveniId} nije pronađen - preskačem popravku ocjena.`);
    return null;
  }

  const [predmeti] = await db.query(
    `
    SELECT p.id, p.naziv
    FROM upisi_predmeta up
    JOIN predmeti p ON up.predmet_id = p.id
    WHERE up.student_id = ? AND p.obavezan = 1
    `,
    [student.id]
  );

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

    const komponente = { prisustvo: 8, test: 10, kolokvijum_redovni: 20, zavrsni_redovni: 30 };

    for (const [tip, bodovi] of Object.entries(komponente)) {
      await db.query(
        `INSERT INTO bodovi_komponente (rezultat_id, student_id, tip_boda, bodovi)
         VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE bodovi = VALUES(bodovi)`,
        [rezultatId, student.id, tip, bodovi]
      );
    }

    const ukupno = 68;
    const ocjena = izracunajOcjenu(ukupno);

    await db.query(
      `INSERT INTO rezultat_studenta (rezultat_id, student_id, bodovi, ocjena, polozen)
       VALUES (?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE bodovi = VALUES(bodovi), ocjena = VALUES(ocjena), polozen = 1`,
      [rezultatId, student.id, ukupno, ocjena]
    );
  }

  console.log(`✓ ${jedinstveniId} (${student.ime} ${student.prezime}) — ${predmeti.length} obaveznih predmeta forsirano položeno.`);
  return student;
}

// ════════════════════════════════════════════════════════════════════════════
// 2) BRIŠEMO firme/konkurse/aktivnosti POTPUNO
// ════════════════════════════════════════════════════════════════════════════
async function ocistiFirmeIDogadjaje() {
  await db.query("DELETE FROM prijave_na_konkurse");
  await db.query("DELETE FROM aktivnosti_studenata");
  await db.query("DELETE FROM konkursi");
  await db.query("DELETE FROM firme");
  console.log("✓ Obrisane sve firme, konkursi, aktivnosti, prijave.\n");
}

// ════════════════════════════════════════════════════════════════════════════
// 3) NOVE FIRME — organizacije koje rade tribine/radionice/debate/volontiranje
//    (ne sezonski poslovi - razvoj struke + soft skills)
// ════════════════════════════════════════════════════════════════════════════
async function dodajFirme() {
  const lozinka = await bcrypt.hash("firma123", 10);

  const firme = [
    { naziv: "Cortex", email: "cortex@firma.me", pib: "20001001", adresa: "Bulevar Revolucije 12, Podgorica", opis: "Tehnološka i AI zajednica - organizuje tribine, predavanja i radionice o vještačkoj inteligenciji i njenoj primjeni u različitim oblastima." },
    { naziv: "TEDx Podgorica", email: "tedx@firma.me", pib: "20002002", adresa: "Njegoševa 8, Podgorica", opis: "Nezavisna organizacija koja organizuje TEDx događaje - govori i ideje vrijedne širenja." },
    { naziv: "Udruženje pravnika Crne Gore", email: "upcg@firma.me", pib: "20003003", adresa: "Slobode 22, Podgorica", opis: "Strukovno udruženje pravnika - panel diskusije, konferencije i stručna usavršavanja." },
    { naziv: "Debatni klub Crna Gora", email: "debata@firma.me", pib: "20004004", adresa: "Stanka Dragojevića 3, Podgorica", opis: "Klub za razvoj vještina javnog govora, argumentacije i kritičkog razmišljanja." },
    { naziv: "Crveni krst Podgorica", email: "crvenikrst@firma.me", pib: "20005005", adresa: "Bulevar Save Kovačevića 1, Podgorica", opis: "Humanitarna organizacija - volonterske akcije, edukacije i društveno koristan rad." },
    { naziv: "Digital Hub Podgorica", email: "digitalhub@firma.me", pib: "20006006", adresa: "Cetinjski put 15, Podgorica", opis: "Zajednica za razvoj digitalnih vještina - hakatoni, radionice programiranja i tehnoloških inovacija." },
  ];

  const idMapa = {};
  for (const f of firme) {
    const [result] = await db.query(
      `INSERT INTO firme (uloga_id, naziv_firme, email, lozinka, pib, adresa, opis) VALUES (3, ?, ?, ?, ?, ?, ?)`,
      [f.naziv, f.email, lozinka, f.pib, f.adresa, f.opis]
    );
    idMapa[f.naziv] = result.insertId;
  }

  console.log(`✓ Dodato ${firme.length} novih organizacija (lozinka za sve: firma123).\n`);
  return idMapa;
}

// ════════════════════════════════════════════════════════════════════════════
// 4) KONKURSI — događaji (tribine/radionice/debate), PROŠLI i AKTUELNI
// ════════════════════════════════════════════════════════════════════════════
async function dodajKonkurse(firmeId) {
  const danas = new Date();
  const minus60 = new Date(danas); minus60.setDate(danas.getDate() - 60);
  const minus30 = new Date(danas); minus30.setDate(danas.getDate() - 30);
  const minus10 = new Date(danas); minus10.setDate(danas.getDate() - 10);
  const plus10 = new Date(danas); plus10.setDate(danas.getDate() + 10);
  const plus20 = new Date(danas); plus20.setDate(danas.getDate() + 20);
  const plus35 = new Date(danas); plus35.setDate(danas.getDate() + 35);

  const konkursi = [
    // ── PROŠLI (već se desili) ──
    { firma: "Cortex", naslov: "Tribina: Vještačka inteligencija u medicini", opis: "Poziv za volontere u organizaciji tribine o primjeni AI u medicinskoj dijagnostici.", pozicija: "Volonter - organizacija", max: 8, rok: fmtDate(minus30) },
    { firma: "Udruženje pravnika Crne Gore", naslov: "Panel: Reforma pravosuđa u Crnoj Gori", opis: "Panel diskusija sa sudijama i advokatima o aktuelnim reformama pravosudnog sistema.", pozicija: "Učesnik/volonter", max: 15, rok: fmtDate(minus60) },
    { firma: "Crveni krst Podgorica", naslov: "Humanitarna akcija - Sakupljanje pomoći", opis: "Volontiranje u akciji sakupljanja humanitarne pomoći za ugrožene porodice.", pozicija: "Volonter", max: 20, rok: fmtDate(minus10) },

    // ── AKTUELNI (otvoreni za prijavu) ──
    { firma: "TEDx Podgorica", naslov: "TEDx Podgorica 2026 - poziv za volontere", opis: "Tražimo volontere za organizaciju TEDx Podgorica događaja - logistika, registracija gostiju, produkcija.", pozicija: "Event volonter", max: 25, rok: fmtDate(plus20) },
    { firma: "Debatni klub Crna Gora", naslov: "Radionica javnog govora i argumentacije", opis: "Besplatna radionica za razvoj vještina javnog govora, argumentacije i kritičkog razmišljanja.", pozicija: "Učesnik radionice", max: 30, rok: fmtDate(plus10) },
    { firma: "Digital Hub Podgorica", naslov: "Hakaton - Pametni gradovi", opis: "48-časovni hakaton na temu pametnih gradova - timovi razvijaju prototip rješenja.", pozicija: "Učesnik hakatona", max: 40, rok: fmtDate(plus35) },
    { firma: "Cortex", naslov: "Tribina: AI i etika - poziv za učesnike", opis: "Diskusija o etičkim dilemama vještačke inteligencije, sa gostima iz akademske zajednice.", pozicija: "Učesnik", max: 50, rok: fmtDate(plus10) },
  ];

  let dodato = 0;
  for (const k of konkursi) {
    const firmaId = firmeId[k.firma];
    if (!firmaId) continue;

    await db.query(
      `INSERT INTO konkursi (firma_id, naslov, opis, pozicija, maksimalan_broj_prijava, rok_prijave)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [firmaId, k.naslov, k.opis, k.pozicija, k.max, k.rok]
    );
    dodato++;
  }

  console.log(`✓ Dodato ${dodato} konkursa (3 prošla + 4 aktuelna).\n`);
}

// ════════════════════════════════════════════════════════════════════════════
// 5) AKTIVNOSTI — stvarno učešće studenata (uključujući Sarin Cortex primjer)
// ════════════════════════════════════════════════════════════════════════════
async function dodajAktivnosti(firmeId) {
  const [[sara]] = await db.query(`SELECT id FROM studenti WHERE jedinstveni_id = 'PMF001'`);

  const danas = new Date();
  let dodato = 0;

  if (sara) {
    const datum = new Date(danas); datum.setDate(datum.getDate() - 28);
    await db.query(
      `INSERT INTO aktivnosti_studenata (firma_id, student_id, tip, naziv, opis, bodovi, datum_aktivnosti)
       VALUES (?, ?, 'dogadjaj', 'Organizacija tribine sa Cortex-om o vještačkoj inteligenciji u medicini', 'Aktivno učešće u organizaciji i logistici tribine - koordinacija gostiju i tehnička podrška.', 22, ?)`,
      [firmeId["Cortex"], sara.id, fmtDate(datum)]
    );
    dodato++;
  }

  // Jos nekoliko nasumicnih studenata sa raznim dogadjajima, za raznovrsnost demo podataka
  const [ostaliStudenti] = await db.query(
    `SELECT id FROM studenti WHERE jedinstveni_id != 'PMF001' ORDER BY id ASC LIMIT 25`
  );

  const primjeri = [
    { firma: "TEDx Podgorica", naziv: "Volontiranje na TEDx Podgorica događaju", tip: "volontiranje", bodovi: 18 },
    { firma: "Debatni klub Crna Gora", naziv: "Radionica javnog govora i argumentacije", tip: "radionica", bodovi: 12 },
    { firma: "Crveni krst Podgorica", naziv: "Humanitarna akcija - Sakupljanje pomoći", tip: "volontiranje", bodovi: 15 },
    { firma: "Udruženje pravnika Crne Gore", naziv: "Panel: Reforma pravosuđa u Crnoj Gori", tip: "dogadjaj", bodovi: 10 },
    { firma: "Digital Hub Podgorica", naziv: "Hakaton - Pametni gradovi", tip: "dogadjaj", bodovi: 25 },
  ];

  for (const s of ostaliStudenti) {
    if (Math.random() > 0.4) continue; // ne svi
    const primjer = primjeri[Math.floor(Math.random() * primjeri.length)];
    const datum = new Date(danas); datum.setDate(datum.getDate() - Math.floor(Math.random() * 60 + 5));

    const [[postoji]] = await db.query(
      `SELECT id FROM aktivnosti_studenata WHERE student_id = ? AND naziv = ?`,
      [s.id, primjer.naziv]
    );
    if (postoji) continue;

    await db.query(
      `INSERT INTO aktivnosti_studenata (firma_id, student_id, tip, naziv, opis, bodovi, datum_aktivnosti)
       VALUES (?, ?, ?, ?, NULL, ?, ?)`,
      [firmeId[primjer.firma], s.id, primjer.tip, primjer.naziv, primjer.bodovi, fmtDate(datum)]
    );
    dodato++;
  }

  console.log(`✓ Dodato ${dodato} aktivnosti (uključujući Sarin primjer sa Cortex-om).\n`);
}

// ════════════════════════════════════════════════════════════════════════════
// 6) VAUČERI — jedna nagrada po fakultetu za TRENUTNI mjesec (ne 3 pozicije)
// ════════════════════════════════════════════════════════════════════════════
async function azurirajVaucereTrenutniMjesec() {
  const [[pmf]] = await db.query(`SELECT id FROM studentske_sluzbe WHERE naziv_fakulteta = 'Prirodno-matematički fakultet'`);
  const [[pravni]] = await db.query(`SELECT id FROM studentske_sluzbe WHERE naziv_fakulteta = 'Pravni fakultet'`);

  const sada = new Date();
  const mjesec = sada.getMonth() + 1;
  const godina = sada.getFullYear();

  // Obrisi STARE vaucere za trenutni mjesec (Kernel/Xiaomi/Cineplexx 1-2-3 pozicije) - zamjenjujemo ih
  await db.query(`DELETE FROM vauceri WHERE mjesec = ? AND godina = ? AND studentska_sluzba_id IN (?, ?)`, [mjesec, godina, pmf.id, pravni.id]);

  await db.query(
    `INSERT INTO vauceri (studentska_sluzba_id, naziv_partnera, opis, procenat_popusta, pozicija, mjesec, godina)
     VALUES (?, 'PC Gamer', '40% popusta na sve proizvode OSIM telefona i računara - na telefone i računare ide 20% popusta.', 40, 1, ?, ?)`,
    [pmf.id, mjesec, godina]
  );

  await db.query(
    `INSERT INTO vauceri (studentska_sluzba_id, naziv_partnera, opis, procenat_popusta, pozicija, mjesec, godina)
     VALUES (?, 'Karver Knjižara', '50% popusta na svu literaturu i pribor.', 50, 1, ?, ?)`,
    [pravni.id, mjesec, godina]
  );

  console.log(`✓ Vaučeri za trenutni mjesec (${mjesec}/${godina}) ažurirani — jedan po fakultetu.\n`);
}

// ════════════════════════════════════════════════════════════════════════════
// 7) PMF001 (Sara) — prošli mjesec: 3 mjeseca BESPLATNO u teretani (ne 50%!)
// ════════════════════════════════════════════════════════════════════════════
async function azurirajSarinVaucer() {
  const [[sara]] = await db.query(`SELECT id, studentska_sluzba_id FROM studenti WHERE jedinstveni_id = 'PMF001'`);
  if (!sara) { console.log("PMF001 nije pronađen - preskačem.\n"); return; }

  const sada = new Date();
  const prosliMjesec = sada.getMonth() === 0 ? 12 : sada.getMonth();
  const prosliMjesecGodina = sada.getMonth() === 0 ? sada.getFullYear() - 1 : sada.getFullYear();
  const istek = new Date(sada); istek.setMonth(istek.getMonth() + 3);

  // Obrisi stari (ako postoji, npr. od ranije sa 50%) i napravi ispravan
  await db.query(
    `DELETE FROM vauceri WHERE naziv_partnera = 'Studentska teretana' AND mjesec = ? AND godina = ? AND studentska_sluzba_id = ?`,
    [prosliMjesec, prosliMjesecGodina, sara.studentska_sluzba_id]
  );

  const [result] = await db.query(
    `INSERT INTO vauceri (studentska_sluzba_id, naziv_partnera, opis, procenat_popusta, pozicija, mjesec, godina, datum_isteka)
     VALUES (?, 'Studentska teretana', '3 mjeseca BESPLATNOG članstva.', 100, 1, ?, ?, ?)`,
    [sara.studentska_sluzba_id, prosliMjesec, prosliMjesecGodina, fmtDate(istek)]
  );

  await db.query(`INSERT IGNORE INTO vauceri_dobitnici (vaucer_id, student_id) VALUES (?, ?)`, [result.insertId, sara.id]);

  console.log(`✓ Sarin (PMF001) vaučer ažuriran — 3 mjeseca BESPLATNO u teretani (${prosliMjesec}/${prosliMjesecGodina}).\n`);
}

// ════════════════════════════════════════════════════════════════════════════
// 8) PRAV001 — mart 2026: 2 karte za LOTR maraton u Cineplexx-u (21. mart 2026)
// ════════════════════════════════════════════════════════════════════════════
async function dodajPravniVaucer() {
  const [[prav001]] = await db.query(`SELECT id, studentska_sluzba_id FROM studenti WHERE jedinstveni_id = 'PRAV001'`);
  if (!prav001) { console.log("PRAV001 nije pronađen - preskačem.\n"); return; }

  const mjesecMart = 3;
  const godina2026 = 2026;

  await db.query(
    `DELETE FROM vauceri WHERE naziv_partnera = 'Cineplexx' AND mjesec = ? AND godina = ? AND studentska_sluzba_id = ?`,
    [mjesecMart, godina2026, prav001.studentska_sluzba_id]
  );

  const [result] = await db.query(
    `INSERT INTO vauceri (studentska_sluzba_id, naziv_partnera, opis, procenat_popusta, pozicija, mjesec, godina)
     VALUES (?, 'Cineplexx', '2 besplatne karte za LOTR (Gospodar prstenova) maraton, 21. mart 2026 - sva tri filma u jednom danu.', NULL, 1, ?, ?)`,
    [prav001.studentska_sluzba_id, mjesecMart, godina2026]
  );

  await db.query(`INSERT IGNORE INTO vauceri_dobitnici (vaucer_id, student_id) VALUES (?, ?)`, [result.insertId, prav001.id]);

  console.log(`✓ PRAV001-ov vaučer dodat — 2 karte za LOTR maraton, Cineplexx, 21. mart 2026 (${mjesecMart}/${godina2026}).\n`);
}

// ════════════════════════════════════════════════════════════════════════════
async function main() {
  try {
    console.log("Popravljam ocjene za PMF001 i PRAV001...\n");
    await popraviStudenta("PMF001");
    await popraviStudenta("PRAV001");
    console.log("");

    await ocistiFirmeIDogadjaje();
    const firmeId = await dodajFirme();
    await dodajKonkurse(firmeId);
    await dodajAktivnosti(firmeId);
    await azurirajVaucereTrenutniMjesec();
    await azurirajSarinVaucer();
    await dodajPravniVaucer();

    console.log("════════════════════════════════════════════════════════");
    console.log("✅ SVE JE SREĐENO.");
    console.log("════════════════════════════════════════════════════════");

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();