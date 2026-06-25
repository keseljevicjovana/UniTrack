import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/api";

// ─── ZAŠTITA RUTE — provjerava da li je korisnik ulogovan i da ima pravu ulogu
// Koristi postojeću backend rutu GET /auth/me koja čita session cookie.
// Dok se provjera vrši, prikazuje spinner. Ako nije ulogovan ili je pogrešna
// uloga, redirektuje na login ("/") bez prikazivanja zaštićenog sadržaja.
const ProtectedRoute = ({ children, allowedRole }) => {
  const [status, setStatus] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    let otkazano = false;

    api
      .get("/auth/me")
      .then((res) => {
        if (otkazano) return;
        if (res.data.success && res.data.user.role === allowedRole) {
          setStatus("ok");
        } else {
          setStatus("denied");
        }
      })
      .catch(() => {
        if (!otkazano) setStatus("denied");
      });

    return () => { otkazano = true; };
  }, [allowedRole]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#EAE4DC" }}>
        <div className="w-8 h-8 border-2 border-[#DDD0BE] border-t-[#6B4C2A] rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;