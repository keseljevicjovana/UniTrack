const FirmeTable = ({ data, onDelete }) => {
  if (!data?.length) {
    return <div className="py-16 text-center text-[#8B7355] text-sm">Nema firmi u sistemu.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#F5EFE7] border-b border-[#DDD0BE]">
            {["Naziv firme", "Email", "PIB", "Adresa", "Datum dodavanja", "Akcije"].map((h) => (
              <th key={h} className="text-left text-[10px] font-semibold tracking-widest uppercase text-[#8B7355] px-5 py-3.5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((f) => (
            <tr key={f.id} className="border-b border-[#F0E8DC] hover:bg-[#FAF7F3] transition-colors">
              <td className="px-5 py-4">
                <div className="font-semibold text-sm text-[#2C1A0E]">{f.naziv_firme}</div>
                {f.opis && <div className="text-xs text-[#8B7355] mt-0.5 max-w-[180px] truncate">{f.opis}</div>}
              </td>
              <td className="px-5 py-4 text-sm text-[#2C1A0E]">{f.email}</td>
              <td className="px-5 py-4 text-sm text-[#2C1A0E]">{f.pib || "—"}</td>
              <td className="px-5 py-4 text-sm text-[#2C1A0E]">{f.adresa || "—"}</td>
              <td className="px-5 py-4 text-xs text-[#8B7355]">
                {f.datum_kreiranja ? new Date(f.datum_kreiranja).toLocaleDateString("bs-BA") : "—"}
              </td>
              <td className="px-5 py-4">
                <button
                  onClick={() => onDelete(f)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Obriši
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FirmeTable;