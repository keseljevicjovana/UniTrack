import { useState, useEffect, useCallback } from "react";
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

const NAV = [
  { id: "pregled",  label: "Početna",            Icon: IcoHome },
  { id: "studenti", label: "Studenti",           Icon: IcoUsers },
  { id: "cv",       label: "CV zahtjevi",        Icon: IcoFile },
  { id: "upload",   label: "Unos bodova (Excel)",Icon: IcoUpload },
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

  useEffect(() => {
    if (tab === "studenti" && !studentiLoaded) fetchStudenti();
    if (tab === "cv" && !zahtjeviLoaded) fetchZahtjevi();
  }, [tab, studentiLoaded, zahtjeviLoaded, fetchStudenti, fetchZahtjevi]);

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

  const promijeniStatus = async (zahtjevId, noviStatus) => {
    try {
      const res = await api.put(`/sluzba/cv-zahtjev/${zahtjevId}`, { status: noviStatus });
      if (res.data.success) {
        setZahtjevi((prev) => prev.map((z) => (z.id === zahtjevId ? { ...z, status: noviStatus } : z)));
        showAlert("Status zahtjeva je ažuriran.");
      } else showAlert(res.data.message || "Greška.", "error");
    } catch {
      showAlert("Greška pri ažuriranju statusa.", "error");
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
            <button className="text-[#8B7355] hover:text-[#5C4033] transition-colors">
              <IcoBell />
            </button>

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
                <Section title="Studenti vašeg fakulteta" count={`${studenti.length} studenata`}>
                  {!studentiLoaded ? <Spinner /> : (
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
                            <th className="px-6 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EDE5DA] text-[13px]">
                          {studenti.length === 0 ? (
                            <tr><td colSpan="7" className="px-6 py-8 text-center text-[#8B7355]">Nema unesenih studenata.</td></tr>
                          ) : studenti.map((s) => (
                            <tr key={s.id} className="hover:bg-[#FAF7F3]">
                              <td className="px-6 py-3.5 font-semibold text-[#2C1A0E]">{s.ime} {s.prezime}</td>
                              <td className="px-6 py-3.5 text-[#8B7355]">{s.jedinstveni_id}</td>
                              <td className="px-6 py-3.5 text-[#8B7355]">{s.studentski_email}</td>
                              <td className="px-6 py-3.5 text-[#8B7355]">{s.broj_indeksa}</td>
                              <td className="px-6 py-3.5 text-[#8B7355]">{s.smjer}</td>
                              <td className="px-6 py-3.5 text-[#8B7355]">{s.godina_studija}</td>
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
                  )}
                </Section>
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Section>
              )}

              {tab === "upload" && (
                <Section title="Unos bodova putem Excel fajla">
                  <div className="px-6 py-8">
                    <p className="text-[13px] text-[#8B7355] mb-6">
                      Excel fajl mora imati kolone: <strong>jedinstveni_id</strong>, <strong>akademski_bodovi</strong>, <strong>vannastavne_aktivnosti_bodovi</strong>, <strong>drustveni_doprinos_bodovi</strong>, <strong>posebna_postignuca_bodovi</strong>
                    </p>
                    <div className="border-2 border-dashed border-[#DDD0BE] rounded-xl p-8 text-center mb-6 hover:border-[#A0784A] transition-colors">
                      <IcoUpload />
                      <p className="text-[13px] text-[#8B7355] mt-3 mb-4">Odaberite Excel fajl (.xlsx)</p>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setUploadFile(e.target.files[0])}
                        className="hidden"
                        id="excel-upload-bodovi"
                      />
                      <label
                        htmlFor="excel-upload-bodovi"
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
                      onClick={uploadBodovi}
                      disabled={!uploadFile || uploadLoading}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: "#A0784A" }}
                    >
                      {uploadLoading ? "Obrađivanje..." : "Uploaduj i obradi"}
                    </button>

                    {uploadRezultat && (
                      <div className="mt-6 p-4 rounded-xl bg-[#F5EFE7] border border-[#DDD0BE]">
                        <p className="text-[13px] font-semibold text-[#2C1A0E] mb-2">{uploadRezultat.message}</p>
                        {uploadRezultat.greske?.length > 0 && (
                          <ul className="text-[12px] text-[#C62828] list-disc pl-5 space-y-1">
                            {uploadRezultat.greske.map((g, i) => <li key={i}>{g}</li>)}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </Section>
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
    </div>
  );
};

export default SluzbaDashboard;