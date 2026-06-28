import { useState, useEffect, useCallback } from "react";
import api from "../../api/api";
import StudentiTable from "../../components/admin/StudentiTable";
import FirmeTable from "../../components/admin/FirmeTable";
import SluzbeTable from "../../components/admin/SluzbeTable";
import Modal, { ConfirmModal, FormInput } from "../../components/admin/Modal";
import Alert from "../../components/admin/Alert";
import UserDropdown from "../../components/admin/UserDropdown";

// ─── SVG ICONS ───────────────────────────────────────────────────────────────
const IcoHome     = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const IcoUsers    = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IcoBuilding = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>;
const IcoSchool   = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>;
const IcoTrophy   = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>;
const IcoSettings = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IcoTicket   = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>;
const IcoPlus     = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>;
const IcoChart    = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>;

const NAV = [
  { id: "pregled",  label: "Početna",           Icon: IcoHome     },
  { id: "studenti", label: "Studenti",           Icon: IcoUsers    },
  { id: "firme",    label: "Firme",              Icon: IcoBuilding },
  { id: "sluzbe",   label: "Studentske službe",  Icon: IcoSchool   },
  { id: "rang",     label: "Rang lista",         Icon: IcoTrophy   },
  { id: "vauceri",  label: "Vaučeri",            Icon: IcoTicket   },
  { id: "settings", label: "Podešavanja",        Icon: IcoSettings },
];

const MJESECI = [
  "januar", "februar", "mart", "april", "maj", "jun",
  "jul", "avgust", "septembar", "oktobar", "novembar", "decembar",
];

const formatirajDatum = (datum) => {
  const d = datum instanceof Date ? datum : new Date(datum);
  return `${d.getDate()}. ${MJESECI[d.getMonth()]} ${d.getFullYear()}.`;
};

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

