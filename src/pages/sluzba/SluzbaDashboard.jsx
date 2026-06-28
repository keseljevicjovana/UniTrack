import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../api/api";
import Alert from "../../components/admin/Alert";
import Modal, { FormInput } from "../../components/admin/Modal";
import UserDropdown from "../../components/admin/UserDropdown";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const IcoHome    = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const IcoUsers   = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IcoFile    = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
const IcoUpload  = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>;
const IcoSettings= () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IcoBell    = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>;
const IcoEdit    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>;
const IcoDownload= () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>;
const IcoPlus    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>;
const IcoSearch  = () => <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>;
const IcoFilter  = () => <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 4h18M6 8h12M9 12h6M11 16h2"/></svg>;
const IcoBook    = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.04C10.5 4.5 8 4 6 4.5v13c2-.5 4.5 0 6 1.54 1.5-1.54 4-2.04 6-1.54v-13c-2-.5-4.5 0-6 1.54z"/></svg>;
const IcoClipboard = () => <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-5 8l2 2 4-4"/></svg>;
const IcoLock2   = () => <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v2"/></svg>;

const NAV = [
  { id: "pregled",  label: "Početna",            Icon: IcoHome },
  { id: "studenti", label: "Studenti",           Icon: IcoUsers },
  { id: "predmeti", label: "Predmeti",           Icon: IcoBook },
  { id: "cv",       label: "CV zahtjevi",        Icon: IcoFile },
  { id: "bodovi",   label: "Unos bodova (Excel)",Icon: IcoUpload },
  { id: "settings", label: "Podešavanja",        Icon: IcoSettings },
];

const MJESECI = ["januar","februar","mart","april","maj","jun","jul","avgust","septembar","oktobar","novembar","decembar"];
const formatirajDatum = (datum) => {
  const d = datum instanceof Date ? datum : new Date(datum);
  return `${d.getDate()}. ${MJESECI[d.getMonth()]} ${d.getFullYear()}.`;
};

const STATUS_OPCIJE = [
  { value: "poslato",   label: "Poslato",    bg: "#F5EFE7", color: "#8B7355" },
  { value: "u_obradi",  label: "U obradi",   bg: "#FFF6E0", color: "#B8860B" },
  { value: "zavrseno",  label: "Završeno",   bg: "#E8F5E9", color: "#2E7D32" },
  { value: "odbijeno",  label: "Odbijeno",   bg: "#FDECEC", color: "#C62828" },
];
const statusInfo = (val) => STATUS_OPCIJE.find((s) => s.value === val) || STATUS_OPCIJE[0];

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
          <span className="text-[12px] text-[#8B7355] bg-[#F5EFE7] border border-[#DDD0BE] px-3 py-1 rounded-full">{count}</span>
        )}
        {action}
      </div>
    </div>
    {children}
  </div>
);

