import CoinDisplay from './CoinDisplay';
import StreakCounter from './StreakCounter';

export default function GamificationBar({ chivoSrc }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-full px-4 py-2 flex items-center gap-3">
      <img
        src={chivoSrc}
        alt="Chivito"
        className="w-10 h-10 object-contain"
      />
      <CoinDisplay />
      <StreakCounter />
    </div>
  );
}