const BigUsers    = () => <svg className="w-12 h-12 text-[#C4A882]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const BigFile     = () => <svg className="w-12 h-12 text-[#C4A882]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
const BigSchool   = () => <svg className="w-12 h-12 text-[#C4A882]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>;

const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#8B7355] text-sm">
    <div className="w-7 h-7 border-2 border-[#DDD0BE] border-t-[#6B4C2A] rounded-full animate-spin" />
    Učitavanje...
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

const AdminDashboard = () => {
  const [tab, setTab]       = useState("pregled");
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert]   = useState({ msg: "", type: "" });

  const [firmaModal,  setFirmaModal]  = useState(false);
  const [sluzbaModal, setSluzbaModal] = useState(false);
  const [confirm, setConfirm]         = useState({ open: false, item: null, type: "" });

  const [firmaForm,  setFirmaForm]  = useState({ naziv_firme: "", email: "", pib: "", adresa: "", opis: "" });
  const [sluzbaForm, setSluzbaForm] = useState({ naziv_fakulteta: "", email: "" });

  // Rang lista
  const [rangLista, setRangLista] = useState([]);
  const [rangListaLoaded, setRangListaLoaded] = useState(false);

  // Vaučeri
  const [vauceri, setVauceri] = useState([]);
  const [vauceriLoaded, setVauceriLoaded] = useState(false);
  const [vaucerModal, setVaucerModal] = useState(false);
  const [vaucerForm, setVaucerForm] = useState({ studentska_sluzba_id: "", naziv_partnera: "", opis: "", procenat_popusta: "", pozicija: "", mjesec: new Date().getMonth() + 1, godina: new Date().getFullYear(), datum_isteka: "" });
  const [dobitnikInput, setDobitnikInput] = useState({});
  const [confirmVaucer, setConfirmVaucer] = useState({ open: false, item: null });

  // Podešavanja — promjena lozinke
  const [passwordForm, setPasswordForm] = useState({ staraLozinka: "", novaLozinka: "", potvrdaLozinke: "" });

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

  // ─── Rang lista — učitava se kad se prvi put otvori tab ─────────────────────
  const fetchRangLista = useCallback(async () => {
    try {
      const res = await api.get("/admin/rang-lista");
      if (res.data.success) {
        setRangLista(res.data.rangLista);
        setRangListaLoaded(true);
      }
    } catch {
      showAlert("Greška pri učitavanju rang liste.", "error");
    }
  }, []);

  useEffect(() => {
    if (tab === "rang" && !rangListaLoaded) fetchRangLista();
  }, [tab, rangListaLoaded, fetchRangLista]);

  // ─── Vaučeri ──────────────────────────────────────────────────────────────
  const fetchVauceri = useCallback(async () => {
    try {
      const res = await api.get("/admin/vauceri");
      if (res.data.success) {
        setVauceri(res.data.vauceri);
        setVauceriLoaded(true);
      }
    } catch {
      showAlert("Greška pri učitavanju vaučera.", "error");
    }
  }, []);

  useEffect(() => {
    if (tab === "vauceri" && !vauceriLoaded) fetchVauceri();
  }, [tab, vauceriLoaded, fetchVauceri]);

  const dodajVaucer = async () => {
    if (!vaucerForm.studentska_sluzba_id || !vaucerForm.naziv_partnera) {
      showAlert("Fakultet i naziv partnera su obavezni.", "error"); return;
    }
    try {
      const res = await api.post("/admin/vauceri", vaucerForm);
      if (res.data.success) {
        setVaucerModal(false);
        setVaucerForm({ studentska_sluzba_id: "", naziv_partnera: "", opis: "", procenat_popusta: "", pozicija: "", mjesec: new Date().getMonth() + 1, godina: new Date().getFullYear(), datum_isteka: "" });
        showAlert("Vaučer je uspješno dodat!");
        setVauceriLoaded(false);
      } else showAlert(res.data.message || "Greška.", "error");
    } catch { showAlert("Greška pri dodavanju vaučera.", "error"); }
  };

  const dodijeliPobjednika = async (vaucerId) => {
    const jedinstveniId = dobitnikInput[vaucerId];
    if (!jedinstveniId) { showAlert("Unesi jedinstveni ID studenta.", "error"); return; }
    try {
      const res = await api.post(`/admin/vauceri/${vaucerId}/dobitnik`, { jedinstveni_id: jedinstveniId });
      if (res.data.success) {
        showAlert(res.data.message);
        setDobitnikInput({ ...dobitnikInput, [vaucerId]: "" });
        setVauceriLoaded(false);
      } else showAlert(res.data.message || "Greška.", "error");
    } catch (err) { showAlert(err.response?.data?.message || "Greška pri dodjeli pobjednika.", "error"); }
  };

  const ukloniPobjednika = async (vaucerId) => {
    try {
      const res = await api.delete(`/admin/vauceri/${vaucerId}/dobitnik`);
      if (res.data.success) {
        showAlert("Dobitnik je uklonjen.");
        setVauceriLoaded(false);
      } else showAlert(res.data.message || "Greška.", "error");
    } catch { showAlert("Greška pri uklanjanju dobitnika.", "error"); }
  };

  const obrisiVaucer = async () => {
    try {
      const res = await api.delete(`/admin/vauceri/${confirmVaucer.item.id}`);
      if (res.data.success) {
        setConfirmVaucer({ open: false, item: null });
        showAlert("Vaučer je uspješno obrisan.");
        setVauceriLoaded(false);
      } else showAlert(res.data.message || "Greška.", "error");
    } catch { showAlert("Greška pri brisanju vaučera.", "error"); }
  };

  // ─── Podešavanja — promjena lozinke ──────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/admin/settings/password", passwordForm);
      if (res.data.success) {
        showAlert("Lozinka je uspješno promijenjena.");
        setPasswordForm({ staraLozinka: "", novaLozinka: "", potvrdaLozinke: "" });
      } else showAlert(res.data.message || "Greška.", "error");
    } catch (err) {
      showAlert(err.response?.data?.message || "Greška pri promjeni lozinke.", "error");
    }
  };

  const dodajFirmu = async () => {
    if (!firmaForm.naziv_firme || !firmaForm.email) {
      showAlert("Naziv i email su obavezni.", "error"); return;
    }
    try {
      const res = await api.post("/admin/firme", firmaForm);
      if (res.data.success) {
        setFirmaModal(false);
        setFirmaForm({ naziv_firme: "", email: "", pib: "", adresa: "", opis: "" });
        showAlert(res.data.message || "Firma je uspješno dodata!"); fetchData();
      } else showAlert(res.data.message || "Greška.", "error");
    } catch { showAlert("Greška pri dodavanju firme.", "error"); }
  };

  const dodajSluzbu = async () => {
    if (!sluzbaForm.naziv_fakulteta || !sluzbaForm.email) {
      showAlert("Sva polja su obavezna.", "error"); return;
    }
    try {
      const res = await api.post("/admin/studentske-sluzbe", sluzbaForm);
      if (res.data.success) {
        setSluzbaModal(false);
        setSluzbaForm({ naziv_fakulteta: "", email: "" });
        showAlert(res.data.message || "Studentska služba je uspješno dodata!"); fetchData();
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

  const adminIme     = data?.user?.ime || "";
  const adminPrezime = data?.user?.prezime || "";
  const userName  = `${adminIme} ${adminPrezime}`.trim() || "Administrator";
  const userEmail = data?.user?.email || "admin@unitrack.me";
  const inicijali = `${adminIme?.[0] || ""}${adminPrezime?.[0] || ""}`.toUpperCase() || "A";
  const today = formatirajDatum(new Date());

  const latestFirma  = data?.firme?.[0];
  const latestSluzba = data?.studentskeSluzbe?.[0];

  return (
    <div className="flex min-h-screen" style={{ background: "#EAE4DC", fontFamily: "'Inter', sans-serif" }}>

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

        <div className="px-3 pb-4 border-t border-[#DDD0BE] pt-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "#E8DDD0" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0" style={{ background: "#A0784A" }}>
              {inicijali}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#2C1A0E] truncate">{userName}</p>
              <p className="text-[10.5px] text-[#8B7355] truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="ml-[240px] flex-1 flex flex-col min-h-screen">

        <header className="h-[64px] flex items-center justify-between px-8 sticky top-0 z-30 border-b border-[#DDD0BE]" style={{ background: "#F2EBE1" }}>
          <div />
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#8B7355]">Univerzitet Crne Gore</span>

            <UserDropdown
              inicijali={inicijali}
              naziv={userName}
              podnaslov={userEmail}
              logoutUrl="/auth/logout"
              polja={[
                { labela: "Ime i prezime", vrijednost: userName },
                { labela: "Email",          vrijednost: userEmail },
                { labela: "Uloga",          vrijednost: "Administrator" },
              ]}
            />
          </div>
        </header>

        <div className="flex-1 p-6">
          <div className="bg-white rounded-2xl min-h-full shadow-sm overflow-hidden">
            <div className="p-8">

              <Alert message={alert.msg} type={alert.type} onClose={hideAlert} />

              {tab === "pregled" && (
                <>
                  <div className="mb-7">
                    <h1 className="text-[22px] font-bold text-[#2C1A0E]">Zdravo, {adminIme || "Admine"} 👋</h1>
                    <p className="text-[14px] text-[#8B7355] mt-1">Tvoj pregled sistema · {today}</p>
                  </div>

                  {loading ? <Spinner /> : (
                    <>
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

              {tab === "studenti" && (
                <Section title="Lista studenata" count={`${data?.studenti?.length ?? 0} studenata`}>
                  {loading ? <Spinner /> : <StudentiTable data={data?.studenti} />}
                </Section>
              )}

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

              {tab === "rang" && (
                <Section title="Zvanična rang lista — svi studenti, svi fakulteti" count={`${rangLista.length} studenata`}>
                  {!rangListaLoaded ? <Spinner /> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F2EBE1] text-[12px] font-bold text-[#5C4033]">
                            <th className="px-6 py-3">Pozicija</th>
                            <th className="px-6 py-3">Student</th>
                            <th className="px-6 py-3">Fakultet</th>
                            <th className="px-6 py-3">Smjer</th>
                            <th className="px-6 py-3">Ukupno bodova</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EDE5DA] text-[13px]">
                          {rangLista.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-10 text-center text-[#8B7355]">Nema podataka za rang listu.</td></tr>
                          ) : rangLista.map((item, index) => (
                            <tr key={index} className="hover:bg-[#FAF7F3]">
                              <td className="px-6 py-3.5 font-bold text-[#A0784A]">{item.mjesto}.</td>
                              <td className="px-6 py-3.5 font-semibold text-[#2C1A0E]">{item.prikaz_studenta}</td>
                              <td className="px-6 py-3.5 text-[#8B7355]">{item.naziv_fakulteta}</td>
                              <td className="px-6 py-3.5 text-[#8B7355]">{item.smjer}</td>
                              <td className="px-6 py-3.5 font-bold text-[#8B6340]">{item.ukupno_bodova}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
              )}

              {tab === "vauceri" && (
                <Section
                  title="Vaučeri za studente"
                  count={`${vauceri.length} vaučera`}
                  action={
                    <button
                      onClick={() => setVaucerModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-[12.5px] font-semibold rounded-xl transition-colors hover:opacity-90"
                      style={{ background: "#A0784A" }}
                    >
                      <IcoPlus /> Dodaj vaučer
                    </button>
                  }
                >
                  {!vauceriLoaded ? <Spinner /> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F2EBE1] text-[12px] font-bold text-[#5C4033]">
                            <th className="px-6 py-3">Mjesto</th>
                            <th className="px-6 py-3">Partner / Nagrada</th>
                            <th className="px-6 py-3">Fakultet</th>
                            <th className="px-6 py-3">Mjesec/Godina</th>
                            <th className="px-6 py-3">Dobitnik</th>
                            <th className="px-6 py-3">Akcije</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EDE5DA] text-[13px]">
                          {vauceri.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-10 text-center text-[#8B7355]">Nema unesenih vaučera.</td></tr>
                          ) : vauceri.map((v) => (
                            <tr key={v.id} className="hover:bg-[#FAF7F3]">
                              <td className="px-6 py-3.5">
                                {v.pozicija ? (
                                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F5EFE7] text-[#6B4C2A]">{v.pozicija}. mjesto</span>
                                ) : "—"}
                              </td>
                              <td className="px-6 py-3.5">
                                <p className="font-semibold text-[#2C1A0E]">{v.naziv_partnera}{v.procenat_popusta ? ` — ${v.procenat_popusta}%` : ""}</p>
                                {v.opis && <p className="text-[11.5px] text-[#8B7355] mt-0.5 max-w-[280px]">{v.opis}</p>}
                              </td>
                              <td className="px-6 py-3.5 text-[#8B7355]">{v.naziv_fakulteta}</td>
                              <td className="px-6 py-3.5 text-[#8B7355]">{v.mjesec}/{v.godina}</td>
                              <td className="px-6 py-3.5">
                                {v.dobitnik_id ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-semibold text-[#2C1A0E]">{v.dobitnik_ime} {v.dobitnik_prezime} ({v.dobitnik_jedinstveni_id})</span>
                                    <button onClick={() => ukloniPobjednika(v.id)} className="text-[11px] text-red-500 hover:underline">ukloni</button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="jedinstveni ID"
                                      value={dobitnikInput[v.id] || ""}
                                      onChange={(e) => setDobitnikInput({ ...dobitnikInput, [v.id]: e.target.value })}
                                      className="w-[110px] px-2 py-1 border border-[#DDD0BE] rounded-lg text-[12px] outline-none focus:border-[#A0784A]"
                                    />
                                    <button onClick={() => dodijeliPobjednika(v.id)} className="text-[11px] font-semibold text-[#A0784A] hover:underline">Dodijeli</button>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-3.5">
                                <button
                                  onClick={() => setConfirmVaucer({ open: true, item: v })}
                                  className="text-[12px] font-semibold text-red-500 hover:underline"
                                >
                                  Obriši
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
              )}

              {tab === "settings" && (
                <div>
                  <div className="mb-7">
                    <h1 className="text-[22px] font-bold text-[#2C1A0E]">Podešavanja naloga</h1>
                    <p className="text-[14px] text-[#8B7355] mt-1">Upravljaj bezbjednošću svog admin naloga.</p>
                  </div>

                  <Section title="Promjena lozinke">
                    <form onSubmit={handleChangePassword} className="p-6 max-w-md">
                      <div className="mb-4">
                        <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">Trenutna lozinka</label>
                        <input
                          type="password"
                          value={passwordForm.staraLozinka}
                          onChange={(e) => setPasswordForm({ ...passwordForm, staraLozinka: e.target.value })}
                          className="w-full border border-[#DDD0BE] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A0784A] transition-colors"
                          placeholder="Unesi trenutnu lozinku"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">Nova lozinka</label>
                        <input
                          type="password"
                          value={passwordForm.novaLozinka}
                          onChange={(e) => setPasswordForm({ ...passwordForm, novaLozinka: e.target.value })}
                          className="w-full border border-[#DDD0BE] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A0784A] transition-colors"
                          placeholder="Unesi novu lozinku"
                          required
                        />
                      </div>
                      <div className="mb-5">
                        <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">Potvrda nove lozinke</label>
                        <input
                          type="password"
                          value={passwordForm.potvrdaLozinke}
                          onChange={(e) => setPasswordForm({ ...passwordForm, potvrdaLozinke: e.target.value })}
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

      <Modal open={firmaModal} onClose={() => setFirmaModal(false)} title="Dodaj firmu" subtitle="Kreiraj nalog za novu partnersku firmu">
        <FormInput label="Naziv firme"  required placeholder="npr. Mtel d.o.o."         value={firmaForm.naziv_firme} onChange={(e) => setFirmaForm({ ...firmaForm, naziv_firme: e.target.value })} />
        <FormInput label="Email"        required type="email" placeholder="firma@email.com" value={firmaForm.email} onChange={(e) => setFirmaForm({ ...firmaForm, email: e.target.value })} />
        <p className="text-[11.5px] text-[#8B7355] -mt-1 mb-3">Lozinka se automatski generiše i šalje na ovaj email.</p>
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

      <Modal open={sluzbaModal} onClose={() => setSluzbaModal(false)} title="Dodaj studentsku službu" subtitle="Kreiraj nalog za fakultetsku studentsku službu">
        <FormInput label="Naziv fakulteta" required placeholder="npr. Elektrotehnički fakultet" value={sluzbaForm.naziv_fakulteta} onChange={(e) => setSluzbaForm({ ...sluzbaForm, naziv_fakulteta: e.target.value })} />
        <FormInput label="Email"           required type="email" placeholder="sluzba@ucg.ac.me"  value={sluzbaForm.email}          onChange={(e) => setSluzbaForm({ ...sluzbaForm, email: e.target.value })} />
        <p className="text-[11.5px] text-[#8B7355] -mt-1 mb-3">Lozinka se automatski generiše i šalje na ovaj email.</p>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setSluzbaModal(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#F5EFE7] text-[#8B7355] border border-[#DDD0BE] hover:bg-[#EDE3D6] transition-colors">Otkaži</button>
          <button onClick={dodajSluzbu} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors hover:opacity-90" style={{ background: "#A0784A" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            Sačuvaj
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={confirm.open}
        onClose={() => setConfirm({ open: false, item: null, type: "" })}
        onConfirm={handleDelete}
        name={confirm.item?.naziv_firme || confirm.item?.naziv_fakulteta || ""}
      />

      <Modal open={vaucerModal} onClose={() => setVaucerModal(false)} title="Dodaj vaučer" subtitle="Kreiraj novi vaučer za studente jednog fakulteta">
        <div className="mb-4">
          <label className="block text-xs font-semibold tracking-wider uppercase text-[#8B7355] mb-1.5">Fakultet</label>
          <select
            value={vaucerForm.studentska_sluzba_id}
            onChange={(e) => setVaucerForm({ ...vaucerForm, studentska_sluzba_id: e.target.value })}
            className="w-full px-4 py-2.5 border border-[#DDD0BE] rounded-xl text-sm text-[#2C1A0E] bg-[#F5EFE7] focus:outline-none focus:border-[#6B4C2A] focus:bg-white transition-colors"
          >
            <option value="">— Izaberi fakultet —</option>
            {data?.studentskeSluzbe?.map((s) => <option key={s.id} value={s.id}>{s.naziv_fakulteta}</option>)}
          </select>
        </div>
        <FormInput label="Naziv partnera" required placeholder="npr. FitZone Teretana" value={vaucerForm.naziv_partnera} onChange={(e) => setVaucerForm({ ...vaucerForm, naziv_partnera: e.target.value })} />
        <FormInput label="Opis / nagrada (puni opis - npr. ako nije procenat, npr. karte za bioskop)" placeholder="Kratki opis ponude..." as="textarea" value={vaucerForm.opis} onChange={(e) => setVaucerForm({ ...vaucerForm, opis: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Procenat popusta (opciono)" type="number" placeholder="npr. 20" value={vaucerForm.procenat_popusta} onChange={(e) => setVaucerForm({ ...vaucerForm, procenat_popusta: e.target.value })} />
          <div className="mb-4">
            <label className="block text-xs font-semibold tracking-wider uppercase text-[#8B7355] mb-1.5">Mjesto (opciono)</label>
            <select
              value={vaucerForm.pozicija}
              onChange={(e) => setVaucerForm({ ...vaucerForm, pozicija: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#DDD0BE] rounded-xl text-sm text-[#2C1A0E] bg-[#F5EFE7] focus:outline-none focus:border-[#6B4C2A] focus:bg-white transition-colors"
            >
              <option value="">— Bez mjesta —</option>
              <option value="1">1. mjesto</option>
              <option value="2">2. mjesto</option>
              <option value="3">3. mjesto</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Mjesec (1-12)" required type="number" value={vaucerForm.mjesec} onChange={(e) => setVaucerForm({ ...vaucerForm, mjesec: e.target.value })} />
          <FormInput label="Godina" required type="number" value={vaucerForm.godina} onChange={(e) => setVaucerForm({ ...vaucerForm, godina: e.target.value })} />
        </div>
        <FormInput label="Datum isteka (opciono)" type="date" value={vaucerForm.datum_isteka} onChange={(e) => setVaucerForm({ ...vaucerForm, datum_isteka: e.target.value })} />
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setVaucerModal(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#F5EFE7] text-[#8B7355] border border-[#DDD0BE] hover:bg-[#EDE3D6] transition-colors">Otkaži</button>
          <button onClick={dodajVaucer} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors hover:opacity-90" style={{ background: "#A0784A" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            Sačuvaj
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={confirmVaucer.open}
        onClose={() => setConfirmVaucer({ open: false, item: null })}
        onConfirm={obrisiVaucer}
        name={confirmVaucer.item?.naziv_partnera || ""}
      />
    </div>
  );
};

export default AdminDashboard;