const StatCard = ({ label, value, sub, icon }) => (
  <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-start justify-between mb-4">
      <span className="text-xs font-semibold tracking-widest uppercase text-[#8B7355]">{label}</span>
      <div className="w-10 h-10 rounded-xl bg-[#F5EFE7] flex items-center justify-center text-[#6B4C2A]">{icon}</div>
    </div>
    <div className="text-5xl font-bold text-[#6B4C2A] leading-none mb-2">{value ?? "—"}</div>
    <div className="text-xs text-[#8B7355] mt-1">{sub}</div>
  </div>
);

export default StatCard;