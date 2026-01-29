
import React, { useState } from 'react';
import { X, Mail, Lock, User, Calendar, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../i18n';
import { Language } from '../types';

interface Props {
  lang: Language;
  onClose: () => void;
}

const AuthModal: React.FC<Props> = ({ lang, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(20);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUpEmail, loginEmail } = useAuth();
  const t = translations;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginEmail(email, password);
      } else {
        await signUpEmail(email, password, name, age);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="relative p-8">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-400">
            <X size={20} />
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-4">
              <Sparkles size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {mode === 'login' ? t.signIn[lang] : t.signUp[lang]}
            </h2>
            <p className="text-slate-500 text-sm mt-1">{t.discoverPrompt[lang]}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="text"
                    placeholder={t.fullName[lang]}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="number"
                    placeholder={t.age[lang]}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                  />
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                required
                type="email"
                placeholder={t.email[lang]}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                required
                type="password"
                placeholder={t.password[lang]}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn size={20} />}
              {mode === 'login' ? t.signIn[lang] : t.signUp[lang]}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="w-full mt-6 text-slate-400 text-sm font-bold"
          >
            {mode === 'login' ? t.signUp[lang] : t.signIn[lang]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
