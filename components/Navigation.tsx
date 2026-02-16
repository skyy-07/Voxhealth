import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, User, Mic, History as HistoryIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onProfileClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, onProfileClick }) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'dashboard', icon: Mic, label: t('nav_scan') },
    { id: 'insights', icon: Brain, label: t('nav_insights') },
    { id: 'history', icon: HistoryIcon, label: t('nav_history'), className: 'xl:hidden' },
  ];

  return (
    <>
      {/* Desktop Navigation (Left Sidebar) */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-6"
      >
        <div className="bento-card p-3 rounded-2xl flex flex-col gap-4 items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 dark:from-neon-teal dark:to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(45,212,191,0.3)]">
            <Activity className="text-white w-5 h-5" />
          </div>

          {navItems.filter(item => !item.className).map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={clsx(
                "p-3 rounded-xl transition-all duration-300 group relative",
                activeTab === item.id 
                  ? "bg-slate-200 dark:bg-white/10 text-teal-600 dark:text-neon-teal shadow-[0_0_10px_rgba(45,212,191,0.1)]" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">
                {item.label}
              </span>
            </button>
          ))}

          <div className="w-full h-px bg-slate-300 dark:bg-white/10 my-2" />

          <button
            onClick={onProfileClick}
            className="p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300 group relative"
          >
            <User className="w-6 h-6" />
             <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">
                {t('nav_profile')}
              </span>
          </button>
        </div>
      </motion.div>

      {/* Mobile Navigation (Bottom Bar) */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="md:hidden fixed bottom-4 left-4 right-4 z-50"
      >
        <div className="bento-card p-2 rounded-2xl flex items-center justify-around shadow-2xl bg-white/90 dark:bg-[#020617]/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10">
          {navItems.map((item) => (
             <button
               key={item.id}
               onClick={() => onTabChange(item.id)}
               className={clsx(
                 "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[64px]",
                 activeTab === item.id ? "text-teal-600 dark:text-neon-teal" : "text-slate-500"
               )}
             >
               <div className={clsx(
                 "p-1.5 rounded-lg transition-all",
                 activeTab === item.id && "bg-teal-50 dark:bg-neon-teal/10"
               )}>
                 <item.icon className="w-5 h-5" />
               </div>
               <span className="text-[10px] font-medium">{item.label}</span>
             </button>
          ))}
           
           <button
             onClick={onProfileClick}
             className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[64px] text-slate-500"
           >
              <div className="p-1.5 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{t('nav_profile')}</span>
           </button>
        </div>
      </motion.div>
    </>
  );
};

export default Navigation;