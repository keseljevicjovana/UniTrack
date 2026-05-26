import { useState, useEffect, useCallback } from "react";
import api from "../../api/api";
import StudentiTable from "../../components/admin/StudentiTable";
import FirmeTable from "../../components/admin/FirmeTable";
import SluzbeTable from "../../components/admin/SluzbeTable";
import Modal, { ConfirmModal, FormInput } from "../../components/admin/Modal";
import Alert from "../../components/admin/Alert";

// ─── SVG ICONS ───────────────────────────────────────────────────────────────
const IcoHome     = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const IcoUsers    = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IcoBuilding = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>;
const IcoSchool   = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>;
const IcoTrophy   = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>;
const IcoSettings = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IcoBell     = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>;
const IcoPlus     = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>;
const IcoChart    = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>;

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV = [
  { id: "pregled",  label: "Početna",           Icon: IcoHome     },
  { id: "studenti", label: "Studenti",           Icon: IcoUsers    },
  { id: "firme",    label: "Firme",              Icon: IcoBuilding },
  { id: "sluzbe",   label: "Studentske službe",  Icon: IcoSchool   },
  { id: "rang",     label: "Rang lista",         Icon: IcoTrophy   },
  { id: "settings", label: "Podešavanja",        Icon: IcoSettings },
];

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, sub, BigIcon, progress }) => (
  <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
    <p className="text-[13px] font-semibold text-[#5C4033] mb-3">{title}</p>
    {progress !== undefined ? (
      <>
        <div className="mb-3">
          <span className="text-[40px] font-bold text-[#2C1A0E] leading-none">{value ?? "—"}</span>
          {sub && <span className="text-[13px] text-[#8B7355] ml-2">{sub}</span>}
        </div>
        <div className="h-[7px] bg-[#EDE5DA] rounded-full overflow-hidden">
          <div className="h-full bg-[#8B6340] rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </>
    ) : (
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[40px] font-bold text-[#2C1A0E] leading-none">{value ?? "—"}</span>
          {sub && <p className="text-[12px] text-[#8B7355] mt-1">{sub}</p>}
        </div>
        {BigIcon && <BigIcon />}
      </div>
    )}
  </div>
);

// ─── BIG ICONS for stat cards ─────────────────────────────────────────────────
const BigUsers    = () => <svg className="w-12 h-12 text-[#C4A882]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const BigFile     = () => <svg className="w-12 h-12 text-[#C4A882]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
const BigSchool   = () => <svg className="w-12 h-12 text-[#C4A882]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>;

// ─── SPINNER ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#8B7355] text-sm">
    <div className="w-7 h-7 border-2 border-[#DDD0BE] border-t-[#6B4C2A] rounded-full animate-spin" />
    Učitavanje...
  </div>
);

// ─── SECTION ──────────────────────────────────────────────────────────────────
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

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [tab, setTab]       = useState("pregled");
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert]   = useState({ msg: "", type: "" });

  const [firmaModal,  setFirmaModal]  = useState(false);
  const [sluzbaModal, setSluzbaModal] = useState(false);
  const [confirm, setConfirm]         = useState({ open: false, item: null, type: "" });

  const [firmaForm,  setFirmaForm]  = useState({ naziv_firme: "", email: "", lozinka: "", pib: "", adresa: "", opis: "" });
  const [sluzbaForm, setSluzbaForm] = useState({ naziv_fakulteta: "", email: "", lozinka: "" });

  const showAlert = (msg, type = "success") => setAlert({ msg, type });
  const hideAlert = () => setAlert({ msg: "", type: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/dashboard");
      if (res.data.success) setData(res.data);
      else showAlert("Greška pri učitavanju podataka.", "error");
    } catch {
      showAlert("Nije moguće povezati se sa serverom.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const dodajFirmu = async () => {
    if (!firmaForm.naziv_firme || !firmaForm.email || !firmaForm.lozinka) {
      showAlert("Naziv, email i lozinka su obavezni.", "error"); return;
    }
    try {
      const res = await api.post("/admin/firme", firmaForm);
      if (res.data.success) {
        setFirmaModal(false);
        setFirmaForm({ naziv_firme: "", email: "", lozinka: "", pib: "", adresa: "", opis: "" });
        showAlert("Firma je uspješno dodata!"); fetchData();
      } else showAlert(res.data.message || "Greška.", "error");
    } catch { showAlert("Greška pri dodavanju firme.", "error"); }
  };

  const dodajSluzbu = async () => {
    if (!sluzbaForm.naziv_fakulteta || !sluzbaForm.email || !sluzbaForm.lozinka) {
      showAlert("Sva polja su obavezna.", "error"); return;
    }
    try {
      const res = await api.post("/admin/studentske-sluzbe", sluzbaForm);
      if (res.data.success) {
        setSluzbaModal(false);
        setSluzbaForm({ naziv_fakulteta: "", email: "", lozinka: "" });
        showAlert("Studentska služba je uspješno dodata!"); fetchData();
      } else showAlert(res.data.message || "Greška.", "error");
    } catch { showAlert("Greška pri dodavanju službe.", "error"); }
  };

  const handleDelete = async () => {
    const { item, type } = confirm;
    const url = type === "firma" ? `/admin/firme/${item.id}` : `/admin/studentske-sluzbe/${item.id}`;
    try {
      const res = await api.delete(url);
      if (res.data.success) {
        setConfirm({ open: false, item: null, type: "" });
        showAlert("Uspješno obrisano!"); fetchData();
      } else showAlert(res.data.message || "Greška.", "error");
    } catch { showAlert("Greška pri brisanju.", "error"); }
  };

  const st  = data?.statistika;
  const userName  = data?.user ? `${data.user.ime || ""} ${data.user.prezime || "Admin"}`.trim() : "Administrator";
  const userEmail = data?.user?.email || "admin@unitrack.me";
  const today = new Date().toLocaleDateString("bs-BA", { day: "numeric", month: "long", year: "numeric" });

  // latest 3 actions for "Najnovije aktivnosti"
  const latestFirma  = data?.firme?.[0];
  const latestSluzba = data?.studentskeSluzbe?.[0];

  return (
    <div className="flex min-h-screen" style={{ background: "#EAE4DC", fontFamily: "'Inter', sans-serif" }}>

      {/* ═══ SIDEBAR ═══ */}
      <aside className="w-[240px] flex-shrink-0 fixed left-0 top-0 h-screen flex flex-col" style={{ background: "#F2EBE1" }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-[#DDD0BE]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#8B6340" }}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L23 9 12 3zm6.18 8.11L12 14.25 5.82 11.1 12 7.96l6.18 3.15zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
          </div>
          <span className="text-[17px] font-semibold text-[#2C1A0E]">UniTrack</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-[10px] rounded-xl text-[13.5px] font-medium mb-1 transition-all text-left
                ${tab === id
                  ? "text-white shadow-sm"
                  : "text-[#7C5C3A] hover:bg-[#E8DDD0]"
                }`}
              style={tab === id ? { background: "#A0784A" } : {}}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-[#DDD0BE] pt-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "#E8DDD0" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0" style={{ background: "#A0784A" }}>
              {userName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#2C1A0E] truncate">{userName}</p>
              <p className="text-[10.5px] text-[#8B7355] truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className="ml-[240px] flex-1 flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="h-[64px] flex items-center justify-between px-8 sticky top-0 z-30 border-b border-[#DDD0BE]" style={{ background: "#F2EBE1" }}>
          <div /> {/* spacer */}
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#8B7355]">Univerzitet Crne Gore</span>
            <button className="text-[#8B7355] hover:text-[#5C4033] transition-colors">
              <IcoBell />
            </button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold" style={{ background: "#A0784A" }}>
              {userName[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content area — white rounded card like mockup */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-2xl min-h-full shadow-sm overflow-hidden">
            <div className="p-8">

              <Alert message={alert.msg} type={alert.type} onClose={hideAlert} />

              {/* ── POČETNA ── */}
              {tab === "pregled" && (
                <>
                  <div className="mb-7">
                    <h1 className="text-[22px] font-bold text-[#2C1A0E]">Zdravo, Admine 👋</h1>
                    <p className="text-[14px] text-[#8B7355] mt-1">Tvoj pregled sistema · {today}</p>
                  </div>

                  {loading ? <Spinner /> : (
                    <>
                      {/* 2x2 stat cards */}
                      <div className="grid grid-cols-2 gap-5 mb-8">
                        <StatCard
                          title="Ukupno studenata"
                          value={st?.studenti?.toLocaleString("bs-BA")}
                          sub="aktivnih naloga"
                          BigIcon={BigUsers}
                        />
                        <StatCard
                          title="Partnerske firme"
                          value={st?.firme}
                          sub="registrovanih"
                          progress={st?.firme ? Math.min((st.firme / 20) * 100, 100) : 0}
                        />
                        <StatCard
                          title="Aktivni konkursi"
                          value={st?.konkursi}
                          sub="objavljenih oglasa"
                          BigIcon={BigFile}
                        />
                        <StatCard
                          title="Studentske službe"
                          value={st?.studentskeSluzbe}
                          sub="fakulteta"
                          BigIcon={BigSchool}
                        />
                      </div>

                      {/* Najnovije aktivnosti */}
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <h2 className="text-[15px] font-bold text-[#2C1A0E] whitespace-nowrap">Najnovije aktivnosti</h2>
                          <div className="flex-1 h-px bg-[#EDE5DA]" />
                        </div>
                        <div className="border border-[#EDE5DA] rounded-xl overflow-hidden">
                          {latestFirma && (
                            <div className="flex items-center gap-4 px-5 py-4 border-b border-[#F5F0EB]">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F5EFE7" }}>
                                <IcoBuilding />
                              </div>
                              <p className="text-[13.5px] text-[#2C1A0E]">
                                Dodana je nova firma <strong>{latestFirma.naziv_firme}</strong>
                              </p>
                            </div>
                          )}
                          {latestSluzba && (
                            <div className="flex items-center gap-4 px-5 py-4 border-b border-[#F5F0EB]">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F5EFE7" }}>
                                <IcoSchool />
                              </div>
                              <p className="text-[13.5px] text-[#2C1A0E]">
                                Dodana studentska služba <strong>{latestSluzba.naziv_fakulteta}</strong>
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 px-5 py-4">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F5EFE7" }}>
                              <IcoChart />
                            </div>
                            <p className="text-[13.5px] text-[#2C1A0E]">
                              Ukupno <strong>{st?.prijave ?? 0}</strong> prijava na aktivne konkurse
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── STUDENTI ── */}
              {tab === "studenti" && (
                <Section title="Lista studenata" count={`${data?.studenti?.length ?? 0} studenata`}>
                  {loading ? <Spinner /> : <StudentiTable data={data?.studenti} />}
                </Section>
              )}

              {/* ── FIRME ── */}
              {tab === "firme" && (
                <Section
                  title="Partnerske firme"
                  count={`${data?.firme?.length ?? 0} firmi`}
                  action={
                    <button
                      onClick={() => setFirmaModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-[12.5px] font-semibold rounded-xl transition-colors hover:opacity-90"
                      style={{ background: "#A0784A" }}
                    >
                      <IcoPlus /> Dodaj firmu
                    </button>
                  }
                >
                  {loading ? <Spinner /> : (
                    <FirmeTable
                      data={data?.firme}
                      onDelete={(f) => setConfirm({ open: true, item: f, type: "firma" })}
                    />
                  )}
                </Section>
              )}

              {/* ── STUDENTSKE SLUŽBE ── */}
              {tab === "sluzbe" && (
                <Section
                  title="Studentske službe"
                  count={`${data?.studentskeSluzbe?.length ?? 0} službi`}
                  action={
                    <button
                      onClick={() => setSluzbaModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-[12.5px] font-semibold rounded-xl transition-colors hover:opacity-90"
                      style={{ background: "#A0784A" }}
                    >
                      <IcoPlus /> Dodaj službu
                    </button>
                  }
                >
                  {loading ? <Spinner /> : (
                    <SluzbeTable
                      data={data?.studentskeSluzbe}
                      onDelete={(s) => setConfirm({ open: true, item: s, type: "sluzba" })}
                    />
                  )}
                </Section>
              )}

              {/* ── RANG LISTA ── */}
              {tab === "rang" && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <IcoTrophy />
                  <h2 className="text-[18px] font-bold text-[#2C1A0E] mt-4 mb-2">Rang lista</h2>
                  <p className="text-[13px] text-[#8B7355]">Funkcionalnost u izradi.</p>
                </div>
              )}

              {/* ── PODEŠAVANJA ── */}
              {tab === "settings" && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <IcoSettings />
                  <h2 className="text-[18px] font-bold text-[#2C1A0E] mt-4 mb-2">Podešavanja</h2>
                  <p className="text-[13px] text-[#8B7355]">Funkcionalnost u izradi.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: DODAJ FIRMU ── */}
      <Modal open={firmaModal} onClose={() => setFirmaModal(false)} title="Dodaj firmu" subtitle="Kreiraj nalog za novu partnersku firmu">
        <FormInput label="Naziv firme"  required placeholder="npr. Mtel d.o.o."         value={firmaForm.naziv_firme} onChange={(e) => setFirmaForm({ ...firmaForm, naziv_firme: e.target.value })} />
        <FormInput label="Email"        required type="email" placeholder="firma@email.com" value={firmaForm.email} onChange={(e) => setFirmaForm({ ...firmaForm, email: e.target.value })} />
        <FormInput label="Lozinka"      required type="password" placeholder="Min. 8 karaktera" value={firmaForm.lozinka} onChange={(e) => setFirmaForm({ ...firmaForm, lozinka: e.target.value })} />
        <FormInput label="PIB"          placeholder="Poreski identifikacioni broj"       value={firmaForm.pib}    onChange={(e) => setFirmaForm({ ...firmaForm, pib: e.target.value })} />
        <FormInput label="Adresa"       placeholder="Ulica i broj, grad"                 value={firmaForm.adresa} onChange={(e) => setFirmaForm({ ...firmaForm, adresa: e.target.value })} />
        <FormInput label="Opis"         placeholder="Kratki opis firme..." as="textarea"  value={firmaForm.opis}   onChange={(e) => setFirmaForm({ ...firmaForm, opis: e.target.value })} />
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setFirmaModal(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#F5EFE7] text-[#8B7355] border border-[#DDD0BE] hover:bg-[#EDE3D6] transition-colors">Otkaži</button>
          <button onClick={dodajFirmu} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors hover:opacity-90" style={{ background: "#A0784A" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            Sačuvaj
          </button>
        </div>
      </Modal>

      {/* ── MODAL: DODAJ SLUŽBU ── */}
      <Modal open={sluzbaModal} onClose={() => setSluzbaModal(false)} title="Dodaj studentsku službu" subtitle="Kreiraj nalog za fakultetsku studentsku službu">
        <FormInput label="Naziv fakulteta" required placeholder="npr. Elektrotehnički fakultet" value={sluzbaForm.naziv_fakulteta} onChange={(e) => setSluzbaForm({ ...sluzbaForm, naziv_fakulteta: e.target.value })} />
        <FormInput label="Email"           required type="email" placeholder="sluzba@ucg.ac.me"  value={sluzbaForm.email}          onChange={(e) => setSluzbaForm({ ...sluzbaForm, email: e.target.value })} />
        <FormInput label="Lozinka"         required type="password" placeholder="Min. 8 karaktera" value={sluzbaForm.lozinka}     onChange={(e) => setSluzbaForm({ ...sluzbaForm, lozinka: e.target.value })} />
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setSluzbaModal(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#F5EFE7] text-[#8B7355] border border-[#DDD0BE] hover:bg-[#EDE3D6] transition-colors">Otkaži</button>
          <button onClick={dodajSluzbu} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors hover:opacity-90" style={{ background: "#A0784A" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            Sačuvaj
          </button>
        </div>
      </Modal>

      {/* ── CONFIRM DELETE ── */}
      <ConfirmModal
        open={confirm.open}
        onClose={() => setConfirm({ open: false, item: null, type: "" })}
        onConfirm={handleDelete}
        name={confirm.item?.naziv_firme || confirm.item?.naziv_fakulteta || ""}
      />
    </div>
  );
};

export default AdminDashboard;