require("dotenv").config();
const db = require("./config/db");

function nasumicno(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function popuniBodove() {
  const [studenti] = await db.query(`SELECT id FROM studenti`);

  let azurirano = 0;
  for (const s of studenti) {
    // Akademski — prosjek bodova iz svih unesenih rezultata (stvarni podaci)
    const [[akRow]] = await db.query(
      `SELECT AVG(bodovi) AS prosjek FROM rezultat_studenta WHERE student_id = ?`,
      [s.id]
    );
    const akademski = akRow.prosjek ? Number(akRow.prosjek).toFixed(2) : nasumicno(50, 85);

    // Vannastavne — zbir bodova iz aktivnosti, ograničen na 100 (stvarni podaci)
    const [[vanRow]] = await db.query(
      `SELECT SUM(bodovi) AS zbir FROM aktivnosti_studenata WHERE student_id = ?`,
      [s.id]
    );
    let vannastavne = vanRow.zbir ? Number(vanRow.zbir) : 0;
    if (vannastavne === 0) vannastavne = nasumicno(0, 40);
    if (vannastavne > 100) vannastavne = 100;

    // Društveni doprinos — nema izvora podataka, demo vrijednost
    const drustveni = nasumicno(20, 80);

    // Posebna postignuća — nema izvora podataka, demo vrijednost (manji opseg, kumulativni bonus)
    const posebna = nasumicno(0, 25);

    const [postojeci] = await db.query(
      `SELECT id FROM bodovi_studenata WHERE student_id = ?`,
      [s.id]
    );

    if (postojeci.length === 0) {
      await db.query(
        `INSERT INTO bodovi_studenata
         (student_id, akademski_bodovi, vannastavne_aktivnosti_bodovi, drustveni_doprinos_bodovi, posebna_postignuca_bodovi)
         VALUES (?, ?, ?, ?, ?)`,
        [s.id, akademski, vannastavne, drustveni, posebna]
      );
    } else {
      await db.query(
        `UPDATE bodovi_studenata
         SET akademski_bodovi = ?, vannastavne_aktivnosti_bodovi = ?, drustveni_doprinos_bodovi = ?, posebna_postignuca_bodovi = ?
         WHERE student_id = ?`,
        [akademski, vannastavne, drustveni, posebna, s.id]
      );
    }
    azurirano++;
  }

  console.log(`✓ Popunjeno/ažurirano bodova za ${azurirano} studenata (sve 4 kategorije).`);
  process.exit();
}

popuniBodove().catch((e) => { console.log(e); process.exit(1); });