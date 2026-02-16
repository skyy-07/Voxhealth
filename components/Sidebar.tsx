import React from 'react';
import { motion } from 'framer-motion';
import { History, Calendar, Trash2 } from 'lucide-react';
import { ScanResult } from '../types';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

interface HistoryModuleProps {
  history: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
  onDeleteScan: (scanId: string) => void;
  className?: string;
  isDimmed?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 }
};

const HistoryModule: React.FC<HistoryModuleProps> = ({ history, onSelectScan, onDeleteScan, className, isDimmed }) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      className={clsx(
        "bento-card rounded-3xl p-6 flex flex-col h-full overflow-hidden transition-opacity duration-500",
        className,
        isDimmed && "opacity-30 blur-[2px] pointer-events-none"
      )}
      whileHover={{ y: -5, borderColor: "rgba(45, 212, 191, 0.3)" }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
          <History className="w-5 h-5 text-teal-600 dark:text-neon-teal" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white tracking-wide">{t('history_title')}</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
            <Calendar className="w-8 h-8 opacity-50" />
            <p className="text-sm">{t('history_empty')}</p>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {history.map((scan) => {
              // Safety check: Skip rendering if critical data is missing
              if (!scan?.data?.frontend_state || !scan?.data?.clinical_inference) return null;

              const urgency = scan.data.frontend_state.urgency || 'Low';
              const summary = scan.data.frontend_state.history_card_summary || 'Scan Result';
              const suspect = scan.data.clinical_inference.primary_suspect || 'Unknown';
              const score = scan.data.clinical_inference.confidence_metrics?.aggregate_score || 0;
              
              return (
                <motion.div 
                  key={scan.id}
                  variants={item}
                  onClick={() => onSelectScan(scan)}
                  className="group p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:border-teal-500/30 dark:hover:border-neon-teal/30 cursor-pointer transition-all shadow-sm relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                      {new Date(scan.date).toLocaleDateString()}
                    </span>
                    
                    <div className="flex items-center gap-2">
                        {urgency === 'High' && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        )}
                        
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteScan(scan.id);
                            }}
                            className="p-1.5 -mt-1.5 -mr-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100 opacity-100"
                            title={t('confirm_delete') || "Delete"}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium text-sm line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-neon-teal transition-colors pr-6">
                    {summary}
                  </p>
                  
                  <div className="mt-2 text-xs text-slate-500 flex justify-between items-center">
                    <span>
                      {t('history_finding')} <span className={clsx(
                        "font-semibold",
                        urgency === 'High' ? "text-red-500 dark:text-red-400" : 
                        urgency === 'Medium' ? "text-amber-500 dark:text-amber-400" : "text-teal-600 dark:text-teal-400"
                      )}>{suspect}</span>
                    </span>
                    <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                      {(score * 100).toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default HistoryModule;