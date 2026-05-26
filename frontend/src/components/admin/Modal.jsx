import { useEffect } from "react";

const Modal = ({ open, onClose, title, subtitle, children }) => {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[480px] max-w-[95vw] p-8">
        <h2 className="text-xl font-bold text-[#2C1A0E] mb-1">{title}</h2>
        {subtitle && <p className="text-sm text-[#8B7355] mb-6">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

export const ConfirmModal = ({ open, onClose, onConfirm, name }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[380px] max-w-[95vw] p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-[#2C1A0E] mb-2">Potvrdi brisanje</h3>
        <p className="text-sm text-[#8B7355] mb-6">
          Da li ste sigurni da želite obrisati <strong>"{name}"</strong>? Ova akcija se ne može poništiti.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#F5EFE7] text-[#8B7355] border border-[#DDD0BE] hover:bg-[#EDE3D6] transition-colors">
            Otkaži
          </button>
          <button onClick={onConfirm} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors">
            Obriši
          </button>
        </div>
      </div>
    </div>
  );
};

export const FormInput = ({ label, required, as, ...props }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold tracking-wider uppercase text-[#8B7355] mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {as === "textarea" ? (
      <textarea
        {...props}
        rows={3}
        className="w-full px-4 py-2.5 border border-[#DDD0BE] rounded-xl text-sm text-[#2C1A0E] bg-[#F5EFE7] focus:outline-none focus:border-[#6B4C2A] focus:bg-white transition-colors placeholder:text-[#C4A882] resize-none"
      />
    ) : (
      <input
        {...props}
        className="w-full px-4 py-2.5 border border-[#DDD0BE] rounded-xl text-sm text-[#2C1A0E] bg-[#F5EFE7] focus:outline-none focus:border-[#6B4C2A] focus:bg-white transition-colors placeholder:text-[#C4A882]"
      />
    )}
  </div>
);

export default Modal;