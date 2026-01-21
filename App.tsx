import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { GameState, GameStats } from './types';
import { playSound } from './utils/sound';
import { MAX_LIVES, GAME_DURATION } from './constants';

function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    lives: MAX_LIVES,
    timeLeft: GAME_DURATION
  });
  const [finalScore, setFinalScore] = useState(0);

  const startGame = () => {
    playSound('start');
    setGameState('PLAYING');
    setGameStats({ score: 0, lives: MAX_LIVES, timeLeft: GAME_DURATION });
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setGameState('GAME_OVER');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans text-white bg-slate-900 selection:bg-purple-500">
      
      {/* Background Stars (Static CSS for performance) */}
      <div className="absolute inset-0 pointer-events-none opacity-50" 
           style={{
             backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
             backgroundSize: '50px 50px'
           }}>
      </div>
      
      {/* Game Canvas */}
      <GameCanvas 
        gameState={gameState} 
        onGameOver={handleGameOver} 
        setStats={setGameStats}
      />

      {/* HUD (Only visible when playing) */}
      {gameState === 'PLAYING' && <UIOverlay stats={gameStats} />}

      {/* Start Screen */}
      {gameState === 'START' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border-2 border-slate-600 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl transform transition-all hover:scale-105">
            <div className="text-6xl mb-4 animate-bounce">🚀</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
              Uzayda Temizlik
            </h1>
            <p className="text-slate-300 mb-6">Uzayı çöplerden temizle, geleceği kurtar!</p>
            
            <div className="grid grid-cols-2 gap-4 text-left bg-slate-900/50 p-4 rounded-xl mb-8 text-sm">
              <div>
                <p className="text-green-400 font-bold mb-1">Topla (Puan):</p>
                <div className="flex gap-2 text-2xl">🗑️ 🥤 🥫</div>
              </div>
              <div>
                <p className="text-red-400 font-bold mb-1">Dokunma (Can -1):</p>
                <div className="flex gap-2 text-2xl">👩‍🚀 💎 🛰️</div>
              </div>
            </div>

            <button 
              onClick={startGame}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              Görevi Başlat
            </button>
            <p className="mt-4 text-xs text-slate-500">Oynamak için sürükle</p>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white text-slate-900 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter text-slate-800">Oyun Bitti!</h2>
            
            <div className="my-8">
              <p className="text-sm font-semibold text-slate-500 uppercase">Toplam Puan</p>
              <p className="text-6xl font-black text-blue-600">{finalScore}</p>
            </div>

            <button 
              onClick={startGame}
              className="w-full bg-slate-900 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🔄</span> Tekrar Oyna
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;