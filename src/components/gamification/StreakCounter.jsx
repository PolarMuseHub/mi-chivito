import { useGamification } from '../../context/GamificationContext';

export default function StreakCounter() {
  const { streak } = useGamification();

  const getStreakStyle = () => {
    if (streak >= 7) {
      return 'text-red-500 animate-pulse';
    } else if (streak >= 3) {
      return 'text-orange-500';
    }
    return 'text-gray-400';
  };

  return (
    <div className="relative group flex items-center gap-1.5">
      <span className="text-xl">🔥</span>
      <span className={`font-semibold text-lg ${getStreakStyle()}`}>
        {streak}
      </span>

      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        Tu racha vive en este dispositivo. ¡No la pierdas! 🐐
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}
