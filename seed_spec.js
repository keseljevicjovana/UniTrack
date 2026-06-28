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

// ─── Polozi SVE obavezne predmete na koje je student upisan (za CV demo) ────
async function polozisveIspite(studentId) {
  const [predmeti] = await db.query(
    `
    SELECT p.id, p.naziv
    FROM upisi_predmeta up
    JOIN predmeti p ON up.predmet_id = p.id
    WHERE up.student_id = ? AND p.obavezan = 1
    `,
    [studentId]
  );

  for (const p of predmeti) {
    const [[rez]] = await db.query(
      `SELECT id FROM rezultati WHERE predmet_id = ?`,
      [p.id]
    );

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

    // Provjeri da student vec nema ocjenu
    const [[postoji]] = await db.query(
      `SELECT id FROM rezultat_studenta WHERE rezultat_id = ? AND student_id = ?`,
      [rezultatId, studentId]
    );
    if (postoji) continue;

    const komponente = {
      prisustvo: 8,
      test: 10,
      kolokvijum_redovni: 20,
      zavrsni_redovni: 30,
    };

    for (const [tip, bodovi] of Object.entries(komponente)) {
      await db.query(
        `INSERT INTO bodovi_komponente (rezultat_id, student_id, tip_boda, bodovi)
         VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE bodovi = VALUES(bodovi)`,
        [rezultatId, studentId, tip, bodovi]
      );
    }

    const ukupno = 8 + 10 + 20 + 30; // 68 -> D
    const ocjena = izracunajOcjenu(ukupno);

    await db.query(
      `INSERT INTO rezultat_studenta (rezultat_id, student_id, bodovi, ocjena, polozen)
       VALUES (?, ?, ?, ?, 1)`,
      [rezultatId, studentId, ukupno, ocjena]
    );
  }

  return predmeti.length;
}

async function postaviPoznatuLozinku(studentId, lozinkaPlain) {
  const hash = await bcrypt.hash(lozinkaPlain, 10);
  await db.query(`UPDATE studenti SET lozinka = ? WHERE id = ?`, [hash, studentId]);
}

