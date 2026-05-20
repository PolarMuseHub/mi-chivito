import { useGamification } from '../../context/GamificationContext';

const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#FFFFD2'];

export default function RewardModal() {
  const { showRewardModal, rewardInfo, closeRewardModal } = useGamification();

  if (!showRewardModal || !rewardInfo) return null;

  const getModalContent = () => {
    if (rewardInfo.type === 'bonus') {
      return {
        title: '¡Doble recompensa! 🎲',
        coins: `+${rewardInfo.coins} ChivoCoins`
      };
    }

    if (rewardInfo.type === 'streak') {
      if (rewardInfo.streak === 3) {
        return {
          title: '¡3 días seguidos! 🔥',
          coins: '+25 ChivoCoins'
        };
      }
      if (rewardInfo.streak >= 7) {
        return {
          title: '¡Una semana! 🐐✨',
          coins: '+75 ChivoCoins'
        };
      }
    }

    return {
      title: rewardInfo.message || '¡Recompensa!',
      coins: `+${rewardInfo.coins} ChivoCoins`
    };
  };

  const content = getModalContent();

  return (
    <>
      <style>{`
        @keyframes modalEnter {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(360deg);
            opacity: 0;
          }
        }

        .modal-enter {
          animation: modalEnter 0.4s ease-out;
        }

        .confetti {
          animation: confettiFall 2s ease-in forwards;
        }
      `}</style>

      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
        <div className="relative">
          {/* Confetti */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="confetti absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: confettiColors[i % confettiColors.length],
                left: `${Math.random() * 300 - 50}px`,
                top: `${Math.random() * 50 - 50}px`,
                animationDelay: `${Math.random() * 0.3}s`,
                animationDuration: `${2 + Math.random()}s`
              }}
            />
          ))}

          {/* Modal */}
          <div className="modal-enter bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              {content.title}
            </h2>
            <p className="text-5xl font-bold text-yellow-500 mb-6">
              {content.coins}
            </p>
            <button
              onClick={closeRewardModal}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              ¡Genial!
            </button>
            <p className="text-sm text-gray-500 mt-6">
              Tus ChivoCoins se guardan en este dispositivo
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
