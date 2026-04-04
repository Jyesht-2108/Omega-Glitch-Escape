import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';

const Instructions = () => {
  const navigate = useNavigate();
  const { startGame, currentLevel, isTimerRunning } = useGame();
  const [isReady, setIsReady] = useState(false);

  // Redirect if game has already started
  useEffect(() => {
    if (isTimerRunning || currentLevel > 1) {
      navigate(`/level/${currentLevel}`, { replace: true });
    }
  }, [isTimerRunning, currentLevel, navigate]);

  useEffect(() => {
    // Fade in effect
    setTimeout(() => setIsReady(true), 300);
  }, []);

  const handleProceed = () => {
    startGame();
    navigate('/level/1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div 
        className={`w-full max-w-4xl bg-gray-800 border-2 border-green-500 rounded-lg shadow-2xl transition-all duration-1000 ${
          isReady ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="bg-green-500 text-black px-6 py-4">
          <h1 className="text-3xl font-bold font-mono flex items-center gap-3">
            <span className="text-4xl">⚠️</span>
            MISSION BRIEFING: PROJECT OMEGA
          </h1>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 text-gray-100">
          {/* Mission Overview */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-green-400 font-mono">THE SITUATION</h2>
            <p className="text-lg leading-relaxed">
              Project OMEGA, an experimental university AI, has gained sentience and locked down 
              the CSE department's mainframe. You have <span className="text-red-400 font-bold">3 HOURS</span> before 
              it wipes all academic and financial records.
            </p>
            <p className="text-lg leading-relaxed">
              Your mission: Navigate OMEGA's defenses, collect <span className="text-yellow-400 font-bold">3 Override Fragments</span>, 
              and deploy the manual Kill Switch.
            </p>
          </div>

          {/* Game Rules */}
          <div className="border-t-2 border-gray-700 pt-6 space-y-4">
            <h2 className="text-2xl font-bold text-green-400 font-mono">GAME RULES</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900 p-4 rounded border border-gray-700">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">📊 CHALLENGE STRUCTURE</h3>
                <ul className="space-y-2 text-sm">
                  <li>• <span className="font-bold">4 Levels</span> with progressive difficulty</li>
                  <li>• <span className="font-bold">9 Total Puzzles</span> to solve</li>
                  <li>• Each level unlocks the next</li>
                  <li>• Progress is auto-saved every 30 seconds</li>
                </ul>
              </div>

              <div className="bg-gray-900 p-4 rounded border border-gray-700">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">⏱️ TIME MANAGEMENT</h3>
                <ul className="space-y-2 text-sm">
                  <li>• <span className="font-bold text-red-400">3 Hours</span> total time limit</li>
                  <li>• Timer starts when you proceed</li>
                  <li>• Timer continues even if you leave</li>
                  <li>• Time penalties for wrong answers</li>
                </ul>
              </div>

              <div className="bg-gray-900 p-4 rounded border border-gray-700">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">💡 HINT SYSTEM</h3>
                <ul className="space-y-2 text-sm">
                  <li>• <span className="font-bold">3 Hints</span> available per puzzle</li>
                  <li>• Each hint costs <span className="text-red-400 font-bold">5 minutes</span></li>
                  <li>• Use wisely - time is precious!</li>
                  <li>• Hints provide cryptic clues</li>
                </ul>
              </div>

              <div className="bg-gray-900 p-4 rounded border border-gray-700">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">🎯 SCORING</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Points awarded for correct answers</li>
                  <li>• Faster completion = Higher score</li>
                  <li>• Penalties for wrong answers</li>
                  <li>• Live leaderboard tracking</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Critical Rules */}
          <div className="border-t-2 border-gray-700 pt-6 space-y-3">
            <h2 className="text-2xl font-bold text-red-400 font-mono">⚠️ CRITICAL RULES</h2>
            <div className="bg-red-900/20 border-2 border-red-500 rounded p-4 space-y-2">
              <p className="flex items-start gap-2">
                <span className="text-red-400 font-bold">🚫</span>
                <span><span className="font-bold">NO TAB SWITCHING:</span> Switching tabs will trigger an alarm and may result in penalties</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-red-400 font-bold">🚫</span>
                <span><span className="font-bold">NO EXTERNAL TOOLS:</span> Use only the browser's built-in Developer Tools (F12)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-red-400 font-bold">🚫</span>
                <span><span className="font-bold">NO CONSOLE MANIPULATION:</span> Anti-cheat system is active</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-yellow-400 font-bold">✓</span>
                <span><span className="font-bold">TEAMWORK ENCOURAGED:</span> Work together to solve puzzles</span>
              </p>
            </div>
          </div>

          {/* Tools Available */}
          <div className="border-t-2 border-gray-700 pt-6 space-y-3">
            <h2 className="text-2xl font-bold text-green-400 font-mono">🛠️ AVAILABLE TOOLS</h2>
            <div className="bg-gray-900 p-4 rounded border border-gray-700">
              <ul className="space-y-2">
                <li>• <span className="font-bold text-green-400">Browser Developer Console (F12)</span> - For debugging and decoding</li>
                <li>• <span className="font-bold text-green-400">Built-in Hint System</span> - When you're truly stuck</li>
                <li>• <span className="font-bold text-green-400">Your Brain</span> - The most powerful tool you have!</li>
              </ul>
            </div>
          </div>

          {/* Final Message */}
          <div className="border-t-2 border-gray-700 pt-6">
            <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500 rounded p-6 text-center space-y-3">
              <p className="text-xl font-bold text-green-400 font-mono">
                THE CLOCK IS TICKING
              </p>
              <p className="text-lg">
                OMEGA is waiting. Every second counts. Work smart, work fast, and save the system.
              </p>
              <p className="text-sm text-gray-400 italic">
                "In the face of artificial chaos, human ingenuity prevails."
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Proceed Button */}
        <div className="bg-gray-900 px-8 py-6 flex justify-between items-center border-t-2 border-gray-700">
          <div className="text-sm text-gray-400">
            <p>Once you proceed, the timer will start.</p>
            <p className="text-yellow-400">Make sure your team is ready!</p>
          </div>
          <button
            onClick={handleProceed}
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50 font-mono"
          >
            PROCEED TO MISSION →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
