import { useEffect, useState } from 'react';
import { useGamification } from '../../context/GamificationContext';

export default function CoinDisplay() {
  const { coins } = useGamification();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (coins > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [coins]);

  return (
    <>
      <style>{`
        @keyframes bounceGlow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(250, 204, 21, 0)); }
          25% { transform: scale(1.2); filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.8)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 12px rgba(250, 204, 21, 1)); }
          75% { transform: scale(1.15); filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.8)); }
        }
      `}</style>
      <div
        className={`flex items-center gap-1.5 ${animate ? 'animate-bounce-glow' : ''}`}
        style={animate ? { animation: 'bounceGlow 1s ease-in-out' } : {}}
      >
        <span className="text-xl">🪙</span>
        <span className="font-bold text-lg">{coins}</span>
      </div>
    </>
  );
}
