import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, FallingObject, GameStats } from '../types';
import { playSound } from '../utils/sound';
import { GAME_DURATION, MAX_LIVES, PLAYER_SIZE, SPAWN_RATE_MS, TRASH_ITEMS, GOOD_ITEMS } from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: (score: number) => void;
  setStats: (stats: GameStats) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onGameOver, setStats }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game State Refs (using refs for mutable game loop state to avoid re-renders)
  const playerX = useRef<number>(window.innerWidth / 2);
  const objects = useRef<FallingObject[]>([]);
  const score = useRef<number>(0);
  const lives = useRef<number>(MAX_LIVES);
  const timeRemaining = useRef<number>(GAME_DURATION);
  const lastTime = useRef<number>(0);
  const lastSpawn = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // Initialize/Reset Game
  const resetGame = useCallback(() => {
    score.current = 0;
    lives.current = MAX_LIVES;
    timeRemaining.current = GAME_DURATION;
    objects.current = [];
    playerX.current = window.innerWidth / 2;
    setStats({ score: 0, lives: MAX_LIVES, timeLeft: GAME_DURATION });
  }, [setStats]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      resetGame();
      lastTime.current = performance.now();
      requestRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // Input Handling
  const handleStart = (clientX: number) => {
    isDragging.current = true;
    movePlayer(clientX);
  };

  const handleMove = (clientX: number) => {
    if (isDragging.current || gameState === 'PLAYING') {
      movePlayer(clientX);
    }
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  const movePlayer = (x: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const relativeX = x - rect.left;
    // Clamp player within screen bounds
    playerX.current = Math.max(PLAYER_SIZE / 2, Math.min(canvasRef.current.width - PLAYER_SIZE / 2, relativeX));
  };

  // Main Game Loop
  const gameLoop = (time: number) => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const deltaTime = time - lastTime.current;
    lastTime.current = time;

    // 1. Update Time
    if (timeRemaining.current > 0) {
      // Decrease time roughly every second (accumulated handled by integer check usually, but floating point is fine for display)
      // Actually we should subtract deltaTime in seconds
      timeRemaining.current = Math.max(0, timeRemaining.current - (deltaTime / 1000));
      
      // Check Game Over Conditions
      if (timeRemaining.current <= 0 || lives.current <= 0) {
        playSound('gameover');
        onGameOver(score.current);
        return; // Stop loop
      }
    }

    // 2. Spawn Objects
    if (time - lastSpawn.current > SPAWN_RATE_MS) {
      spawnObject(canvas.width);
      lastSpawn.current = time;
    }

    // 3. Update Physics & Collisions
    updatePhysics(canvas.height, canvas.width);

    // 4. Draw
    draw(ctx, canvas.width, canvas.height);

    // 5. Update React UI (throttled slightly would be better in huge apps, but fine here)
    // We only update if integer values change to avoid excessive re-renders of the HUD
    setStats({
      score: score.current,
      lives: lives.current,
      timeLeft: Math.ceil(timeRemaining.current)
    });

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const spawnObject = (width: number) => {
    const isTrash = Math.random() > 0.3; // 70% trash, 30% good
    const collection = isTrash ? TRASH_ITEMS : GOOD_ITEMS;
    const emoji = collection[Math.floor(Math.random() * collection.length)];
    const size = 40 + Math.random() * 20;

    objects.current.push({
      id: Date.now() + Math.random(),
      x: Math.random() * (width - size) + size / 2,
      y: -50,
      speed: (2 + Math.random() * 3) * (window.innerHeight / 800), // Scale speed by height
      emoji,
      type: isTrash ? 'TRASH' : 'GOOD',
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 4,
      size
    });
  };

  const updatePhysics = (height: number, width: number) => {
    const playerY = height - 100;
    const hitRadius = PLAYER_SIZE / 2 + 10; // Simple circular collision

    // Filter in place
    objects.current.forEach(obj => {
      obj.y += obj.speed;
      obj.rotation += obj.rotationSpeed;
    });

    // Check collisions and bounds
    for (let i = objects.current.length - 1; i >= 0; i--) {
      const obj = objects.current[i];
      
      // Remove if off screen
      if (obj.y > height + 50) {
        objects.current.splice(i, 1);
        continue;
      }

      // Collision detection
      const dx = obj.x - playerX.current;
      const dy = obj.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < hitRadius + obj.size / 3) {
        // Hit!
        if (obj.type === 'TRASH') {
          score.current += 10;
          playSound('collect');
          // Create simple visual pop effect (could be added later, keeping it simple for now)
        } else {
          lives.current -= 1;
          playSound('hit');
          // Shake screen effect logic could go here
        }
        objects.current.splice(i, 1);
      }
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // Draw Player (Spaceship)
    const playerY = height - 100;
    
    ctx.save();
    ctx.translate(playerX.current, playerY);
    
    // Draw flame
    if (isDragging.current) {
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔥', 0, 45); 
    }

    ctx.font = `${PLAYER_SIZE}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚀', 0, 0);
    ctx.restore();

    // Draw Objects
    objects.current.forEach(obj => {
      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.rotate((obj.rotation * Math.PI) / 180);
      ctx.font = `${obj.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obj.emoji, 0, 0);
      ctx.restore();
    });
  };

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full cursor-none touch-none"
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    />
  );
};

export default GameCanvas;