require("dotenv").config();
const db = require("./config/db");

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function dohvatiFirmeMapu() {
  const [firme] = await db.query(`SELECT id, naziv_firme FROM firme`);
  const mapa = {};
  for (const f of firme) mapa[f.naziv_firme] = f.id;
  return mapa;
}

async function dodajKonkurseNiz(firmeId, lista) {
  let dodato = 0;
  for (const k of lista) {
    const firmaId = firmeId[k.firma];
    if (!firmaId) { console.log(`  ⚠ Firma "${k.firma}" nije pronađena, preskačem "${k.naslov}"`); continue; }

    const [[postoji]] = await db.query(
      `SELECT id FROM konkursi WHERE naslov = ? AND firma_id = ?`,
      [k.naslov, firmaId]
    );
    if (postoji) continue;

    await db.query(
      `INSERT INTO konkursi (firma_id, naslov, opis, pozicija, maksimalan_broj_prijava, rok_prijave)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [firmaId, k.naslov, k.opis, k.pozicija, k.max, k.rok]
    );
    dodato++;
  }
  return dodato;
}

async function dodajKonkurse() {
  const firmeId = await dohvatiFirmeMapu();
  const danas = new Date();
  const d = (offset) => { const x = new Date(danas); x.setDate(x.getDate() + offset); return fmtDate(x); };

  const novi = [
    // ── CORTEX (dodatno) ──
    { firma: "Cortex", naslov: "Radionica: Uvod u mašinsko učenje", opis: "Praktična radionica za studente svih smjerova - osnove mašinskog učenja kroz primjere.", pozicija: "Učesnik radionice", max: 30, rok: d(15) },
    { firma: "Cortex", naslov: "Tribina: Budućnost AI u Crnoj Gori", opis: "Diskusija sa stručnjacima o tome kako će AI promijeniti tržište rada i obrazovanje u Crnoj Gori.", pozicija: "Učesnik", max: 60, rok: d(25) },

    // ── TEDx PODGORICA (dodatno) ──
    { firma: "TEDx Podgorica", naslov: "TEDx Salon - Mladi inovatori", opis: "Manji TEDx događaj posvećen mladim inovatorima iz Crne Gore.", pozicija: "Učesnik/volonter", max: 40, rok: d(-15) },
    { firma: "TEDx Podgorica", naslov: "Radionica pisanja TED govora", opis: "Kako napisati i isporučiti govor koji ostavlja utisak - praktična radionica.", pozicija: "Učesnik radionice", max: 20, rok: d(12) },
    { firma: "TEDx Podgorica", naslov: "TEDx Podgorica - poziv za predavače", opis: "Imaš ideju vrijednu širenja? Prijavi se da održiš svoj TEDx govor.", pozicija: "Predavač", max: 10, rok: d(30) },

    // ── UDRUŽENJE PRAVNIKA CRNE GORE (dodatno) ──
    { firma: "Udruženje pravnika Crne Gore", naslov: "Konferencija: Ljudska prava i digitalno doba", opis: "Godišnja konferencija o izazovima ljudskih prava u eri digitalizacije.", pozicija: "Učesnik/volonter", max: 50, rok: d(28) },
    { firma: "Udruženje pravnika Crne Gore", naslov: "Radionica: Vještine pregovaranja", opis: "Praktična radionica pregovaračkih vještina za buduće pravnike.", pozicija: "Učesnik radionice", max: 25, rok: d(-20) },
    { firma: "Udruženje pravnika Crne Gore", naslov: "Panel: Karijera u pravosuđu", opis: "Sudije i advokati govore o svom profesionalnom putu i savjeti za studente prava.", pozicija: "Učesnik", max: 40, rok: d(18) },

    // ── DEBATNI KLUB CRNA GORA (dodatno) ──
    { firma: "Debatni klub Crna Gora", naslov: "Debatni turnir - Otvoreno prvenstvo", opis: "Godišnji debatni turnir otvoren za sve studente, bez obzira na smjer.", pozicija: "Debater", max: 32, rok: d(22) },
    { firma: "Debatni klub Crna Gora", naslov: "Radionica kritičkog razmišljanja", opis: "Razvoj vještina logičkog zaključivanja i argumentacije kroz praktične vježbe.", pozicija: "Učesnik radionice", max: 25, rok: d(-8) },
    { firma: "Debatni klub Crna Gora", naslov: "Liga debate - poziv za nove članove", opis: "Pridruži se debatnom klubu i razvijaj vještine javnog govora kroz cijelu godinu.", pozicija: "Član kluba", max: 15, rok: d(40) },

    // ── CRVENI KRST PODGORICA (dodatno) ──
    { firma: "Crveni krst Podgorica", naslov: "Edukacija o prvoj pomoći", opis: "Besplatna edukacija o pružanju prve pomoći, sa sertifikatom o učešću.", pozicija: "Učesnik", max: 35, rok: d(10) },
    { firma: "Crveni krst Podgorica", naslov: "Akcija dobrovoljnog davanja krvi", opis: "Organizacija i podrška akciji dobrovoljnog davanja krvi na fakultetu.", pozicija: "Volonter", max: 20, rok: d(-25) },
    { firma: "Crveni krst Podgorica", naslov: "Volontiranje - podrška starijim sugrađanima", opis: "Redovno volontiranje u podršci starijim i ugroženim sugrađanima.", pozicija: "Volonter", max: 30, rok: d(45) },

    // ── DIGITAL HUB PODGORICA (dodatno) ──
    { firma: "Digital Hub Podgorica", naslov: "Radionica: Uvod u Web razvoj", opis: "Osnove HTML/CSS/JavaScript za studente bez prethodnog iskustva u programiranju.", pozicija: "Učesnik radionice", max: 30, rok: d(-12) },
    { firma: "Digital Hub Podgorica", naslov: "Meetup: Karijere u IT sektoru", opis: "Razgovor sa profesionalcima iz IT industrije o mogućnostima karijere.", pozicija: "Učesnik", max: 50, rok: d(16) },
    { firma: "Digital Hub Podgorica", naslov: "Hakaton - Zelene tehnologije", opis: "48-časovni hakaton na temu rješenja za održivi razvoj i zaštitu životne sredine.", pozicija: "Učesnik hakatona", max: 40, rok: d(38) },
  ];

  const dodato = await dodajKonkurseNiz(firmeId, novi);
  console.log(`✓ Dodato ${dodato} novih konkursa.\n`);

  const [[ukupno]] = await db.query(`SELECT COUNT(*) AS broj FROM konkursi`);
  console.log(`Ukupno konkursa u bazi sada: ${ukupno.broj}\n`);

  const [poFirmi] = await db.query(`
    SELECT f.naziv_firme, COUNT(k.id) AS broj_konkursa
    FROM firme f LEFT JOIN konkursi k ON k.firma_id = f.id
    GROUP BY f.id ORDER BY f.naziv_firme
  `);
  console.log("Konkursa po firmi:");
  for (const row of poFirmi) console.log(`  ${row.naziv_firme}: ${row.broj_konkursa}`);
  console.log("");
}

async function dodajAktivnostiZaStudenta(jedinstveniId, firmeId) {
  const [[student]] = await db.query(`SELECT id, ime, prezime FROM studenti WHERE jedinstveni_id = ?`, [jedinstveniId]);
  if (!student) { console.log(`${jedinstveniId} nije pronađen.\n`); return; }

  const [[brojPostojecih]] = await db.query(`SELECT COUNT(*) AS broj FROM aktivnosti_studenata WHERE student_id = ?`, [student.id]);

  const danas = new Date();
  const d = (offset) => { const x = new Date(danas); x.setDate(x.getDate() - offset); return fmtDate(x); };

  const aktivnosti = [
    { firma: "Cortex", naziv: "Organizacija tribine sa Cortex-om o vještačkoj inteligenciji u medicini", tip: "dogadjaj", bodovi: 22, datum: d(28) },
    { firma: "Cortex", naziv: "Učešće na tribini: Budućnost AI u Crnoj Gori", tip: "dogadjaj", bodovi: 10, datum: d(5) },
    { firma: "TEDx Podgorica", naziv: "Volontiranje na TEDx Podgorica događaju", tip: "volontiranje", bodovi: 18, datum: d(40) },
    { firma: "TEDx Podgorica", naziv: "Učešće na radionici pisanja TED govora", tip: "radionica", bodovi: 12, datum: d(15) },
    { firma: "Debatni klub Crna Gora", naziv: "Učešće na debatnom turniru - Otvoreno prvenstvo", tip: "dogadjaj", bodovi: 20, datum: d(50) },
    { firma: "Debatni klub Crna Gora", naziv: "Radionica kritičkog razmišljanja", tip: "radionica", bodovi: 12, datum: d(60) },
    { firma: "Crveni krst Podgorica", naziv: "Volontiranje - Akcija dobrovoljnog davanja krvi", tip: "volontiranje", bodovi: 15, datum: d(35) },
    { firma: "Crveni krst Podgorica", naziv: "Edukacija o prvoj pomoći", tip: "radionica", bodovi: 10, datum: d(20) },
    { firma: "Udruženje pravnika Crne Gore", naziv: "Učešće na panelu: Karijera u pravosuđu", tip: "dogadjaj", bodovi: 14, datum: d(45) },
    { firma: "Digital Hub Podgorica", naziv: "Učešće na hakatonu - Pametni gradovi", tip: "dogadjaj", bodovi: 25, datum: d(10) },
  ];

  let dodato = 0;
  for (const a of aktivnosti) {
    const [[postoji]] = await db.query(`SELECT id FROM aktivnosti_studenata WHERE student_id = ? AND naziv = ?`, [student.id, a.naziv]);
    if (postoji) continue;

    await db.query(
      `INSERT INTO aktivnosti_studenata (firma_id, student_id, tip, naziv, opis, bodovi, datum_aktivnosti)
       VALUES (?, ?, ?, ?, NULL, ?, ?)`,
      [firmeId[a.firma], student.id, a.tip, a.naziv, a.bodovi, a.datum]
    );
    dodato++;
  }

  const [[ukupnoSad]] = await db.query(`SELECT COUNT(*) AS broj FROM aktivnosti_studenata WHERE student_id = ?`, [student.id]);
  console.log(`✓ ${jedinstveniId} (${student.ime} ${student.prezime}) — dodato ${dodato} novih, ukupno sada: ${ukupnoSad.broj} aktivnosti.`);
}

async function main() {
  try {
    console.log("Dodajem konkurse...\n");
    await dodajKonkurse();

    const firmeId = await dohvatiFirmeMapu();

    console.log("Dodajem aktivnosti za PMF001 (Sara) i PRAV001 (Stefan)...\n");
    await dodajAktivnostiZaStudenta("PMF001", firmeId);
    await dodajAktivnostiZaStudenta("PRAV001", firmeId);

    console.log("\n════════════════════════════════════════════════════════");
    console.log("✅ GOTOVO.");
    console.log("════════════════════════════════════════════════════════");

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();