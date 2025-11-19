
import React, { useState, useEffect, useRef } from 'react';
import { LOADING_STEPS, HEX_CHARS } from '../constants';

export const ArcherLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  // Initial logs
  const [logs, setLogs] = useState<string[]>([
    "176354.3854799 > SYSTEM_INIT...",
    "176354.3854812 > CONNECTION_ESTABLISHED"
  ]);
  const [memAddr, setMemAddr] = useState("0X2477");
  const [threadCount, setThreadCount] = useState(4);
  
  const logContainerRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(0);

  const BLOCKS_COUNT = 60; 
  const TOTAL_DURATION = 6000; // Speed up loop

  // Derived state for current step based on global progress
  // Cycles through the whole list as progress goes 0 -> 100
  const currentStepIndex = Math.min(
    Math.floor((progress / 100) * LOADING_STEPS.length),
    LOADING_STEPS.length - 1
  );

  // Generate a formatted timestamp
  const getTimestamp = () => {
    const now = performance.now() + 176354000; 
    return now.toFixed(7);
  };

  // Helper to add log line
  const addLog = (text: string) => {
    setLogs(prev => {
      const newLogs = [...prev, text];
      return newLogs.slice(-8); // Keep last 8 lines for the window
    });
  };

  // 1. Main Progress Sequencer (Looping 0 -> 100 -> 0)
  useEffect(() => {
    let startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / TOTAL_DURATION) * 100;

      if (newProgress >= 100) {
        // Restart loop
        startTime = Date.now();
        setProgress(0);
        prevStepRef.current = -1; // Reset step tracker for logging
        addLog(`${getTimestamp()} > SEQUENCE_COMPLETE... RESTARTING`);
      } else {
        setProgress(newProgress);
      }
    }, 30); // Smooth updates

    return () => clearInterval(interval);
  }, []);

  // 2. Log previous steps as they complete
  useEffect(() => {
    if (currentStepIndex > prevStepRef.current) {
       // Ensure we don't log on the initial reset frame (-1)
       if (prevStepRef.current >= 0) {
         addLog(`${getTimestamp()} > ${LOADING_STEPS[prevStepRef.current].toUpperCase()}... DONE`);
       }
       prevStepRef.current = currentStepIndex;
    }
  }, [currentStepIndex]);

  // 3. Fast "Streaming" Noise Generator
  useEffect(() => {
    const noiseInterval = setInterval(() => {
      // 30% chance to add a random system noise log
      if (Math.random() > 0.7) {
        const hex = Math.random().toString(16).substring(2, 6).toUpperCase();
        const op = ['ALLOC', 'READ', 'WRITE', 'SYNC', 'PING'][Math.floor(Math.random() * 5)];
        addLog(`${getTimestamp()} > MEM_${op}_0x${hex}`);
      }
      
      // Update header stats
      setMemAddr(`0X${Math.random().toString(16).substring(2, 6).toUpperCase()}`);
      if(Math.random() > 0.95) setThreadCount(Math.floor(Math.random() * 12) + 2);

    }, 120); 

    return () => clearInterval(noiseInterval);
  }, []);

  // Auto scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const filledBlocks = Math.floor((progress / 100) * BLOCKS_COUNT);

  return (
    <div className="w-full max-w-5xl aspect-[16/10] md:aspect-auto md:h-[600px] border-4 border-[#FF7834] bg-black relative flex flex-col overflow-hidden shadow-2xl">
      
      {/* Global Dither Overlay for Component */}
      <div className="absolute inset-0 pointer-events-none z-50 dither-effect opacity-50"></div>

      {/* Top Window Bar */}
      <div className="h-10 border-b-2 border-[#FF7834] flex items-center justify-between px-3 bg-[#FF7834]/20">
        <div className="flex gap-2">
          <div className="w-4 h-2 bg-[#FF7834]"></div>
          <div className="w-4 h-2 bg-[#FF7834]"></div>
          <div className="w-4 h-2 bg-[#FF7834]"></div>
        </div>
        <div className="text-sm tracking-widest text-[#FF7834] font-mono font-bold uppercase">
          ARCHER EXCHANGE
        </div>
        <div className="w-12"></div> 
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 md:p-12 flex flex-col relative justify-between z-10">
        
        {/* Header Title - Replaced Text with Image */}
        <div className="flex justify-center py-8">
          <img 
            src="https://images2.imgbox.com/c3/46/CCLcysoT_o.png" 
            alt="ARCHER" 
            className="h-16 md:h-24 object-contain"
          />
        </div>

        {/* Progress Area */}
        <div className="w-full font-mono space-y-4">
          
          {/* Step Label & Percentage */}
          <div className="flex justify-between items-end font-bold uppercase tracking-widest text-sm md:text-base">
            <div className="flex items-center gap-3 text-[#FF7834]">
              <span className="animate-pulse bg-[#FF7834] w-3 h-5 block"></span>
              <span>{LOADING_STEPS[currentStepIndex]}</span>
            </div>
            <div className="text-[#FF7834]">{Math.floor(progress)}%</div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="h-12 w-full border-2 border-[#FF7834] p-1 flex gap-1 bg-black">
            {Array.from({ length: BLOCKS_COUNT }).map((_, i) => (
              <div 
                key={i} 
                className={`h-full flex-1 ${
                  i < filledBlocks 
                    ? 'bg-[#FF7834]' 
                    : 'bg-[#FF7834]/10'
                }`}
              />
            ))}
          </div>

          {/* Memory / Thread Stats */}
          <div className="flex justify-between text-xs md:text-sm text-[#FF7834] font-mono font-bold uppercase tracking-wider pt-2">
            <span>MEM: {memAddr}</span>
            <span>THREADS: {threadCount}</span>
          </div>
        </div>

        {/* Streaming Logs Console */}
        <div className="mt-8 border-t-2 border-[#FF7834]/50 pt-4">
            <div 
              ref={logContainerRef}
              className="font-mono text-xs md:text-sm text-[#FF7834] font-bold h-[120px] overflow-hidden flex flex-col justify-end"
            >
              {logs.map((log, i) => (
                <div key={i} className="whitespace-nowrap leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
        </div>

      </div>

      {/* Footer Status Bar */}
      <div className="h-10 border-t-2 border-[#FF7834] flex items-center justify-between px-4 bg-[#FF7834]/20 font-mono text-xs text-[#FF7834] uppercase font-bold tracking-wider">
        <div className="flex items-center gap-2">
           <span>SECURE CONNECTION:</span>
           <span className="text-[#FF7834] animate-pulse">PENDING...</span>
        </div>
        <div className="flex gap-6">
           <span>V.2.4.0</span>
           <span>PORT: 8080</span>
        </div>
      </div>

    </div>
  );
};
