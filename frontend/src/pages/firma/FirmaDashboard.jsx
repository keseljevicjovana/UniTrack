import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../api/api";
import Modal, { ConfirmModal, FormInput } from "../../components/admin/Modal";
import Alert from "../../components/admin/Alert";
import UserDropdown from "../../components/admin/UserDropdown";
import KonkursiTable from "../../components/firma/KonkursiTable";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const IcoHome     = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const IcoList     = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>;
const IcoUpload   = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>;
const IcoPlus     = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>;
const IcoBell     = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>;
const IcoCheck    = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IcoSettings = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IcoSearch   = () => <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>;
const IcoFilter   = () => <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 4h18M6 8h12M9 12h6M11 16h2"/></svg>;

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id: "pregled",   label: "Početna",        Icon: IcoHome     },
  { id: "konkursi",  label: "Moji konkursi",  Icon: IcoList     },
  { id: "prijave",   label: "Prijave",        Icon: IcoCheck    },
  { id: "aktivnosti",label: "Aktivnosti",     Icon: IcoCheck    },
  { id: "upload",    label: "Upload Excel",   Icon: IcoUpload   },
  { id: "settings",  label: "Podešavanja",    Icon: IcoSettings },
];

const MJESECI = [
  "januar", "februar", "mart", "april", "maj", "jun",
  "jul", "avgust", "septembar", "oktobar", "novembar", "decembar",
];

const formatirajDatum = (datum) => {
  const d = datum instanceof Date ? datum : new Date(datum);
  return `${d.getDate()}. ${MJESECI[d.getMonth()]} ${d.getFullYear()}.`;
};

const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#8B7355] text-sm">
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

const StatCard = ({ title, value, sub, icon }) => (
  <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm hover:-translate-y-1 transition-transform duration-200">
    <div className="flex items-start justify-between mb-4">
      <span className="text-xs font-semibold tracking-widest uppercase text-[#8B7355]">{title}</span>
      <div className="w-10 h-10 rounded-xl bg-[#F5EFE7] flex items-center justify-center text-[#6B4C2A]">{icon}</div>
    </div>
    <div className="text-5xl font-bold text-[#6B4C2A] leading-none mb-2">{value ?? "—"}</div>
    <div className="text-xs text-[#8B7355]">{sub}</div>
  </div>
);

