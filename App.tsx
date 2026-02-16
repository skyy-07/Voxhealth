import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import VoiceRecorder from './components/VoiceRecorder';
import HistoryModule from './components/Sidebar';
import InsightModule from './components/ResultCard';
import ProfileModal from './components/ProfileModal';
import Questionnaire from './components/Questionnaire';
import { UserProfile, ScanResult, DiagnosticFlow, QuestionResponse } from './types';
import { analyzeAudio, generateDiagnosticQuestions } from './services/geminiService';
import { signInUser, saveScanResult, getScanHistory, deleteScanResult } from './services/firebaseService';
import { clsx } from 'clsx';
import { Loader2, Brain, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type AppState = 'IDLE' | 'GENERATING_QUESTIONS' | 'QUESTIONNAIRE' | 'ANALYZING' | 'RESULTS';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'dark';
  });

  // Application Data State
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    uid: 'guest',
    name: 'Guest Patient',
    age: 35,
    gender: 'Other',
    smokingHistory: false,
    notes: '',
    language: 'en'
  });
  
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  
  // Workflow State
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Interim Data
  const [currentAudioBlob, setCurrentAudioBlob] = useState<string | null>(null);
  const [diagnosticFlow, setDiagnosticFlow] = useState<DiagnosticFlow | null>(null);

  // Initialize App
  useEffect(() => {
    const init = async () => {
      try {
        const user = await signInUser();
        if (user) {
          setCurrentUser(prev => ({ ...prev, uid: user.uid }));
          const scans = await getScanHistory(user.uid);
          setHistory(scans);
        }
      } catch (err) {
        console.error("Initialization error", err);
      }
    };
    init();
  }, []);

  // Update i18n when user language preference changes
  useEffect(() => {
    if (currentUser.language) {
      i18n.changeLanguage(currentUser.language);
    }
  }, [currentUser.language, i18n]);

  // Handle Theme Change
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Step 1: Recording Complete -> Generate Questions
  const handleRecordingComplete = async (blob: Blob) => {
    setAppState('GENERATING_QUESTIONS');
    
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      setCurrentAudioBlob(base64String);

      try {
        // Pass user language preference to Gemini
        const flow = await generateDiagnosticQuestions(base64String, currentUser.language);
        setDiagnosticFlow(flow);
        setAppState('QUESTIONNAIRE');
      } catch (error) {
        console.error("Failed to generate questions, skipping to analysis", error);
        // Fallback: Skip questions if generation fails
        handleQuestionnaireComplete([], base64String); 
      }
    };
  };

  // Step 2: Questionnaire Complete -> Final Analysis
  const handleQuestionnaireComplete = async (responses: QuestionResponse[], overrideAudio?: string) => {
    const audioToUse = overrideAudio || currentAudioBlob;
    if (!audioToUse) return;

    setAppState('ANALYZING');
    
    try {
      const result = await analyzeAudio(audioToUse, currentUser, responses);
      await saveScanResult(currentUser.uid, result);
      
      setHistory(prev => [result, ...prev]);
      setCurrentResult(result);
      
      setAppState('RESULTS');
      setActiveTab('insights');
    } catch (error) {
      console.error("Final Analysis Failed", error);
      alert("Analysis failed. Please try again.");
      setAppState('IDLE');
    }
  };

  const handleSelectScan = (scan: ScanResult) => {
    setCurrentResult(scan);
    setActiveTab('insights');
  };

  const handleDeleteScan = async (scanId: string) => {
      if (window.confirm(t('confirm_delete'))) {
          try {
              await deleteScanResult(currentUser.uid, scanId);
              setHistory(prev => prev.filter(s => s.id !== scanId));
              
              // If the deleted result is currently being viewed, reset the view
              if (currentResult?.id === scanId) {
                  setCurrentResult(null);
                  if (activeTab === 'insights') {
                      setActiveTab('dashboard');
                      setAppState('IDLE');
                  }
              }
          } catch (error) {
              console.error("Failed to delete", error);
          }
      }
  };

  // Reset to idle when switching back to dashboard manually
  useEffect(() => {
    if (activeTab === 'dashboard' && appState === 'RESULTS') {
      setAppState('IDLE');
      setCurrentAudioBlob(null);
      setDiagnosticFlow(null);
    }
  }, [activeTab, appState]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white font-sans relative overflow-hidden flex flex-col md:flex-row transition-colors duration-500">
      
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-teal-200/20 dark:bg-neon-teal/5 rounded-full blur-[150px] pointer-events-none transition-colors duration-500" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-300/20 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none transition-colors duration-500" />

      {/* Navigation Dock */}
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onProfileClick={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full h-[100dvh] flex flex-col md:flex-row gap-6 p-4 pb-28 md:pl-24 md:pr-6 md:py-6 md:pb-6 max-w-[1800px] mx-auto overflow-hidden">
        
        {/* Center Panel (Dynamic) */}
        <div className="flex-1 flex flex-col gap-4 md:gap-6 h-full relative overflow-hidden">
          
          {/* Header Area */}
          <div className="flex items-center justify-between shrink-0 h-14 md:h-16">
             <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                  {activeTab === 'dashboard' ? t('dashboard_title') : 
                   activeTab === 'insights' ? t('insights_title') : t('history_title')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm line-clamp-1">
                  {activeTab === 'dashboard' 
                    ? t('dashboard_subtitle', { name: currentUser.name.split(' ')[0] })
                    : activeTab === 'insights' 
                    ? t('insights_subtitle')
                    : t('history_subtitle')}
                </p>
             </div>

             {/* Theme Toggle */}
             <button
               onClick={toggleTheme}
               className="p-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-yellow-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 shadow-sm"
               aria-label="Toggle Theme"
             >
               {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 pb-10 md:pb-0"
                >
                  <AnimatePresence mode="wait">
                    {appState === 'IDLE' && (
                      <VoiceRecorder 
                        key="recorder"
                        onRecordingStart={() => {}}
                        onRecordingStop={() => {}}
                        onRecordingComplete={handleRecordingComplete}
                        isProcessing={false}
                        className="h-full w-full"
                      />
                    )}
                    
                    {appState === 'GENERATING_QUESTIONS' && (
                       <motion.div 
                         key="loading_q"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                         className="h-full w-full bento-card rounded-3xl flex flex-col items-center justify-center gap-4"
                       >
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 dark:border-neon-teal/20 dark:border-t-neon-teal rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 text-teal-600 dark:text-neon-teal animate-pulse" />
                            </div>
                          </div>
                          <p className="text-lg font-medium text-slate-700 dark:text-slate-300 animate-pulse">{t('loading_logic')}</p>
                          <p className="text-sm text-slate-500">{t('loading_path')}</p>
                       </motion.div>
                    )}

                    {appState === 'QUESTIONNAIRE' && diagnosticFlow && (
                      <Questionnaire 
                        key="questionnaire"
                        flow={diagnosticFlow}
                        onComplete={handleQuestionnaireComplete}
                        className="h-full w-full"
                      />
                    )}

                    {appState === 'ANALYZING' && (
                       <motion.div 
                         key="analyzing_final"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                         className="h-full w-full bento-card rounded-3xl flex flex-col items-center justify-center gap-4"
                       >
                          <div className="w-20 h-20 bg-teal-500/10 dark:bg-neon-teal/10 rounded-full flex items-center justify-center relative">
                             <div className="absolute inset-0 rounded-full border border-teal-500/30 dark:border-neon-teal/30 animate-ping"></div>
                             <Brain className="w-10 h-10 text-teal-600 dark:text-neon-teal animate-pulse" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t('loading_report')}</h3>
                          <p className="text-slate-500 dark:text-slate-400 max-w-sm text-center px-4">{t('loading_correlating')}</p>
                       </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : activeTab === 'insights' ? (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 pb-10 md:pb-0"
                >
                   <InsightModule 
                     result={currentResult} 
                     isLoading={appState === 'ANALYZING'}
                     className="h-full w-full"
                   />
                </motion.div>
              ) : (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 pb-10 md:pb-0 block xl:hidden"
                >
                   <HistoryModule 
                     history={history} 
                     onSelectScan={handleSelectScan} 
                     onDeleteScan={handleDeleteScan}
                     className="h-full w-full"
                   />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Sidebar (History) - Persistent on XL screens */}
        <motion.div 
          className="w-96 hidden xl:block h-full shrink-0"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HistoryModule 
            history={history} 
            onSelectScan={handleSelectScan} 
            onDeleteScan={handleDeleteScan}
            isDimmed={appState !== 'IDLE' && appState !== 'RESULTS'}
            className="h-full"
          />
        </motion.div>

      </main>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <ProfileModal 
            user={currentUser} 
            onSave={setCurrentUser} 
            onClose={() => setIsProfileOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;