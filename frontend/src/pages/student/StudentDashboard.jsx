import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import StatCard from "../../components/admin/StatCard";
import Alert from "../../components/admin/Alert";
import DigitalniCV from "./DigitalniCV";

// ─── SVG ICONS ───────────────────────────────────────────────────────────────
const IcoHome     = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const IcoTrophy   = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>;
const IcoFile     = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
const IcoSettings = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IcoBell     = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>;
const IcoLogout   = () => <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>;
const IcoX        = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>;
const IcoAward    = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15a6 6 0 100-12 6 6 0 000 12zm-3.5 1.5L7 21l5-2 5 2-1.5-4.5"/></svg>;
const IcoCheck    = () => <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>;
const IcoXCircle  = () => <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>;
const IcoSearch   = () => <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>;
const IcoFilter   = () => <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 4h18M6 8h12M9 12h6M11 16h2"/></svg>;

const IcoSortUp   = () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7"/></svg>;
const IcoSortDown = () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>;

const NAV = [
  { id: "pregled",     label: "Početna",                Icon: IcoHome },
  { id: "rezultati",   label: "Moji rezultati",         Icon: IcoAward },
  { id: "vannastavne", label: "Vannastavne aktivnosti",  Icon: IcoTrophy },
  { id: "konkursi",    label: "Konkursi",                Icon: IcoFile },
  { id: "cv",          label: "Digitalni CV",            Icon: IcoFile },
  { id: "rang",        label: "Rang lista",              Icon: IcoTrophy },
  { id: "settings",    label: "Podešavanja",             Icon: IcoSettings },
];

// ─── OCJENA na osnovu bodova: F<50, E 50-59, D 60-69, C 70-79, B 80-89, A 90-100
// Računa se na frontendu (ne vjerujemo isključivo bazi) da bi prikaz bio uvijek tačan
const izracunajOcjenu = (bodovi) => {
  const b = Number(bodovi) || 0;
  if (b >= 90) return "A";
  if (b >= 80) return "B";
  if (b >= 70) return "C";
  if (b >= 60) return "D";
  if (b >= 50) return "E";
  return "F";
};

const OCJENA_BOJE = {
  A: { bg: "#E8F5E9", color: "#2E7D32" },
  B: { bg: "#F1F8E9", color: "#558B2F" },
  C: { bg: "#FFF8E1", color: "#B8860B" },
  D: { bg: "#FFF3E0", color: "#E65100" },
  E: { bg: "#FBE9E7", color: "#D84315" },
  F: { bg: "#FDECEC", color: "#C62828" },
};

// ─── TIP AKTIVNOSTI → labela i boja (za "Moj uspjeh") ────────────────────────
const TIP_AKTIVNOSTI_INFO = {
  praksa:        { label: "Praksa",        bg: "#F5EFE7", color: "#6B4C2A" },
  volontiranje:  { label: "Volontiranje",  bg: "#E8F5E9", color: "#2E7D32" },
  radionica:     { label: "Radionica",     bg: "#E3F2FD", color: "#1565C0" },
  dogadjaj:      { label: "Događaj",       bg: "#FFF3E0", color: "#E65100" },
  drugo:         { label: "Drugo",         bg: "#F3E5F5", color: "#6A1B9A" },
};
const tipAktivnostiInfo = (tip) => TIP_AKTIVNOSTI_INFO[tip] || TIP_AKTIVNOSTI_INFO.drugo;

const MJESECI = [
  "januar", "februar", "mart", "april", "maj", "jun",
  "jul", "avgust", "septembar", "oktobar", "novembar", "decembar",
];

const formatirajDatum = (datum) => {
  const d = datum instanceof Date ? datum : new Date(datum);
  return `${d.getDate()}. ${MJESECI[d.getMonth()]} ${d.getFullYear()}.`;
};

const BigTrophy = () => <svg className="w-12 h-12 text-[#C4A882]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>;
const BigFile   = () => <svg className="w-12 h-12 text-[#C4A882]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;

const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#8B7355] text-sm">
    <div className="w-7 h-7 border-2 border-[#DDD0BE] border-t-[#6B4C2A] rounded-full animate-spin" />
    Učitavanje studentskog panela...
  </div>
);

const Section = ({ title, count, action, children }) => (
  <div className="bg-white border border-[#E8DDD0] rounded-2xl overflow-hidden mb-6 shadow-sm">
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE5DA]">
      <span className="text-[14px] font-bold text-[#2C1A0E]">{title}</span>
      <div className="flex items-center gap-3">
        {count !== undefined && (
          <span className="text-[12px] text-[#8B7355] bg-[#F5EFE7] border border-[#DDD0BE] px-3 py-1 rounded-full">
            {count}
          </span>
        )}
        {action}
      </div>
    </div>
    {children}
  </div>
);

