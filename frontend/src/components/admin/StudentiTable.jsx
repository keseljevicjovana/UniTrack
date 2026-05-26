const StudentiTable = ({ data }) => {
  if (!data?.length) {
    return <div className="py-16 text-center text-[#8B7355] text-sm">Nema studenata u sistemu.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#F5EFE7] border-b border-[#DDD0BE]">
            {["Student", "Jedinstveni ID", "Broj indeksa", "Fakultet", "Godina", "Smjer"].map((h) => (
              <th key={h} className="text-left text-[10px] font-semibold tracking-widest uppercase text-[#8B7355] px-5 py-3.5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((s) => (
            <tr key={s.id} className="border-b border-[#F0E8DC] hover:bg-[#FAF7F3] transition-colors">
              <td className="px-5 py-4">
                <div className="font-semibold text-sm text-[#2C1A0E]">{s.ime} {s.prezime}</div>
                <div className="text-xs text-[#8B7355] mt-0.5">{s.studentski_email}</div>
              </td>
              <td className="px-5 py-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F5EFE7] text-[#6B4C2A] border border-[#C4A882]">
                  {s.jedinstveni_id || "—"}
                </span>
              </td>
              <td className="px-5 py-4 text-sm text-[#2C1A0E]">{s.broj_indeksa || "—"}</td>
              <td className="px-5 py-4 text-sm text-[#2C1A0E]">{s.naziv_fakulteta || "—"}</td>
              <td className="px-5 py-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                  {s.godina_studija || "—"}. god.
                </span>
              </td>
              <td className="px-5 py-4 text-sm text-[#2C1A0E]">{s.smjer || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentiTable;