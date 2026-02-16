import React, { useState } from 'react';
import { UserProfile, LanguageCode } from '../types';
import { useTranslation } from 'react-i18next';

interface ProfileModalProps {
  user: UserProfile;
  onSave: (user: UserProfile) => void;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onSave, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<UserProfile>(user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl shadow-2xl animate-[fadeIn_0.3s_ease-out] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-teal-600 dark:text-neon-teal mb-6">{t('profile_header')}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">{t('profile_name')}</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:border-teal-500 dark:focus:border-neon-teal focus:outline-none transition-colors"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">{t('profile_age')}</label>
              <input 
                type="number" 
                required
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:border-teal-500 dark:focus:border-neon-teal focus:outline-none"
                value={formData.age}
                onChange={e => setFormData({...formData, age: Number(e.target.value)})}
              />
            </div>
            <div>
               <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">{t('profile_gender')}</label>
               <select 
                 className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:border-teal-500 dark:focus:border-neon-teal focus:outline-none"
                 value={formData.gender}
                 onChange={e => setFormData({...formData, gender: e.target.value})}
               >
                 <option value="Male">{t('male')}</option>
                 <option value="Female">{t('female')}</option>
                 <option value="Other">{t('other')}</option>
               </select>
            </div>
          </div>

          <div>
             <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">{t('profile_language')}</label>
             <select 
               className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:border-teal-500 dark:focus:border-neon-teal focus:outline-none"
               value={formData.language}
               onChange={e => setFormData({...formData, language: e.target.value as LanguageCode})}
             >
               <option value="en">English</option>
               <option value="hi">Hindi (हिंदी)</option>
               <option value="ta">Tamil (தமிழ்)</option>
               <option value="bn">Bengali (বাংলা)</option>
               <option value="mr">Marathi (मराठी)</option>
               <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
               <option value="gu">Gujarati (ગુજરાતી)</option>
             </select>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-800">
            <input 
              type="checkbox"
              id="smoking"
              className="w-5 h-5 text-teal-600 dark:text-neon-teal rounded focus:ring-teal-500 dark:focus:ring-neon-teal bg-white dark:bg-slate-800 border-slate-300 dark:border-gray-600"
              checked={formData.smokingHistory}
              onChange={e => setFormData({...formData, smokingHistory: e.target.checked})}
            />
            <label htmlFor="smoking" className="text-sm text-slate-700 dark:text-slate-300">{t('profile_smoking')}</label>
          </div>

          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">{t('profile_notes')}</label>
            <textarea 
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:border-teal-500 dark:focus:border-neon-teal focus:outline-none h-24 resize-none"
              placeholder="..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {t('btn_cancel')}
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-teal-50 dark:bg-neon-teal/10 text-teal-600 dark:text-neon-teal border border-teal-200 dark:border-neon-teal hover:bg-teal-100 dark:hover:bg-neon-teal/20 rounded-lg font-semibold transition-all shadow-[0_0_10px_rgba(45,212,191,0.2)]"
            >
              {t('btn_save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;