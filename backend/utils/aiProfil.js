const Anthropic = require("@anthropic-ai/sdk");

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// ─── REZERVNA VARIJANTA (kalup) — koristi se ako AI poziv ne uspije ili
// ako API ključ nije podešen. Aplikacija NIKAD ne puca zbog ovoga. ───────────
function generisiKalupZakljucak(student, kompetencije, interesovanja, preporuceneOblasti) {
  const ime = student.ime;
  const smjer = student.smjer || "odabrane oblasti";

  const kompetencijeTekst = kompetencije.length > 0 ? kompetencije.slice(0, 4).join(", ") : "odgovornost, spremnost na učenje i profesionalni razvoj";
  const interesovanjaTekst = interesovanja.length > 0 ? interesovanja.slice(0, 4).join(", ") : "stručno usavršavanje i razvoj karijere";
  const oblastiTekst = preporuceneOblasti.length > 0 ? preporuceneOblasti.slice(0, 4).join(", ") : "oblasti povezane sa studijskim programom";

  return `${ime} je student smjera ${smjer} koji kroz akademski rad, aktivnosti i dodatna angažovanja pokazuje razvijene kompetencije kao što su ${kompetencijeTekst}. Na osnovu zabilježenih podataka, posebno se ističu interesovanja u oblastima: ${interesovanjaTekst}. Student se preporučuje za oblasti kao što su: ${oblastiTekst}.`;
}

// ─── GLAVNA FUNKCIJA — poziva Claude API, sa fallback na kalup ─────────────
async function generisiAiZakljucak(student, kompetencije, interesovanja, preporuceneOblasti, aktivnosti) {
  // Ako API ključ nije podešen, ne pokušavaj poziv - odmah kalup
  if (!anthropic) {
    return generisiKalupZakljucak(student, kompetencije, interesovanja, preporuceneOblasti);
  }

  try {
    const listaAktivnosti = aktivnosti
      .slice(0, 8)
      .map((a) => `${a.naziv} (${a.tip})`)
      .join(", ") || "nema posebno zabilježenih aktivnosti";

    const prompt = `Napiši JEDAN kratak, profesionalan pasus (4-5 rečenica, bez markdown formatiranja, samo čist tekst) koji predstavlja profesionalni profil studenta za zvanični univerzitetski dokument (digitalni CV).

JEZIK — VEOMA BITNO: Piši ISKLJUČIVO na crnogorskom jeziku (ijekavica), NE hrvatskom i NE srpskom ekavicom. Koristi crnogorsku/standardnu terminologiju, na primjer:
- "univerzitet" (NE "sveučilište")
- "opština" (NE "općina")
- "hiljada" (NE "tisuća")
- "ko" (NE "tko")
- "đe/gdje" su oba u redu, ali izbjegavaj izrazito hrvatske oblike i riječi

Podaci o studentu:
- Ime: ${student.ime}
- Smjer: ${student.smjer}
- Fakultet: ${student.fakultet || student.naziv_fakulteta}
- Kompetencije: ${kompetencije.join(", ") || "nema posebno istaknutih"}
- Interesovanja: ${interesovanja.join(", ") || "nema posebno istaknutih"}
- Preporučene oblasti za karijeru: ${preporuceneOblasti.join(", ") || "nema posebno istaknutih"}
- Aktivnosti: ${listaAktivnosti}

Pravila:
- Piši u trećem licu, formalnim ali toplim tonom (kao zvanična univerzitetska preporuka)
- Ne nabrajaj sve podatke mehanički - uklopi ih prirodno u rečenice
- Ne izmišljaj podatke koji nisu navedeni
- Vrati SAMO tekst pasusa, ništa drugo (nema uvoda, nema "Evo pasusa:", nema citata)`;

    const poruka = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const tekst = poruka.content?.[0]?.text?.trim();

    if (!tekst) {
      throw new Error("Prazan odgovor od AI servisa.");
    }

    return tekst;
  } catch (error) {
    console.log("AI generisanje profila nije uspjelo, koristim kalup:", error.message);
    return generisiKalupZakljucak(student, kompetencije, interesovanja, preporuceneOblasti);
  }
}

module.exports = { generisiAiZakljucak, generisiKalupZakljucak };