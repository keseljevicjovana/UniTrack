import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import api from "../api/api";

function ResetPassword() {
  const [formData, setFormData] = useState({
    email: '',
    novaLozinka: '',
    potvrdaLozinke: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    api
      .post('/reset/reset-password', formData)
      .then((res) => {
        setMessage({ type: 'success', text: res.data.message });
        setFormData({ email: '', novaLozinka: '', potvrdaLozinke: '' });
      })
      .catch((err) => {
        setMessage({
          type: 'error',
          text: err.response?.data?.message || 'Greška na serveru',
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-uni-beige font-sans p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="bg-uni-brown p-12 text-center relative overflow-hidden">
          <h1 className="text-3xl font-bold text-uni-beige tracking-tight relative z-10">
            Resetuj lozinku
          </h1>
          <p className="text-uni-gold text-sm mt-2 font-medium tracking-wide uppercase relative z-10">
            UniTrack
          </p>
        </div>

        <div className="p-8 md:p-10">
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-uni-brown mb-2 ml-1">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400 group-focus-within:text-uni-brown transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:border-uni-brown focus:ring-0 outline-none transition-all text-uni-brown bg-gray-50/50"
                  placeholder="vas.email@primjer.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-uni-brown mb-2 ml-1">
                Nova lozinka
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400 group-focus-within:text-uni-brown transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="novaLozinka"
                  required
                  minLength={6}
                  className="block w-full pl-11 pr-12 py-3.5 border-2 border-gray-100 rounded-xl focus:border-uni-brown focus:ring-0 outline-none transition-all text-uni-brown bg-gray-50/50"
                  placeholder="••••••••"
                  value={formData.novaLozinka}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-uni-brown"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-uni-brown mb-2 ml-1">
                Potvrdi lozinku
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400 group-focus-within:text-uni-brown transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="potvrdaLozinke"
                  required
                  minLength={6}
                  className="block w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:border-uni-brown focus:ring-0 outline-none transition-all text-uni-brown bg-gray-50/50"
                  placeholder="••••••••"
                  value={formData.potvrdaLozinke}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-lg h-14 rounded-xl shadow-xl hover:shadow-2xl disabled:opacity-60"
            >
              {loading ? 'Šaljem...' : 'Promijeni lozinku'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <a
              href="/"
              className="inline-flex items-center text-uni-brown font-bold hover:tracking-wider transition-all"
            >
              <ArrowLeft size={16} className="mr-2" /> Nazad na prijavu
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;