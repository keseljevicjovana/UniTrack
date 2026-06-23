import { useState, useEffect, useCallback } from "react";
import api from "../../api/api";
import Alert from "../../components/admin/Alert";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const IcoLock      = () => <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v2"/></svg>;
const IcoPrinter    = () => <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>;
const IcoCheck      = () => <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>;
const IcoTrophy     = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>;

// ─── BOSANSKI NAZIVI MJESECI ──────────────────────────────────────────────────
const MJESECI = ["januar","februar","mart","april","maj","jun","jul","avgust","septembar","oktobar","novembar","decembar"];
const formatirajDatum = (datum) => {
  if (!datum) return "—";
  const d = datum instanceof Date ? datum : new Date(datum);
  return `${d.getDate()}. ${MJESECI[d.getMonth()]} ${d.getFullYear()}.`;
};

// ─── TIP AKTIVNOSTI → labela i boja ───────────────────────────────────────────
const TIP_INFO = {
  praksa:        { label: "Praksa",        bg: "#F5EFE7", color: "#6B4C2A" },
  volontiranje:  { label: "Volontiranje",  bg: "#E8F5E9", color: "#2E7D32" },
  radionica:     { label: "Radionica",     bg: "#E3F2FD", color: "#1565C0" },
  dogadjaj:      { label: "Događaj",       bg: "#FFF3E0", color: "#E65100" },
  drugo:         { label: "Drugo",         bg: "#F3E5F5", color: "#6A1B9A" },
};
const tipInfo = (tip) => TIP_INFO[tip] || TIP_INFO.drugo;

const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#8B7355] text-sm">
    <div className="w-7 h-7 border-2 border-[#DDD0BE] border-t-[#6B4C2A] rounded-full animate-spin" />
    Učitavanje digitalnog CV-a...
  </div>
);

