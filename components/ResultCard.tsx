import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanResult } from '../types';
import { Activity, AlertCircle, Wifi, Mic, Zap, Wind, Brain, MessageSquare, AlertTriangle, CheckCircle2, XCircle, Thermometer } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

interface InsightModuleProps {
  result: ScanResult | null;
  isLoading: boolean;
  className?: string;
  isDimmed?: boolean;
}

const InsightModule: React.FC<InsightModuleProps> = ({ result, isLoading, className, isDimmed }) => {
  const { t } = useTranslation();
  
  const getUrgencyStyles = (urgency?: string) => {
    switch (urgency) {
      case 'High': return {
        badge: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/50',
        gradient: 'from-red-500/10 to-orange-500/10 dark:from-red-900/40 dark:to-orange-900/20',
        icon: AlertTriangle
      };
      case 'Medium': return {
        badge: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50',
        gradient: 'from-amber-500/10 to-yellow-500/10 dark:from-amber-900/40 dark:to-yellow-900/20',
        icon: Activity
      };
      default: return {
        badge: 'bg-teal-500/20 text-teal-600 dark:text-neon-teal border-teal-500/50',
        gradient: 'from-teal-500/10 to-blue-500/10 dark:from-teal-900/40 dark:to-blue-900/20',
        icon: CheckCircle2
      };
    }
  };

  const urgencyStyles = getUrgencyStyles(result?.data?.frontend_state?.urgency);
  const UrgencyIcon = urgencyStyles.icon;

  const MetricCard = ({ label, value, icon: Icon, delay }: { label: string, value: string, icon: any, delay: number }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="relative overflow-hidden p-3 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 hover:border-teal-500/30 dark:hover:border-neon-teal/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">{label}</span>
        <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500 dark:group-hover:text-neon-teal transition-colors" />
      </div>
      <div className="font-mono text-sm md:text-base font-bold text-slate-800 dark:text-white truncate" title={value}>
        {value || 'N/A'}
      </div>
      {/* Decorative corner glow */}
      <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-gradient-to-br from-teal-400/20 to-blue-500/0 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
    </motion.div>
  );

  return (
    <motion.div 
      className={clsx(
        "bento-card rounded-3xl p-5 md:p-6 h-full flex flex-col relative overflow-hidden transition-all duration-500 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-3xl border-slate-200/50 dark:border-slate-700/50 shadow-xl",
        className,
        isDimmed && "opacity-30 blur-[2px] pointer-events-none grayscale"
      )}
      whileHover={{ borderColor: "rgba(45, 212, 191, 0.4)" }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6 z-10 border-b border-slate-200/60 dark:border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 rounded-xl border border-teal-200 dark:border-teal-700/50 shadow-sm">
            <Activity className="w-5 h-5 text-teal-600 dark:text-neon-teal" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white tracking-wide font-sans">{t('insights_title')}</h3>
            {result && result.data?.header && <p className="text-[10px] text-slate-400 font-mono tracking-wider">ID: {result.data.header.report_id}</p>}
          </div>
        </div>
        
        {/* Signal Quality Indicator */}
        {result && result.data?.signal_integrity && (
          <div className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm",
            result.data.signal_integrity.is_valid 
              ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
              : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
          )}>
            <div className={clsx("w-2 h-2 rounded-full", result.data.signal_integrity.is_valid ? "bg-green-500 animate-pulse" : "bg-red-500")} />
            <span className="hidden md:inline font-mono">SNR: {result.data.signal_integrity.snr_ratio?.toFixed(1)}dB</span>
            <Wifi className="w-3 h-3 md:hidden" />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col gap-4"
          >
             {/* Tech-style Loading UI */}
             <div className="flex gap-4">
               <div className="w-2/3 h-32 bg-slate-200 dark:bg-slate-800/40 rounded-2xl relative overflow-hidden border border-slate-300 dark:border-white/5">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '1000px 100%' }}></div>
               </div>
               <div className="w-1/3 h-32 bg-slate-200 dark:bg-slate-800/40 rounded-2xl relative overflow-hidden border border-slate-300 dark:border-white/5">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '1000px 100%' }}></div>
               </div>
             </div>
             <div className="grid grid-cols-3 gap-3 mt-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800/40 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '800px 100%' }}></div>
                  </div>
                ))}
             </div>
          </motion.div>
        ) : !result ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500"
          >
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-4">
               <Activity className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-sm font-medium">{t('history_empty')}</p>
          </motion.div>
        ) : (!result.data?.clinical_inference || !result.data?.biometric_payload) ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-red-500 text-center p-4"
          >
             <AlertTriangle className="w-16 h-16 mb-4 opacity-80" />
             <h3 className="font-bold text-lg mb-2">Incomplete Analysis</h3>
             <p className="text-sm opacity-80 max-w-xs">The AI model could not generate a complete clinical report. Please ensure audio quality is clear and try again.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col gap-5 h-full overflow-y-auto custom-scrollbar pr-2 pb-2"
          >
            {/* --- HERO SECTION: Diagnosis & Confidence --- */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              
              {/* Primary Diagnosis Card */}
              <div className={clsx(
                "md:col-span-3 rounded-2xl p-5 md:p-6 relative overflow-hidden border shadow-lg group",
                "bg-gradient-to-br", urgencyStyles.gradient, "border-white/20 dark:border-white/10"
              )}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 dark:opacity-20" 
                     style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}>
                </div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                       <UrgencyIcon className="w-4 h-4" />
                       {t('result_suspect')}
                    </h4>
                    <span className={clsx("px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider shadow-sm backdrop-blur-md", urgencyStyles.badge)}>
                      {result.data.frontend_state?.urgency || 'UNKNOWN'}
                    </span>
                  </div>
                  
                  <div className="my-3">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                      {result.data.clinical_inference.primary_suspect}
                    </h2>
                  </div>

                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium border-l-2 border-slate-300 dark:border-slate-600 pl-3 leading-relaxed opacity-90">
                    {result.data.clinical_inference.differential_diagnosis?.exclusion_logic}
                  </p>
                </div>

                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 dark:bg-white/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
              </div>

              {/* Confidence Gauge */}
              <div className="md:col-span-2 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-4 flex flex-col items-center justify-center relative shadow-md">
                 <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Glowing SVG Gauge */}
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(45,212,191,0.3)]">
                      {/* Background Track */}
                      <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                      {/* Progress Track */}
                      <motion.circle 
                        initial={{ strokeDashoffset: 264 }}
                        animate={{ strokeDashoffset: 264 - (264 * (result.data.clinical_inference.confidence_metrics?.aggregate_score || 0)) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="50%" cy="50%" r="42%" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeLinecap="round"
                        className="text-teal-500 dark:text-neon-teal" 
                        strokeDasharray={264} 
                      />
                    </svg>
                    
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-slate-800 dark:text-white tracking-tighter">
                          {((result.data.clinical_inference.confidence_metrics?.aggregate_score || 0) * 100).toFixed(0)}
                          <span className="text-sm align-top ml-0.5">%</span>
                        </span>
                    </div>
                 </div>
                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-2">{t('result_confidence')}</span>
              </div>
            </div>

            {/* --- BIOMETRIC GRID --- */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4" /> Biometric Analysis
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard 
                   label="Jitter" 
                   value={result.data.biometric_payload?.vocal_features?.jitter_local} 
                   icon={Mic} 
                   delay={0.1} 
                />
                <MetricCard 
                   label="Shimmer" 
                   value={result.data.biometric_payload?.vocal_features?.shimmer_local_db} 
                   icon={Mic} 
                   delay={0.15} 
                />
                <MetricCard 
                   label="Micro-Tremor" 
                   value={result.data.biometric_payload?.neurological_markers?.micro_tremor_freq} 
                   icon={Zap} 
                   delay={0.2} 
                />
                <MetricCard 
                   label="Resp. Force" 
                   value={result.data.biometric_payload?.respiratory_markers?.cough_burst_intensity} 
                   icon={Wind} 
                   delay={0.25} 
                />
              </div>
            </div>

            {/* --- DIFFERENTIAL DIAGNOSIS (Rule Outs) --- */}
            <div className="p-4 bg-slate-50/80 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('result_diff')}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {result.data.clinical_inference.differential_diagnosis?.ruled_out?.map((condition, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (idx * 0.1) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 line-through decoration-slate-400/50 decoration-2">
                        {condition}
                      </span>
                    </motion.div>
                  ))}
                  {(!result.data.clinical_inference.differential_diagnosis?.ruled_out?.length) && (
                    <span className="text-xs text-slate-400 italic">No specific exclusions noted.</span>
                  )}
                </div>
                
                {result.data.signal_integrity?.validation_note && (
                   <div className="mt-3 flex items-start gap-2 text-[10px] text-slate-500 bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded-lg border border-yellow-100 dark:border-yellow-900/20">
                      <AlertCircle className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
                      <span>{result.data.signal_integrity.validation_note}</span>
                   </div>
                )}
            </div>

             {/* --- SYMPTOMS (Collapsible-ish feel) --- */}
             {result.data.questionnaire_data && result.data.questionnaire_data.responses.length > 0 && (
                <div className="p-4 bg-white/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('result_symptoms')}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.data.questionnaire_data.responses.map((item, idx) => (
                      <div key={idx} className="group flex flex-col gap-1 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        <span className="text-[10px] text-slate-400 font-medium group-hover:text-teal-500 transition-colors">{item.question}</span>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-neon-teal"></div>
                           <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{item.answer}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             )}

            {/* --- DISCLAIMER --- */}
            <div className="mt-auto pt-2">
               <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                 <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] md:text-xs text-red-700 dark:text-red-300/80 leading-relaxed font-medium">
                    {t('result_disclaimer')}
                 </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InsightModule;