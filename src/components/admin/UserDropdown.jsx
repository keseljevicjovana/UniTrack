import { useState, useEffect, useRef } from "react";
import api from "../../api/api";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const IcoLogout = () => <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>;
const IcoX      = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>;

// ─── PROFIL POPUP — prikazuje stvarne podatke korisnika iz baze ──────────────
const ProfilPopup = ({ inicijali, naziv, podnaslov, polja, onClose }) => {
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
        <p className="text-[14px] font-bold text-[#2C1A0E]">{naziv}</p>
        {podnaslov && <p className="text-[11.5px] text-[#8B7355] mt-0.5">{podnaslov}</p>}
      </div>

      {/* Polja sa stvarnim podacima iz baze */}
      <div className="px-5 py-4 space-y-3">
        {polja.map(({ labela, vrijednost }) => (
          <div key={labela} className="flex justify-between items-start gap-2">
            <span className="text-[11.5px] text-[#8B7355] whitespace-nowrap">{labela}</span>
            <span className="text-[12px] font-semibold text-[#2C1A0E] text-right break-all">{vrijednost || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── AVATAR KRUG (otvara popup direktno) + POSEBNO DUGME ZA ODJAVU ───────────
//
// Props:
// - inicijali: slovo/a za avatar krug
// - naziv: ime za prikaz u popupu
// - podnaslov: dodatni tekst ispod imena u popupu (email)
// - polja: niz [{ labela, vrijednost }] — stvarni podaci iz baze
// - logoutUrl: backend ruta za odjavu
// - onLoggedOut: callback nakon odjave (default: redirect na "/")
const UserDropdown = ({ inicijali, naziv, podnaslov, polja, logoutUrl = "/auth/logout", onLoggedOut }) => {
  const [showProfil, setShowProfil] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post(logoutUrl);
    } catch (_) {
      // i ako backend ne odgovori, ipak odjavi korisnika na frontendu
    } finally {
      if (onLoggedOut) onLoggedOut();
      else window.location.href = "/";
    }
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* Avatar krug — klik DIREKTNO otvara lične podatke, bez međukoraka */}
      <div className="relative">
        <button
          onClick={() => setShowProfil((v) => !v)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold transition-opacity hover:opacity-85"
          style={{ background: "#A0784A" }}
          title="Lični podaci"
        >
          {inicijali}
        </button>

        {showProfil && (
          <ProfilPopup
            inicijali={inicijali}
            naziv={naziv}
            podnaslov={podnaslov}
            polja={polja}
            onClose={() => setShowProfil(false)}
          />
        )}
      </div>

      {/* Posebno, stalno vidljivo dugme za odjavu — tamno braon, uklapa se sa stilom */}
      <button
        onClick={handleLogout}
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

export default UserDropdown;