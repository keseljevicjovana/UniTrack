require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("./config/db");

// ════════════════════════════════════════════════════════════════════════════
// PODACI O PREDMETIMA — tačno onako kako su dati, po smjeru i semestru.
// Funkcija ispod automatski PREPOZNAJE isti naziv predmeta (case-insensitive)
// i koristi JEDAN red u "predmeti" tabeli, samo dodaje veze u "predmet_smjerovi".
// ════════════════════════════════════════════════════════════════════════════

const PMF_SMJEROVI = {
  "Matematika": [
    [1, [["Linearna algebra 1", 8], ["Analiza 1", 8], ["Računari i programiranje", 6], ["Uvod u matematičku logiku", 4], ["Engleski jezik 1", 4]]],
    [2, [["Analiza 2", 8], ["Principi programiranja", 6], ["Linearna algebra 2", 6], ["Analitička geometrija", 4], ["Geometrija ravni i prostora", 4], ["Engleski jezik 2", 2]]],
    [3, [["Analiza 3", 6], ["Programiranje 1", 6], ["Diskretna matematika 1", 5], ["Algebra 1", 5], ["Mehanika", 5], ["Engleski jezik 3", 3]]],
    [4, [["Diferencijalne jednačine", 6], ["Analiza 4", 6], ["Programiranje 2", 6], ["Algebra 2", 5], ["Diskretna matematika 2", 5], ["Engleski jezik 4", 2]]],
    [5, [["Algebra 3", 8], ["Numerička analiza", 6], ["Teorija vjerovatnoće", 6], ["Kompleksna analiza 1", 5], ["Funkcionalna analiza", 5]]],
    [6, [["Statistika", 6], ["Parcijalne jednačine", 6], ["Kompleksna analiza 2", 6], ["Teorija mjere", 6], ["Lanci Markova", 6]]],
  ],
  "Matematika i računarske nauke": [
    [1, [["Linearna algebra 1", 8], ["Analiza 1", 8], ["Računari i programiranje", 6], ["Uvod u matematičku logiku", 4], ["Engleski jezik 1", 4]]],
    [2, [["Analiza 2", 8], ["Principi programiranja", 6], ["Linearna algebra 2", 6], ["Analitička geometrija", 4], ["Geometrija ravni i prostora", 4], ["Engleski jezik 2", 2]]],
    [3, [["Analiza 3", 6], ["Programiranje 1", 6], ["Operativni sistemi", 5], ["Diskretna matematika 1", 5], ["Algebra 1", 5], ["Engleski jezik 3", 3]]],
    [4, [["Diferencijalne jednačine", 6], ["Analiza 4", 6], ["Programiranje 2", 6], ["Algebra 2", 5], ["Diskretna matematika 2", 5], ["Engleski jezik 4", 2]]],
    [5, [["Baze podataka", 6], ["Teorija vjerovatnoće", 6], ["Numerička analiza", 5], ["Kompleksna analiza 1", 5], ["Funkcionalna analiza", 5], ["Objektno orjentisano programiranje", 3]]],
    [6, [["Vjerovatnoća i statistika", 6], ["Kompleksna analiza 2", 6], ["Računarske mreže", 5], ["Programski prevodioci", 5], ["Računarska grafika i vizuelizacija", 4], ["Internet tehnologije", 4]]],
  ],
  "Računarske nauke": [
    [1, [["Računari i programiranje", 6], ["Analiza 1", 6], ["Uvod u kompjuterske nauke", 6], ["Analitička geometrija", 5], ["Uvod u matematičku logiku", 5], ["Engleski jezik 1", 2]]],
    [2, [["Analiza 2", 6], ["Strukture podataka", 6], ["Principi programiranja", 6], ["Linearna algebra", 5], ["Algebra", 5], ["Engleski jezik 2", 2]]],
    [3, [["Analiza 3", 6], ["Operativni sistemi", 6], ["Programiranje 1", 6], ["Diskretna matematika 1", 5], ["Objektno orjentisano programiranje", 3], ["Engleski jezik 3", 4]]],
    [4, [["Programiranje 2", 6], ["Računarske mreže", 6], ["Vjerovatnoća i statistika", 5], ["Diskretna matematika 2", 5], ["Računarska grafika i vizuelizacija", 4], ["Engleski jezik 4", 4]]],
    [5, [["Baze podataka", 6], ["Programski jezici", 5], ["Vještačka inteligencija", 5], ["Numerička analiza", 4], ["Uvod u informacione sisteme", 4], ["Bezbjednost računarskih sistema", 4], ["Arhitektura računarskih sistema", 2]]],
    [6, [["Programski prevodioci", 5], ["Napredne baze podataka", 5], ["Napredne programske tehnike", 5], ["Softversko inženjerstvo", 5], ["Distribuirani računarski sistemi", 4], ["Internet tehnologije", 4], ["Interaktivni dizajn i vizuelizacija", 2]]],
  ],
  "Fizika": [
    [1, [["Matematika 1", 8], ["Fizička mehanika", 8], ["Osnovi fizičkog eksperimenta 1", 4], ["Laboratorijski praktikum 1", 4], ["Računari i programiranje", 3], ["Engleski jezik 1", 3]]],
    [2, [["Matematika 2", 7], ["Molekularna fizika i termodinamika", 7], ["Osnovi fizičkog eksperimenta 2", 5], ["Oscilacije i talasi", 5], ["Engleski jezik 2", 3], ["Laboratorijski praktikum 2", 3]]],
    [3, [["Elektromagnetizam", 8], ["Matematika 3", 7], ["Teorijska mehanika", 6], ["Osnovi mjerenja u fizici", 4], ["Laboratorijski praktikum 3", 3], ["Engleski jezik 3", 2]]],
    [4, [["Matematika 4", 7], ["Teorijska elektrodinamika", 6], ["Optika", 4], ["Osnovi mjerenja u fizici 2", 4], ["Uvod u atomsku fiziku", 4], ["Laboratorijski praktikum 4", 3], ["Engleski jezik 4", 2]]],
    [5, [["Statistička fizika", 10], ["Matematičke metode u fizici", 8], ["Kvantna mehanika 1", 8], ["Istorija i filozofija fizike", 4]]],
    [6, [["Uvod u nuklearnu fiziku", 6], ["Uvod u astronomiju i astrofiziku", 6], ["Fizika čvrstog stanja", 5], ["Kvantna mehanika 2", 5], ["Fizika životne sredine", 5], ["Laboratorijski praktikum 5", 3]]],
  ],
  "Biologija": [
    [1, [["Anatomija i morfologija biljaka", 7], ["Citologija i tkiva", 6], ["Opšta i neorganska hemija", 5], ["Zoologija nižih bekičmenjaka", 5], ["Sistematika algi", 5], ["Istorija biologije", 2]]],
    [2, [["Zoologija viših bekičmenjaka", 6], ["Organska hemija", 5], ["Histologija sa embriologijom", 5], ["Fizika", 4], ["Sistematika gljiva i lišajeva", 4], ["Matematika", 3], ["Engleski jezik 1", 3]]],
    [3, [["Antropologija", 6], ["Opšta fiziologija", 6], ["Biohemija 1", 6], ["Anatomija i morfologija hordata", 6], ["Sistematika i filogenija nevjetnica", 4], ["Engleski jezik 2", 2]]],
    [4, [["Genetika", 7], ["Mikrobiologija", 7], ["Sistematika i filogenija cvjetnica", 6], ["Biohemija 2", 4], ["Sistematika i filogenija hordata", 4], ["Engleski jezik 3", 2]]],
    [5, [["Molekularna biologija", 8], ["Fiziologija biljaka", 7], ["Uporedna fiziologija", 5], ["Ekologija biljaka", 4], ["Ekologija životinja", 4], ["Engleski jezik 4", 2]]],
    [6, [["Hidrobiologija", 6], ["Ekologija vegetacije", 5], ["Ekologija životinja sa zoogeografijom", 5], ["Evolucija", 4], ["Humana ekologija", 4], ["Instrumentalne metode u biologiji", 4], ["Zaštita životne sredine", 2]]],
  ],
};

