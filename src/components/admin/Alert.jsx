import { useEffect } from "react";

const Alert = ({ message, type, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-6 border ${
      isSuccess ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"
    }`}>
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d={isSuccess ? "M5 13l4 4L19 7" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
      </svg>
      {message}
    </div>
  );
};

export default Alert;