const FirmaDashboard = () => {
  const [tab, setTab]         = useState("pregled");
  const [firma, setFirma]     = useState(null);
  const [konkursi, setKonkursi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert]     = useState({ msg: "", type: "" });

  const [konkursModal,  setKonkursModal]  = useState(false);
  const [editModal,     setEditModal]     = useState(false);
  const [editItem,      setEditItem]      = useState(null);
  const [confirm,       setConfirm]       = useState({ open: false, item: null });
  const [aktivnostModal, setAktivnostModal] = useState(false);

  const emptyKonkurs = { naslov: "", opis: "", pozicija: "", maksimalan_broj_prijava: "", rok_prijave: "" };
  const [konkursForm, setKonkursForm] = useState(emptyKonkurs);
  const [aktivnostForm, setAktivnostForm] = useState({ student_id: "", tip: "dogadjaj", naziv: "", opis: "", datum_aktivnosti: "", bodovi: "", konkurs_id: "" });

  // Prijave (ko se prijavio na konkurse)
  const [prijave, setPrijave] = useState([]);
  const [prijaveLoaded, setPrijaveLoaded] = useState(false);
  const [prijaveLoading, setPrijaveLoading] = useState(false);
  const [odabraniKonkursId, setOdabraniKonkursId] = useState(null);

  const [uploadFile,    setUploadFile]    = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ staraLozinka: "", novaLozinka: "", potvrdaLozinke: "" });

  // pretraga i filteri za "Moji konkursi"
  const [konkursiPretraga, setKonkursiPretraga] = useState("");
  const [naprednoOtvoreno, setNaprednoOtvoreno] = useState(false);
  const [filterStatus, setFilterStatus] = useState("svi"); // svi | aktivan | istekao
  const [sortBy, setSortBy] = useState("najnoviji");

  const showAlert = (msg, type = "success") => setAlert({ msg, type });
  const hideAlert = () => setAlert({ msg: "", type: "" });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/firma/settings/password", passwordForm);
      if (res.data.success) {
        showAlert("Lozinka je uspješno promijenjena.");
        setPasswordForm({ staraLozinka: "", novaLozinka: "", potvrdaLozinke: "" });
      } else showAlert(res.data.message || "Greška.", "error");
    } catch (err) {
      showAlert(err.response?.data?.message || "Greška pri promjeni lozinke.", "error");
    }
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, konRes] = await Promise.all([
        api.get("/firma/dashboard"),
        api.get("/firma/konkursi"),
      ]);
      if (dashRes.data.success) setFirma(dashRes.data.firma);
      if (konRes.data.success)  setKonkursi(konRes.data.konkursi);
    } catch {
      showAlert("Greška pri učitavanju podataka.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Prijave — ko se prijavio na konkurse (učitava se kad se otvori tab) ───
  const fetchPrijave = useCallback(async () => {
    setPrijaveLoading(true);
    try {
      const res = await api.get("/firma/prijave");
      if (res.data.success) {
        setPrijave(res.data.prijave);
        setPrijaveLoaded(true);
      }
    } catch {
      showAlert("Greška pri učitavanju prijava.", "error");
    } finally {
      setPrijaveLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "prijave" && !prijaveLoaded) fetchPrijave();
  }, [tab, prijaveLoaded, fetchPrijave]);

  const filtriraniKonkursi = useMemo(() => {
    const danas = new Date();
    let rezultat = konkursi.filter((k) => {
      if (konkursiPretraga.trim()) {
        const q = konkursiPretraga.trim().toLowerCase();
        if (!`${k.naslov} ${k.pozicija || ""}`.toLowerCase().includes(q)) return false;
      }

      const istekao = new Date(k.rok_prijave) < danas;
      if (filterStatus === "aktivan" && istekao) return false;
      if (filterStatus === "istekao" && !istekao) return false;

      return true;
    });

    rezultat = [...rezultat].sort((a, b) => {
      if (sortBy === "najvise_prijava") return (b.broj_prijava || 0) - (a.broj_prijava || 0);
      if (sortBy === "najmanje_prijava") return (a.broj_prijava || 0) - (b.broj_prijava || 0);
      return new Date(b.datum_objave) - new Date(a.datum_objave);
    });

    return rezultat;
  }, [konkursi, konkursiPretraga, filterStatus, sortBy]);

  // "Svi konkursi" — vraća pretragu, filtere i sortiranje na default (najnoviji prvo)
  const resetSveNaDefault = () => {
    setKonkursiPretraga("");
    setFilterStatus("svi");
    setSortBy("najnoviji");
  };

  // ─── Prijave filtrirane po odabranom konkursu (master-detail prikaz) ───────
  const prijaveZaOdabraniKonkurs = useMemo(() => {
    if (!odabraniKonkursId) return [];
    return prijave.filter((p) => p.konkurs_id === odabraniKonkursId);
  }, [prijave, odabraniKonkursId]);

  const resetFiltere = () => {
    setFilterStatus("svi");
    setSortBy("najnoviji");
  };

  const dodajKonkurs = async () => {
    if (!konkursForm.naslov || !konkursForm.opis || !konkursForm.maksimalan_broj_prijava || !konkursForm.rok_prijave) {
      showAlert("Sva obavezna polja moraju biti popunjena.", "error"); return;
    }
    try {
      const res = await api.post("/firma/konkurs", konkursForm);
      if (res.data.success) {
        setKonkursModal(false);
        setKonkursForm(emptyKonkurs);
        showAlert("Konkurs je uspješno kreiran!");
        fetchAll();
      } else showAlert(res.data.message || "Greška.", "error");
    } catch { showAlert("Greška pri kreiranju konkursa.", "error"); }
  };

  const otvoriEdit = (k) => {
    setEditItem(k);
    setKonkursForm({
      naslov: k.naslov,
      opis: k.opis,
      pozicija: k.pozicija || "",
      maksimalan_broj_prijava: k.maksimalan_broj_prijava,
      rok_prijave: k.rok_prijave?.split("T")[0] || k.rok_prijave,
    });
    setEditModal(true);
  };

  const izmijeniKonkurs = async () => {
    try {
      const res = await api.put(`/firma/konkurs/${editItem.id}`, konkursForm);
      if (res.data.success) {
        setEditModal(false);
        setEditItem(null);
        setKonkursForm(emptyKonkurs);
        showAlert("Konkurs je uspješno ažuriran!");
        fetchAll();
      } else showAlert(res.data.message || "Greška.", "error");
    } catch { showAlert("Greška pri ažuriranju.", "error"); }
  };

  const handleDelete = async () => {
    try {
      const res = await api.delete(`/firma/konkurs/${confirm.item.id}`);
      if (res.data.success) {
        setConfirm({ open: false, item: null });
        showAlert("Konkurs je obrisan!");
        fetchAll();
      } else showAlert(res.data.message || "Greška.", "error");
    } catch { showAlert("Greška pri brisanju.", "error"); }
  };

  const dodajAktivnost = async () => {
    if (!aktivnostForm.student_id || !aktivnostForm.naziv) {
      showAlert("Student ID i naziv su obavezni.", "error"); return;
    }
    try {
      const res = await api.post("/firma/aktivnost", aktivnostForm);
      if (res.data.success) {
        setAktivnostModal(false);
        setAktivnostForm({ student_id: "", tip: "dogadjaj", naziv: "", opis: "", datum_aktivnosti: "", bodovi: "", konkurs_id: "" });
        showAlert("Aktivnost je uspješno dodana!");
      } else showAlert(res.data.message || "Greška.", "error");
    } catch { showAlert("Greška pri dodavanju aktivnosti.", "error"); }
  };

  const uploadExcel = async () => {
    if (!uploadFile) { showAlert("Odaberite Excel fajl.", "error"); return; }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await api.post("/firma/upload-aktivnosti", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setUploadFile(null);
        showAlert("Excel fajl je uspješno obrađen!");
      } else showAlert(res.data.message || "Greška.", "error");
    } catch { showAlert("Greška pri uploadu.", "error"); }
    finally { setUploadLoading(false); }
  };

  const firmaEmail = firma?.email || "";
  const firmaNaziv = firma?.naziv_firme || "Firma";
  const today = formatirajDatum(new Date());

  return (
    <div className="flex min-h-screen" style={{ background: "#EAE4DC", fontFamily: "'Inter', sans-serif" }}>

      <aside className="w-[240px] flex-shrink-0 fixed left-0 top-0 h-screen flex flex-col" style={{ background: "#F2EBE1" }}>
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-[#DDD0BE]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#8B6340" }}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L23 9 12 3zm6.18 8.11L12 14.25 5.82 11.1 12 7.96l6.18 3.15zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
          </div>
          <span className="text-[17px] font-semibold text-[#2C1A0E]">UniTrack</span>
        </div>

        <nav className="flex-1 px-3 py-4">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-[10px] rounded-xl text-[13.5px] font-medium mb-1 transition-all text-left
                ${tab === id ? "text-white shadow-sm" : "text-[#7C5C3A] hover:bg-[#E8DDD0]"}`}
              style={tab === id ? { background: "#A0784A" } : {}}
            >
              <Icon />{label}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t border-[#DDD0BE] pt-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "#E8DDD0" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0" style={{ background: "#A0784A" }}>
              {firmaNaziv[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#2C1A0E] truncate">{firmaNaziv}</p>
              <p className="text-[10.5px] text-[#8B7355] truncate">{firmaEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="ml-[240px] flex-1 flex flex-col min-h-screen">
        <header className="h-[64px] flex items-center justify-between px-8 sticky top-0 z-30 border-b border-[#DDD0BE]" style={{ background: "#F2EBE1" }}>
          <div />
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#8B7355]">Partnerska firma</span>
            <span className="text-xs text-[#8B7355] bg-[#F5EFE7] border border-[#DDD0BE] px-4 py-1.5 rounded-full">{today}</span>

            <UserDropdown
              inicijali={firmaNaziv[0]?.toUpperCase()}
              naziv={firmaNaziv}
              podnaslov={firmaEmail}
              logoutUrl="/auth/logout"
              polja={[
                { labela: "Naziv firme", vrijednost: firmaNaziv },
                { labela: "Email",       vrijednost: firmaEmail },
                { labela: "PIB",         vrijednost: firma?.pib },
                { labela: "Adresa",      vrijednost: firma?.adresa },
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
                    <h1 className="text-[22px] font-bold text-[#2C1A0E]">Zdravo, {firmaNaziv}! 👋</h1>
                    <p className="text-[14px] text-[#8B7355] mt-1">Pregled vašeg naloga · {today}</p>
                  </div>
                  {loading ? <Spinner /> : (
                    <>
                      <div className="grid grid-cols-2 gap-5 mb-8">
                        <StatCard
                          title="Aktivni konkursi"
                          value={konkursi.length}
                          sub="objavljenih oglasa"
                          icon={<IcoList />}
                        />
                        <StatCard
                          title="Ukupno prijava"
                          value={konkursi.reduce((acc, k) => acc + (k.broj_prijava || 0), 0)}
                          sub="prijava na vaše konkurse"
                          icon={<IcoCheck />}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <h2 className="text-[15px] font-bold text-[#2C1A0E] whitespace-nowrap">Najnoviji konkursi</h2>
                          <div className="flex-1 h-px bg-[#EDE5DA]" />
                        </div>
                        <div className="border border-[#EDE5DA] rounded-xl overflow-hidden">
                          {konkursi.length === 0 ? (
                            <div className="py-12 text-center text-[#8B7355] text-sm">Nemate aktivnih konkursa.</div>
                          ) : (
                            konkursi.slice(0, 3).map((k, i) => (
                              <div key={k.id} className={`flex items-center gap-4 px-5 py-4 ${i < 2 ? "border-b border-[#F5F0EB]" : ""}`}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F5EFE7" }}>
                                  <IcoList />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13.5px] font-semibold text-[#2C1A0E] truncate">{k.naslov}</p>
                                  <p className="text-[11px] text-[#8B7355]">Rok: {formatirajDatum(k.rok_prijave)}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {tab === "konkursi" && (
                <Section
                  title="Moji konkursi"
                  count={`${filtriraniKonkursi.length} / ${konkursi.length} konkursa`}
                  action={
                    <button
                      onClick={() => setKonkursModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-[12.5px] font-semibold rounded-xl hover:opacity-90 transition-colors"
                      style={{ background: "#A0784A" }}
                    >
                      <IcoPlus /> Novi konkurs
                    </button>
                  }
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div className="relative flex-1 min-w-[220px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A89682]">
                          <IcoSearch />
                        </div>
                        <input
                          type="text"
                          value={konkursiPretraga}
                          onChange={(e) => setKonkursiPretraga(e.target.value)}
                          placeholder="Brza pretraga — naslov ili pozicija..."
                          className="w-full pl-9 pr-4 py-2.5 border border-[#DDD0BE] rounded-xl text-sm outline-none focus:border-[#A0784A] bg-[#FAF7F3]"
                        />
                      </div>
                      <button
                        onClick={resetSveNaDefault}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-semibold border border-[#DDD0BE] bg-white text-[#6B4C2A] hover:bg-[#F5EFE7] transition-colors"
                      >
                        Svi konkursi
                      </button>
                      <button
                        onClick={() => setNaprednoOtvoreno((v) => !v)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-semibold border transition-colors ${
                          naprednoOtvoreno
                            ? "bg-[#A0784A] text-white border-transparent"
                            : "bg-white text-[#6B4C2A] border-[#DDD0BE] hover:bg-[#F5EFE7]"
                        }`}
                      >
                        <IcoFilter /> FILTERI
                      </button>
                    </div>

                    {naprednoOtvoreno && (
                      <div className="bg-[#FAF7F3] border border-[#EDE5DA] rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#8B7355] mb-1">Status</label>
                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-[#DDD0BE] rounded-lg text-[12.5px] outline-none focus:border-[#A0784A] bg-white"
                          >
                            <option value="svi">Svi konkursi</option>
                            <option value="aktivan">Aktivni</option>
                            <option value="istekao">Istekli</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#8B7355] mb-1">Sortiraj po</label>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-2 border border-[#DDD0BE] rounded-lg text-[12.5px] outline-none focus:border-[#A0784A] bg-white"
                          >
                            <option value="najnoviji">Najnoviji prvo</option>
                            <option value="najvise_prijava">Najviše prijava</option>
                            <option value="najmanje_prijava">Najmanje prijava</option>
                          </select>
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                          <button onClick={resetFiltere} className="text-[12px] font-semibold text-[#A0784A] hover:underline">
                            Poništi filtere
                          </button>
                        </div>
                      </div>
                    )}

                    {loading ? <Spinner /> : (
                      <KonkursiTable
                        data={filtriraniKonkursi}
                        onEdit={otvoriEdit}
                        onDelete={(k) => setConfirm({ open: true, item: k })}
                      />
                    )}
                  </div>
                </Section>
              )}

              {tab === "prijave" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* LIJEVO — lista konkursa sa brojem prijava */}
                  <Section title="Vaši konkursi" count={`${konkursi.length} konkursa`}>
                    {prijaveLoading ? <Spinner /> : (
                      <div className="divide-y divide-[#F0E8DC]">
                        {konkursi.length === 0 ? (
                          <div className="p-6 text-center text-[#8B7355] text-sm">Nemate objavljenih konkursa.</div>
                        ) : konkursi.map((k) => (
                          <button
                            key={k.id}
                            onClick={() => setOdabraniKonkursId(k.id)}
                            className={`w-full text-left flex items-center justify-between gap-3 px-6 py-4 transition-colors ${
                              odabraniKonkursId === k.id ? "bg-[#FDF9F3]" : "hover:bg-[#FAF7F3]"
                            }`}
                            style={odabraniKonkursId === k.id ? { boxShadow: "inset 3px 0 0 #A0784A" } : {}}
                          >
                            <div className="min-w-0">
                              <p className="text-[13.5px] font-semibold text-[#2C1A0E] truncate">{k.naslov}</p>
                              <p className="text-[11px] text-[#8B7355] mt-0.5">Rok: {formatirajDatum(k.rok_prijave)}</p>
                            </div>
                            <span
                              className="text-[12px] font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                              style={{ background: "#F5EFE7", color: "#6B4C2A" }}
                            >
                              {k.broj_prijava || 0} / {k.maksimalan_broj_prijava}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </Section>

                  {/* DESNO — prijave za izabrani konkurs */}
                  <Section
                    title={odabraniKonkursId ? `Prijavljeni — ${konkursi.find((k) => k.id === odabraniKonkursId)?.naslov || ""}` : "Prijavljeni studenti"}
                    count={odabraniKonkursId ? `${prijaveZaOdabraniKonkurs.length} prijava` : undefined}
                  >
                    {!odabraniKonkursId ? (
                      <div className="p-10 text-center text-[#8B7355] text-sm">
                        ← Izaberite konkurs sa lijeve strane da vidite ko se prijavio.
                      </div>
                    ) : prijaveZaOdabraniKonkurs.length === 0 ? (
                      <div className="p-10 text-center text-[#8B7355] text-sm">Još nema prijava na ovaj konkurs.</div>
                    ) : (
                      <div className="divide-y divide-[#F0E8DC]">
                        {prijaveZaOdabraniKonkurs.map((p) => (
                          <div key={p.id} className="px-6 py-4">
                            <p className="text-[13.5px] font-semibold text-[#2C1A0E]">{p.ime} {p.prezime}</p>
                            <p className="text-[11.5px] text-[#8B7355] mt-0.5">
                              {p.jedinstveni_id} · {p.studentski_email} · {p.smjer}
                            </p>
                            <p className="text-[10.5px] text-[#A89682] mt-1">
                              Prijavljen: {formatirajDatum(p.datum_prijave)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>
              )}


              {tab === "aktivnosti" && (
                <Section
                  title="Dodaj aktivnost studentu"
                  action={
                    <button
                      onClick={() => setAktivnostModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-[12.5px] font-semibold rounded-xl hover:opacity-90 transition-colors"
                      style={{ background: "#A0784A" }}
                    >
                      <IcoPlus /> Dodaj aktivnost
                    </button>
                  }
                >
                  <div className="px-6 py-10 text-center text-[#8B7355] text-sm">
                    Kliknite "Dodaj aktivnost" da ručno dodate aktivnost za studenta, ili koristite tab "Upload Excel" za masovni unos.
                  </div>
                </Section>
              )}

              {tab === "upload" && (
                <Section title="Upload Excel fajla">
                  <div className="px-6 py-8">
                    <p className="text-[13px] text-[#8B7355] mb-6">
                      Excel fajl mora imati kolone: <strong>student_identifier</strong>, <strong>aktivnost</strong>, <strong>bodovi</strong>. Opciono: <strong>tip</strong> (dogadjaj/volontiranje/praksa/radionica/drugo), <strong>konkurs_naslov</strong> (ako želite da povežete aktivnost sa konkretnim konkursom), <strong>opis</strong>.
                    </p>
                    <div className="border-2 border-dashed border-[#DDD0BE] rounded-xl p-8 text-center mb-6 hover:border-[#A0784A] transition-colors">
                      <IcoUpload />
                      <p className="text-[13px] text-[#8B7355] mt-3 mb-4">Odaberite Excel fajl (.xlsx)</p>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setUploadFile(e.target.files[0])}
                        className="hidden"
                        id="excel-upload"
                      />
                      <label
                        htmlFor="excel-upload"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer text-white hover:opacity-90 transition-colors"
                        style={{ background: "#A0784A" }}
                      >
                        Odaberi fajl
                      </label>
                      {uploadFile && (
                        <p className="text-[12px] text-[#6B4C2A] mt-3 font-semibold">{uploadFile.name}</p>
                      )}
                    </div>
                    <button
                      onClick={uploadExcel}
                      disabled={!uploadFile || uploadLoading}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: "#A0784A" }}
                    >
                      {uploadLoading ? "Obrađivanje..." : "Uploaduj i obradi"}
                    </button>
                  </div>
                </Section>
              )}

              {tab === "settings" && (
                <div>
                  <div className="mb-7">
                    <h1 className="text-[22px] font-bold text-[#2C1A0E]">Podešavanja naloga</h1>
                    <p className="text-[14px] text-[#8B7355] mt-1">Upravljaj bezbjednošću svog naloga.</p>
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

      <Modal open={konkursModal} onClose={() => { setKonkursModal(false); setKonkursForm(emptyKonkurs); }} title="Novi konkurs" subtitle="Kreirajte oglas za volontiranje ili praksu">
        <FormInput label="Naslov" required placeholder="npr. IT volonter" value={konkursForm.naslov} onChange={(e) => setKonkursForm({ ...konkursForm, naslov: e.target.value })} />
        <FormInput label="Opis" required placeholder="Opis pozicije i uslova..." as="textarea" value={konkursForm.opis} onChange={(e) => setKonkursForm({ ...konkursForm, opis: e.target.value })} />
        <FormInput label="Pozicija" placeholder="npr. Frontend developer" value={konkursForm.pozicija} onChange={(e) => setKonkursForm({ ...konkursForm, pozicija: e.target.value })} />
        <FormInput label="Maks. broj prijava" required type="number" placeholder="npr. 20" value={konkursForm.maksimalan_broj_prijava} onChange={(e) => setKonkursForm({ ...konkursForm, maksimalan_broj_prijava: e.target.value })} />
        <FormInput label="Rok prijave" required type="date" value={konkursForm.rok_prijave} onChange={(e) => setKonkursForm({ ...konkursForm, rok_prijave: e.target.value })} />
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => { setKonkursModal(false); setKonkursForm(emptyKonkurs); }} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#F5EFE7] text-[#8B7355] border border-[#DDD0BE] hover:bg-[#EDE3D6] transition-colors">Otkaži</button>
          <button onClick={dodajKonkurs} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition-colors" style={{ background: "#A0784A" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            Objavi konkurs
          </button>
        </div>
      </Modal>

      <Modal open={editModal} onClose={() => { setEditModal(false); setKonkursForm(emptyKonkurs); }} title="Izmijeni konkurs" subtitle="Ažurirajte podatke o konkursu">
        <FormInput label="Naslov" required placeholder="npr. IT volonter" value={konkursForm.naslov} onChange={(e) => setKonkursForm({ ...konkursForm, naslov: e.target.value })} />
        <FormInput label="Opis" required placeholder="Opis pozicije..." as="textarea" value={konkursForm.opis} onChange={(e) => setKonkursForm({ ...konkursForm, opis: e.target.value })} />
        <FormInput label="Pozicija" placeholder="npr. Frontend developer" value={konkursForm.pozicija} onChange={(e) => setKonkursForm({ ...konkursForm, pozicija: e.target.value })} />
        <FormInput label="Maks. broj prijava" required type="number" placeholder="npr. 20" value={konkursForm.maksimalan_broj_prijava} onChange={(e) => setKonkursForm({ ...konkursForm, maksimalan_broj_prijava: e.target.value })} />
        <FormInput label="Rok prijave" required type="date" value={konkursForm.rok_prijave} onChange={(e) => setKonkursForm({ ...konkursForm, rok_prijave: e.target.value })} />
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => { setEditModal(false); setKonkursForm(emptyKonkurs); }} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#F5EFE7] text-[#8B7355] border border-[#DDD0BE] hover:bg-[#EDE3D6] transition-colors">Otkaži</button>
          <button onClick={izmijeniKonkurs} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition-colors" style={{ background: "#A0784A" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            Sačuvaj izmjene
          </button>
        </div>
      </Modal>

      <Modal open={aktivnostModal} onClose={() => setAktivnostModal(false)} title="Dodaj aktivnost" subtitle="Ručno dodajte aktivnost za studenta">
        <FormInput label="Student ID" required placeholder="Jedinstveni ID studenta" value={aktivnostForm.student_id} onChange={(e) => setAktivnostForm({ ...aktivnostForm, student_id: e.target.value })} />
        <div className="mb-4">
          <label className="block text-xs font-semibold tracking-wider uppercase text-[#8B7355] mb-1.5">Tip aktivnosti</label>
          <select
            value={aktivnostForm.tip}
            onChange={(e) => setAktivnostForm({ ...aktivnostForm, tip: e.target.value })}
            className="w-full px-4 py-2.5 border border-[#DDD0BE] rounded-xl text-sm text-[#2C1A0E] bg-[#F5EFE7] focus:outline-none focus:border-[#6B4C2A] focus:bg-white transition-colors"
          >
            <option value="dogadjaj">Događaj</option>
            <option value="volontiranje">Volontiranje</option>
            <option value="praksa">Praksa</option>
            <option value="radionica">Radionica</option>
            <option value="drugo">Drugo</option>
          </select>
        </div>
        <FormInput label="Naziv" required placeholder="Naziv aktivnosti" value={aktivnostForm.naziv} onChange={(e) => setAktivnostForm({ ...aktivnostForm, naziv: e.target.value })} />
        <FormInput label="Opis" placeholder="Kratki opis..." as="textarea" value={aktivnostForm.opis} onChange={(e) => setAktivnostForm({ ...aktivnostForm, opis: e.target.value })} />
        <FormInput label="Bodovi" type="number" placeholder="npr. 10" value={aktivnostForm.bodovi} onChange={(e) => setAktivnostForm({ ...aktivnostForm, bodovi: e.target.value })} />
        <div className="mb-4">
          <label className="block text-xs font-semibold tracking-wider uppercase text-[#8B7355] mb-1.5">Konkurs (opciono)</label>
          <select
            value={aktivnostForm.konkurs_id}
            onChange={(e) => setAktivnostForm({ ...aktivnostForm, konkurs_id: e.target.value })}
            className="w-full px-4 py-2.5 border border-[#DDD0BE] rounded-xl text-sm text-[#2C1A0E] bg-[#F5EFE7] focus:outline-none focus:border-[#6B4C2A] focus:bg-white transition-colors"
          >
            <option value="">— Nije povezano sa konkursom —</option>
            {konkursi.map((k) => <option key={k.id} value={k.id}>{k.naslov}</option>)}
          </select>
        </div>
        <FormInput label="Datum aktivnosti" type="date" value={aktivnostForm.datum_aktivnosti} onChange={(e) => setAktivnostForm({ ...aktivnostForm, datum_aktivnosti: e.target.value })} />
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setAktivnostModal(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#F5EFE7] text-[#8B7355] border border-[#DDD0BE] hover:bg-[#EDE3D6] transition-colors">Otkaži</button>
          <button onClick={dodajAktivnost} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition-colors" style={{ background: "#A0784A" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            Sačuvaj
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={confirm.open}
        onClose={() => setConfirm({ open: false, item: null })}
        onConfirm={handleDelete}
        name={confirm.item?.naslov || ""}
      />
    </div>
  );
};

export default FirmaDashboard;