const PRAVNI_SMJEROVI = {
  "Pravne nauke": [
    [1, [["Opšta teorija prava", 7], ["Rimsko pravo", 6], ["Osnovi sociologije i sociologija prava", 6], ["Opšta i nacionalna pravna istorija", 6], ["Savremeni politički sistemi", 5]]],
    [2, [["Ustavno pravo", 8], ["Uvod u građansko pravo", 8], ["Radno pravo", 7], ["Osnovi prava Evropske unije", 7]]],
    [3, [["Stvarno pravo", 7], ["Krivično pravo - opšti dio", 7], ["Porodično pravo", 6], ["Nasljedno pravo", 6], ["Engleski jezik struke", 4]]],
    [4, [["Obligaciono pravo", 6], ["Upravno pravo", 6], ["Finansijsko pravo", 6], ["Krivično pravo - posebni dio", 6], ["Kompanijsko pravo", 6]]],
    [5, [["Međunarodno javno pravo", 6], ["Građansko procesno pravo", 6], ["Međunarodno privatno pravo", 6], ["Krivično procesno pravo", 6], ["Trgovinsko pravo", 6]]],
    [6, [["Pomorsko pravo", 6], ["Međunarodne organizacije", 6], ["Autorsko pravo i pravo industrije svojine", 6], ["Kriminalistika", 6], ["Krivično izvršno pravo", 6]]],
  ],
};