async function main() {
  try {
    const rezultatiZaPrikaz = [];

    // ═══ 1) DVA STUDENTA SA SVIM POLOŽENIM ISPITIMA (za CV demo) ═══════════
    const [[pmfStudent]] = await db.query(
      `SELECT s.id, s.ime, s.prezime, s.jedinstveni_id, s.smjer
       FROM studenti s
       JOIN studentske_sluzbe ss ON s.studentska_sluzba_id = ss.id
       WHERE ss.naziv_fakulteta = 'Prirodno-matematički fakultet'
       ORDER BY s.id ASC LIMIT 1`
    );
    const [[pravniStudent]] = await db.query(
      `SELECT s.id, s.ime, s.prezime, s.jedinstveni_id, s.smjer
       FROM studenti s
       JOIN studentske_sluzbe ss ON s.studentska_sluzba_id = ss.id
       WHERE ss.naziv_fakulteta = 'Pravni fakultet'
       ORDER BY s.id ASC LIMIT 1`
    );

    const lozinkaDemo = "DemoCV2026!";

    if (pmfStudent) {
      const broj = await polozisveIspite(pmfStudent.id);
      await postaviPoznatuLozinku(pmfStudent.id, lozinkaDemo);
      rezultatiZaPrikaz.push({
        svrha: "SVI ISPITI POLOŽENI (PMF) - za CV demo",
        ime: `${pmfStudent.ime} ${pmfStudent.prezime}`,
        jedinstveni_id: pmfStudent.jedinstveni_id,
        lozinka: lozinkaDemo,
        napomena: `${broj} obaveznih predmeta položeno (svaki 68 bodova, D)`,
      });
    }

    if (pravniStudent) {
      const broj = await polozisveIspite(pravniStudent.id);
      await postaviPoznatuLozinku(pravniStudent.id, lozinkaDemo);
      rezultatiZaPrikaz.push({
        svrha: "SVI ISPITI POLOŽENI (Pravni) - za CV demo",
        ime: `${pravniStudent.ime} ${pravniStudent.prezime}`,
        jedinstveni_id: pravniStudent.jedinstveni_id,
        lozinka: lozinkaDemo,
        napomena: `${broj} obaveznih predmeta položeno (svaki 68 bodova, D)`,
      });
    }

    // ═══ 2) DVA STUDENTA KOJI SU OSVOJILI NAGRADE PROŠLOG MJESECA ═══════════
    const [[pmfDobitnik]] = await db.query(
      `SELECT s.id, s.ime, s.prezime, s.jedinstveni_id, s.studentska_sluzba_id
       FROM studenti s
       JOIN studentske_sluzbe ss ON s.studentska_sluzba_id = ss.id
       WHERE ss.naziv_fakulteta = 'Prirodno-matematički fakultet'
       ORDER BY s.id ASC LIMIT 1 OFFSET 1`
    );
    const [[pravniDobitnik]] = await db.query(
      `SELECT s.id, s.ime, s.prezime, s.jedinstveni_id, s.studentska_sluzba_id
       FROM studenti s
       JOIN studentske_sluzbe ss ON s.studentska_sluzba_id = ss.id
       WHERE ss.naziv_fakulteta = 'Pravni fakultet'
       ORDER BY s.id ASC LIMIT 1 OFFSET 1`
    );

    const sada = new Date();
    const prosliMjesec = sada.getMonth() === 0 ? 12 : sada.getMonth();
    const prosliMjesecGodina = sada.getMonth() === 0 ? sada.getFullYear() - 1 : sada.getFullYear();
    const istek = new Date(sada);
    istek.setMonth(istek.getMonth() + 2);

    const lozinkaDobitnik = "DemoVaucer2026!";

    async function dodajIDodijeliVaucer(student, nazivPartnera, opis, procenat, pozicija) {
      const [[postoji]] = await db.query(
        `SELECT id FROM vauceri WHERE naziv_partnera = ? AND mjesec = ? AND godina = ? AND studentska_sluzba_id = ?`,
        [nazivPartnera, prosliMjesec, prosliMjesecGodina, student.studentska_sluzba_id]
      );

      let vaucerId;
      if (postoji) {
        vaucerId = postoji.id;
      } else {
        const [result] = await db.query(
          `INSERT INTO vauceri (studentska_sluzba_id, naziv_partnera, opis, procenat_popusta, pozicija, mjesec, godina, datum_isteka)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [student.studentska_sluzba_id, nazivPartnera, opis, procenat, pozicija, prosliMjesec, prosliMjesecGodina, fmtDate(istek)]
        );
        vaucerId = result.insertId;
      }

      await db.query(
        `INSERT IGNORE INTO vauceri_dobitnici (vaucer_id, student_id) VALUES (?, ?)`,
        [vaucerId, student.id]
      );

      await postaviPoznatuLozinku(student.id, lozinkaDobitnik);
    }

    if (pmfDobitnik) {
      await dodajIDodijeliVaucer(pmfDobitnik, "SportShop Podgorica", "30% popusta na sportsku opremu.", 30, 2);
      rezultatiZaPrikaz.push({
        svrha: "OSVOJIO NAGRADU PROŠLI MJESEC (PMF)",
        ime: `${pmfDobitnik.ime} ${pmfDobitnik.prezime}`,
        jedinstveni_id: pmfDobitnik.jedinstveni_id,
        lozinka: lozinkaDobitnik,
        napomena: "2. mjesto - 30% popusta, SportShop Podgorica",
      });
    }

    if (pravniDobitnik) {
      await dodajIDodijeliVaucer(pravniDobitnik, "Karver Knjižara", "25% popusta na stručnu literaturu.", 25, 3);
      rezultatiZaPrikaz.push({
        svrha: "OSVOJIO NAGRADU PROŠLI MJESEC (Pravni)",
        ime: `${pravniDobitnik.ime} ${pravniDobitnik.prezime}`,
        jedinstveni_id: pravniDobitnik.jedinstveni_id,
        lozinka: lozinkaDobitnik,
        napomena: "3. mjesto - 25% popusta, Karver Knjižara",
      });
    }

    console.log("\n════════════════════════════════════════════════════════");
    console.log("✅ DEMO STUDENTI SPREMNI");
    console.log("════════════════════════════════════════════════════════\n");

    for (const r of rezultatiZaPrikaz) {
      console.log(`${r.svrha}`);
      console.log(`  Ime: ${r.ime}`);
      console.log(`  Login: ${r.jedinstveni_id}  /  Lozinka: ${r.lozinka}`);
      console.log(`  (${r.napomena})\n`);
    }

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();