// ─── BODOVI PROGRESS BAR (za "Pregled" tab) ──────────────────────────────────
const BodoviBar = ({ label, value, weight }) => {
  const pct = Math.min((value || 0), 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[12.5px] font-semibold text-[#5C4033]">
          {label} <span className="text-[10.5px] text-[#A89682]">({weight})</span>
        </span>
        <span className="text-[13px] font-bold text-[#2C1A0E]">{value ?? 0}</span>
      </div>
      <div className="h-[7px] bg-[#EDE5DA] rounded-full overflow-hidden">
        <div className="h-full bg-[#A0784A] rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ─── PROFIL POPUP — prikazuje stvarne podatke iz baze ────────────────────────
const ProfilPopup = ({ profil, onClose }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!profil) {
    return (
      <div ref={popupRef} className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-[#E8DDD0] z-50 p-6 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#DDD0BE] border-t-[#6B4C2A] rounded-full animate-spin" />
      </div>
    );
  }

  const inicijali = `${profil.ime?.[0] || ""}${profil.prezime?.[0] || ""}`.toUpperCase();

  const polja = [
    { labela: "Ime i prezime",    vrijednost: `${profil.ime} ${profil.prezime}` },
    { labela: "Studentski email", vrijednost: profil.studentski_email },
    { labela: "Jedinstveni ID",   vrijednost: profil.jedinstveni_id },
    { labela: "Broj indeksa",     vrijednost: profil.broj_indeksa || "—" },
    { labela: "Smjer",            vrijednost: profil.smjer || "—" },
    { labela: "Godina studija",   vrijednost: profil.godina_studija ? `${profil.godina_studija}. godina` : "—" },
    { labela: "Fakultet",         vrijednost: profil.naziv_fakulteta || "—" },
  ];

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-[#E8DDD0] z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE5DA]" style={{ background: "#F2EBE1" }}>
        <span className="text-[13px] font-bold text-[#2C1A0E]">Lični podaci</span>
        <button onClick={onClose} className="text-[#8B7355] hover:text-[#2C1A0E] transition-colors">
          <IcoX />
        </button>
      </div>

      <div className="flex flex-col items-center pt-5 pb-4 px-5 border-b border-[#F0E8DC]">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[18px] font-bold mb-2"
          style={{ background: "#A0784A" }}
        >
          {inicijali}
        </div>
        <p className="text-[14px] font-bold text-[#2C1A0E]">{profil.ime} {profil.prezime}</p>
        <p className="text-[11.5px] text-[#8B7355] mt-0.5">{profil.naziv_fakulteta}</p>
      </div>

      <div className="px-5 py-4 space-y-3">
        {polja.map(({ labela, vrijednost }) => (
          <div key={labela} className="flex justify-between items-start gap-2">
            <span className="text-[11.5px] text-[#8B7355] whitespace-nowrap">{labela}</span>
            <span className="text-[12px] font-semibold text-[#2C1A0E] text-right break-all">{vrijednost}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── AVATAR KRUG (otvara popup direktno) + POSEBNO DUGME ZA ODJAVU ───────────
const UserAccountBar = ({ inicijali, onProfilClick, profil, profilLoading, showProfil, onCloseProfil, onLogout }) => {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <button
          onClick={onProfilClick}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold transition-opacity hover:opacity-85"
          style={{ background: "#A0784A" }}
          title="Lični podaci"
        >
          {inicijali}
        </button>

        {showProfil && (
          <ProfilPopup
            profil={profilLoading ? null : profil}
            onClose={onCloseProfil}
          />
        )}
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-semibold transition-colors"
        style={{ color: "#6B4C2A", border: "1px solid #D8C5AE", background: "transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F0E5D8")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <IcoLogout />
        Odjavite se
      </button>
    </div>
  );
};

// ─── GLAVNI KOMPONENT ─────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pregled");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ msg: "", type: "" });

  const [data, setData] = useState(null);

  const [showProfil, setShowProfil]   = useState(false);
  const [profil, setProfil]           = useState(null);
  const [profilLoading, setProfilLoading] = useState(false);

  const [rangPrikaz, setRangPrikaz] = useState("ime_prezime");
  const [passwordForm, setPasswordForm] = useState({
    staraLozinka: "",
    novaLozinka: "",
    potvrdaLozinke: "",
  });

  // Ref za auto-skrolovanje rang liste do reda trenutnog studenta
  const currentRowRef = useRef(null);

  // Aktivnosti (vannastavni uspjeh) — za tab "Vannastavne aktivnosti", učitava se posebno
  const [aktivnosti, setAktivnosti] = useState([]);
  const [aktivnostiLoaded, setAktivnostiLoaded] = useState(false);

  // Filteri za "Vannastavne aktivnosti"
  const [aktivnostiFilterFirma, setAktivnostiFilterFirma] = useState("");
  const [aktivnostiFilterOd, setAktivnostiFilterOd] = useState("");
  const [aktivnostiFilterDo, setAktivnostiFilterDo] = useState("");

  // Detaljni rezultati (eindex stil) — za tab "Moji rezultati"
  const [rezultatiDetaljno, setRezultatiDetaljno] = useState([]);
  const [rezultatiDetaljnoLoaded, setRezultatiDetaljnoLoaded] = useState(false);
  const [sortKolona, setSortKolona] = useState("datum");
  const [sortSmjer, setSortSmjer] = useState("desc"); // asc | desc
  const [trenutnaStranica, setTrenutnaStranica] = useState(1);
  const REDOVA_PO_STRANICI = 10;

  // Pretraga i filteri za "Konkursi" tab
  const [konkursiPretraga, setKonkursiPretraga] = useState("");
  const [konkursiNaprednoOtvoreno, setKonkursiNaprednoOtvoreno] = useState(false);
  const [filterStatus, setFilterStatus] = useState("svi"); // svi | prijavljeni | nisam_prijavljen
  const [filterRok, setFilterRok] = useState("svi"); // svi | 7 | 30
  const [filterFirma, setFilterFirma] = useState("");

  // Pamti kad je student poslednji put bio na Početnoj — koristi se za "NOVI KONKURS" oznaku
  const [zadnjaPosjetaKonkursima, setZadnjaPosjetaKonkursima] = useState(null);

  useEffect(() => {
    const KLJUC = "unitrack_zadnja_posjeta_konkursima";
    const staraVrijednost = localStorage.getItem(KLJUC);
    setZadnjaPosjetaKonkursima(staraVrijednost ? new Date(staraVrijednost) : new Date());
    localStorage.setItem(KLJUC, new Date().toISOString());
  }, []);

  const showAlert = (msg, type = "success") => setAlert({ msg, type });
  const hideAlert = () => setAlert({ msg: "", type: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get("/student/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Greška pri učitavanju podataka:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/login");
      } else {
        showAlert("Nije moguće učitati podatke sa servera.", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Učitaj aktivnosti (vannastavni uspjeh) kad se prvi put otvori taj tab ──
  const fetchAktivnosti = useCallback(async () => {
    try {
      const res = await api.get("/student/aktivnosti");
      if (res.data.success) {
        setAktivnosti(res.data.aktivnosti);
        setAktivnostiLoaded(true);
      }
    } catch (err) {
      console.error("Greška pri učitavanju aktivnosti:", err);
    }
  }, []);

  const fetchRezultatiDetaljno = useCallback(async () => {
    try {
      const res = await api.get("/student/rezultati");
      if (res.data.success) {
        setRezultatiDetaljno(res.data.rezultati);
        setRezultatiDetaljnoLoaded(true);
      }
    } catch (err) {
      console.error("Greška pri učitavanju rezultata:", err);
    }
  }, []);

  useEffect(() => {
    if (tab === "vannastavne" && !aktivnostiLoaded) fetchAktivnosti();
    if (tab === "rezultati" && !rezultatiDetaljnoLoaded) fetchRezultatiDetaljno();
  }, [tab, aktivnostiLoaded, rezultatiDetaljnoLoaded, fetchAktivnosti, fetchRezultatiDetaljno]);

  // ─── Sortirani i paginirani rezultati za "Moji rezultati" tabelu ────────────
  const sortiraniRezultati = useMemo(() => {
    const niz = [...rezultatiDetaljno];
    niz.sort((a, b) => {
      let va = a[sortKolona];
      let vb = b[sortKolona];
      if (sortKolona === "datum") { va = new Date(va); vb = new Date(vb); }
      if (va == null) va = sortKolona === "datum" ? new Date(0) : "";
      if (vb == null) vb = sortKolona === "datum" ? new Date(0) : "";
      if (va < vb) return sortSmjer === "asc" ? -1 : 1;
      if (va > vb) return sortSmjer === "asc" ? 1 : -1;
      return 0;
    });
    return niz;
  }, [rezultatiDetaljno, sortKolona, sortSmjer]);

  // ─── Opcije za dropdown (firme) — izvučene iz već učitanih aktivnosti ──────
  const aktivnostiFirmaOpcije = useMemo(
    () => [...new Set(aktivnosti.map((a) => a.naziv_firme).filter(Boolean))].sort(),
    [aktivnosti]
  );

  // ─── Filtrirane aktivnosti — po firmi i opsegu datuma ──────────────────────
  const filtriraneAktivnosti = useMemo(() => {
    return aktivnosti.filter((a) => {
      if (aktivnostiFilterFirma && a.naziv_firme !== aktivnostiFilterFirma) return false;
      if (aktivnostiFilterOd && new Date(a.datum_aktivnosti) < new Date(aktivnostiFilterOd)) return false;
      if (aktivnostiFilterDo && new Date(a.datum_aktivnosti) > new Date(aktivnostiFilterDo)) return false;
      return true;
    });
  }, [aktivnosti, aktivnostiFilterFirma, aktivnostiFilterOd, aktivnostiFilterDo]);

  const ukupnoBodovaAktivnosti = useMemo(
    () => filtriraneAktivnosti.reduce((zbir, a) => zbir + (Number(a.bodovi) || 0), 0),
    [filtriraneAktivnosti]
  );

  const resetAktivnostiFiltere = () => {
    setAktivnostiFilterFirma("");
    setAktivnostiFilterOd("");
    setAktivnostiFilterDo("");
  };

  const ukupnoStranica = Math.max(1, Math.ceil(sortiraniRezultati.length / REDOVA_PO_STRANICI));
  const rezultatiNaStranici = sortiraniRezultati.slice(
    (trenutnaStranica - 1) * REDOVA_PO_STRANICI,
    trenutnaStranica * REDOVA_PO_STRANICI
  );

  const promijeniSort = (kolona) => {
    if (sortKolona === kolona) {
      setSortSmjer((s) => (s === "asc" ? "desc" : "asc"));
    } else {
      setSortKolona(kolona);
      setSortSmjer("asc");
    }
  };

  const handleProfilClick = async () => {
    setShowProfil((v) => !v);
    if (profil) return;
    setProfilLoading(true);
    try {
      const res = await api.get("/student/settings");
      if (res.data.success) {
        setProfil(res.data.student);
      }
    } catch (err) {
      console.error("Greška pri učitavanju profila:", err);
    } finally {
      setProfilLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {
      // ignoriši grešku, svejedno odjavi
    } finally {
      window.location.href = "/";
    }
  };

  const handleSaveRangPrikaz = async () => {
    try {
      await api.put("/student/settings/rang-prikaz", {
        prikaz_na_rang_listi: rangPrikaz,
      });
      showAlert("Podešavanje prikaza na rang listi je uspješno sačuvano.");
    } catch (err) {
      console.error("Greška pri čuvanju prikaza na rang listi:", err);
      showAlert(err.response?.data?.message || "Greška pri čuvanju podešavanja.", "error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put("/student/settings/password", passwordForm);
      showAlert("Lozinka je uspješno promijenjena.");
      setPasswordForm({ staraLozinka: "", novaLozinka: "", potvrdaLozinke: "" });
    } catch (err) {
      console.error("Greška pri promjeni lozinke:", err);
      showAlert(err.response?.data?.message || "Greška pri promjeni lozinke.", "error");
    }
  };

  const handleKonkursAction = async (konkursId, trenutnoPrijavljen) => {
    try {
      await api.post(`/student/konkursi/${konkursId}/prijava`, { prijavljen: !trenutnoPrijavljen });

      setData((prev) => {
        const noviKonkursi = prev.konkursi.map((k) => {
          if (k.id === konkursId) {
            return {
              ...k,
              prijavljen: !k.prijavljen,
              trenutno_prijava: k.prijavljen ? k.trenutno_prijava - 1 : k.trenutno_prijava + 1,
            };
          }
          return k;
        });
        return { ...prev, konkursi: noviKonkursi };
      });

      showAlert(trenutnoPrijavljen ? "Uspješno ste se odjavili sa konkursa." : "Uspješno ste se prijavili na konkurs!");
    } catch (err) {
      console.error("Greška pri prijavi na konkurs:", err);
      showAlert(err.response?.data?.message || "Akcija nije uspjela. Pokušajte ponovo.", "error");
    }
  };

  // Auto-skroluj do reda trenutnog studenta kad se otvori tab "rang"
  useEffect(() => {
    if (tab === "rang" && currentRowRef.current) {
      // mali timeout da DOM stigne da se renderuje prije skrola
      const t = setTimeout(() => {
        currentRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [tab, data]);

  // ─── OVI HOOK-OVI MORAJU BITI PRIJE "if (loading) return" — Pravila Hookova
  // zahtijevaju da se svi hook-ovi (useState/useEffect/useMemo...) pozivaju
  // u IDENTIČNOM redoslijedu u svakom render-u, bez izuzetka uslovljenog if-om.
  const konkursi = data?.konkursi || [];

  // ─── Opcije za dropdown (firme) — izvučene iz već učitanih konkursa ────────
  const firmaOpcije = useMemo(
    () => [...new Set(konkursi.map((k) => k.naziv_firme).filter(Boolean))].sort(),
    [konkursi]
  );

  // ─── Najnoviji oglasi (sortirano po datumu objave, najnoviji prvo) ─────────
  const najnovijiOglasi = useMemo(
    () => [...konkursi].sort((a, b) => new Date(b.datum_objave) - new Date(a.datum_objave)),
    [konkursi]
  );

  // ─── Filtrirani konkursi — brza pretraga + napredni filteri ────────────────
  const filtriraniKonkursi = useMemo(() => {
    const danas = new Date();
    return konkursi.filter((k) => {
      if (konkursiPretraga.trim()) {
        const q = konkursiPretraga.trim().toLowerCase();
        const tekst = `${k.naslov} ${k.naziv_firme} ${k.pozicija || ""}`.toLowerCase();
        if (!tekst.includes(q)) return false;
      }

      if (filterStatus === "prijavljeni" && !k.prijavljen) return false;
      if (filterStatus === "nisam_prijavljen" && k.prijavljen) return false;

      if (filterRok !== "svi") {
        const rokDatum = new Date(k.rok_prijave);
        const razlikaDana = (rokDatum - danas) / (1000 * 60 * 60 * 24);
        if (razlikaDana > Number(filterRok) || razlikaDana < 0) return false;
      }

      if (filterFirma && k.naziv_firme !== filterFirma) return false;

      return true;
    });
  }, [konkursi, konkursiPretraga, filterStatus, filterRok, filterFirma]);

  const resetKonkursiFiltere = () => {
    setKonkursiPretraga("");
    setFilterStatus("svi");
    setFilterRok("svi");
    setFilterFirma("");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#EAE4DC" }}>
        <Spinner />
      </div>
    );
  }

  const studentInfo = data?.student || {};
  const statistika  = data?.statistika || {};
  const rezultati   = data?.rezultati || [];
  const rangLista   = data?.rangLista || [];

  // ─── Personalizacija: ime/prezime iz STVARNIH podataka studenta ────────────
  const userName  = `${studentInfo.ime || ""} ${studentInfo.prezime || "Student"}`.trim();
  const inicijali = `${studentInfo.ime?.[0] || ""}${studentInfo.prezime?.[0] || ""}`.toUpperCase() || "S";
  const today = formatirajDatum(new Date());

  return (
    <div className="flex min-h-screen" style={{ background: "#EAE4DC", fontFamily: "'Inter', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside className="w-[240px] flex-shrink-0 fixed left-0 top-0 h-screen flex flex-col" style={{ background: "#F2EBE1" }}>
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-[#DDD0BE]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#8B6340" }}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L23 9 12 3zm6.18 8.11L12 14.25 5.82 11.1 12 7.96l6.18 3.15zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
          </div>
          <span className="text-[17px] font-semibold text-[#2C1A0E]">UniTrack</span>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-[10px] rounded-xl text-[13.5px] font-medium mb-1 transition-all text-left ${tab === id ? "text-white shadow-sm" : "text-[#7C5C3A] hover:bg-[#E8DDD0]"}`}
              style={tab === id ? { background: "#A0784A" } : {}}
            >
              <Icon /> {label}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t border-[#DDD0BE] pt-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "#E8DDD0" }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
              style={{ background: "#A0784A" }}
            >
              {inicijali}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#2C1A0E] truncate">{userName}</p>
              <p className="text-[10.5px] text-[#8B7355] truncate">
                {studentInfo?.broj_indeksa} · {studentInfo?.smjer}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="ml-[240px] flex-1 flex flex-col min-h-screen">

        <header
          className="h-[64px] flex items-center justify-between px-8 sticky top-0 z-30 border-b border-[#DDD0BE]"
          style={{ background: "#F2EBE1" }}
        >
          <div className="text-[13px] font-semibold text-[#5C4033]">
            {studentInfo?.naziv_fakulteta || "Fakultet"}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#8B7355] bg-[#F5EFE7] border border-[#DDD0BE] px-4 py-1.5 rounded-full">{today}</span>

            <UserAccountBar
              inicijali={inicijali}
              onProfilClick={handleProfilClick}
              profil={profil}
              profilLoading={profilLoading}
              showProfil={showProfil}
              onCloseProfil={() => setShowProfil(false)}
              onLogout={handleLogout}
            />
          </div>
        </header>

        <div className="flex-1 p-6">
          <div className="bg-white rounded-2xl min-h-full shadow-sm overflow-hidden p-8">
            <Alert message={alert.msg} type={alert.type} onClose={hideAlert} />

            {/* ── PREGLED ── */}
            {tab === "pregled" && (
              <>
                <div className="mb-7">
                  <h1 className="text-[22px] font-bold text-[#2C1A0E]">Zdravo, {studentInfo?.ime || "studente"} 👋</h1>
                  <p className="text-[14px] text-[#8B7355] mt-1">Dobrodošao na svoj UniTrack panel. Prati svoje bodove i konkurse.</p>
                </div>

                <div className="grid grid-cols-2 gap-5 mb-8">
                  <button onClick={() => setTab("rezultati")} className="text-left cursor-pointer transition-transform hover:-translate-y-0.5">
                    <StatCard
                      label="UKUPNO OSTVARENIH BODOVA"
                      value={statistika?.ukupnoBodova ?? 0}
                      sub={`Godina studija: ${studentInfo?.godina_studija || "—"} · klikni za detalje →`}
                      icon={<BigFile />}
                    />
                  </button>
                  <button onClick={() => setTab("rang")} className="text-left cursor-pointer transition-transform hover:-translate-y-0.5">
                    <StatCard
                      label="POZICIJA NA RANG LISTI"
                      value={statistika?.pozicijaNaRangListi ? `#${statistika.pozicijaNaRangListi}` : "—"}
                      sub={`Fakultet: ${studentInfo?.naziv_fakulteta || "—"}`}
                      icon={<BigTrophy />}
                    />
                  </button>
                </div>

                {/* Pregled bodova po kategorijama */}
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 mb-8">
                  <h2 className="text-[15px] font-bold text-[#2C1A0E] mb-1">Pregled bodova po kategorijama</h2>
                  <p className="text-[12px] text-[#8B7355] mb-5">
                    Ukupno: <strong className="text-[#A0784A]">{statistika?.ukupnoBodova ?? 0}</strong> bodova (40% akademski + 25% vannastavne + 20% društveni + 15% posebna postignuća)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <BodoviBar label="Akademski" value={statistika?.akademski} weight="40%" />
                    <BodoviBar label="Vannastavne aktivnosti" value={statistika?.vannastavne} weight="25%" />
                    <BodoviBar label="Društveni doprinos" value={statistika?.drustveni} weight="20%" />
                    <BodoviBar label="Posebna postignuća" value={statistika?.posebna} weight="15%" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-[15px] font-bold text-[#2C1A0E] whitespace-nowrap">Najnoviji oglasi</h2>
                    <div className="flex-1 h-px bg-[#EDE5DA]" />
                    <button
                      onClick={() => setTab("konkursi")}
                      className="text-[12px] font-semibold text-[#A0784A] hover:underline whitespace-nowrap"
                    >
                      Vidi sve →
                    </button>
                  </div>

                  <div className="border border-[#EDE5DA] rounded-xl overflow-hidden">
                    {najnovijiOglasi.length === 0 ? (
                      <div className="p-6 text-center text-[#8B7355] text-sm">
                        Trenutno nema objavljenih konkursa.
                      </div>
                    ) : (
                      najnovijiOglasi.slice(0, 5).map((k, index) => {
                        const jeNovi = zadnjaPosjetaKonkursima && new Date(k.datum_objave) > zadnjaPosjetaKonkursima;
                        return (
                          <div
                            key={k.id}
                            className={`flex items-center justify-between px-5 py-4 ${index !== Math.min(najnovijiOglasi.length, 5) - 1 ? "border-b border-[#F5F0EB]" : ""}`}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs text-[#6B4C2A]"
                                style={{ background: "#F5EFE7" }}
                              >
                                {k.naziv_firme ? k.naziv_firme[0].toUpperCase() : "K"}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-[13.5px] font-semibold text-[#2C1A0E] truncate">{k.naslov}</p>
                                  {jeNovi && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ background: "#A0784A" }}>
                                      NOVI KONKURS
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11.5px] text-[#8B7355] mt-0.5">{k.naziv_firme}{k.pozicija ? ` · ${k.pozicija}` : ""}</p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[11px] text-[#8B7355]">Rok: <strong>{formatirajDatum(k.rok_prijave)}</strong></p>
                              <p className="text-[10px] text-[#A89682] mt-0.5">
                                Objavljeno {formatirajDatum(k.datum_objave)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── MOJI REZULTATI — raspis po predmetu (prisustvo/test/kolokvijum/završni) ── */}
            {tab === "rezultati" && (
              <>
                <div className="mb-7">
                  <h1 className="text-[22px] font-bold text-[#2C1A0E]">Moji rezultati</h1>
                  <p className="text-[14px] text-[#8B7355] mt-1">Svi položeni ispiti i kolokvijumi od početka studija.</p>
                </div>

                {!rezultatiDetaljnoLoaded ? <Spinner /> : (
                  rezultatiDetaljno.length === 0 ? (
                    <div className="bg-white border border-[#E8DDD0] rounded-2xl p-10 text-center text-[#8B7355] text-sm">
                      Još uvijek nemaš unesenih rezultata.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {rezultatiDetaljno.map((r) => {
                        const ocjenaPrikaz = r.ocjena && ["A","B","C","D","E","F"].includes(r.ocjena) ? r.ocjena : izracunajOcjenu(r.bodovi);
                        const boje = OCJENA_BOJE[ocjenaPrikaz] || OCJENA_BOJE.F;
                        const prikaziVrijednost = (v) => v === null || v === undefined ? "—" : v;

                        return (
                          <div key={r.id} className="bg-white border border-[#E8DDD0] rounded-2xl overflow-hidden">
                            <div className="px-6 py-3.5 border-b border-[#EDE5DA] flex items-center justify-between flex-wrap gap-2">
                              <h3 className="text-[15px] font-bold text-[#5C4033] tracking-wide uppercase">{r.predmet}</h3>
                              <span className="text-[11px] text-[#A89682]">
                                {r.semestar ? `${r.semestar}. semestar · ` : ""}{formatirajDatum(r.datum)}
                              </span>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-center border-collapse min-w-[640px]">
                                <thead>
                                  <tr className="text-[11px] font-bold text-[#5C4033]">
                                    <th rowSpan={2} className="px-4 py-2 border border-[#EDE5DA] bg-[#F5EFE7] align-middle">PRISUSTVO</th>
                                    <th rowSpan={2} className="px-4 py-2 border border-[#EDE5DA] bg-[#F5EFE7] align-middle">TEST</th>
                                    <th colSpan={2} className="px-4 py-2 border border-[#EDE5DA] bg-[#F5EFE7]">KOLOKVIJUM</th>
                                    <th colSpan={2} className="px-4 py-2 border border-[#EDE5DA] bg-[#F5EFE7]">ZAVRŠNI ISPIT</th>
                                    <th rowSpan={2} className="px-4 py-2 border border-[#EDE5DA] bg-[#F5EFE7] align-middle">BODOVI / OCJENA</th>
                                  </tr>
                                  <tr className="text-[10.5px] font-bold text-[#8B7355]">
                                    <th className="px-3 py-1.5 border border-[#EDE5DA] bg-[#FAF7F3]">redovni</th>
                                    <th className="px-3 py-1.5 border border-[#EDE5DA] bg-[#FAF7F3]">popravni</th>
                                    <th className="px-3 py-1.5 border border-[#EDE5DA] bg-[#FAF7F3]">redovni</th>
                                    <th className="px-3 py-1.5 border border-[#EDE5DA] bg-[#FAF7F3]">popravni</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="text-[13px] text-[#2C1A0E]">
                                    <td className="px-4 py-3 border border-[#EDE5DA]">{prikaziVrijednost(r.prisustvo)}</td>
                                    <td className="px-4 py-3 border border-[#EDE5DA]">{prikaziVrijednost(r.test)}</td>
                                    <td className="px-4 py-3 border border-[#EDE5DA]">{prikaziVrijednost(r.kolokvijum_redovni)}</td>
                                    <td className="px-4 py-3 border border-[#EDE5DA]">{prikaziVrijednost(r.kolokvijum_popravni)}</td>
                                    <td className="px-4 py-3 border border-[#EDE5DA]">{prikaziVrijednost(r.zavrsni_redovni)}</td>
                                    <td className="px-4 py-3 border border-[#EDE5DA]">{prikaziVrijednost(r.zavrsni_popravni)}</td>
                                    <td className="px-4 py-3 border border-[#EDE5DA]">
                                      <div className="flex items-center justify-center gap-2">
                                        <span className="font-bold">{r.bodovi}</span>
                                        <span
                                          className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-lg"
                                          style={{ background: boje.bg, color: boje.color }}
                                        >
                                          {ocjenaPrikaz}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </>
            )}

            {/* ── VANNASTAVNE AKTIVNOSTI ── */}
            {tab === "vannastavne" && (
              <>
                <div className="mb-7">
                  <h1 className="text-[22px] font-bold text-[#2C1A0E]">Vannastavne aktivnosti</h1>
                  <p className="text-[14px] text-[#8B7355] mt-1">Praksa, volontiranje, radionice i drugi vannastavni doprinosi.</p>
                </div>

                <Section
                  title="Sve aktivnosti"
                  count={`${filtriraneAktivnosti.length} / ${aktivnosti.length} aktivnosti · ${ukupnoBodovaAktivnosti.toFixed(0)} bodova`}
                >
                  <div className="p-4">
                    {/* Filteri: firma (dropdown) + datum (od-do, kalendar) */}
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <div>
                        <label className="block text-[11px] font-bold text-[#8B7355] mb-1">Firma</label>
                        <select
                          value={aktivnostiFilterFirma}
                          onChange={(e) => setAktivnostiFilterFirma(e.target.value)}
                          className="px-3 py-2 border border-[#DDD0BE] rounded-lg text-[12.5px] outline-none focus:border-[#A0784A] bg-white min-w-[180px]"
                        >
                          <option value="">Sve firme</option>
                          {aktivnostiFirmaOpcije.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#8B7355] mb-1">Datum od</label>
                        <input
                          type="date"
                          value={aktivnostiFilterOd}
                          onChange={(e) => setAktivnostiFilterOd(e.target.value)}
                          className="px-3 py-2 border border-[#DDD0BE] rounded-lg text-[12.5px] outline-none focus:border-[#A0784A] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#8B7355] mb-1">Datum do</label>
                        <input
                          type="date"
                          value={aktivnostiFilterDo}
                          onChange={(e) => setAktivnostiFilterDo(e.target.value)}
                          className="px-3 py-2 border border-[#DDD0BE] rounded-lg text-[12.5px] outline-none focus:border-[#A0784A] bg-white"
                        />
                      </div>
                      {(aktivnostiFilterFirma || aktivnostiFilterOd || aktivnostiFilterDo) && (
                        <button
                          onClick={resetAktivnostiFiltere}
                          className="text-[12px] font-semibold text-[#A0784A] hover:underline self-end pb-2"
                        >
                          Poništi filtere
                        </button>
                      )}
                    </div>

                    {!aktivnostiLoaded ? <Spinner /> : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#F2EBE1] text-[12px] font-bold text-[#5C4033]">
                              <th className="px-6 py-3">Naziv</th>
                              <th className="px-6 py-3">Konkurs</th>
                              <th className="px-6 py-3">Firma</th>
                              <th className="px-6 py-3">Datum</th>
                              <th className="px-6 py-3">Tip</th>
                              <th className="px-6 py-3 text-right">Bodovi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EDE5DA] text-[13px]">
                            {filtriraneAktivnosti.length === 0 ? (
                              <tr><td colSpan="6" className="px-6 py-8 text-center text-[#8B7355]">Nema aktivnosti koje odgovaraju filterima.</td></tr>
                            ) : filtriraneAktivnosti.map((a) => {
                              const info = tipAktivnostiInfo(a.tip);
                              return (
                                <tr key={a.id} className="hover:bg-[#FAF7F3]">
                                  <td className="px-6 py-3.5 font-semibold text-[#2C1A0E]">{a.naziv}</td>
                                  <td className="px-6 py-3.5 text-[#8B7355]">{a.naziv_konkursa || "—"}</td>
                                  <td className="px-6 py-3.5 text-[#8B7355]">{a.naziv_firme || "—"}</td>
                                  <td className="px-6 py-3.5 text-[#8B7355]">{formatirajDatum(a.datum_aktivnosti)}</td>
                                  <td className="px-6 py-3.5">
                                    <span
                                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                                      style={{ background: info.bg, color: info.color }}
                                    >
                                      {info.label}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3.5 text-right font-bold text-[#A0784A]">+{a.bodovi ?? 0}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </Section>
              </>
            )}


            {/* ── KONKURSI ── */}
            {tab === "konkursi" && (
              <Section title="Dostupni konkursi za praksu i posao" count={`${filtriraniKonkursi.length} / ${konkursi.length} oglasa`}>
                <div className="p-4">
                  {/* Brza pretraga */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className="relative flex-1 min-w-[220px]">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A89682]">
                        <IcoSearch />
                      </div>
                      <input
                        type="text"
                        value={konkursiPretraga}
                        onChange={(e) => setKonkursiPretraga(e.target.value)}
                        placeholder="Brza pretraga — naslov, firma ili pozicija..."
                        className="w-full pl-9 pr-4 py-2.5 border border-[#DDD0BE] rounded-xl text-sm outline-none focus:border-[#A0784A] bg-[#FAF7F3]"
                      />
                    </div>
                    <button
                      onClick={() => setKonkursiNaprednoOtvoreno((v) => !v)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-semibold border transition-colors ${
                        konkursiNaprednoOtvoreno
                          ? "bg-[#A0784A] text-white border-transparent"
                          : "bg-white text-[#6B4C2A] border-[#DDD0BE] hover:bg-[#F5EFE7]"
                      }`}
                    >
                      <IcoFilter /> FILTERI
                    </button>
                  </div>

                  {/* Napredni filteri */}
                  {konkursiNaprednoOtvoreno && (
                    <div className="bg-[#FAF7F3] border border-[#EDE5DA] rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#8B7355] mb-1">Status prijave</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-[#DDD0BE] rounded-lg text-[12.5px] outline-none focus:border-[#A0784A] bg-white"
                        >
                          <option value="svi">Svi konkursi</option>
                          <option value="prijavljeni">Na koje sam prijavljen</option>
                          <option value="nisam_prijavljen">Aktivni (nisam prijavljen)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#8B7355] mb-1">Rok prijave</label>
                        <select
                          value={filterRok}
                          onChange={(e) => setFilterRok(e.target.value)}
                          className="w-full px-3 py-2 border border-[#DDD0BE] rounded-lg text-[12.5px] outline-none focus:border-[#A0784A] bg-white"
                        >
                          <option value="svi">Svi rokovi</option>
                          <option value="7">Još 7 dana</option>
                          <option value="30">Još 30 dana</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#8B7355] mb-1">Firma</label>
                        <select
                          value={filterFirma}
                          onChange={(e) => setFilterFirma(e.target.value)}
                          className="w-full px-3 py-2 border border-[#DDD0BE] rounded-lg text-[12.5px] outline-none focus:border-[#A0784A] bg-white"
                        >
                          <option value="">Sve firme</option>
                          {firmaOpcije.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-3 flex justify-end">
                        <button onClick={resetKonkursiFiltere} className="text-[12px] font-semibold text-[#A0784A] hover:underline">
                          Poništi filtere
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="divide-y divide-[#F0E8DC] border border-[#EDE5DA] rounded-xl overflow-hidden">
                    {filtriraniKonkursi.length === 0 ? (
                      <div className="p-6 text-center text-[#8B7355] text-sm">Nema konkursa koji odgovaraju pretrazi/filterima.</div>
                    ) : (
                      filtriraniKonkursi.map((k) => {
                        const rokIstekao = new Date(k.rok_prijave) < new Date();
                        const popunjeno  = k.maksimalan_broj_prijava && k.trenutno_prijava >= k.maksimalan_broj_prijava;

                        return (
                          <div
                            key={k.id}
                            className="p-6 hover:bg-[#FAF7F3] transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <h3 className="text-sm font-bold text-[#2C1A0E]">{k.naslov}</h3>
                                <span className="text-[11px] bg-[#F5EFE7] border border-[#DDD0BE] text-[#6B4C2A] px-2.5 py-0.5 rounded-full font-medium">
                                  {k.naziv_firme}
                                </span>
                              </div>
                              <p className="text-xs text-[#8B7355] flex items-center gap-4">
                                <span>📍 {k.pozicija}</span>
                                <span>📅 Rok: <strong>{formatirajDatum(k.rok_prijave)}</strong></span>
                              </p>
                            </div>

                            <button
                              onClick={() => handleKonkursAction(k.id, k.prijavljen)}
                              disabled={rokIstekao || (popunjeno && !k.prijavljen)}
                              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm border ${
                                k.prijavljen
                                  ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                  : "bg-[#A0784A] text-white border-transparent hover:opacity-90"
                              } disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                              {k.prijavljen ? "Odjavi se" : "Prijavi se"}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </Section>
            )}

            {/* ── DIGITALNI CV ── */}
            {tab === "cv" && <DigitalniCV />}

            {/* ── RANG LISTA ── */}
            {tab === "rang" && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#F5EFE7] flex items-center justify-center text-[#A0784A] mb-4">
                  <IcoTrophy />
                </div>
                <h2 className="text-[18px] font-bold text-[#2C1A0E] mb-2">Zvanična rang lista fakulteta</h2>
                <p className="text-[13px] text-[#8B7355] max-w-lg mb-6">
                  Trenutna pozicija u odnosu na ostale studente fakulteta <strong>{studentInfo?.naziv_fakulteta}</strong>.
                </p>

                {/* Skrolabilan kontejner - kod velikih listi (npr. 250 studenata)
                    automatski se centrira na red trenutnog studenta */}
                <div className="w-full max-w-2xl border border-[#EDE5DA] rounded-xl overflow-hidden mt-2 text-left">
                  <div className="max-h-[480px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-[#F2EBE1] text-[12px] font-bold text-[#5C4033]">
                          <th className="px-6 py-3">Pozicija</th>
                          <th className="px-6 py-3">Student</th>
                          <th className="px-6 py-3">Ukupno bodova</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDE5DA] text-[13px]">
                        {rangLista.length > 0 ? (
                          rangLista.map((item, index) => (
                            <tr
                              key={item.student_id || index}
                              ref={item.is_current_student ? currentRowRef : null}
                              className={item.is_current_student ? "bg-[#FDF9F3] font-bold" : ""}
                              style={item.is_current_student ? { boxShadow: "inset 3px 0 0 #A0784A" } : {}}
                            >
                              <td className="px-6 py-4">{item.mjesto}.</td>
                              <td className="px-6 py-4">
                                {item.prikaz_studenta}
                                {!!item.is_current_student && (
                                  <span className="ml-2 text-[10px] bg-[#A0784A] text-white px-2 py-0.5 rounded-full">
                                    (Vi)
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 font-bold text-[#8B6340]">
                                {item.ukupno_bodova}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-6 py-6 text-center text-[#8B7355]">
                              Nema podataka za rang listu na ovom smjeru.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── SETTINGS ── */}
            {tab === "settings" && (
              <div>
                <div className="mb-7">
                  <h1 className="text-[22px] font-bold text-[#2C1A0E]">Podešavanja naloga</h1>
                  <p className="text-[14px] text-[#8B7355] mt-1">
                    Upravljaj bezbjednošću naloga i načinom prikaza na rang listi.
                  </p>
                </div>

                <Section title="Prikaz na rang listi">
                  <div className="p-6">
                    <p className="text-[13px] text-[#8B7355] mb-5">
                      Izaberi da li želiš da se na rang listi prikazuje tvoje ime i prezime ili samo jedinstveni ID.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                      <label
                        className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                          rangPrikaz === "ime_prezime"
                            ? "border-[#A0784A] bg-[#FDF9F3]"
                            : "border-[#E8DDD0] hover:bg-[#FAF7F3]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="rangPrikaz"
                            value="ime_prezime"
                            checked={rangPrikaz === "ime_prezime"}
                            onChange={(e) => setRangPrikaz(e.target.value)}
                          />
                          <div>
                            <p className="text-[13.5px] font-bold text-[#2C1A0E]">Ime i prezime</p>
                            <p className="text-[11.5px] text-[#8B7355] mt-0.5">
                              Na rang listi će biti prikazano tvoje puno ime.
                            </p>
                          </div>
                        </div>
                      </label>

                      <label
                        className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                          rangPrikaz === "jedinstveni_id"
                            ? "border-[#A0784A] bg-[#FDF9F3]"
                            : "border-[#E8DDD0] hover:bg-[#FAF7F3]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="rangPrikaz"
                            value="jedinstveni_id"
                            checked={rangPrikaz === "jedinstveni_id"}
                            onChange={(e) => setRangPrikaz(e.target.value)}
                          />
                          <div>
                            <p className="text-[13.5px] font-bold text-[#2C1A0E]">Jedinstveni ID</p>
                            <p className="text-[11.5px] text-[#8B7355] mt-0.5">
                              Na rang listi će biti prikazan samo tvoj studentski ID.
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>

                    <button
                      onClick={handleSaveRangPrikaz}
                      className="px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow-sm hover:opacity-90 transition-opacity"
                      style={{ background: "#A0784A" }}
                    >
                      Sačuvaj podešavanje
                    </button>
                  </div>
                </Section>

                <Section title="Promjena lozinke">
                  <form onSubmit={handleChangePassword} className="p-6 max-w-md">
                    <div className="mb-4">
                      <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">
                        Trenutna lozinka
                      </label>
                      <input
                        type="password"
                        value={passwordForm.staraLozinka}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, staraLozinka: e.target.value })
                        }
                        className="w-full border border-[#DDD0BE] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A0784A] transition-colors"
                        placeholder="Unesi trenutnu lozinku"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">
                        Nova lozinka
                      </label>
                      <input
                        type="password"
                        value={passwordForm.novaLozinka}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, novaLozinka: e.target.value })
                        }
                        className="w-full border border-[#DDD0BE] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A0784A] transition-colors"
                        placeholder="Unesi novu lozinku"
                        required
                      />
                    </div>

                    <div className="mb-5">
                      <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">
                        Potvrda nove lozinke
                      </label>
                      <input
                        type="password"
                        value={passwordForm.potvrdaLozinke}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, potvrdaLozinke: e.target.value })
                        }
                        className="w-full border border-[#DDD0BE] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A0784A] transition-colors"
                        placeholder="Ponovi novu lozinku"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow-sm hover:opacity-90 transition-opacity"
                      style={{ background: "#A0784A" }}
                    >
                      Promijeni lozinku
                    </button>
                  </form>
                </Section>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;