// ════════════════════════════════════════════════════════════════════════════

function godinaIzSemestra(semestar) {
  return Math.ceil(semestar / 2);
}

// Ubacuje predmete za jedan fakultet, prepoznaje duplikate preko naziva
// (case-insensitive), vraća mapu { "naziv (lowercase)": predmet_id }
async function ubaciPredmete(sluzbaId, smjeroviData) {
  const predmetIdMapa = {}; // lowercase naziv -> id

  for (const [smjer, semestri] of Object.entries(smjeroviData)) {
    for (const [semestar, predmetiList] of semestri) {
      const godina = godinaIzSemestra(semestar);

      for (const [naziv, espb] of predmetiList) {
        const kljuc = naziv.toLowerCase().trim();
        let predmetId;

        if (predmetIdMapa[kljuc]) {
          // Predmet već postoji (od nekog drugog smjera/semestra) - samo
          // dodajemo vezu na NOVI smjer ako već nema tu vezu
          predmetId = predmetIdMapa[kljuc];
        } else {
          const [result] = await db.query(
            `INSERT INTO predmeti (studentska_sluzba_id, naziv, sifra_predmeta, semestar, godina_studija, espb, obavezan)
             VALUES (?, ?, NULL, ?, ?, ?, 1)`,
            [sluzbaId, naziv, semestar, godina, espb]
          );
          predmetId = result.insertId;
          predmetIdMapa[kljuc] = predmetId;
        }

        await db.query(
          `INSERT IGNORE INTO predmet_smjerovi (predmet_id, smjer) VALUES (?, ?)`,
          [predmetId, smjer]
        );
      }
    }
  }

  return predmetIdMapa;
}

// ════════════════════════════════════════════════════════════════════════════
// GENERISANJE STUDENATA
// ════════════════════════════════════════════════════════════════════════════

const IMENA_M = ["Marko", "Luka", "Nikola", "Stefan", "Filip", "Petar", "Andrija", "Vuk", "Igor", "Bojan", "Miloš", "Aleksa", "Đorđe", "Nemanja", "Vasilije", "Pavle", "Lazar", "Mihailo", "Jovan", "Marko"];
const IMENA_Z = ["Ana", "Jovana", "Milica", "Tijana", "Ema", "Sara", "Teodora", "Anastasija", "Nina", "Mila", "Jana", "Iva", "Lana", "Maša", "Kristina", "Marija", "Sofija", "Vanja", "Dunja", "Ksenija"];
const PREZIMENA = ["Marković", "Jovanović", "Petrović", "Nikolić", "Popović", "Đukanović", "Vuković", "Radulović", "Pavićević", "Bulatović", "Ivanović", "Mijović", "Knežević", "Đurović", "Lakić", "Vujović", "Stanković", "Krivokapić", "Šćekić", "Boljević"];

