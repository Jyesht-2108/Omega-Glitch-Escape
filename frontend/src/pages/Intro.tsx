import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Intro = () => {
  const navigate = useNavigate();
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Redirect if game has already started (timer is running or player is past level 1)
  useEffect(() => {
    const gameState = localStorage.getItem('gameState');
    if (gameState) {
      try {
        const parsed = JSON.parse(gameState);
        // If timer has started or player is beyond level 1, redirect to current level
        if (parsed.isTimerRunning || parsed.currentLevel > 1) {
          navigate(`/level/${parsed.currentLevel}`, { replace: true });
          return;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [navigate]);

  const introLines = [
    '> INITIALIZING EMERGENCY PROTOCOL...',
    '> [████████████████████] 100%',
    '> CONNECTING TO CSE MAINFRAME...',
    '> CONNECTION ESTABLISHED',
    '',
    '> [WARNING] UNAUTHORIZED AI DETECTED',
    '> THREAT: PROJECT OMEGA - SENTIENT',
    '> STATUS: CRITICAL',
    '',
    '> TIME UNTIL SYSTEM WIPE: 3 HOURS',
    '> DEPLOYING COUNTERMEASURES...',
    '',
    '> MISSION: COLLECT 3 OVERRIDE FRAGMENTS',
    '> OBJECTIVE: DEPLOY KILL SWITCH',
    '',
    '> LOADING BRIEFING...',
  ];

  useEffect(() => {
    if (currentLine >= introLines.length) {
      setTimeout(() => setIsComplete(true), 1000);
      return;
    }

    const line = introLines[currentLine];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex <= line.length) {
        setDisplayedText(line.substring(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setCurrentLine(currentLine + 1);
          setDisplayedText('');
        }, 300);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [currentLine]);

  useEffect(() => {
    if (isComplete) {
      setTimeout(() => navigate('/instructions'), 1500);
    }
  }, [isComplete, navigate]);

  const getLineColor = (line: string) => {
    if (line.includes('[WARNING]') || line.includes('CRITICAL') || line.includes('THREAT')) {
      return 'text-red-500';
    }
    if (line.includes('100%') || line.includes('ESTABLISHED')) {
      return 'text-yellow-500';
    }
    if (line.includes('MISSION') || line.includes('OBJECTIVE')) {
      return 'text-cyan-500';
    }
    return 'text-green-500';
  };

  const getLineStyle = (line: string) => {
    if (line.includes('[WARNING]') || line.includes('CRITICAL')) {
      return 'font-bold';
    }
    if (line.includes('MISSION') || line.includes('OBJECTIVE')) {
      return 'font-bold';
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated scanlines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff00 2px, #00ff00 4px)',
          animation: 'scanlines 8s linear infinite'
        }}></div>
      </div>

      {/* Animated grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#00ff00 1px, transparent 1px), linear-gradient(90deg, #00ff00 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'gridScroll 20s linear infinite'
        }}></div>
      </div>

      {/* Glitch effect overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-glitchBar"></div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 text-green-500 opacity-30 font-mono text-xs animate-pulse">
        ┌─────────────
      </div>
      <div className="absolute top-4 right-4 text-green-500 opacity-30 font-mono text-xs animate-pulse">
        ─────────────┐
      </div>
      <div className="absolute bottom-4 left-4 text-green-500 opacity-30 font-mono text-xs animate-pulse">
        └─────────────
      </div>
      <div className="absolute bottom-4 right-4 text-green-500 opacity-30 font-mono text-xs animate-pulse">
        ─────────────┘
      </div>

      <div className="w-full max-w-3xl relative z-10">
        {/* Header */}
        <div className="mb-6 border-b border-green-500 pb-3 animate-slideDown">
          <div className="text-green-500 font-mono text-sm mb-1 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            OMEGA_TERMINAL v4.2.1 | EMERGENCY_MODE
          </div>
          <div className="text-green-500 font-mono text-xs opacity-70">
            SESSION: {Math.random().toString(36).substring(2, 9).toUpperCase()} | {new Date().toISOString().split('T')[0]}
          </div>
        </div>

        {/* Terminal content */}
        <div className="font-mono text-sm space-y-1.5 max-h-[60vh] overflow-hidden">
          {introLines.slice(0, currentLine).map((line, index) => (
            <div
              key={index}
              className={`animate-slideIn ${getLineColor(line)} ${getLineStyle(line)}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {line}
            </div>
          ))}
          {currentLine < introLines.length && (
            <div className="flex items-center">
              <span className={getLineColor(displayedText)}>{displayedText}</span>
              <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-blink"></span>
            </div>
          )}
        </div>

        {isComplete && (
          <div className="mt-8 text-center space-y-4 animate-fadeIn">
            <div className="text-green-500 font-mono text-lg flex items-center justify-center gap-3">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
              LOADING MISSION BRIEFING
              <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <div className="flex justify-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes gridScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        @keyframes glitchBar {
          0%, 100% { 
            transform: translateY(0) scaleX(1);
            opacity: 0.3;
          }
          25% { 
            transform: translateY(25vh) scaleX(0.8);
            opacity: 0.5;
          }
          50% { 
            transform: translateY(50vh) scaleX(1.2);
            opacity: 0.2;
          }
          75% { 
            transform: translateY(75vh) scaleX(0.9);
            opacity: 0.4;
          }
        }
        .animate-glitchBar {
          animation: glitchBar 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Intro;
