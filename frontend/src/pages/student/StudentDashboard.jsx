import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import StatCard from "../../components/admin/StatCard";
import Alert from "../../components/admin/Alert";

// ─── SVG ICONS ───────────────────────────────────────────────────────────────
const IcoHome     = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const IcoTrophy   = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>;
const IcoFile     = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
const IcoSettings = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IcoBell     = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>;
const IcoLogout   = () => <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>;
const IcoX        = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>;

const NAV = [
  { id: "pregled",  label: "Početna",     Icon: IcoHome },
  { id: "konkursi", label: "Konkursi",    Icon: IcoFile },
  { id: "rang",     label: "Rang lista",  Icon: IcoTrophy },
  { id: "settings", label: "Podešavanja", Icon: IcoSettings },
];

// ─── BOSANSKI NAZIVI MJESECI U NOMINATIVU (npr. "19. jun 2026.") ─────────────
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
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE5DA]" style={{ background: "#F2EBE1" }}>
        <span className="text-[13px] font-bold text-[#2C1A0E]">Lični podaci</span>
        <button onClick={onClose} className="text-[#8B7355] hover:text-[#2C1A0E] transition-colors">
          <IcoX />
        </button>
      </div>

      {/* Avatar */}
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

      {/* Polja sa stvarnim podacima */}
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
const UserAccountBar = ({ userName, onProfilClick, profil, profilLoading, showProfil, onCloseProfil, onLogout }) => {
  return (
    <div className="flex items-center gap-2.5">
      {/* Avatar krug — klik DIREKTNO otvara lične podatke */}
      <div className="relative">
        <button
          onClick={onProfilClick}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold transition-opacity hover:opacity-85"
          style={{ background: "#A0784A" }}
          title="Lični podaci"
        >
          {userName[0]?.toUpperCase() || "S"}
        </button>

        {showProfil && (
          <ProfilPopup
            profil={profilLoading ? null : profil}
            onClose={onCloseProfil}
          />
        )}
      </div>

      {/* Posebno, stalno vidljivo dugme za odjavu — tamno braon, uklapa se sa stilom */}
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

  // Podaci sa baze
  const [data, setData] = useState(null);

  // Profil popup
  const [showProfil, setShowProfil]   = useState(false);
  const [profil, setProfil]           = useState(null);
  const [profilLoading, setProfilLoading] = useState(false);

  // Podešavanja
  const [rangPrikaz, setRangPrikaz] = useState("ime_prezime");
  const [passwordForm, setPasswordForm] = useState({
    staraLozinka: "",
    novaLozinka: "",
    potvrdaLozinke: "",
  });

  const showAlert = (msg, type = "success") => setAlert({ msg, type });
  const hideAlert = () => setAlert({ msg: "", type: "" });

  // ─── Učitaj dashboard podatke ───────────────────────────────────────────────
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

  // ─── Učitaj lične podatke za popup ───────────────────────────────────────────
  // NAPOMENA: backend ima rutu "/student/settings" koja vraća iste podatke
  // (ime, prezime, email, jedinstveni_id, broj_indeksa, godina_studija, smjer,
  // naziv_fakulteta) — koristimo tu rutu, ne "/student/me" koja ne postoji.
  const handleProfilClick = async () => {
    setShowProfil((v) => !v);
    if (profil) return; // već učitano
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

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {
      // ignoriši grešku, svejedno odjavi
    } finally {
      window.location.href = "/";
    }
  };

  // ─── Podešavanja: prikaz na rang listi ──────────────────────────────────────
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

  // ─── Podešavanja: promjena lozinke ──────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      await api.put("/student/settings/password", passwordForm);

      showAlert("Lozinka je uspješno promijenjena.");
      setPasswordForm({
        staraLozinka: "",
        novaLozinka: "",
        potvrdaLozinke: "",
      });
    } catch (err) {
      console.error("Greška pri promjeni lozinke:", err);
      showAlert(err.response?.data?.message || "Greška pri promjeni lozinke.", "error");
    }
  };

  // ─── Prijava/odjava sa konkursa ─────────────────────────────────────────────
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

  // ─── Loading screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#EAE4DC" }}>
        <Spinner />
      </div>
    );
  }

  // ─── Izvlačenje podataka ─────────────────────────────────────────────────────
  const user        = data?.user || {};
  const studentInfo = data?.student || {};
  const statistika  = data?.statistika || {};
  const rezultati   = data?.rezultati || [];
  const konkursi    = data?.konkursi || [];
  const rangLista   = data?.rangLista || [];

  const userName = `${user.ime || ""} ${user.prezime || "Student"}`.trim();
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

        {/* Sidebar user info */}
        <div className="px-3 pb-4 border-t border-[#DDD0BE] pt-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "#E8DDD0" }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
              style={{ background: "#A0784A" }}
            >
              {userName[0]?.toUpperCase() || "S"}
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

        {/* Header */}
        <header
          className="h-[64px] flex items-center justify-between px-8 sticky top-0 z-30 border-b border-[#DDD0BE]"
          style={{ background: "#F2EBE1" }}
        >
          <div className="text-[13px] font-semibold text-[#5C4033]">
            {studentInfo?.naziv_fakulteta || "Fakultet"}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#8B7355] bg-[#F5EFE7] border border-[#DDD0BE] px-4 py-1.5 rounded-full">{today}</span>
            <button className="text-[#8B7355] hover:text-[#5C4033]">
              <IcoBell />
            </button>

            {/* Avatar krug (otvara lične podatke) + posebno dugme za odjavu — povlači stvarne podatke o studentu iz baze */}
            <UserAccountBar
              userName={userName}
              onProfilClick={handleProfilClick}
              profil={profil}
              profilLoading={profilLoading}
              showProfil={showProfil}
              onCloseProfil={() => setShowProfil(false)}
              onLogout={handleLogout}
            />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-2xl min-h-full shadow-sm overflow-hidden p-8">
            <Alert message={alert.msg} type={alert.type} onClose={hideAlert} />

            {/* ── PREGLED ── */}
            {tab === "pregled" && (
              <>
                <div className="mb-7">
                  <h1 className="text-[22px] font-bold text-[#2C1A0E]">Zdravo, {user?.ime || "studente"} 👋</h1>
                  <p className="text-[14px] text-[#8B7355] mt-1">Dobrodošao na svoj UniTrack panel. Prati svoje bodove i konkurse.</p>
                </div>

                <div className="grid grid-cols-2 gap-5 mb-8">
                  <StatCard
                    label="UKUPNO OSTVARENIH BODOVA"
                    value={statistika?.ukupnoBodova ?? 0}
                    sub={`Godina studija: ${studentInfo?.godina_studija || "—"}`}
                    icon={<BigFile />}
                  />
                  <StatCard
                    label="POZICIJA NA RANG LISTI"
                    value={`#${statistika?.pozicijaNaRangListi || "—"}`}
                    sub="U sklopu tvog studijskog smjera"
                    icon={<BigTrophy />}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-[15px] font-bold text-[#2C1A0E] whitespace-nowrap">Moje vrednovane aktivnosti</h2>
                    <div className="flex-1 h-px bg-[#EDE5DA]" />
                  </div>

                  <div className="border border-[#EDE5DA] rounded-xl overflow-hidden">
                    {rezultati.length === 0 ? (
                      <div className="p-6 text-center text-[#8B7355] text-sm">
                        Još uvijek nemaš registrovanih aktivnosti i bodova.
                      </div>
                    ) : (
                      rezultati.map((r, index) => (
                        <div
                          key={r.id}
                          className={`flex items-center justify-between px-5 py-4 ${index !== rezultati.length - 1 ? "border-b border-[#F5F0EB]" : ""}`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs text-[#6B4C2A]"
                              style={{ background: "#F5EFE7" }}
                            >
                              {r.tip ? r.tip[0].toUpperCase() : "A"}
                            </div>
                            <div>
                              <p className="text-[13.5px] font-semibold text-[#2C1A0E]">{r.naziv}</p>
                              <p className="text-[11.5px] text-[#8B7355] mt-0.5">{r.opis}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[14px] font-bold text-[#A0784A]">+{r.bodovi} bodova</span>
                            <p className="text-[10px] text-[#8B7355] mt-0.5">
                              {formatirajDatum(r.datum_objave)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── KONKURSI ── */}
            {tab === "konkursi" && (
              <Section title="Dostupni konkursi za praksu i posao" count={`${konkursi.length} aktivnih oglasa`}>
                <div className="divide-y divide-[#F0E8DC]">
                  {konkursi.length === 0 ? (
                    <div className="p-6 text-center text-[#8B7355] text-sm">Trenutno nema aktivnih konkursa.</div>
                  ) : (
                    konkursi.map((k) => {
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
                                {k.firma}
                              </span>
                            </div>
                            <p className="text-xs text-[#8B7355] flex items-center gap-4">
                              <span>📍 {k.pozicija}</span>
                              <span>📅 Rok: <strong>{formatirajDatum(k.rok_prijave)}</strong></span>
                              <span>👥 Prijave: <strong>{k.trenutno_prijava}{k.maksimalan_broj_prijava ? ` / ${k.maksimalan_broj_prijava}` : ""}</strong></span>
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
              </Section>
            )}

            {/* ── RANG LISTA ── */}
            {tab === "rang" && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#F5EFE7] flex items-center justify-center text-[#A0784A] mb-4">
                  <IcoTrophy />
                </div>
                <h2 className="text-[18px] font-bold text-[#2C1A0E] mb-2">Zvanična rang lista smjera</h2>
                <p className="text-[13px] text-[#8B7355] max-w-lg mb-6">
                  Trenutna pozicija u odnosu na ostale kolege sa smjera <strong>{studentInfo?.smjer}</strong>.
                </p>

                <div className="w-full max-w-2xl border border-[#EDE5DA] rounded-xl overflow-hidden mt-2 text-left">
                  <table className="w-full text-left border-collapse">
                    <thead>
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
                            key={item.id || index}
                            className={item.is_current_student ? "bg-[#FDF9F3] font-semibold" : ""}
                          >
                            <td className="px-6 py-4">{index + 1}.</td>
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