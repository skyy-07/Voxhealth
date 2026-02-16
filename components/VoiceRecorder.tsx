import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Upload, StopCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
  isProcessing: boolean;
  className?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete, 
  onRecordingStart, 
  onRecordingStop, 
  isProcessing,
  className 
}) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      // Ensure previous session is cleaned up
      stopVisualization();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      // Setup Visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(blob);
        stopVisualization();
        if (stream) stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      onRecordingStart();
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      drawVisualization();

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingStop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const drawVisualization = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    // Check if dark mode is active to adjust visualizer colors
    const isDark = document.documentElement.classList.contains('dark');

    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      if (!analyserRef.current || !dataArrayRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      
      const barWidth = (WIDTH / dataArrayRef.current.length) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        barHeight = dataArrayRef.current[i];
        
        // Gradient color
        const gradient = ctx.createLinearGradient(0, HEIGHT - barHeight, 0, HEIGHT);
        // Use darker teal for light mode, neon for dark mode
        const colorStart = isDark ? '#2dd4bf' : '#0d9488';
        const colorEnd = isDark ? 'rgba(45, 212, 191, 0.2)' : 'rgba(13, 148, 136, 0.2)';

        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);

        ctx.fillStyle = gradient;
        
        // Rounded caps roughly
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    renderFrame();
  };

  const stopVisualization = () => {
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
    }
    
    if (audioContextRef.current) {
      // Check state before closing to avoid "Cannot close a closed AudioContext" error
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.warn("Error closing audio context:", e));
      }
      // We don't nullify immediately if we want to be strict, but usually it's fine.
      // However, if we don't nullify, next time we might try to close it again if state checks fail.
      // Better to keep the ref until we overwrite it or unmount, but the state check protects us.
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onRecordingComplete(file);
      event.target.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopVisualization();
    };
  }, []);

  return (
    <motion.div 
      layout
      className={clsx(
        "bento-card rounded-3xl p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500",
        className
      )}
      whileHover={{ y: -5, borderColor: "rgba(45, 212, 191, 0.3)" }}
    >
      {/* Background Pulse Animation when Recording */}
      {isRecording && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-teal-500/10 dark:bg-neon-teal/5 rounded-full animate-pulse-slow blur-3xl"></div>
            <div className="w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-teal-500/20 dark:bg-neon-teal/10 rounded-full animate-pulse blur-2xl"></div>
         </div>
      )}

      {/* Visualizer Canvas */}
      <div className="relative w-full h-32 md:h-40 mb-8 rounded-2xl overflow-hidden flex items-end justify-center">
        <canvas ref={canvasRef} width={600} height={160} className="w-full h-full absolute bottom-0 z-10" />
        
        {!isRecording && !isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
             <div className="w-full h-[1px] bg-slate-300 dark:bg-white/10"></div>
          </div>
        )}
      </div>

      {/* Main Controls Container */}
      <div className="relative z-20 flex flex-col items-center gap-8">
        {/* Record Button */}
        <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={clsx(
              "relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full transition-all duration-500 shadow-2xl",
              isRecording 
                ? "bg-red-500/20 border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)] scale-110" 
                : "bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 hover:border-teal-500 dark:hover:border-neon-teal hover:shadow-[0_0_30px_rgba(45,212,191,0.2)]"
            )}
        >
            {isProcessing ? (
                <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-teal-500/30 dark:border-neon-teal/30 border-t-teal-600 dark:border-t-neon-teal rounded-full animate-spin" />
            ) : isRecording ? (
                <StopCircle className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
            ) : (
                <Mic className="w-6 h-6 md:w-8 md:h-8 text-slate-700 dark:text-white group-hover:text-teal-600 dark:group-hover:text-neon-teal transition-colors" />
            )}
        </button>

        {/* Upload Button */}
        {!isRecording && !isProcessing && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex flex-col items-center gap-3"
           >
              <span className="text-xs text-slate-500 dark:text-slate-600 font-medium uppercase tracking-widest">or</span>
              <button 
                  onClick={handleUploadClick}
                  className="group flex items-center gap-3 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 hover:border-teal-500 dark:hover:border-neon-teal/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300"
              >
                  <Upload className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-neon-teal" />
                  <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{t('recorder_upload')}</span>
              </button>
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="audio/*" 
                  className="hidden" 
              />
           </motion.div>
        )}
      </div>

      {/* Status Text */}
      <div className="mt-8 text-center z-20 h-24">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-2">
          {isProcessing ? t('recorder_analyzing') : isRecording ? t('recorder_listening') : t('recorder_ready')}
        </h2>
        {isRecording ? (
           <p className="font-mono text-teal-600 dark:text-neon-teal text-lg md:text-xl tracking-widest">
             {new Date(recordingTime * 1000).toISOString().substr(14, 5)}
           </p>
        ) : (
           !isProcessing && (
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-md mx-auto animate-in fade-in slide-in-from-bottom-2 px-4">
                {t('recorder_instruction')}
              </p>
           )
        )}
      </div>

    </motion.div>
  );
};

export default VoiceRecorder;