import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Intro = () => {
  const navigate = useNavigate();
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<OscillatorNode[]>([]);

  // Initialize audio and start ambient drone
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        console.log('Audio context initialized');
        
        // Start ambient drone
        startAmbientDrone();
      } catch (e) {
        console.error('Error initializing audio:', e);
      }
    };

    initAudio();

    return () => {
      stopAmbientDrone();
      audioContextRef.current?.close();
    };
  }, []);

  // Start dramatic pulsing ambient drone
  const startAmbientDrone = () => {
    if (!audioContextRef.current || audioContextRef.current.state !== 'running') return;
    
    const ctx = audioContextRef.current;
    
    // Deep pulsing bass
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const bassLFO = ctx.createOscillator(); // LFO for pulsing
    const bassLFOGain = ctx.createGain();
    
    bass.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassLFO.connect(bassLFOGain);
    bassLFOGain.connect(bassGain.gain);
    
    bass.frequency.value = 55;
    bass.type = 'sine';
    bassGain.gain.value = 0.05;
    
    // Pulse at 0.5Hz (slow dramatic pulse)
    bassLFO.frequency.value = 0.5;
    bassLFO.type = 'sine';
    bassLFOGain.gain.value = 0.03;
    
    bass.start();
    bassLFO.start();
    ambientNodesRef.current.push(bass, bassLFO);
    
    // Rising tension drone
    const tension = ctx.createOscillator();
    const tensionGain = ctx.createGain();
    tension.connect(tensionGain);
    tensionGain.connect(ctx.destination);
    tension.frequency.value = 220;
    tension.type = 'sawtooth';
    tensionGain.gain.value = 0.015;
    
    // Slowly rise in pitch for building tension
    tension.frequency.setValueAtTime(220, ctx.currentTime);
    tension.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 20);
    
    tension.start();
    ambientNodesRef.current.push(tension);
    
    // Dramatic low rumble with noise
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    const rumbleFilter = ctx.createBiquadFilter();
    
    rumble.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);
    
    rumble.frequency.value = 30;
    rumble.type = 'sawtooth';
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.value = 100;
    rumbleGain.gain.value = 0.04;
    
    rumble.start();
    ambientNodesRef.current.push(rumble);
  };

  const stopAmbientDrone = () => {
    ambientNodesRef.current.forEach(node => {
      try {
        node.stop();
      } catch (e) {
        // Already stopped
      }
    });
    ambientNodesRef.current = [];
  };

  // Mute/unmute ambient
  useEffect(() => {
    if (audioMuted) {
      stopAmbientDrone();
    } else if (audioContextRef.current && audioContextRef.current.state === 'running') {
      startAmbientDrone();
    }
  }, [audioMuted]);

  // Toggle mute on click
  const toggleMute = () => {
    setAudioMuted(!audioMuted);
  };

  // Remove typing sound - just ambient drone now
  const playTypingSound = () => {
    // No sound per character - just ambient drone
  };

  // Ultron-style robotic threat sound
  const playRoboticThreat = () => {
    if (!audioContextRef.current || audioContextRef.current.state !== 'running') {
      return;
    }
    
    try {
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Deep robotic growl
      const growl = ctx.createOscillator();
      const growlGain = ctx.createGain();
      const growlFilter = ctx.createBiquadFilter();
      
      growl.connect(growlFilter);
      growlFilter.connect(growlGain);
      growlGain.connect(ctx.destination);
      
      growl.type = 'sawtooth';
      growl.frequency.setValueAtTime(60, now);
      growl.frequency.exponentialRampToValueAtTime(40, now + 0.3);
      
      growlFilter.type = 'lowpass';
      growlFilter.frequency.value = 200;
      growlFilter.Q.value = 5;
      
      growlGain.gain.setValueAtTime(0, now);
      growlGain.gain.linearRampToValueAtTime(0.15, now + 0.05);
      growlGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
      
      growl.start(now);
      growl.stop(now + 1.5);

      // Metallic clang/impact
      const clang = ctx.createOscillator();
      const clangGain = ctx.createGain();
      const clangFilter = ctx.createBiquadFilter();
      
      clang.connect(clangFilter);
      clangFilter.connect(clangGain);
      clangGain.connect(ctx.destination);
      
      clang.type = 'square';
      clang.frequency.setValueAtTime(800, now);
      clang.frequency.exponentialRampToValueAtTime(200, now + 0.2);
      
      clangFilter.type = 'bandpass';
      clangFilter.frequency.value = 1500;
      clangFilter.Q.value = 10;
      
      clangGain.gain.setValueAtTime(0.08, now);
      clangGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      clang.start(now);
      clang.stop(now + 0.5);

      // Digital glitch/warning
      const glitch = ctx.createOscillator();
      const glitchGain = ctx.createGain();
      
      glitch.connect(glitchGain);
      glitchGain.connect(ctx.destination);
      
      glitch.type = 'square';
      glitch.frequency.setValueAtTime(1200, now + 0.2);
      glitch.frequency.setValueAtTime(1000, now + 0.25);
      glitch.frequency.setValueAtTime(1400, now + 0.3);
      glitch.frequency.setValueAtTime(900, now + 0.35);
      
      glitchGain.gain.setValueAtTime(0, now + 0.2);
      glitchGain.gain.linearRampToValueAtTime(0.04, now + 0.21);
      glitchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      
      glitch.start(now + 0.2);
      glitch.stop(now + 0.6);

      // Robotic voice-like modulation
      const voice = ctx.createOscillator();
      const voiceGain = ctx.createGain();
      const voiceFilter = ctx.createBiquadFilter();
      const voiceLFO = ctx.createOscillator();
      const voiceLFOGain = ctx.createGain();
      
      voice.connect(voiceFilter);
      voiceFilter.connect(voiceGain);
      voiceGain.connect(ctx.destination);
      
      voiceLFO.connect(voiceLFOGain);
      voiceLFOGain.connect(voice.frequency);
      
      voice.type = 'sawtooth';
      voice.frequency.value = 150;
      
      voiceFilter.type = 'bandpass';
      voiceFilter.frequency.value = 400;
      voiceFilter.Q.value = 8;
      
      voiceLFO.type = 'square';
      voiceLFO.frequency.value = 8;
      voiceLFOGain.gain.value = 30;
      
      voiceGain.gain.setValueAtTime(0, now + 0.4);
      voiceGain.gain.linearRampToValueAtTime(0.06, now + 0.45);
      voiceGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      
      voice.start(now + 0.4);
      voiceLFO.start(now + 0.4);
      voice.stop(now + 1.2);
      voiceLFO.stop(now + 1.2);
      
      console.log('Playing robotic threat sound');
    } catch (e) {
      console.error('Error playing robotic threat:', e);
    }
  };

  // Success chime
  const playSuccessChime = () => {
    if (!audioContextRef.current || audioContextRef.current.state !== 'running') {
      return;
    }
    
    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
      
      console.log('Playing success chime');
    } catch (e) {
      console.error('Error playing success chime:', e);
    }
  };

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
      playSuccessChime();
      setTimeout(() => setIsComplete(true), 1000);
      return;
    }

    const line = introLines[currentLine];
    let charIndex = 0;

    // Play robotic threat sound for warning lines
    if (line.includes('[WARNING]') || line.includes('CRITICAL')) {
      playRoboticThreat();
    }

    const typeInterval = setInterval(() => {
      if (charIndex <= line.length) {
        setDisplayedText(line.substring(0, charIndex));
        // Play typing sound for each character (except spaces and empty lines)
        if (charIndex < line.length && line[charIndex] !== ' ' && line.trim() !== '') {
          playTypingSound();
        }
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setCurrentLine(currentLine + 1);
          setDisplayedText('');
        }, 300);
      }
    }, 30); // Back to original speed

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
    <div 
      onClick={toggleMute}
      className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden cursor-pointer"
    >
      {/* Mute indicator */}
      {audioMuted && (
        <div className="absolute top-4 right-4 z-50 text-green-500/50 font-mono text-xs flex items-center gap-2">
          <span>🔇 MUTED</span>
        </div>
      )}
      {!audioMuted && (
        <div className="absolute top-4 right-4 z-50 text-green-500/30 font-mono text-xs flex items-center gap-2 animate-pulse">
          <span>🔊 AUDIO ON</span>
        </div>
      )}

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