// ─── SCORE BAR (jedna kategorija bodova) ──────────────────────────────────────
const ScoreBar = ({ label, value, maxValue = 100, weight }) => {
  const pct = Math.min(((value || 0) / maxValue) * 100, 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[12.5px] font-semibold text-[#5C4033]">{label} <span className="text-[10.5px] text-[#A89682]">({weight})</span></span>
        <span className="text-[13px] font-bold text-[#2C1A0E]">{value ?? 0}</span>
      </div>
      <div className="h-[7px] bg-[#EDE5DA] rounded-full overflow-hidden">
        <div className="h-full bg-[#A0784A] rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ─── TAG PILL ──────────────────────────────────────────────────────────────────
const Tag = ({ children }) => (
  <span className="inline-block text-[11.5px] font-semibold px-3 py-1.5 rounded-full mr-2 mb-2" style={{ background: "#F5EFE7", color: "#6B4C2A", border: "1px solid #DDD0BE" }}>
    {children}
  </span>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const DigitalniCV = () => {
  const [loading, setLoading] = useState(true);
  const [imaPristup, setImaPristup] = useState(null);
  const [cv, setCv] = useState(null);
  const [poruka, setPoruka] = useState("");
  const [nepolozeni, setNepolozeni] = useState(0);
  const [alert, setAlert] = useState({ msg: "", type: "" });
  const [stampanjeLoading, setStampanjeLoading] = useState(false);
  const [zahtjevPoslat, setZahtjevPoslat] = useState(false);

  const showAlert = (msg, type = "success") => setAlert({ msg, type });
  const hideAlert = () => setAlert({ msg: "", type: "" });

  const fetchCV = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/student/digitalni-cv");
      if (res.data.success) {
        setImaPristup(true);
        setCv(res.data.digitalniCV);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data && data.imaPristup === false) {
        setImaPristup(false);
        setPoruka(data.message);
        setNepolozeni(data.nepolozeni_predmeti || 0);
      } else {
        showAlert("Greška pri učitavanju digitalnog CV-a.", "error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCV(); }, [fetchCV]);

  const zatraziStampanje = async () => {
    setStampanjeLoading(true);
    try {
      const res = await api.post("/student/digitalni-cv/stampanje");
      if (res.data.success) {
        showAlert(res.data.message);
        setZahtjevPoslat(true);
      } else {
        showAlert(res.data.message || "Greška.", "error");
      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Greška pri slanju zahtjeva.", "error");
    } finally {
      setStampanjeLoading(false);
    }
  };

  if (loading) return <Spinner />;

  // ─── NEMA PRISTUPA ──────────────────────────────────────────────────────────
  if (imaPristup === false) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[#F5EFE7] flex items-center justify-center text-[#A0784A] mb-5">
          <IcoLock />
        </div>
        <h2 className="text-[18px] font-bold text-[#2C1A0E] mb-2">Digitalni CV još nije dostupan</h2>
        <p className="text-[13.5px] text-[#8B7355] mb-1">{poruka}</p>
        {nepolozeni > 0 && (
          <p className="text-[12px] text-[#A0784A] font-semibold mt-3">
            Položite još {nepolozeni} {nepolozeni === 1 ? "ispit" : "ispita"} da otključate ovu funkcionalnost.
          </p>
        )}
      </div>
    );
  }

  // ─── PRIKAZ CV-A ────────────────────────────────────────────────────────────
  const { student, aktivnosti, istaknutaPostignuca, kompetencije, interesovanja, preporuceneOblasti, unitrackScore, profesionalniZakljucak } = cv;

  return (
    <div>
      <Alert message={alert.msg} type={alert.type} onClose={hideAlert} />

      <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#2C1A0E]">Digitalni CV</h1>
          <p className="text-[14px] text-[#8B7355] mt-1">Automatski generisan na osnovu tvojih aktivnosti i postignuća.</p>
        </div>
        <button
          onClick={zatraziStampanje}
          disabled={stampanjeLoading || zahtjevPoslat}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "#A0784A" }}
        >
          <IcoPrinter />
          {zahtjevPoslat ? "Zahtjev poslat" : stampanjeLoading ? "Slanje..." : "Zatraži štampanje CV-a"}
        </button>
      </div>

      {/* Header kartica sa osnovnim podacima */}
      <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 mb-6 flex items-center gap-5 flex-wrap">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[22px] font-bold flex-shrink-0" style={{ background: "#A0784A" }}>
          {student.ime?.[0]}{student.prezime?.[0]}
        </div>
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-[17px] font-bold text-[#2C1A0E]">{student.ime} {student.prezime}</h2>
          <p className="text-[12.5px] text-[#8B7355] mt-0.5">{student.smjer} · {student.fakultet}</p>
          <p className="text-[12px] text-[#A89682] mt-0.5">{student.email} · Indeks: {student.broj_indeksa}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LIJEVA KOLONA — bodovi + tagovi */}
        <div className="lg:col-span-1 space-y-6">

          {/* UniTrack Score */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <IcoTrophy />
              <h3 className="text-[14px] font-bold text-[#2C1A0E]">UniTrack bodovi</h3>
            </div>
            <div className="text-center mb-5 pb-5 border-b border-[#EDE5DA]">
              <span className="text-[40px] font-bold text-[#A0784A] leading-none">{unitrackScore?.ukupno_bodova ?? "—"}</span>
              <p className="text-[11px] text-[#8B7355] mt-1">ukupno bodova</p>
            </div>
            <ScoreBar label="Akademski" value={unitrackScore?.akademski_bodovi} weight="40%" />
            <ScoreBar label="Vannastavne aktivnosti" value={unitrackScore?.vannastavne_aktivnosti_bodovi} weight="25%" />
            <ScoreBar label="Društveni doprinos" value={unitrackScore?.drustveni_doprinos_bodovi} weight="20%" />
            <ScoreBar label="Posebna postignuća" value={unitrackScore?.posebna_postignuca_bodovi} weight="15%" />
          </div>

          {/* Kompetencije */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6">
            <h3 className="text-[14px] font-bold text-[#2C1A0E] mb-3">Kompetencije</h3>
            {kompetencije.length === 0 ? (
              <p className="text-[12px] text-[#8B7355]">Nema dovoljno podataka.</p>
            ) : kompetencije.map((k) => <Tag key={k}>{k}</Tag>)}
          </div>

          {/* Interesovanja */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6">
            <h3 className="text-[14px] font-bold text-[#2C1A0E] mb-3">Interesovanja</h3>
            {interesovanja.length === 0 ? (
              <p className="text-[12px] text-[#8B7355]">Nema dovoljno podataka.</p>
            ) : interesovanja.map((i) => <Tag key={i}>{i}</Tag>)}
          </div>

          {/* Preporučene oblasti */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6">
            <h3 className="text-[14px] font-bold text-[#2C1A0E] mb-3">Preporučene oblasti</h3>
            {preporuceneOblasti.length === 0 ? (
              <p className="text-[12px] text-[#8B7355]">Nema dovoljno podataka.</p>
            ) : preporuceneOblasti.map((o) => <Tag key={o}>{o}</Tag>)}
          </div>
        </div>

        {/* DESNA KOLONA — zaključak, postignuća, aktivnosti */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profesionalni zaključak */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6">
            <h3 className="text-[14px] font-bold text-[#2C1A0E] mb-3">Profesionalni profil</h3>
            <p className="text-[13.5px] text-[#5C4033] leading-relaxed">{profesionalniZakljucak}</p>
          </div>

          {/* Istaknuta postignuća */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EDE5DA] flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#2C1A0E]">Istaknuta postignuća</h3>
              <span className="text-[12px] text-[#8B7355] bg-[#F5EFE7] border border-[#DDD0BE] px-3 py-1 rounded-full">{istaknutaPostignuca.length}</span>
            </div>
            {istaknutaPostignuca.length === 0 ? (
              <div className="p-6 text-center text-[#8B7355] text-sm">Nema istaknutih postignuća (nagrade, takmičenja, sertifikati).</div>
            ) : (
              <div className="divide-y divide-[#F0E8DC]">
                {istaknutaPostignuca.map((p) => {
                  const info = tipInfo(p.tip);
                  return (
                    <div key={p.id} className="flex items-start gap-3 px-6 py-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F5EFE7", color: "#A0784A" }}>
                        <IcoCheck />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[13.5px] font-semibold text-[#2C1A0E]">{p.naziv}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: info.bg, color: info.color }}>{info.label}</span>
                        </div>
                        {p.opis && <p className="text-[12px] text-[#8B7355] mb-0.5">{p.opis}</p>}
                        <p className="text-[11px] text-[#A89682]">{p.naziv_firme ? `${p.naziv_firme} · ` : ""}{formatirajDatum(p.datum_aktivnosti)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sve aktivnosti */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EDE5DA] flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#2C1A0E]">Sve aktivnosti</h3>
              <span className="text-[12px] text-[#8B7355] bg-[#F5EFE7] border border-[#DDD0BE] px-3 py-1 rounded-full">{aktivnosti.length}</span>
            </div>
            {aktivnosti.length === 0 ? (
              <div className="p-6 text-center text-[#8B7355] text-sm">Još nema registrovanih aktivnosti.</div>
            ) : (
              <div className="divide-y divide-[#F0E8DC]">
                {aktivnosti.map((a) => {
                  const info = tipInfo(a.tip);
                  return (
                    <div key={a.id} className="flex items-center justify-between gap-3 px-6 py-3.5">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#2C1A0E] truncate">{a.naziv}</p>
                        <p className="text-[11px] text-[#A89682]">{a.naziv_firme ? `${a.naziv_firme} · ` : ""}{formatirajDatum(a.datum_aktivnosti)}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: info.bg, color: info.color }}>{info.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DigitalniCV;