const SluzbaDashboard = () => {
  const [tab, setTab] = useState("pregled");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ msg: "", type: "" });

  const [data, setData]         = useState(null);
  const [studenti, setStudenti] = useState([]);
  const [zahtjevi, setZahtjevi] = useState([]);

  const [studentiLoaded, setStudentiLoaded] = useState(false);
  const [zahtjeviLoaded, setZahtjeviLoaded] = useState(false);

  // Pretraga i filteri za "Studenti" tab
  const [brzaPretraga, setBrzaPretraga] = useState("");
  const [naprednoOtvoreno, setNaprednoOtvoreno] = useState(false);
  const [filterIme, setFilterIme] = useState("");
  const [filterPrezime, setFilterPrezime] = useState("");
  const [filterSmjer, setFilterSmjer] = useState("");
  const [filterProsjekMin, setFilterProsjekMin] = useState("");
  const [filterProsjekMax, setFilterProsjekMax] = useState("");

  const [bodoviModal, setBodoviModal]     = useState(false);
  const [bodoviStudent, setBodoviStudent] = useState(null);
  const [bodoviLoading, setBodoviLoading] = useState(false);
  const [bodoviForm, setBodoviForm] = useState({
    akademski_bodovi: "",
    vannastavne_aktivnosti_bodovi: "",
    drustveni_doprinos_bodovi: "",
    posebna_postignuca_bodovi: "",
  });

  const [passwordForm, setPasswordForm] = useState({ staraLozinka: "", novaLozinka: "", potvrdaLozinke: "" });

  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadRezultat, setUploadRezultat] = useState(null);

  // Unos ocjena (komponente bodova po predmetu)
  const [ocjeneForm, setOcjeneForm] = useState({ predmet_id: "", tip_boda: "prisustvo", opis: "" });

  // Posebna postignuća — modal sa Student ID poljem (kao kod Firme/Aktivnosti)
  const [posebnaModal, setPosebnaModal] = useState(false);
  const [posebnaForm, setPosebnaForm] = useState({ jedinstveni_id: "", bodovi: "" });
  const [posebnaLoading, setPosebnaLoading] = useState(false);
  const [ocjeneFile, setOcjeneFile] = useState(null);
  const [ocjeneLoading, setOcjeneLoading] = useState(false);
  const [ocjeneRezultat, setOcjeneRezultat] = useState(null);
  const [rezultatiList, setRezultatiList] = useState([]);
  const [rezultatiLoaded, setRezultatiLoaded] = useState(false);

  // Predmeti
  const [predmeti, setPredmeti] = useState([]);
  const [predmetiLoaded, setPredmetiLoaded] = useState(false);
  const [predmetForm, setPredmetForm] = useState({ naziv: "", smjer: "", sifra_predmeta: "", semestar: 1, godina_studija: 1, espb: 6, obavezan: true });
  const [predmetSaving, setPredmetSaving] = useState(false);

  // Upisni period (status)
  const [upisniPeriod, setUpisniPeriod] = useState(null);
  const [upisniLoaded, setUpisniLoaded] = useState(false);

  // Upis godine — workflow
  const [upisPretraga, setUpisPretraga] = useState("");
  const [upisOdabraniStudent, setUpisOdabraniStudent] = useState(null);
  const [upisNoviStudentMode, setUpisNoviStudentMode] = useState(false);
  const [noviStudentForm, setNoviStudentForm] = useState({
    ime: "", prezime: "", jmbg: "", jedinstveni_id: "",
    studentski_email: "", lozinka: "", broj_indeksa: "", smjer: "",
  });
  const [upisGodinaStudija, setUpisGodinaStudija] = useState(1);
  const [upisOdabraniPredmeti, setUpisOdabraniPredmeti] = useState([]);
  const [upisSaving, setUpisSaving] = useState(false);

  const showAlert = (msg, type = "success") => setAlert({ msg, type });
  const hideAlert = () => setAlert({ msg: "", type: "" });

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/sluzba/dashboard");
      if (res.data.success) setData(res.data);
      else showAlert("Greška pri učitavanju podataka.", "error");
    } catch {
      showAlert("Nije moguće povezati se sa serverom.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const fetchStudenti = useCallback(async () => {
    try {
      const res = await api.get("/sluzba/studenti");
      if (res.data.success) {
        setStudenti(res.data.studenti);
        setStudentiLoaded(true);
      }
    } catch {
      showAlert("Greška pri učitavanju studenata.", "error");
    }
  }, []);

  // ─── Opcije za dropdown filtere — izvučene iz već učitanih studenata ────────
  const smjerOpcije = useMemo(
    () => [...new Set(studenti.map((s) => s.smjer).filter(Boolean))].sort(),
    [studenti]
  );

  // Filter po smjeru za "Predmeti" tab
  const [filterSmjerPredmeti, setFilterSmjerPredmeti] = useState("");

  const filtriraniPredmeti = useMemo(() => {
    if (!filterSmjerPredmeti) return predmeti;
    return predmeti.filter((p) => p.smjer === filterSmjerPredmeti);
  }, [predmeti, filterSmjerPredmeti]);

  // ─── Filtrirani studenti — brza pretraga + napredni filteri kombinovano ────
  const filtriraniStudenti = useMemo(() => {
    return studenti.filter((s) => {
      // Brza pretraga: ime, prezime, email, jedinstveni ID
      if (brzaPretraga.trim()) {
        const q = brzaPretraga.trim().toLowerCase();
        const tekst = `${s.ime} ${s.prezime} ${s.studentski_email} ${s.jedinstveni_id}`.toLowerCase();
        if (!tekst.includes(q)) return false;
      }

      // Napredni filteri
      if (filterIme.trim() && !s.ime?.toLowerCase().includes(filterIme.trim().toLowerCase())) return false;
      if (filterPrezime.trim() && !s.prezime?.toLowerCase().includes(filterPrezime.trim().toLowerCase())) return false;
      if (filterSmjer && s.smjer !== filterSmjer) return false;
      if (filterProsjekMin !== "" && (Number(s.ukupno_bodova) || 0) < Number(filterProsjekMin)) return false;
      if (filterProsjekMax !== "" && (Number(s.ukupno_bodova) || 0) > Number(filterProsjekMax)) return false;

      return true;
    });
  }, [studenti, brzaPretraga, filterIme, filterPrezime, filterSmjer, filterProsjekMin, filterProsjekMax]);

  const resetFiltere = () => {
    setFilterIme("");
    setFilterPrezime("");
    setFilterSmjer("");
    setFilterProsjekMin("");
    setFilterProsjekMax("");
  };

  const fetchZahtjevi = useCallback(async () => {
    try {
      const res = await api.get("/sluzba/cv-zahtjevi");
      if (res.data.success) {
        setZahtjevi(res.data.zahtjevi);
        setZahtjeviLoaded(true);
      }
    } catch {
      showAlert("Greška pri učitavanju CV zahtjeva.", "error");
    }
  }, []);

  const fetchRezultati = useCallback(async () => {
    try {
      const res = await api.get("/sluzba/rezultati");
      if (res.data.success) {
        setRezultatiList(res.data.rezultati);
        setRezultatiLoaded(true);
      }
    } catch {
      showAlert("Greška pri učitavanju rezultata.", "error");
    }
  }, []);

  const fetchPredmeti = useCallback(async () => {
    try {
      const res = await api.get("/sluzba/predmeti");
      if (res.data.success) {
        setPredmeti(res.data.predmeti);
        setPredmetiLoaded(true);
      }
    } catch {
      showAlert("Greška pri učitavanju predmeta.", "error");
    }
  }, []);

  const fetchUpisniPeriod = useCallback(async () => {
    try {
      const res = await api.get("/sluzba/upisni-period");
      if (res.data.success) {
        setUpisniPeriod(res.data.period);
        setUpisniLoaded(true);
      }
    } catch {
      showAlert("Greška pri učitavanju upisnog perioda.", "error");
    }
  }, []);

  useEffect(() => {
    if (tab === "studenti" && !studentiLoaded) fetchStudenti();
    if (tab === "cv" && !zahtjeviLoaded) fetchZahtjevi();
    if (tab === "bodovi") {
      if (!rezultatiLoaded) fetchRezultati();
      if (!predmetiLoaded) fetchPredmeti();
      if (!studentiLoaded) fetchStudenti();
    }
    if (tab === "predmeti" && !predmetiLoaded) fetchPredmeti();
    if (tab === "predmeti" && !studentiLoaded) fetchStudenti();
  }, [tab, studentiLoaded, zahtjeviLoaded, rezultatiLoaded, predmetiLoaded, fetchStudenti, fetchZahtjevi, fetchRezultati, fetchPredmeti]);

  // ─── Predmeti dostupni za odabranu godinu studija (upis) ────────────────────
  const predmetiZaGodinu = useMemo(
    () => predmeti.filter((p) => Number(p.godina_studija) === Number(upisGodinaStudija)),
    [predmeti, upisGodinaStudija]
  );

  // Kad se promijeni godina studija u "Upis godine" — auto-izaberi sve REDOVNE predmete te godine
  useEffect(() => {
    const redovni = predmetiZaGodinu.filter((p) => p.obavezan).map((p) => p.id);
    setUpisOdabraniPredmeti(redovni);
  }, [predmetiZaGodinu]);

  // Studenti koji se poklapaju sa pretragom u "Upis godine" (max 8 prikazano)
  const upisPretraganiStudenti = useMemo(() => {
    if (!upisPretraga.trim()) return [];
    const q = upisPretraga.trim().toLowerCase();
    return studenti
      .filter((s) => `${s.ime} ${s.prezime} ${s.jedinstveni_id} ${s.broj_indeksa}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [studenti, upisPretraga]);

  const dodajPredmet = async () => {
    if (!predmetForm.naziv || !predmetForm.semestar || !predmetForm.godina_studija) {
      showAlert("Naziv, semestar i godina studija su obavezni.", "error");
      return;
    }
    setPredmetSaving(true);
    try {
      const res = await api.post("/sluzba/predmeti", predmetForm);
      if (res.data.success) {
        showAlert(res.data.message);
        setPredmetForm({ naziv: "", sifra_predmeta: "", semestar: 1, godina_studija: 1, espb: 6, obavezan: true });
        setPredmetiLoaded(false);
        fetchPredmeti();
      } else showAlert(res.data.message || "Greška.", "error");
    } catch (err) {
      showAlert(err.response?.data?.message || "Greška pri dodavanju predmeta.", "error");
    } finally {
      setPredmetSaving(false);
    }
  };

  const dodajNovogStudenta = async () => {
    const f = noviStudentForm;
    if (!f.ime || !f.prezime || !f.jmbg || !f.jedinstveni_id || !f.studentski_email || !f.lozinka || !f.broj_indeksa || !f.smjer) {
      showAlert("Sva polja za novog studenta su obavezna.", "error");
      return;
    }
    setUpisSaving(true);
    try {
      const res = await api.post("/sluzba/studenti", { ...f, godina_studija: upisGodinaStudija });
      if (res.data.success) {
        showAlert("Student je dodat. Sada možeš nastaviti sa upisom predmeta.");
        setUpisOdabraniStudent({
          id: res.data.student_id,
          ime: f.ime,
          prezime: f.prezime,
          jedinstveni_id: f.jedinstveni_id,
        });
        setUpisNoviStudentMode(false);
        setStudentiLoaded(false);
        fetchStudenti();
      } else showAlert(res.data.message || "Greška.", "error");
    } catch (err) {
      showAlert(err.response?.data?.message || "Greška pri dodavanju studenta.", "error");
    } finally {
      setUpisSaving(false);
    }
  };

  const togglePredmetUpis = (predmetId) => {
    setUpisOdabraniPredmeti((prev) =>
      prev.includes(predmetId) ? prev.filter((id) => id !== predmetId) : [...prev, predmetId]
    );
  };

  const potvrdiUpis = async () => {
    if (!upisOdabraniStudent) {
      showAlert("Odaberite ili dodajte studenta.", "error");
      return;
    }
    if (upisOdabraniPredmeti.length === 0) {
      showAlert("Odaberite bar jedan predmet.", "error");
      return;
    }
    setUpisSaving(true);
    try {
      const res = await api.post("/sluzba/upisi", {
        student_id: upisOdabraniStudent.id,
        godina_studija: upisGodinaStudija,
        predmet_ids: upisOdabraniPredmeti,
      });
      if (res.data.success) {
        showAlert(res.data.message);
        setUpisOdabraniStudent(null);
        setUpisPretraga("");
        setStudentiLoaded(false);
      } else showAlert(res.data.message || "Greška.", "error");
    } catch (err) {
      showAlert(err.response?.data?.message || "Greška pri upisu.", "error");
    } finally {
      setUpisSaving(false);
    }
  };

  const otvoriBodoviModal = async (student) => {
    setBodoviStudent(student);
    setBodoviModal(true);
    setBodoviLoading(true);
    setBodoviForm({ akademski_bodovi: "", vannastavne_aktivnosti_bodovi: "", drustveni_doprinos_bodovi: "", posebna_postignuca_bodovi: "" });
    try {
      const res = await api.get(`/sluzba/bodovi/${student.id}`);
      if (res.data.success && res.data.bodovi) {
        const b = res.data.bodovi;
        setBodoviForm({
          akademski_bodovi: b.akademski_bodovi ?? "",
          vannastavne_aktivnosti_bodovi: b.vannastavne_aktivnosti_bodovi ?? "",
          drustveni_doprinos_bodovi: b.drustveni_doprinos_bodovi ?? "",
          posebna_postignuca_bodovi: b.posebna_postignuca_bodovi ?? "",
        });
      }
    } catch {
      showAlert("Greška pri učitavanju postojećih bodova.", "error");
    } finally {
      setBodoviLoading(false);
    }
  };

  const sacuvajBodove = async () => {
    try {
      const res = await api.post("/sluzba/bodovi", {
        student_id: bodoviStudent.id,
        ...bodoviForm,
      });
      if (res.data.success) {
        setBodoviModal(false);
        showAlert("Bodovi su uspješno sačuvani!");
      } else showAlert(res.data.message || "Greška.", "error");
    } catch {
      showAlert("Greška pri čuvanju bodova.", "error");
    }
  };

  const sacuvajPosebnaPostignuca = async () => {
    if (!posebnaForm.jedinstveni_id || posebnaForm.bodovi === "") {
      showAlert("Student ID i bodovi su obavezni.", "error");
      return;
    }
    setPosebnaLoading(true);
    try {
      const res = await api.post("/sluzba/posebna-postignuca", posebnaForm);
      if (res.data.success) {
        setPosebnaModal(false);
        setPosebnaForm({ jedinstveni_id: "", bodovi: "" });
        showAlert(res.data.message);
      } else showAlert(res.data.message || "Greška.", "error");
    } catch (err) {
      showAlert(err.response?.data?.message || "Greška pri unosu.", "error");
    } finally {
      setPosebnaLoading(false);
    }
  };

  const promijeniStatus = async (zahtjevId, noviStatus) => {
    try {
      const res = await api.put(`/sluzba/cv-zahtjev/${zahtjevId}`, { status: noviStatus });
      if (res.data.success) {
        setZahtjevi((prev) => prev.map((z) => (z.id === zahtjevId ? { ...z, status: noviStatus } : z)));
        showAlert("Status zahtjeva je ažuriran.");
      } else showAlert(res.data.message || "Greška.", "error");
    } catch (err) {
      const poruka = err.response?.data?.message;
      const brojNepolozenih = err.response?.data?.nepolozeni_predmeti;
      if (poruka === "STUDENT NIJE POLOŽIO SVE ISPITE") {
        showAlert(
          `⚠️ STUDENT NIJE POLOŽIO SVE ISPITE${brojNepolozenih ? ` — još ${brojNepolozenih} ${brojNepolozenih === 1 ? "ispit" : "ispita"} mu nedostaje` : ""}. Zahtjev ne može biti odobren.`,
          "error"
        );
      } else {
        showAlert(poruka || "Greška pri ažuriranju statusa.", "error");
      }
    }
  };

  // ─── Preuzimanje PDF-a odobrenog digitalnog CV-a ────────────────────────────
  const preuzmiPdf = async (zahtjevId, studentIme) => {
    try {
      const res = await api.get(`/sluzba/zahtjev/${zahtjevId}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Digitalni_CV_${studentIme.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showAlert("Greška pri preuzimanju PDF dokumenta.", "error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/sluzba/settings/password", passwordForm);
      if (res.data.success) {
        showAlert("Lozinka je uspješno promijenjena.");
        setPasswordForm({ staraLozinka: "", novaLozinka: "", potvrdaLozinke: "" });
      } else showAlert(res.data.message || "Greška.", "error");
    } catch (err) {
      showAlert(err.response?.data?.message || "Greška pri promjeni lozinke.", "error");
    }
  };

  const uploadBodovi = async () => {
    if (!uploadFile) { showAlert("Odaberite Excel fajl.", "error"); return; }
    setUploadLoading(true);
    setUploadRezultat(null);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await api.post("/sluzba/upload-bodovi", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setUploadFile(null);
        setUploadRezultat(res.data);
        showAlert(res.data.message);
      } else showAlert(res.data.message || "Greška.", "error");
    } catch (err) {
      showAlert(err.response?.data?.message || "Greška pri uploadu.", "error");
    } finally {
      setUploadLoading(false);
    }
  };

  const uploadOcjene = async () => {
    if (!ocjeneForm.predmet_id) { showAlert("Odaberite predmet.", "error"); return; }
    if (!ocjeneForm.tip_boda) { showAlert("Odaberite tip bodova.", "error"); return; }
    if (!ocjeneFile) { showAlert("Odaberite Excel fajl.", "error"); return; }
    setOcjeneLoading(true);
    setOcjeneRezultat(null);
    try {
      const formData = new FormData();
      formData.append("file", ocjeneFile);
      formData.append("predmet_id", ocjeneForm.predmet_id);
      formData.append("tip_boda", ocjeneForm.tip_boda);
      formData.append("opis", ocjeneForm.opis);
      const res = await api.post("/sluzba/upload-ocjene", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setOcjeneFile(null);
        setOcjeneForm({ predmet_id: "", tip_boda: "prisustvo", opis: "" });
        setOcjeneRezultat(res.data);
        setRezultatiLoaded(false); // forsiraj ponovno učitavanje liste
        showAlert(res.data.message);
      } else showAlert(res.data.message || "Greška.", "error");
    } catch (err) {
      showAlert(err.response?.data?.message || "Greška pri uploadu.", "error");
    } finally {
      setOcjeneLoading(false);
    }
  };

  const st = data?.statistika;
  const userName  = data?.user?.naziv_fakulteta || "Studentska služba";
  const userEmail = data?.user?.email || "";
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

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-[10px] rounded-xl text-[13.5px] font-medium mb-1 transition-all text-left
                ${tab === id ? "text-white shadow-sm" : "text-[#7C5C3A] hover:bg-[#E8DDD0]"}`}
              style={tab === id ? { background: "#A0784A" } : {}}
            >
              <Icon /> {label}
            </button>
          ))}
        </nav>

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

      <div className="ml-[240px] flex-1 flex flex-col min-h-screen">

        <header className="h-[64px] flex items-center justify-between px-8 sticky top-0 z-30 border-b border-[#DDD0BE]" style={{ background: "#F2EBE1" }}>
          <div />
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#8B7355]">Studentska služba</span>
            <span className="text-xs text-[#8B7355] bg-[#F5EFE7] border border-[#DDD0BE] px-4 py-1.5 rounded-full">{today}</span>

            <UserDropdown
              inicijali={userName[0]?.toUpperCase()}
              naziv={userName}
              podnaslov={userEmail}
              logoutUrl="/auth/logout"
              polja={[
                { labela: "Naziv fakulteta", vrijednost: userName },
                { labela: "Email",           vrijednost: userEmail },
                { labela: "Uloga",           vrijednost: "Studentska služba" },
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
                    <h1 className="text-[22px] font-bold text-[#2C1A0E]">Zdravo, {userName}! 👋</h1>
                    <p className="text-[14px] text-[#8B7355] mt-1">Pregled rada studentske službe · {today}</p>
                  </div>

                  {loading ? <Spinner /> : (
                    <div className="grid grid-cols-3 gap-5 mb-8">
                      <StatCard title="Studenata" value={st?.studenti} sub="na vašem fakultetu" icon={<IcoUsers />} />
                      <StatCard title="Predmeta" value={st?.predmeti} sub="u sistemu" icon={<IcoFile />} />
                      <StatCard title="CV zahtjeva" value={st?.zahtjevi} sub="ukupno primljenih" icon={<IcoFile />} />
                    </div>
                  )}
                </>
              )}

              {tab === "studenti" && (
                <Section title="Studenti vašeg fakulteta" count={`${filtriraniStudenti.length} / ${studenti.length} studenata`}>
                  {!studentiLoaded ? <Spinner /> : (
                    <div className="p-4">
                      {/* Brza pretraga */}
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className="relative flex-1 min-w-[220px]">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A89682]">
                            <IcoSearch />
                          </div>
                          <input
                            type="text"
                            value={brzaPretraga}
                            onChange={(e) => setBrzaPretraga(e.target.value)}
                            placeholder="Brza pretraga — ime, prezime, email ili ID..."
                            className="w-full pl-9 pr-4 py-2.5 border border-[#DDD0BE] rounded-xl text-sm outline-none focus:border-[#A0784A] bg-[#FAF7F3]"
                          />
                        </div>
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

                      {/* Napredni filteri */}
                      {naprednoOtvoreno && (
                        <div className="bg-[#FAF7F3] border border-[#EDE5DA] rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-[#8B7355] mb-1">Ime</label>
                            <input
                              type="text"
                              value={filterIme}
                              onChange={(e) => setFilterIme(e.target.value)}
                              placeholder="npr. Marko"
                              className="w-full px-3 py-2 border border-[#DDD0BE] rounded-lg text-[12.5px] outline-none focus:border-[#A0784A]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#8B7355] mb-1">Prezime</label>
                            <input
                              type="text"
                              value={filterPrezime}
                              onChange={(e) => setFilterPrezime(e.target.value)}
                              placeholder="npr. Marković"
                              className="w-full px-3 py-2 border border-[#DDD0BE] rounded-lg text-[12.5px] outline-none focus:border-[#A0784A]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#8B7355] mb-1">Smjer</label>
                            <select
                              value={filterSmjer}
                              onChange={(e) => setFilterSmjer(e.target.value)}
                              className="w-full px-3 py-2 border border-[#DDD0BE] rounded-lg text-[12.5px] outline-none focus:border-[#A0784A] bg-white"
                            >
                              <option value="">Svi smjerovi</option>
                              {smjerOpcije.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#8B7355] mb-1">Prosjek od</label>
                            <input
                              type="number"
                              value={filterProsjekMin}
                              onChange={(e) => setFilterProsjekMin(e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-2 border border-[#DDD0BE] rounded-lg text-[12.5px] outline-none focus:border-[#A0784A]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#8B7355] mb-1">Prosjek do</label>
                            <input
                              type="number"
                              value={filterProsjekMax}
                              onChange={(e) => setFilterProsjekMax(e.target.value)}
                              placeholder="100"
                              className="w-full px-3 py-2 border border-[#DDD0BE] rounded-lg text-[12.5px] outline-none focus:border-[#A0784A]"
                            />
                          </div>
                          <div className="md:col-span-3 lg:col-span-5 flex justify-end">
                            <button
                              onClick={resetFiltere}
                              className="text-[12px] font-semibold text-[#A0784A] hover:underline"
                            >
                              Poništi filtere
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#F2EBE1] text-[12px] font-bold text-[#5C4033]">
                              <th className="px-6 py-3">Ime i prezime</th>
                              <th className="px-6 py-3">Jedinstveni ID</th>
                              <th className="px-6 py-3">Email</th>
                              <th className="px-6 py-3">Indeks</th>
                              <th className="px-6 py-3">Smjer</th>
                              <th className="px-6 py-3">Godina</th>
                              <th className="px-6 py-3">Prosjek</th>
                              <th className="px-6 py-3"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EDE5DA] text-[13px]">
                            {filtriraniStudenti.length === 0 ? (
                              <tr><td colSpan="8" className="px-6 py-8 text-center text-[#8B7355]">Nema studenata koji odgovaraju pretrazi/filterima.</td></tr>
                            ) : filtriraniStudenti.map((s) => (
                              <tr key={s.id} className="hover:bg-[#FAF7F3]">
                                <td className="px-6 py-3.5 font-semibold text-[#2C1A0E]">{s.ime} {s.prezime}</td>
                                <td className="px-6 py-3.5 text-[#8B7355]">{s.jedinstveni_id}</td>
                                <td className="px-6 py-3.5 text-[#8B7355]">{s.studentski_email}</td>
                                <td className="px-6 py-3.5 text-[#8B7355]">{s.broj_indeksa}</td>
                                <td className="px-6 py-3.5 text-[#8B7355]">{s.smjer}</td>
                                <td className="px-6 py-3.5 text-[#8B7355]">{s.godina_studija}</td>
                                <td className="px-6 py-3.5 font-bold text-[#A0784A]">{s.ukupno_bodova ?? "—"}</td>
                                <td className="px-6 py-3.5 text-right">
                                  <button
                                    onClick={() => otvoriBodoviModal(s)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg text-white hover:opacity-90 transition-colors"
                                    style={{ background: "#A0784A" }}
                                  >
                                    <IcoEdit /> Bodovi
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </Section>
              )}

              {/* ── PREDMETI ── */}
              {tab === "predmeti" && (
                <>
                  <Section title="Dodaj novi predmet">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">Naziv predmeta</label>
                        <input
                          type="text"
                          value={predmetForm.naziv}
                          onChange={(e) => setPredmetForm({ ...predmetForm, naziv: e.target.value })}
                          placeholder="npr. Programiranje 1"
                          className="w-full border border-[#DDD0BE] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A0784A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">Šifra (opciono)</label>
                        <input
                          type="text"
                          value={predmetForm.sifra_predmeta}
                          onChange={(e) => setPredmetForm({ ...predmetForm, sifra_predmeta: e.target.value })}
                          placeholder="npr. INF101"
                          className="w-full border border-[#DDD0BE] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A0784A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">Smjer (opciono)</label>
                        <input
                          type="text"
                          list="smjer-opcije-predmet"
                          value={predmetForm.smjer}
                          onChange={(e) => setPredmetForm({ ...predmetForm, smjer: e.target.value })}
                          placeholder="npr. Računarstvo (prazno = svi smjerovi)"
                          className="w-full border border-[#DDD0BE] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A0784A]"
                        />
                        <datalist id="smjer-opcije-predmet">
                          {smjerOpcije.map((s) => <option key={s} value={s} />)}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">ECTS bodovi</label>
                        <input
                          type="number"
                          value={predmetForm.espb}
                          onChange={(e) => setPredmetForm({ ...predmetForm, espb: e.target.value })}
                          className="w-full border border-[#DDD0BE] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A0784A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">Godina studija</label>
                        <select
                          value={predmetForm.godina_studija}
                          onChange={(e) => setPredmetForm({ ...predmetForm, godina_studija: Number(e.target.value) })}
                          className="w-full border border-[#DDD0BE] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A0784A] bg-white"
                        >
                          {[1, 2, 3, 4].map((g) => <option key={g} value={g}>{g}. godina</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">Semestar</label>
                        <select
                          value={predmetForm.semestar}
                          onChange={(e) => setPredmetForm({ ...predmetForm, semestar: Number(e.target.value) })}
                          className="w-full border border-[#DDD0BE] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A0784A] bg-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}. semestar</option>)}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer mb-2.5">
                          <input
                            type="checkbox"
                            checked={predmetForm.obavezan}
                            onChange={(e) => setPredmetForm({ ...predmetForm, obavezan: e.target.checked })}
                          />
                          <span className="text-[13px] text-[#5C4033] font-semibold">Redovan (obavezan) predmet</span>
                        </label>
                      </div>
                      <div className="lg:col-span-3">
                        <button
                          onClick={dodajPredmet}
                          disabled={predmetSaving}
                          className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white disabled:opacity-50"
                          style={{ background: "#A0784A" }}
                        >
                          {predmetSaving ? "Čuvam..." : "Dodaj predmet"}
                        </button>
                      </div>
                    </div>
                  </Section>

                  <Section title="Svi predmeti" count={`${filtriraniPredmeti.length} / ${predmeti.length} predmeta`}>
                    {!predmetiLoaded ? <Spinner /> : (
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <label className="text-[12px] font-bold text-[#8B7355]">Filter po smjeru:</label>
                          <select
                            value={filterSmjerPredmeti}
                            onChange={(e) => setFilterSmjerPredmeti(e.target.value)}
                            className="px-3 py-2 border border-[#DDD0BE] rounded-lg text-[12.5px] outline-none focus:border-[#A0784A] bg-white min-w-[200px]"
                          >
                            <option value="">Svi smjerovi</option>
                            {smjerOpcije.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {filterSmjerPredmeti && (
                            <button onClick={() => setFilterSmjerPredmeti("")} className="text-[12px] font-semibold text-[#A0784A] hover:underline">
                              Poništi
                            </button>
                          )}
                        </div>
                        <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#F2EBE1] text-[12px] font-bold text-[#5C4033]">
                              <th className="px-6 py-3">Naziv</th>
                              <th className="px-6 py-3">Smjer</th>
                              <th className="px-6 py-3">Šifra</th>
                              <th className="px-6 py-3">Godina</th>
                              <th className="px-6 py-3">Semestar</th>
                              <th className="px-6 py-3">ECTS</th>
                              <th className="px-6 py-3">Tip</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EDE5DA] text-[13px]">
                            {filtriraniPredmeti.length === 0 ? (
                              <tr><td colSpan="7" className="px-6 py-8 text-center text-[#8B7355]">Nema predmeta koji odgovaraju filteru.</td></tr>
                            ) : filtriraniPredmeti.map((p) => (
                              <tr key={p.id} className="hover:bg-[#FAF7F3]">
                                <td className="px-6 py-3.5 font-semibold text-[#2C1A0E]">{p.naziv}</td>
                                <td className="px-6 py-3.5 text-[#8B7355]">{p.smjer || "Svi smjerovi"}</td>
                                <td className="px-6 py-3.5 text-[#8B7355]">{p.sifra_predmeta || "—"}</td>
                                <td className="px-6 py-3.5 text-[#8B7355]">{p.godina_studija}. godina</td>
                                <td className="px-6 py-3.5 text-[#8B7355]">{p.semestar}.</td>
                                <td className="px-6 py-3.5 text-[#8B7355]">{p.espb}</td>
                                <td className="px-6 py-3.5">
                                  <span
                                    className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                                    style={{ background: p.obavezan ? "#E8F5E9" : "#F5EFE7", color: p.obavezan ? "#2E7D32" : "#8B7355" }}
                                  >
                                    {p.obavezan ? "Redovan" : "Izborni"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </div>
                      </div>
                    )}
                  </Section>
                </>
              )}


              {tab === "cv" && (
                <Section title="Zahtjevi za štampanje CV-a" count={`${zahtjevi.length} zahtjeva`}>
                  {!zahtjeviLoaded ? <Spinner /> : (
                    <div className="divide-y divide-[#F0E8DC]">
                      {zahtjevi.length === 0 ? (
                        <div className="p-6 text-center text-[#8B7355] text-sm">Nema pristiglih zahtjeva.</div>
                      ) : zahtjevi.map((z) => {
                        const info = statusInfo(z.status);
                        return (
                          <div key={z.id} className="flex items-center justify-between px-6 py-4 gap-4 flex-wrap">
                            <div>
                              <p className="text-[13.5px] font-semibold text-[#2C1A0E]">{z.ime} {z.prezime}</p>
                              <p className="text-[11.5px] text-[#8B7355] mt-0.5">
                                {z.jedinstveni_id} · {formatirajDatum(z.datum_zahtjeva)}
                              </p>
                              {z.poruka && <p className="text-[12px] text-[#5C4033] mt-1 italic">"{z.poruka}"</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[11px] font-bold px-3 py-1 rounded-full"
                                style={{ background: info.bg, color: info.color }}
                              >
                                {info.label}
                              </span>
                              <select
                                value={z.status}
                                onChange={(e) => promijeniStatus(z.id, e.target.value)}
                                className="text-[12px] border border-[#DDD0BE] rounded-lg px-2 py-1.5 outline-none focus:border-[#A0784A] bg-white text-[#2C1A0E]"
                              >
                                {STATUS_OPCIJE.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              {z.status === "zavrseno" && (
                                <button
                                  onClick={() => preuzmiPdf(z.id, `${z.ime} ${z.prezime}`)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg text-white hover:opacity-90 transition-colors"
                                  style={{ background: "#A0784A" }}
                                  title="Preuzmi zvanični PDF dokument"
                                >
                                  <IcoDownload /> Preuzmi PDF
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Section>
              )}

              {tab === "bodovi" && (
                <>
                <Section title="Unos bodova po predmetu (sa automatskim ocjenjivanjem)">
                    <div className="px-6 py-8">
                      <p className="text-[13px] text-[#8B7355] mb-2">
                        Ocjena se računa automatski iz UKUPNOG broja bodova predmeta: <strong>F &lt;50</strong>, <strong>E 50-59</strong>, <strong>D 60-69</strong>, <strong>C 70-79</strong>, <strong>B 80-89</strong>, <strong>A 90-100</strong>.
                      </p>
                      <p className="text-[13px] text-[#8B7355] mb-6">
                        <strong>Prisustvo</strong> i <strong>Test</strong> se sabiraju. Za <strong>Kolokvijum</strong> i <strong>Završni</strong> ispit računaju se bodovi sa <strong>posljednje rađene provjere</strong> (ako postoji popravni, koristi se popravni umjesto redovnog — ne sabiraju se).
                        Excel fajl mora imati kolone: <strong>jedinstveni_id</strong>, <strong>bodovi</strong>
                      </p>

                      {predmeti.length === 0 ? (
                        <div className="p-4 mb-5 rounded-xl bg-[#FFF6E0] border border-[#F0E0B0] text-[13px] text-[#8B7355] max-w-2xl">
                          Nemate unesenih predmeta. Prvo dodajte predmet u tabu "Predmeti", pa se vratite ovdje.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 max-w-2xl">
                          <div>
                            <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">Predmet</label>
                            <select
                              value={ocjeneForm.predmet_id}
                              onChange={(e) => setOcjeneForm({ ...ocjeneForm, predmet_id: e.target.value })}
                              className="w-full border border-[#DDD0BE] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A0784A] bg-white text-[#2C1A0E]"
                            >
                              <option value="">— Izaberi predmet —</option>
                              {predmeti.map((p) => (
                                <option key={p.id} value={p.id}>{p.naziv} ({p.godina_studija}. godina, {p.semestar}. sem.)</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">Tip bodova</label>
                            <select
                              value={ocjeneForm.tip_boda}
                              onChange={(e) => setOcjeneForm({ ...ocjeneForm, tip_boda: e.target.value })}
                              className="w-full border border-[#DDD0BE] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A0784A] bg-white text-[#2C1A0E]"
                            >
                              <option value="prisustvo">Prisustvo</option>
                              <option value="test">Test</option>
                              <option value="kolokvijum_redovni">Kolokvijum — redovni</option>
                              <option value="kolokvijum_popravni">Kolokvijum — popravni</option>
                              <option value="zavrsni_redovni">Završni — redovni</option>
                              <option value="zavrsni_popravni">Završni — popravni</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="mb-5 max-w-2xl">
                        <label className="block text-[12px] font-bold text-[#5C4033] mb-1.5">Opis (opciono)</label>
                        <textarea
                          value={ocjeneForm.opis}
                          onChange={(e) => setOcjeneForm({ ...ocjeneForm, opis: e.target.value })}
                          placeholder="Kratka napomena..."
                          rows={2}
                          className="w-full border border-[#DDD0BE] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#A0784A]"
                        />
                      </div>

                      <div className="border-2 border-dashed border-[#DDD0BE] rounded-xl p-8 text-center mb-6 hover:border-[#A0784A] transition-colors max-w-2xl">
                        <IcoUpload />
                        <p className="text-[13px] text-[#8B7355] mt-3 mb-4">Odaberite Excel fajl (.xlsx)</p>
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => setOcjeneFile(e.target.files[0])}
                          className="hidden"
                          id="excel-upload-ocjene"
                        />
                        <label
                          htmlFor="excel-upload-ocjene"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer text-white hover:opacity-90 transition-colors"
                          style={{ background: "#A0784A" }}
                        >
                          Odaberi fajl
                        </label>
                        {ocjeneFile && (
                          <p className="text-[12px] text-[#6B4C2A] mt-3 font-semibold">{ocjeneFile.name}</p>
                        )}
                      </div>

                      <button
                        onClick={uploadOcjene}
                        disabled={!ocjeneFile || !ocjeneForm.predmet_id || ocjeneLoading}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: "#A0784A" }}
                      >
                        {ocjeneLoading ? "Obrađivanje..." : "Uploaduj i obradi"}
                      </button>

                      {ocjeneRezultat && (
                        <div className="mt-6 p-4 rounded-xl bg-[#F5EFE7] border border-[#DDD0BE] max-w-2xl">
                          <p className="text-[13px] font-semibold text-[#2C1A0E] mb-2">{ocjeneRezultat.message}</p>
                          {ocjeneRezultat.greske?.length > 0 && (
                            <ul className="text-[12px] text-[#C62828] list-disc pl-5 space-y-1">
                              {ocjeneRezultat.greske.map((g, i) => <li key={i}>{g}</li>)}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </Section>

                  <Section title="Posebna postignuća (pojedinačno)">
                    <div className="px-6 py-8">
                      <p className="text-[13px] text-[#8B7355] mb-5">
                        Za sertifikate, nagrade, takmičenja i ostala posebna postignuća — bodovi se <strong>dodaju</strong> na postojeći zbir (ne zamjenjuju ga), i ostale kategorije bodova ostaju netaknute.
                      </p>
                      <button
                        onClick={() => setPosebnaModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition-colors"
                        style={{ background: "#A0784A" }}
                      >
                        <IcoPlus /> UNESI
                      </button>
                    </div>
                  </Section>
                </>
              )}

              {tab === "settings" && (
                <div>
                  <div className="mb-7">
                    <h1 className="text-[22px] font-bold text-[#2C1A0E]">Podešavanja naloga</h1>
                    <p className="text-[14px] text-[#8B7355] mt-1">Promjena lozinke za nalog studentske službe.</p>
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

      <Modal
        open={bodoviModal}
        onClose={() => setBodoviModal(false)}
        title={`Bodovi — ${bodoviStudent?.ime || ""} ${bodoviStudent?.prezime || ""}`}
        subtitle="Unesite ili izmijenite bodove studenta po kategorijama"
      >
        {bodoviLoading ? <Spinner /> : (
          <>
            <FormInput
              label="Akademski bodovi (40%)"
              type="number"
              placeholder="0"
              value={bodoviForm.akademski_bodovi}
              onChange={(e) => setBodoviForm({ ...bodoviForm, akademski_bodovi: e.target.value })}
            />
            <FormInput
              label="Vannastavne aktivnosti (25%)"
              type="number"
              placeholder="0"
              value={bodoviForm.vannastavne_aktivnosti_bodovi}
              onChange={(e) => setBodoviForm({ ...bodoviForm, vannastavne_aktivnosti_bodovi: e.target.value })}
            />
            <FormInput
              label="Društveni doprinos (20%)"
              type="number"
              placeholder="0"
              value={bodoviForm.drustveni_doprinos_bodovi}
              onChange={(e) => setBodoviForm({ ...bodoviForm, drustveni_doprinos_bodovi: e.target.value })}
            />
            <FormInput
              label="Posebna postignuća (15%)"
              type="number"
              placeholder="0"
              value={bodoviForm.posebna_postignuca_bodovi}
              onChange={(e) => setBodoviForm({ ...bodoviForm, posebna_postignuca_bodovi: e.target.value })}
            />
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setBodoviModal(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#F5EFE7] text-[#8B7355] border border-[#DDD0BE] hover:bg-[#EDE3D6] transition-colors">Otkaži</button>
              <button onClick={sacuvajBodove} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition-colors" style={{ background: "#A0784A" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                Sačuvaj
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={posebnaModal}
        onClose={() => setPosebnaModal(false)}
        title="Posebna postignuća"
        subtitle="Unesite jedinstveni ID studenta i broj bodova — dodaju se na postojeći zbir"
      >
        <FormInput
          label="Jedinstveni ID studenta"
          required
          placeholder="npr. PMF001"
          value={posebnaForm.jedinstveni_id}
          onChange={(e) => setPosebnaForm({ ...posebnaForm, jedinstveni_id: e.target.value })}
        />
        <FormInput
          label="Bodovi (posebna postignuća)"
          required
          type="number"
          placeholder="npr. 10"
          value={posebnaForm.bodovi}
          onChange={(e) => setPosebnaForm({ ...posebnaForm, bodovi: e.target.value })}
        />
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setPosebnaModal(false)} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#F5EFE7] text-[#8B7355] border border-[#DDD0BE] hover:bg-[#EDE3D6] transition-colors">Otkaži</button>
          <button
            onClick={sacuvajPosebnaPostignuca}
            disabled={posebnaLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition-colors disabled:opacity-50"
            style={{ background: "#A0784A" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            {posebnaLoading ? "Unosim..." : "Sačuvaj"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SluzbaDashboard;