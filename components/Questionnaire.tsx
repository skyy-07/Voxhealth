import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiagnosticFlow, QuestionResponse, QuestionOption } from '../types';
import { Brain, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

interface QuestionnaireProps {
  flow: DiagnosticFlow;
  onComplete: (responses: QuestionResponse[]) => void;
  className?: string;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ flow, onComplete, className }) => {
  const { t } = useTranslation();
  const [currentQuestionId, setCurrentQuestionId] = useState<string>(flow.initial_question_id);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [direction, setDirection] = useState(1);
  const [stepCount, setStepCount] = useState(1);

  // Map for easy lookup
  const questionsMap = useMemo(() => {
    return new Map(flow.questions.map(q => [q.id, q]));
  }, [flow]);

  const currentQuestion = questionsMap.get(currentQuestionId);

  // Fallback if ID is invalid (shouldn't happen with valid AI response)
  if (!currentQuestion && responses.length === 0 && flow.questions.length > 0) {
     // Try to recover by picking first available if initial_id failed
     const fallback = flow.questions[0];
     if (fallback && fallback.id !== currentQuestionId) {
        setCurrentQuestionId(fallback.id);
     }
  }

  const handleAnswer = (option: QuestionOption) => {
    if (!currentQuestion) return;

    const newResponse = {
      question: currentQuestion.text,
      answer: option.label
    };
    
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (option.next_question_id && questionsMap.has(option.next_question_id)) {
      setDirection(1);
      setStepCount(prev => prev + 1);
      setCurrentQuestionId(option.next_question_id);
    } else {
      // End of branch
      onComplete(updatedResponses);
    }
  };

  // Approximate progress - since it's a tree, we don't know total depth easily.
  // We'll estimate based on average depth of 4 for visual feedback.
  const progress = Math.min((stepCount / 5) * 100, 100);

  return (
    <div className={clsx("bento-card rounded-3xl p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden", className)}>
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 dark:bg-neon-teal/10 rounded-lg">
            <Brain className="w-5 h-5 text-teal-600 dark:text-neon-teal" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t('logic_engine_title')}</h3>
            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">{t('step')} {stepCount}</p>
          </div>
        </div>
        <div className="w-16 md:w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-teal-500 dark:bg-neon-teal"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-lg relative z-10 pt-16 md:pt-12">
        <AnimatePresence mode="wait" custom={direction}>
          {currentQuestion ? (
            <motion.div
              key={currentQuestionId}
              custom={direction}
              initial={{ opacity: 0, x: 50 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 * direction }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col gap-6"
            >
              <h2 className="text-xl md:text-2xl font-light text-slate-800 dark:text-white leading-relaxed text-center">
                {currentQuestion.text}
              </h2>

              <div className="grid grid-cols-1 gap-3 mt-4">
                {currentQuestion.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleAnswer(option)}
                    className="group relative p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-teal-500 dark:hover:border-neon-teal hover:bg-teal-50 dark:hover:bg-neon-teal/5 text-left transition-all duration-300 active:scale-[0.98] shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white font-medium transition-colors text-sm md:text-base">
                        {option.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-neon-teal opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </div>
                    
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-xl bg-teal-400/10 dark:bg-neon-teal/20 blur-xl opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
             <div className="flex flex-col items-center justify-center h-48 text-slate-500 dark:text-slate-400">
               <p>{t('finalizing_path')}</p>
             </div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/40 dark:from-black/40 to-transparent pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-200/20 dark:bg-neon-teal/5 rounded-full blur-[80px]" />
    </div>
  );
};

export default Questionnaire;