function nasumicniIz(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function generisiJMBG(brojac) {
  // Nije stvarno validan JMBG, samo jedinstven 13-cifren string za bazu
  return String(brojac).padStart(13, "1");
}

async function generisiStudente(sluzbaId, prefiksId, smjeroviNazivi, lozinkaHash, brojStudenata) {
  const studenti = [];

  for (let i = 1; i <= brojStudenata; i++) {
    const muski = Math.random() > 0.5;
    const ime = muski ? nasumicniIz(IMENA_M) : nasumicniIz(IMENA_Z);
    const prezime = nasumicniIz(PREZIMENA);
    const smjer = nasumicniIz(smjeroviNazivi);
    const godina = Math.floor(Math.random() * 3) + 1; // 1-3
    const jedinstveniId = `${prefiksId}${String(i).padStart(3, "0")}`;
    const email = `${ime.toLowerCase()}.${prezime.toLowerCase()}${i}@student.me`.replace(/[čćšžđ]/g, (c) => ({č:"c",ć:"c",š:"s",ž:"z",đ:"d"}[c]));
    const jmbg = generisiJMBG(`${prefiksId.length}${i}${Date.now() % 100000}`);
    const brojIndeksa = `${i}/${20 + godina}`;
    const prikaz = i % 2 === 0 ? "ime_prezime" : "jedinstveni_id";

    studenti.push([4, sluzbaId, ime, prezime, jmbg, jedinstveniId, email, lozinkaHash, brojIndeksa, godina, smjer, prikaz]);
  }

  // Batch insert (brže nego jedan po jedan)
  for (const s of studenti) {
    await db.query(
      `INSERT INTO studenti
       (uloga_id, studentska_sluzba_id, ime, prezime, jmbg, jedinstveni_id, studentski_email, lozinka, broj_indeksa, godina_studija, smjer, prikaz_na_rang_listi)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      s
    );
  }

  return studenti.length;
}

async function upisiStudenteNaPredmete(sluzbaId) {
  const [studenti] = await db.query(
    `SELECT id, smjer FROM studenti WHERE studentska_sluzba_id = ?`,
    [sluzbaId]
  );

  let upisano = 0;
  for (const s of studenti) {
    const [predmeti] = await db.query(
      `SELECT p.id FROM predmeti p
       JOIN predmet_smjerovi ps ON ps.predmet_id = p.id
       WHERE ps.smjer = ? AND p.studentska_sluzba_id = ?`,
      [s.smjer, sluzbaId]
    );

    for (const p of predmeti) {
      const [result] = await db.query(
        `INSERT IGNORE INTO upisi_predmeta (student_id, predmet_id, akademska_godina, godina_studija)
         VALUES (?, ?, '2025/2026', 2)`,
        [s.id, p.id]
      );
      if (result.affectedRows > 0) upisano++;
    }
  }
  return upisano;
}

async function dodajBodoveStudentima(sluzbaId) {
  const [studenti] = await db.query(`SELECT id FROM studenti WHERE studentska_sluzba_id = ?`, [sluzbaId]);
  for (const s of studenti) {
    await db.query(
      `INSERT IGNORE INTO bodovi_studenata (student_id, akademski_bodovi, vannastavne_aktivnosti_bodovi, drustveni_doprinos_bodovi, posebna_postignuca_bodovi)
       VALUES (?, ?, ?, ?, ?)`,
      [s.id, Math.floor(Math.random() * 30) + 65, Math.floor(Math.random() * 40) + 45, Math.floor(Math.random() * 40) + 40, Math.floor(Math.random() * 50) + 25]
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// GLAVNA FUNKCIJA
// ════════════════════════════════════════════════════════════════════════════

async function resetujISeeduj() {
  try {
    console.log("⚠️  Brišem sve podatke osim admina...\n");

    // Brisanje redom (FK redoslijed - djeca prije roditelja)
    await db.query("DELETE FROM bodovi_komponente");
    await db.query("DELETE FROM rezultat_studenta");
    await db.query("DELETE FROM rezultati");
    await db.query("DELETE FROM upisi_predmeta");
    await db.query("DELETE FROM predmet_smjerovi");
    await db.query("DELETE FROM predmeti");
    await db.query("DELETE FROM prijave_na_konkurse");
    await db.query("DELETE FROM konkursi");
    await db.query("DELETE FROM aktivnosti_studenata");
    await db.query("DELETE FROM zahtjevi_za_stampanje_cv");
    await db.query("DELETE FROM bodovi_studenata");
    await db.query("DELETE FROM objave");
    await db.query("DELETE FROM vauceri");
    await db.query("DELETE FROM studenti");
    await db.query("DELETE FROM firme");
    await db.query("DELETE FROM studentske_sluzbe");
    await db.query("DELETE FROM upisni_period");

    console.log("✓ Obrisano sve (admini su netaknuti).\n");

    // ─── Studentske sluzbe ──────────────────────────────────────────────────
    const lozinkaSluzba = await bcrypt.hash("sluzba123", 10);
    const lozinkaStudent = await bcrypt.hash("student123", 10);
    const lozinkaFirma = await bcrypt.hash("firma123", 10);

    await db.query(
      `INSERT INTO studentske_sluzbe (uloga_id, naziv_fakulteta, email, lozinka) VALUES
       (2, 'Prirodno-matematički fakultet', 'pmf@unitrack.me', ?),
       (2, 'Pravni fakultet', 'pravni@unitrack.me', ?)`,
      [lozinkaSluzba, lozinkaSluzba]
    );

    const [[pmf]] = await db.query(`SELECT id FROM studentske_sluzbe WHERE naziv_fakulteta = 'Prirodno-matematički fakultet'`);
    const [[pravni]] = await db.query(`SELECT id FROM studentske_sluzbe WHERE naziv_fakulteta = 'Pravni fakultet'`);

    console.log("✓ Dodata 2 fakulteta (PMF, Pravni) — lozinka za oba: sluzba123\n");

    // ─── Predmeti (deduplikovani preko predmet_smjerovi) ────────────────────
    console.log("Dodajem predmete za PMF...");
    await ubaciPredmete(pmf.id, PMF_SMJEROVI);

    console.log("Dodajem predmete za Pravni fakultet...");
    await ubaciPredmete(pravni.id, PRAVNI_SMJEROVI);

    const [[brojPredmetaPmf]] = await db.query(`SELECT COUNT(*) AS ukupno FROM predmeti WHERE studentska_sluzba_id = ?`, [pmf.id]);
    const [[brojPredmetaPravni]] = await db.query(`SELECT COUNT(*) AS ukupno FROM predmeti WHERE studentska_sluzba_id = ?`, [pravni.id]);
    console.log(`✓ PMF: ${brojPredmetaPmf.ukupno} unikatnih predmeta. Pravni: ${brojPredmetaPravni.ukupno} unikatnih predmeta.\n`);

    // ─── Studenti — 100 po fakultetu ─────────────────────────────────────────
    console.log("Generišem 100 studenata za PMF...");
    await generisiStudente(pmf.id, "PMF", Object.keys(PMF_SMJEROVI), lozinkaStudent, 100);

    console.log("Generišem 100 studenata za Pravni fakultet...");
    await generisiStudente(pravni.id, "PRAV", Object.keys(PRAVNI_SMJEROVI), lozinkaStudent, 100);

    console.log("✓ 200 studenata dodato — lozinka za sve: student123\n");

    // ─── Upis studenata na predmete njihovog smjera ─────────────────────────
    console.log("Upisujem studente na predmete njihovog smjera...");
    const upisanoPmf = await upisiStudenteNaPredmete(pmf.id);
    const upisanoPravni = await upisiStudenteNaPredmete(pravni.id);
    console.log(`✓ ${upisanoPmf + upisanoPravni} upisa ukupno.\n`);

    // ─── UniTrack bodovi za sve studente (za rang listu) ────────────────────
    console.log("Dodajem UniTrack bodove svim studentima...");
    await dodajBodoveStudentima(pmf.id);
    await dodajBodoveStudentima(pravni.id);
    console.log("✓ Gotovo.\n");

    // ─── Upisni period ───────────────────────────────────────────────────────
    await db.query(`INSERT INTO upisni_period (id, aktivan) VALUES (1, 0)`);

    // ─── Firme — nekoliko novih, sa lozinkama direktno u bazi ───────────────
    const firme = [
      { naziv: "Mtel Crna Gora", email: "mtel@firma.me", pib: "10001001", adresa: "Bulevar Svetog Petra Cetinjskog, Podgorica", opis: "Telekomunikacione usluge i digitalna rješenja." },
      { naziv: "Crnogorski Telekom", email: "telekom@firma.me", pib: "10002002", adresa: "Moskovska 5, Podgorica", opis: "Vodeći telekom operator u Crnoj Gori." },
      { naziv: "NLB Banka", email: "nlb@firma.me", pib: "10003003", adresa: "Stanka Dragojevića 58, Podgorica", opis: "Bankarske i finansijske usluge." },
      { naziv: "TechCorp", email: "techcorp@firma.me", pib: "10004004", adresa: "Bulevar Revolucije 5, Podgorica", opis: "IT kompanija za razvoj softvera." },
      { naziv: "WebDev Solutions", email: "webdev@firma.me", pib: "10005005", adresa: "Njegoševa 22, Podgorica", opis: "Web development agencija." },
      { naziv: "Advokatska kancelarija Lakić", email: "lakic.law@firma.me", pib: "10006006", adresa: "Slobode 12, Podgorica", opis: "Pravne usluge i konsalting za privredna društva." },
    ];

    for (const f of firme) {
      await db.query(
        `INSERT INTO firme (uloga_id, naziv_firme, email, lozinka, pib, adresa, opis) VALUES (3, ?, ?, ?, ?, ?, ?)`,
        [f.naziv, f.email, lozinkaFirma, f.pib, f.adresa, f.opis]
      );
    }

    console.log(`✓ ${firme.length} firmi dodato — lozinka za sve: firma123\n`);

    // ─── Vaučeri — primjeri za trenutni mjesec, oba fakulteta ───────────────
    const sada = new Date();
    const mjesecSad = sada.getMonth() + 1;
    const godinaSad = sada.getFullYear();

    const vauceriPrimjeri = [
      { sluzbaId: pmf.id, naziv: "Studentski dom Podgorica", opis: "Popust na smještaj za aktivne studente.", procenat: 30 },
      { sluzbaId: pmf.id, naziv: "FitZone Teretana", opis: "Popust na članarinu.", procenat: 20 },
      { sluzbaId: pmf.id, naziv: "Mensa Restoran", opis: "Popust na obroke u studentskoj menzi.", procenat: 50 },
      { sluzbaId: pravni.id, naziv: "Studentski dom Podgorica", opis: "Popust na smještaj za aktivne studente.", procenat: 30 },
      { sluzbaId: pravni.id, naziv: "Knjižara Karver", opis: "Popust na stručnu literaturu.", procenat: 15 },
    ];

    for (const v of vauceriPrimjeri) {
      await db.query(
        `INSERT INTO vauceri (studentska_sluzba_id, naziv_partnera, opis, procenat_popusta, mjesec, godina)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [v.sluzbaId, v.naziv, v.opis, v.procenat, mjesecSad, godinaSad]
      );
    }

    console.log(`✓ ${vauceriPrimjeri.length} vaučera dodato za trenutni mjesec (${mjesecSad}/${godinaSad}).\n`);

    console.log("════════════════════════════════════════════════════");
    console.log("✅ KOMPLETNO RESETOVANO I PONOVO POPUNJENO.");
    console.log("════════════════════════════════════════════════════");
    console.log("PMF služba:    pmf@unitrack.me / sluzba123");
    console.log("Pravni služba: pravni@unitrack.me / sluzba123");
    console.log("Svi studenti:  [jedinstveni_id ili email] / student123");
    console.log("Sve firme:     [email] / firma123");
    console.log("Admin nalozi su netaknuti.");

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

resetujISeeduj();