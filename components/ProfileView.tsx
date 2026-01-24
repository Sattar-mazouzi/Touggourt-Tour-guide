
import React, { useState } from 'react';
import { X, User, Mail, Calendar, LogOut, Edit3, Check, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../i18n';
import { Language } from '../types';

interface Props {
  lang: Language;
  onClose: () => void;
}

const ProfileView: React.FC<Props> = ({ lang, onClose }) => {
  const { profile, updateProfileInfo, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.fullName || '');
  const [age, setAge] = useState(profile?.age || 0);
  const [loading, setLoading] = useState(false);
  const t = translations;

  if (!profile) return null;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateProfileInfo({ fullName: name, age });
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const initials = profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="fixed inset-0 z-[1500] bg-white flex flex-col h-[100dvh] overflow-hidden animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-slate-100 p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] flex items-center justify-between">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-xl font-black text-slate-900">{t.profile[lang]}</h2>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-6 max-w-xl mx-auto space-y-8">
          
          {/* User Hero */}
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-orange-100 rounded-[32px] flex items-center justify-center text-orange-600 text-3xl font-black mx-auto mb-4 shadow-xl shadow-orange-500/10 border-4 border-white">
              {initials}
            </div>
            <h3 className="text-2xl font-black text-slate-900">{profile.fullName}</h3>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">
              {profile.role || 'Visitor'}
            </p>
          </div>

          {/* Info Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2 px-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.personalInfo[lang]}</h4>
              <button 
                onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
                disabled={loading}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  isEditing ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isEditing ? <Check size={14} /> : <Edit3 size={14} />)}
                {isEditing ? t.saveChanges[lang] : t.editProfile[lang]}
              </button>
            </div>

            <div className="bg-slate-50 rounded-[32px] p-6 space-y-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                  <User size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t.fullName[lang]}</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 outline-none"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-black text-slate-900">{profile.fullName}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                  <Mail size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t.email[lang]}</p>
                  <p className="text-sm font-black text-slate-900 truncate">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                  <Calendar size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t.age[lang]}</p>
                  {isEditing ? (
                    <input 
                      type="number" 
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 outline-none"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                    />
                  ) : (
                    <p className="text-sm font-black text-slate-900">{profile.age || '—'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Card */}
          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl space-y-6">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Account Status</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-emerald-400" size={20} />
                <span className="text-sm font-bold">Role</span>
              </div>
              <span className="text-xs bg-white/10 px-3 py-1 rounded-full font-black uppercase tracking-tighter">{profile.role}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="text-blue-400" size={20} />
                <span className="text-sm font-bold">Member Since</span>
              </div>
              <span className="text-xs font-bold text-white/60">
                {new Date(profile.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : (lang === 'fr' ? 'fr-FR' : 'en-US'), { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="w-full py-5 bg-red-50 text-red-600 rounded-[28px] font-black text-base shadow-sm border border-red-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
          >
            <LogOut size={20} />
            {t.logout[lang]}
          </button>

        </div>
      </div>
      
      {/* Footer Safe Area */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </div>
  );
};

export default ProfileView;
