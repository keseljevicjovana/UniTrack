import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Info } from 'lucide-react';

function App() {
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.id.toLowerCase().includes('admin')) {
      alert("Prijavljeni ste kao ADMIN. Preusmjeravam na Admin Dashboard...");
    } else {
      alert("Prijavljeni ste kao STUDENT. Preusmjeravam na Student Dashboard...");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-uni-beige font-sans p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="bg-uni-brown p-12 text-center relative overflow-hidden">
          
          {/* Glavni naslov  */}
          <h1 className="text-4xl font-bold text-uni-beige tracking-tight relative z-10">
            UniTrack
          </h1>
          <p className="text-uni-gold text-sm mt-2 font-medium tracking-wide uppercase relative z-10">
            Univerzitet Crne Gore
          </p>
        </div>

        {/* Forma */}
        <div className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-uni-brown mb-2 ml-1">
                ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400 group-focus-within:text-uni-brown transition-colors" />
                </div>
                <input
                  type="text"
                  name="id"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:border-uni-brown focus:ring-0 outline-none transition-all text-uni-brown bg-gray-50/50"
                  placeholder="Unesite vaš ID"
                  value={formData.id}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2 ml-1">
                <label className="text-sm font-bold text-uni-brown">Lozinka</label>
                <button type="button" className="text-xs font-bold text-gray-400 hover:text-uni-brown transition-colors">
                  Zaboravili ste lozinku?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400 group-focus-within:text-uni-brown transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="block w-full pl-11 pr-12 py-3.5 border-2 border-gray-100 rounded-xl focus:border-uni-brown focus:ring-0 outline-none transition-all text-uni-brown bg-gray-50/50"
                  placeholder="••••••••"
                  value={formData.password}
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

            <div className="flex items-center ml-1">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="checkbox checkbox-primary h-5 w-5"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe" className="ml-3 block text-sm font-medium text-gray-500 cursor-pointer select-none">
                Zapamti me
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full text-lg h-14 rounded-xl shadow-xl hover:shadow-2xl"
            >
              Prijavite se
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400 mb-3 flex items-center justify-center font-medium">
              <Info size={16} className="mr-2" /> Nemate kreiran nalog?
            </p>
            <a 
              href="#" 
              className="inline-block text-uni-brown font-black hover:tracking-wider transition-all border-b-2 border-uni-brown pb-0.5"
            >
              POSJETITE STUDENTSKU SLUŽBU
            </a>
          </div>
        </div>
      </div>
      
    
    </div>
  );
}

export default App;